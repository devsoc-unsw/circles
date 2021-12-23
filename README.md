# Circles

# Running Circles on your local machine

**TODO**: Create a utility container to populate the database.

## Backend Development

### Installing Docker

Circles uses `docker` for backend development. This means you do not need to install anything locally on your machine and it avoids the hassle of configuring MongoDB locally. You will only need to install `docker` on your local system: `https://www.docker.com/get-started`.

We use docker to build 'images' for the backend and mongodb. These `images` can then be used to run `containers`. An image is a blueprint for a container and a container contains everything we need to run an application. All dependencies for code exist within these containers, and via `docker-compose`, these containers can talk to each other.

### Creating Environment Variables

MongoDB and the backend require a few environment variables to get started. In the root folder, create a folder called `env` and add two files: `backend.env` and `mongodb.env`. 

In `backend.env`, add the environment variables:
- `MONGODB_USERNAME=...`
- `MONGODB_PASSWORD=...`
- `MONGODB_URL=mongodb`

In `mongodb.env`, add:
- `MONGO_INITDB_ROOT_USERNAME=...`
- `MONGO_INITDB_ROOT_PASSWORD=...`

Replace the ellipses with a username and password. The username and password in `backend.env` must match the values in `mongodb.env`. The `env` folder has been added to `.gitignore` and will not be committed to the repo. 

### Running the Backend with Docker

The first time you run Circles, or if you have made changes to the backend codebase or dockerfiles, run `docker-compose build --no-cache`. This will rebuild the docker images with the updated code. You can run `docker images` to see what images exist on your machine. Note the `docker rmi <image>` command deletes an image.

To then run the backend, use `docker-compose up`. You can include the `-d` option if you wish to run it in detached mode. 

You will now have the backend API available on `localhost:8000/docs`. Since we use `docker-compose`, the backend and database can talk to each other in their own special docker network (called `circles-net`).

To see what containers are running, use `docker ps`. To see all containers, including stopped containers, add option `-a`. You can remove a particular container using `docker rm <container>`. Another handy command is `docker logs <containerName>` to view a container's output.

You can stop a particular container with `docker-compose stop <containerName>`.

### Running Specific Files

Note if working on specific files or functions, you can still just run `python3 <fileName>`. This can be faster than starting and stopping docker containers. Ensure you have the requisite dependencies by following the below steps:

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

### Removing Docker Containers

To remove all containers and the docker network, run `docker-compose down`. Add the option `-v` to also remove persistant volumes: that is, the mongoDB data. I tend to run this before I rebuild if I have made changes to the backend code to keep everything clean on my system.

To stop a docker container that is running, run `docker-compose stop <containerName>`. This will not remove the container.

## Frontend Development

Run the frontend by following the below steps:

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

The local server should open on port 3000 now. If you also have the backend and mongodb containers running, the local server will be able to talk to the backend API.
