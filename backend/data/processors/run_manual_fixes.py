from data.processors.manualFixes.ACCTFixes import fix_conditions as ACCT_fix
from data.processors.manualFixes.COMPFixes import fix_conditions as COMP_fix


def run_fixes():
    """
    Runs all manual fixes
    """

    ACCT_fix()
    COMP_fix()

if __name__ == "__main__":
    run_fixes()