# Circles

## Running Circles on your local machine

**TODO**: Create a utility container to populate the database.

### Installing Docker

Circles uses `docker` for development. This means you do not need to install anything locally on your machine and it avoids the hassle of configuring MongoDB locally. You will only need to install `docker` on your local system: `https://www.docker.com/get-started`.

We use docker to build 'images' for the backend, frontend, and mongodb. These `images` can then be used to run `containers`. An image is a blueprint for a container and a container contains everything we need to run an application. All dependencies for code exist within these containers, and via `docker-compose`, these containers can talk to each other.

### Running Circles with Docker

If you have made changes to the backend codebase or any of the dockerfiles, run `docker-compose build --no-cache`. This will rebuild the docker images with the updated code. You can run `docker images` to see what images exist on your machine. Note the `docker rmi <image>` command deletes an image.

To then run the whole application (frontend, backend and database), use `docker-compose up`. You can include the `-d` option if you wish to run it in detached mode. 

You will now have the backend API available on `localhost:8000/docs` and the frontend on `localhost:3000`. Since we use `docker-compose`, the backend, frontend and database can talk to each other in their own special docker network (called `circles-net`).

Note that changes to the frontend React code will be visible live while developing due to the bind mount in the docker-compose file (see line 37). It is not necessary to rebuild the images to view the frontend changes.

To see what containers are running, use `docker ps`. To see all containers, including stopped containers, add option `-a`. You can remove a particular container using `docker rm <container>`. Another handy command is `docker logs <containerName>` to view a container's output.

### Running Only the Backend

If you are just working on the backend, you can run only the backend and mongodb containers via `docker-compose up backend` (with `-d` for detached if you wish). The backend container depends on the mongodb container, so this command will launch both. The API will now be available on `localhost:8000/docs`. 

You can stop a particular container with `docker-compose stop <containerName>`. For example, say I want to run the backend to test the API and don't need the frontend container. Assuming I have already built the images, I will run `docker-compose up -d backend` which will start just the backend and mongodb containers. When I am done, I will run `docker-compose stop backend mongodb` to stop both containers. Both containers will still exist (see `docker ps -a`) but will no longer be running.

Note if working on particular files or functions, you can still just run `python3 <fileName>`. This can be faster than starting and stopping docker containers. Ensure you have the requisite dependencies by following the below steps:

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

### Running Only the Frontend

If you are doing superficial work with the frontend and do not need to communicate with the backend, you can `cd` to the frontend folder, run `npm install` to install required packages locally, and then `npm start`. This is faster than running docker compose since you avoid having to set up the backend and mongodb containers.

### Removing Docker Containers

To remove all containers and the docker network, run `docker-compose down`. Add the option `-v` to also remove persistant volumes: that is, the mongoDB data. I tend to run this before I rebuild if I have made changes to the backend code to keep everything clean on my system.

To stop a docker containers that is running, run `docker-compose stop <containerName>`. This will not remove the container.

***
## Old instructions:

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
