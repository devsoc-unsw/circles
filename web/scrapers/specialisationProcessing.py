"""
Program processes the formatted data by editing and customising the data for 
use on the frontend.

Proposed data structure:

"COMPA1": {

    "programs": [ "3776", "3777", ... ], 

    "name": "Computer Science (Artificial Intelligence)", 

    "type": "honours",

    "total_credits": 72,

    "curriculum": {

        "core_courses": {
            
            "credits": 24,

            "courses": [ "COMP2511", "COMP1511", "MATH1081", ... ],
        } ,

        "prescribed_electives": {
            
            "credits": 6,

            "courses": [ "COMP3331", "COMP3311", "COMP3141", ... ],
        } ,

        "discipline_electives": {
            
            "credits": ...,

            "courses": [ ... ],
        } ,

        "computing_electives": {
            
            "credits": ...,

            "courses": [ ... ],
        } ,
    },
    
    "constraints": [
        {
            "title": ...,
            "description": ...
        },
        {
            "title": ...,
            "description": ...
        }
    ]
}

"""