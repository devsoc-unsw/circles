"""
Service for interacting with Groq API
"""
import logging
import os
from typing import List, Dict
from openai import OpenAI

logger = logging.getLogger(__name__)

class GroqService:
    """Service class for Groq API interactions"""
    
    def __init__(self):
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError("GROQ_API_KEY environment variable is not set")
        
        # Groq API uses OpenAI-compatible format
        try:
            # Explicitly create httpx client to avoid version compatibility issues
            import httpx
            http_client = httpx.Client(
                timeout=60.0,
                limits=httpx.Limits(max_keepalive_connections=5, max_connections=10)
            )
            self.client = OpenAI(
                api_key=api_key,
                base_url="https://api.groq.com/openai/v1",
                http_client=http_client
            )
            logger.info("GroqService initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize GroqService: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
            raise
    
    def chat_completion(
        self,
        messages: List[Dict[str, str]],
        model: str = "llama-3.1-8b-instant",
        temperature: float = 0.7,
        max_tokens: int = 4000
    ) -> str:
        """
        Send a chat completion request to Groq API
        
        Args:
            messages: List of message dictionaries with 'role' and 'content' keys
            model: Model name (default: llama-3.1-8b-instant)
            temperature: Sampling temperature (default: 0.7)
            max_tokens: Maximum tokens in response (default: 4000)
        
        Returns:
            The assistant's response text
        """
        try:
            response = self.client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens
            )
            if not response.choices or not response.choices[0].message:
                raise Exception("Empty response from Groq API")
            content = response.choices[0].message.content
            if content is None:
                raise Exception("Empty response content from Groq API")
            return content
        except Exception as e:
            import traceback
            error_msg = f"Groq API error: {str(e)}"
            logger.error(error_msg)
            logger.error(traceback.format_exc())
            raise Exception(error_msg)

# Singleton instance
_groq_service: GroqService | None = None

def get_groq_service() -> GroqService:
    """Get or create the Groq service instance"""
    global _groq_service
    if _groq_service is None:
        _groq_service = GroqService()
    return _groq_service

