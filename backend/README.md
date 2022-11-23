# Backend

### Installing Docker

Circles uses `docker` for development. This means you do not need to install anything locally on your machine and it avoids the hassle of configuring MongoDB locally. You will only need to install `docker` on your local system: `https://www.docker.com/get-started`.

We use docker to build 'images' for the backend, frontend, and mongodb. These `images` can then be used to run `containers`. An image is a blueprint for a container and a container contains everything we need to run an application. All dependencies for code exist within these containers, and via `docker-compose`, these containers can talk to each other.

### Creating Environment Variables

MongoDB and the backend require a few environment variables to get started. In the root folder, create a folder called `env` and add three files: `backend.env`, `mongodb.env` and `frontend.env`. 

In `backend.env`, add the environment variables:

- `MONGODB_USERNAME=name`
- `MONGODB_PASSWORD=name`
- `MONGODB_SERVICE_HOSTNAME=mongodb`

FOR **PRODUCTION**, also add:
- `FORWARDED_ALLOW_IPS=*`

In `mongodb.env`, add:

- `MONGO_INITDB_ROOT_USERNAME=name`
- `MONGO_INITDB_ROOT_PASSWORD=name`

In `frontend.env`, add:

- `VITE_BACKEND_API_BASE_URL=http://localhost:8000/`

> NOTE: The `VITE_BACKEND_API_BASE_URL` environment variable is the base url endpoint that the backend is running on. If the environment variable is not specified, the react application will default to using `http://localhost:8000/` as the base url when calling the API endpoint.

You can use any random username and password. The username and password in `backend.env` must match the values in `mongodb.env`. The `env` folder has been added to `.gitignore` and will not be committed to the repo.

### Removing Docker Containers

To remove all containers and the docker network, run `docker-compose down`. Add the option `-v` to also remove persistent volumes: that is, the mongoDB data. I tend to run this before I rebuild if I have made changes to the backend code to keep everything clean on my system.

To stop a docker containers that is running, run `docker-compose stop <containerName>`. This will not remove the container.

Every once in a while, you will want to clean up docker. To do this, use `docker compose prune`.
### Running Circles
#### with docker
assuming that you correctly followed the steps above, you can run all of circles by using `docker compose up frontend` in a dev environment which will reflect your changes. If you change anything related to `database.py`, you will need to rebuild it to refect the changes.
#### without Docker
It is possible to run Circles without docker, to conserve system resources if it is taking too much of a toll. To do this, ensure nodemon is installed on your linux distribution by running `npm i -g nodemon`. Nodemon is a node package which automatically restarts an app when it detects code changes. 
You can then run `python run_app.py` to run all of circles locally (assuming that you have installed all dependencies).
Ensure your python3 version is set to 3.10. All parts of the app should now be running and talking to eachother. 

If you have having trouble with `python not found`, manually choose what python version is being run by adding `PYTHON_VERSION=python3` or, any version of your choosing in `backend.env`.
If you run into too many issues, you should use docker.
