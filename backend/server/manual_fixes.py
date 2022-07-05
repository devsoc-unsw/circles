from contextlib import suppress


def remove_course(structure: dict, course: str) -> bool:
    """indescriminantly remove a course from structure"""
    for item, collection in structure.items():
        if item == "Rules":
            continue
        for container in collection:
            try:
                if container == "name":
                    continue
                del structure[item][container]["courses"][course]
                return structure[item]
            except KeyError:
                pass

def fix_3784(structure: dict):
    mutated_item = remove_course(structure, "ECON1202")
    if mutated_item:
        with suppress(StopIteration):
            core_name = next(filter(lambda a: "core" in a.lower(), mutated_item.keys()))
            mutated_item[core_name]["UOC"] -= 6
            elective_name = next(filter(lambda a: "prescribed" in a.lower(), mutated_item.keys()))
            mutated_item[elective_name]["UOC"] += 6
    return structure

def fix_3785(structure: dict):
    remove_course(structure, "COMP1911")
    remove_course(structure, "ENGG1811")
    remove_course(structure, "MATH1081")
    mutated_item = remove_course(structure, "COMP4920")
    if mutated_item:
        with suppress(StopIteration):
            core_name = next(filter(lambda a: "core" in a.lower(), mutated_item.keys()))
            mutated_item[core_name]["UOC"] -= 12
    return structure

def apply_manual_fixes(structure, program_code):
    fixes = {
        "3784": fix_3784,
        "3785": fix_3785
    }
    return fixes.get(program_code, lambda a: a)(structure)
