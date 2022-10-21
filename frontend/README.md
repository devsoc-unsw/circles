# Frontend 

## Running Circles fully on your local machine

### Running Only the Frontend

If you are doing superficial work with the frontend and do not need to communicate with the backend, you can `cd` to the frontend folder, run `npm install` to install required packages locally, and then `npm start`. This is faster than running docker compose since you avoid having to set up the backend and mongodb containers.

### Installing Docker

Circles uses `docker` for development. This means you do not need to install anything locally on your machine and it avoids the hassle of configuring MongoDB locally. You will only need to install `docker` on your local system: `https://www.docker.com/get-started`.

We use docker to build 'images' for the backend, frontend, and mongodb. These `images` can then be used to run `containers`. An image is a blueprint for a container and a container contains everything we need to run an application. All dependencies for code exist within these containers, and via `docker-compose`, these containers can talk to each other.

### Creating Environment Variables

MongoDB and the backend require a few environment variables to get started. In the root folder, create a folder called `env` and add three files: `backend.env`, `mongodb.env` and `frontend.env`. 

In `backend.env`, add the environment variables:

- `MONGODB_USERNAME=name`
- `MONGODB_PASSWORD=name`
- `MONGODB_SERVICE_HOSTNAME=mongodb`

In `mongodb.env`, add:

- `MONGO_INITDB_ROOT_USERNAME=name`
- `MONGO_INITDB_ROOT_PASSWORD=name`

In `frontend.env`, add:

- `VITE_BACKEND_API_BASE_URL=http://localhost:8000/`

> NOTE: The `VITE_BACKEND_API_BASE_URL` environment variable is the base url endpoint that the backend is running on. If the environment variable is not specified, the react application will default to using `http://localhost:8000/` as the base url when calling the API endpoint.

Replace the ellipses with a username and password. The username and password in `backend.env` must match the values in `mongodb.env`. The `env` folder has been added to `.gitignore` and will not be committed to the repo.

### Running Circles with Docker

The first time you run Circles, or if you have made changes to the backend codebase, run `docker compose build`. If you find you are building up a lot of `<none>` images or docker is starting to consume space, the `docker system prune` command will remove all docker data.

To run the whole application (frontend, backend and database), use `docker compose up frontend`. You can include the `-d` option if you wish to run it in detached mode.

You will now have the backend API available on `localhost:8000/docs` and the frontend on `localhost:3000`. Since we use `docker-compose`, the backend, frontend and database can talk to each other in their own special docker network (called `circles-net`).

Note that changes to the frontend React code will be visible live while developing due to the bind mount in the docker-compose file (see line 37). It is not necessary to rebuild the images to view the frontend changes.

To see what containers are running, use `docker ps`. To see all containers, including stopped containers, add option `-a`. You can remove a particular container using `docker rm <container>`. Another handy command is `docker logs <containerName>` to view a container's output.
#### Running against live backend

For FE development, it is probably easier to hit the live instance of circlesapi and run the FE locally. You can do this by doing:
```bash
npm install # install dependancies
npm start
```

you can also hit a local BE by using `npm start:local`.
### Removing Docker Containers

To remove all containers and the docker network, run `docker-compose down`. Add the option `-v` to also remove persistent volumes: that is, the mongoDB data. I tend to run this before I rebuild if I have made changes to the backend code to keep everything clean on my system.

To stop a docker containers that is running, run `docker-compose stop <containerName>`. This will not remove the container.

### Running Circles without Docker
It is now possible to run Circles without docker, and have your changes to the backend codebase be reflected in the development server. To do this, ensure nodemon is installed on your linux distribution by running `npm i -g nodemon`. Nodemon is a node package which automatically restarts an app when it detects code changes. 
You can then run `python run_app.py` to run all of circles locally (assuming that you have installed all dependancies).
 Ensure your python3 version is set to 3.10. All parts of the app should now be running and talking to eachother. 
