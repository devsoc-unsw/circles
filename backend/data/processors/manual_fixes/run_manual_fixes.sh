#!/bin/dash
# To run from the backend folder, enter: 
#   data/processors/manualFixes/runManualFixes.sh
# To run from runprocessors.py:
#   python runprocessors.py --type=condition --stage=manual

for file in $(find . -iname '*Fixes.py')
do
    # sed commands convert './data/processors/manualFixes/ACCTFixes.py' to
    #   'data.processors.manualFixes.ACCTFixes'
    module=$(echo $file | sed 's/\//\./g; s/\.py//g; s/\.\.//g')
    python3 -m $module
done