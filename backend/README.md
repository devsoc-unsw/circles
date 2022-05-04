# Backend

### Installing Docker

Circles uses `docker` for development. This means you do not need to install anything locally on your machine and it avoids the hassle of configuring MongoDB locally. You will only need to install `docker` on your local system: `https://www.docker.com/get-started`.

We use docker to build 'images' for the backend, frontend, and mongodb. These `images` can then be used to run `containers`. An image is a blueprint for a container and a container contains everything we need to run an application. All dependencies for code exist within these containers, and via `docker-compose`, these containers can talk to each other.

### Creating Environment Variables

MongoDB and the backend require a few environment variables to get started. In the root folder, create a folder called `env` and add three files: `backend.env`, `mongodb.env` and `frontend.env`. 

In `backend.env`, add the environment variables:

- `MONGODB_USERNAME=...`
- `MONGODB_PASSWORD=...`
- `MONGODB_SERVICE_HOSTNAME=mongodb`

In `mongodb.env`, add:

- `MONGO_INITDB_ROOT_USERNAME=...`
- `MONGO_INITDB_ROOT_PASSWORD=...`

In `frontend.env`, add:

- `REACT_APP_BACKEND_API_BASE_URL=http://localhost:8000/`

> NOTE: The `REACT_APP_BACKEND_API_BASE_URL` environment variable is the base url endpoint that the backend is running on. If the environment variable is not specified, the react application will default to using `http://localhost:8000/` as the base url when calling the API endpoint.

Replace the ellipses with a username and password. The username and password in `backend.env` must match the values in `mongodb.env`. The `env` folder has been added to `.gitignore` and will not be committed to the repo.

### Removing Docker Containers

To remove all containers and the docker network, run `docker-compose down`. Add the option `-v` to also remove persistent volumes: that is, the mongoDB data. I tend to run this before I rebuild if I have made changes to the backend code to keep everything clean on my system.

To stop a docker containers that is running, run `docker-compose stop <containerName>`. This will not remove the container.

### Running Circles without Docker
It is now possible to run Circles without docker, and have your changes to the backend codebase be reflected in the development server. To do this, ensure nodemon is installed on your linux distribution by running `npm i -g nodemon`. Nodemon is a node package which automatically restarts an app when it detects code changes.

Firstly, ensure the mongodb container is up by running `docker compose run --rm init-mongo`. Then, to run the backend, run `MONGODB_SERVICE_HOSTNAME=localhost MONGODB_PASSWORD=<password> MONGODB_USERNAME=<username> nodemon --exec python3 runserver.py`, where `password` and `username` are your mongodb environment variables set in `/env`. Ensure your python3 version is set to 3.10. To run the frontend, navigate to the frontend directory and run `npm start`. All parts of the app should now be running and talking to eachother.
