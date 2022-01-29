# Sanity test of API getAllUnlocked

import requests

user = { "userData": {
    "program": "3778",
    "specialisations": [
      "COMPA1"
    ],
    "courses": {"COMP1511": [6, 1]},
    "year": 1
  },
  "lockedCourses": [
  ]
}

x = requests.post('http://127.0.0.1:8000/courses/getAllUnlocked', json=user)
data = x.json()
print(data)