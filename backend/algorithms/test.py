from conditions import User
import json
path='./userdatatemplate.json'
with open(path) as f:
    data = json.load(f)
user = User()
user.load_json(data)
print(user.wam)