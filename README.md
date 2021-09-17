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
The following commands are work on MacOS. For different systems, google the respective commands. If you cannot get it working, message someone on discord.

1. Create a virtual environment inside the backend folder called venv. Make sure it is called venv or else it will not be gitignored.
```
cd backend
python3 -m venv venv
```
2. Activate the virtual environment
```
source venv/bin/activate
```
Now you should have `(venv)` at the beginning of your terminal. This indicates you are inside the virtual environment called venv.

3. Install all necessary modules
```
pip3 install -r requirements.txt
```

### Connecting to the Database (LOCAL) READ & WRITE - RECOMMENDED
1. Download MongoCompass (The desktop GUI for MongoDB) at https://www.mongodb.com/try/download/compass and perform the necessary installation steps for your system. The end result is to be able to open MongoCompass on your computer... **WARNING: This varies on different systems so message discord for help if needed**

2. Run the server from the backend/ directory```python3 runserver.py```.

You can use: ```python3 runserver.py --overwrite=True``` to overwrite the existing database with the latest up to date data. This should also be used on your first time setting up the database to populate it with data.

A server will start on http://127.0.0.1:8000. The API documentation can be viewed at http://127.0.0.1:8000/docs

3. You can view the database by pasting your connection string into MongoDB Compass and clicking the green connect button. Your connection string should be:

```mongodb://localhost:27017/?readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false```


### Connecting to the Database (CLOUD) READ ONLY - ALTERNATIVE if you can't get Mongo working on your system
You might not be able to get MongoCompass on your local system due to installation issues. In the event this occurs, we have provided an online alternative.

1. Get username and password for our Mongo Cloud from admin (Either @Jwen00 or @JamesyJi)
2. Determine your connection string (URI). It should be in this format:

```
mongodb+srv://<username>:<password>@circles-db.jbk5a.mongodb.net/test
```

So if my username was james and my password was hello123, my URI should be:

```
mongodb+srv://james:hello123@circles-db.jbk5a.mongodb.net/test
```

3. **Temporary Workaround**: Inside the backend/server/config.py file, replace the local URI with your own URI (make sure to keep track of the local URI somewhere!!!). **Make sure you replace the URI when you are done. Do not push your own credentials.**

4. Run the server from the backend/ directory and make calls from http://127.0.0.1:8000 as normal.

```python3 runserver.py```


TODO: Pipeline for local vs cloud so don't have to go and manually change the URI
