import requests 
import json 

user = {
  "program": "3778",
  "specialisations": [
    "COMPA1"
  ],
  "courses": {"COMP1511": [6, 1]},
  "year": 1
}

x = requests.post('http://127.0.0.1:8000/api/getAllUnlocked', json=user)
data = x.json()
# print(data)