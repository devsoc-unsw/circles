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

## Setting up BE on your local machine

### Environment Setup
1. Create a virtual environment inside the backend folder called venv (Think of a virtual environment as a separate container where we can control the versions of modules separately from your own computer)
```
cd backend
python3 -m venv venv # Example for mac. Command might be different for you
```
2. Activate the virtual environment
```
source venv/bin/activate # Example for mac. Command might be different for you
```
Now you should have `(venv)` at the beginning of your terminal. This indicates you are inside the virtual environment called venv.
3. Install all necessary modules
```
pip3 install -r requirements.txt
```

### Connecting to the Database (LOCAL) READ & WRITE - RECOMMENDED FOR BACKEND DEVELOPMENT
1. Download MongoCompass (The desktop GUI for MongoDB) at https://www.mongodb.com/try/download/compass and perform the necessary installation steps for your system.
> HARDEST STEP. MESSAGE DISCORD FOR HELP.

2. Run the server from the backend/ directory
> python3 runserver.py

This will start a local server reading from your local database

TODO: An overwrite option which should populate your MongoDB withall the necessary, up to date data
TODO: API Documentation port
TODO: How to view the API

3. You can view the data by pasting your connection string into the MongoDB Compass and clicking connect. This should be:

```mongodb://localhost:27017/?readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false```


### Connecting to the Database (CLOUD) READ ONLY - RECOMMENDED FOR FRONTEND
1. Get username and password for our Mongo Cloud from admin (Either @Jwen00 or @JamesyJi)
2. Determine your connection string (URI). It should be in this format:

```
mongodb+srv://<username>:<password>@circles-db.jbk5a.mongodb.net/test
```
> Remember to remove the angle brackets!==

3. You can view the data by pasting your connection string into the MongoDB Compass and clicking connect (or by TODO: atlas)

4. Run the server from the backend/ directory.

```python3 runserver.py```

TODO: Pipeline for local vs cloud so don't have to go and manually change the URI
