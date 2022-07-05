
import json


def remove_course(structure: dict, course: str) -> bool:
    """indescriminantly remove a course from structure"""
    for item, collection in structure.items():
        for container in collection:
            try:
                if container == 'name':
                    raise KeyError
                del structure[item][container]["courses"][course]
                print(item, container)
                return structure[item][container]
            except KeyError:
                pass

def fix_3784(structure: dict):
    mutated_item = remove_course(structure, "ECON1202")
    # if mutated_item:
    #     print(mutated_item)
    #     mutated_item["Core Courses"]["UOC"] -= 6
    #     mutated_item["Prescribed Electives"]["UOC"] += 6
    return structure


def apply_manual_fixes(structure, program_code):
    fixes = {
        "3784": fix_3784
    }
    return fixes.get(program_code, lambda a: a)(structure)
