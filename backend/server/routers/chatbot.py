"""
APIs for the /chatbot/ route.
"""
import logging
from typing import Annotated, List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Security
from pydantic import BaseModel

from server.routers.utility.sessions.middleware import HTTPBearerToUserID
from server.routers.utility.user import get_setup_user
from server.services.grok_service import get_groq_service
from server.routers.utility.common import get_course_details, get_program_structure

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/chatbot",
    tags=["chatbot"],
)

require_uid = HTTPBearerToUserID()


class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    conversation_history: Optional[List[ChatMessage]] = None


class ChatResponse(BaseModel):
    response: str


def get_course_info_safe(code: str) -> Optional[dict]:
    """Safely get course details, returning None if not found"""
    try:
        return get_course_details(code)
    except Exception:
        return None


def get_verified_course_info(code: str, exclude_unscheduled: bool = True) -> Optional[str]:
    """
    Get verified course info string, or None if course doesn't exist.
    If exclude_unscheduled is True, returns None for courses not currently offered.
    """
    course = get_course_info_safe(code)
    if not course:
        return None
    
    terms = course.get('terms', [])
    if exclude_unscheduled and not terms:
        return None  # Don't suggest courses that aren't scheduled
    
    terms_str = ', '.join(terms) if terms else 'Not scheduled'
    title = course.get('title', 'Unknown')
    uoc = course.get('UOC', 6)
    prereqs = course.get('raw_requirements', '')
    if not prereqs:
        prereqs = 'None'
    return f"{code}: {title} ({uoc} UOC, Terms: {terms_str}, Prerequisites: {prereqs[:150]})"


def compute_degree_progress(user_data: dict) -> Dict[str, Any]:
    """
    Pre-compute exact degree progress with verified course data.
    Returns structured data that the AI cannot misinterpret.
    """
    result = {
        "program": "",
        "specializations": [],
        "total_uoc_required": 0,
        "completed_uoc": 0,
        "remaining_uoc": 0,
        "completed_courses": [],
        "requirements": [],
        "verified_suggestions": []
    }
    
    degree = user_data.get('degree', {})
    program_code = degree.get('programCode', '')
    specs = degree.get('specs', [])
    
    result["program"] = program_code
    result["specializations"] = specs
    
    # Get user's completed courses with verification
    user_courses = user_data.get('courses', {})
    completed_codes = set(user_courses.keys())
    
    # Verify each completed course exists
    for code in completed_codes:
        course_info = get_course_info_safe(code)
        if course_info:
            result["completed_courses"].append({
                "code": code,
                "title": course_info.get('title', 'Unknown'),
                "uoc": course_info.get('UOC', 6)
            })
    
    result["completed_uoc"] = sum(c["uoc"] for c in result["completed_courses"])
    
    # Get program structure
    if not program_code:
        return result
    
    try:
        structure, total_uoc = get_program_structure(program_code, specs=specs)
        result["total_uoc_required"] = total_uoc
        result["remaining_uoc"] = max(0, total_uoc - result["completed_uoc"])
    except Exception as e:
        logger.warning(f"Could not get program structure: {e}")
        return result
    
    # Process each requirement category
    for section_name, section_data in structure.items():
        if section_name in ['Rules']:
            continue
        
        for group_name, group_data in section_data.get('content', {}).items():
            if not isinstance(group_data, dict):
                continue
            
            required_uoc = group_data.get('UOC', 0)
            courses_dict = group_data.get('courses', {})
            
            if not courses_dict:
                continue
            
            available_codes = list(courses_dict.keys())
            
            # Calculate what's completed in this category
            completed_in_group = [c for c in available_codes if c in completed_codes]
            completed_group_uoc = 0
            for code in completed_in_group:
                course_info = get_course_info_safe(code)
                if course_info:
                    completed_group_uoc += course_info.get('UOC', 6)
            
            remaining_group_uoc = max(0, required_uoc - completed_group_uoc)
            
            # Determine requirement type
            is_core = 'core' in group_name.lower() or 'prescribed' in group_name.lower()
            total_available = len(available_codes) * 6
            is_elective = total_available > required_uoc * 1.5
            
            req_type = "ELECTIVE" if is_elective else "REQUIRED"
            
            # Get VERIFIED remaining options (courses that actually exist)
            remaining_options = []
            for code in available_codes:
                if code not in completed_codes:
                    verified = get_verified_course_info(code)
                    if verified:
                        remaining_options.append(verified)
                    if len(remaining_options) >= 10:  # Limit to 10 verified options
                        break
            
            result["requirements"].append({
                "section": section_name,
                "group": group_name,
                "type": req_type,
                "required_uoc": required_uoc,
                "completed_uoc": completed_group_uoc,
                "remaining_uoc": remaining_group_uoc,
                "completed_courses": completed_in_group,
                "available_options": remaining_options,
                "total_options_count": len([c for c in available_codes if c not in completed_codes])
            })
    
    return result


def format_verified_context(progress: Dict[str, Any]) -> str:
    """Format the pre-computed progress into a clear context string"""
    lines = []
    
    lines.append("=" * 60)
    lines.append("VERIFIED DEGREE PROGRESS (All data below is factual)")
    lines.append("=" * 60)
    
    lines.append(f"\nProgram: {progress['program']}")
    if progress['specializations']:
        lines.append(f"Specializations: {', '.join(progress['specializations'])}")
    
    lines.append(f"\nTotal UOC Required: {progress['total_uoc_required']}")
    lines.append(f"UOC Completed: {progress['completed_uoc']}")
    lines.append(f"UOC Remaining: {progress['remaining_uoc']}")
    
    lines.append(f"\n--- COMPLETED COURSES ({len(progress['completed_courses'])} courses) ---")
    for course in progress['completed_courses']:
        lines.append(f"  ✓ {course['code']}: {course['title']} ({course['uoc']} UOC)")
    
    lines.append("\n--- DEGREE REQUIREMENTS STATUS ---")
    for req in progress['requirements']:
        if req['remaining_uoc'] <= 0:
            lines.append(f"\n✓ {req['group']} - COMPLETE")
            continue
        
        lines.append(f"\n▸ {req['group']} [{req['type']}]")
        lines.append(f"  Need: {req['remaining_uoc']} more UOC (completed {req['completed_uoc']}/{req['required_uoc']} UOC)")
        
        if req['completed_courses']:
            lines.append(f"  Already done: {', '.join(req['completed_courses'][:5])}")
        
        if req['type'] == "REQUIRED":
            lines.append(f"  MUST TAKE these courses:")
        else:
            lines.append(f"  CHOOSE from these options (pick enough to reach {req['remaining_uoc']} UOC):")
        
        for option in req['available_options'][:6]:
            lines.append(f"    • {option}")
        
        if req['total_options_count'] > 6:
            lines.append(f"    ... and {req['total_options_count'] - 6} more options")
    
    lines.append("\n" + "=" * 60)
    
    return "\n".join(lines)


@router.post("/chat", response_model=ChatResponse)
def chat_with_bot(request: ChatRequest, uid: Annotated[str, Security(require_uid)]):
    """
    Chat endpoint that uses Grok API to help users plan courses and learn about courses.
    Pre-computes and verifies all course data to prevent hallucination.
    """
    try:
        # Get user data and pre-compute verified degree progress
        user_data = get_setup_user(uid)
        progress = compute_degree_progress(user_data)
        verified_context = format_verified_context(progress)
        
        # Build system prompt with extremely strict instructions
        system_prompt = f"""You are Cayman, a course planning assistant for UNSW students.

## ABSOLUTE RULES - VIOLATION WILL CAUSE HARM TO STUDENTS:

1. **NEVER invent course codes.** Every course code you mention MUST appear in the VERIFIED DATA below.
   - If you write a course code that isn't in the data, you are LYING to the student.
   - Course codes are 4 letters + 4 numbers (e.g., COMP1511). Do NOT make them up.

2. **The COMPLETED COURSES list is FACT.** Do NOT tell a student they haven't completed a course if it appears in the completed list. That would be a LIE.

3. **Only suggest courses from the "CHOOSE from these options" lists.** Those are the ONLY verified courses.

4. **For ELECTIVE requirements:** Students need X UOC total. Suggest 2-3 courses from the verified list. Do NOT list all options.

5. **For General Education:** Usually only 12 UOC needed (2 courses). Suggest 2-3 from the verified options.

6. **If asked about a course not in the data:** Say "I don't have verified information about that course."

## VERIFIED DEGREE DATA (This is the ONLY source of truth):

{verified_context}

## YOUR TASK:
- Answer the student's question using ONLY the verified data above
- When suggesting courses, copy them EXACTLY from the options listed
- Be helpful but NEVER make up information
- Keep responses concise

## RESPONSE FORMAT:
Use Markdown. Bold course codes. Use short lists. Be direct."""

        # Build messages array
        messages = [{"role": "system", "content": system_prompt}]
        
        # Add conversation history if provided
        if request.conversation_history:
            for msg in request.conversation_history:
                messages.append({"role": msg.role, "content": msg.content})
        
        # Add current user message
        messages.append({"role": "user", "content": request.message})
        
        # Call Groq API with very low temperature for factual responses
        groq_service = get_groq_service()
        response_text = groq_service.chat_completion(messages, temperature=0.1)
        
        return ChatResponse(response=response_text)
    
    except ValueError as e:
        import traceback
        logger.error(f"Configuration error in chatbot: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Configuration error: {str(e)}")
    except Exception as e:
        import traceback
        logger.error(f"Error in chatbot endpoint: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error processing chat request: {str(e)}")

