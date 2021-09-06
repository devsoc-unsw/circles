# Circles

## Setting up FE on your local machine 

1. Clone the repository 

```
git clone git@github.com:csesoc/Circles.git
```

2. Install npm packages and run with 

```
cd frontend
npm install 
npm start
``` 

The local server should open on port 3000 now. 

## Setting up BE on your local machine (read only)

### Method 1: Using Mongo Compass
1. Get username and password for our Mongo Cloud from admin (Either @Jwen00 or @jamesyJi) 
2. Paste your connection string replacing username and password and click connect. It should look like this 

```
mongodb+srv://<username>:<password>@circles-db.jbk5a.mongodb.net/test
```
> Remember to remove the angle brackets!==

3. Run the backend server
``` 
cd backend
```
4. Create a virtual environment (to ensure the same versions of python and other packages)
```
pip3 install pipenv
pipenv shell
```
Now you should have `(backend)` at the beginning of your terminal. This indicates that you're inside the virtual envrionment called backend. 
### Method 2: Running DB in your local machine 

TBA