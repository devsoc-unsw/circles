# Frontend

## Technology Stack
- React JS with Typescript + [Vite](https://vitejs.dev/)
- [Styled components](https://styled-components.com/) + [Ant Design](https://ant.design/)
- Jest and React Testing Library (RTL) + [Vitest](https://vitest.dev/)

## Installation
### Prerequisites
- [Git](https://github.com/git-guides/install-git)
- [Nodejs](https://nodejs.org/en/download/package-manager/) and [npm](https://www.npmjs.com/)
- [Docker](https://www.docker.com/) (Optional)

### Option 1: Running Only the Frontend

If you are doing superficial work with the frontend and do not need to communicate with the backend, you can `cd` to the `frontend` folder, run `npm install` to install required packages locally, and then `npm start`. This is faster than running docker compose since you avoid having to set up the backend and mongodb containers.

> NOTE: Your frontend requests will be fetching from `https://circlesapi.csesoc.app` and the production version of the Circles API will be used to handle your backend requests.

### Option 2: Using Docker

This method sets up both the frontend and backend via Docker.

#### Installing Docker

Circles uses `docker` for development. This means you do not need to install anything locally on your machine and it avoids the hassle of configuring MongoDB locally. You will only need to install `docker` on your local system. Get started with Docker [here](`https://www.docker.com/get-started`).

We use docker to build 'images' for the backend, frontend, and mongodb. These `images` can then be used to run `containers`. An image is a blueprint for a container and a container contains everything we need to run an application. All dependencies for code exist within these containers, and via `docker-compose`, these containers can talk to each other.

#### Creating Environment Variables

MongoDB and the backend require a few environment variables to get started. In the root folder, create a folder called `env` and add three files: `backend.env`, `mongodb.env` and `frontend.env`. 

In `backend.env`, add the environment variables:

- `MONGODB_USERNAME=test`
- `MONGODB_PASSWORD=test`
- `MONGODB_SERVICE_HOSTNAME=mongodb`

In `mongodb.env`, add:

- `MONGO_INITDB_ROOT_USERNAME=test`
- `MONGO_INITDB_ROOT_PASSWORD=test`

In `frontend.env`, add:

- `VITE_BACKEND_API_BASE_URL=http://localhost:8000/`

> NOTE: The `VITE_BACKEND_API_BASE_URL` environment variable is the base url endpoint that the backend is running on. If the environment variable is not specified, the react application will default to using `https://circlesapi.csesoc.app/` as the base url when calling the API endpoint.

Feel free to replace username and password to any value. The username and password in `backend.env` must match the values in `mongodb.env`. The `env` folder has been added to `.gitignore` and will not be committed to the repo.

#### Running Circles with Docker

The first time you run Circles, or if you have made changes to the backend codebase, run `docker compose build`. If you find you are building up a lot of `<none>` images or docker is starting to consume space, the `docker system prune` command will remove all docker data.

To run the whole application (frontend, backend and database), use `docker compose up frontend`. You can include the `-d` option if you wish to run it in detached mode.

You will now have the backend API available on `localhost:8000/docs` and the frontend on `localhost:3000`. Since we use `docker-compose`, the backend, frontend and database can talk to each other in their own special docker network (called `circles-net`).

Note that changes to the frontend React code will be visible live while developing due to the bind mount in the docker-compose file (see line 37). It is not necessary to rebuild the images to view the frontend changes.

To see what containers are running, use `docker ps`. To see all containers, including stopped containers, add option `-a`. You can remove a particular container using `docker rm <container>`. Another handy command is `docker logs <containerName>` to view a container's output.

#### Removing Docker Containers

To remove all containers and the docker network, run `docker-compose down`. Add the option `-v` to also remove persistent volumes: that is, the mongoDB data. I tend to run this before I rebuild if I have made changes to the backend code to keep everything clean on my system.

To stop a docker containers that is running, run `docker-compose stop <containerName>`. This will not remove the container.

## Project Structure 
(Accurate as of January 2023)
```bash
frontend/
├─ public/                              # files related to the initial static html
├─ src/
│  ├─ assets/                           # stores all static assets (images, svgs, css)
│  ├─ components/                       # stores reusable components
│  │  ├─ CourseButton/
│  │  │  ├─ CourseButton.tsx            # component implementation
│  │  │  ├─ CourseButton.test.tsx       # test file for the component
│  │  │  ├─ index.ts                    # should contain only imports of component(s) to be exported from this folder
│  │  │  ├─ styles.ts                   # contains stylings related to this component(s)
│  ├─ config/                           # stores any config and misc files
│  ├─ hooks/                            # stores custom hooks
│  ├─ pages/
│  │  ├─ CourseSelector/
│  │  │  ├─ CourseSelector.tsx
│  │  │  ├─ CourseSelector.test.tsx
│  │  │  ├─ index.ts
│  │  │  ├─ styles.ts
│  │  │  ├─ CourseBanner/               # components specific to this page
│  │  │  │  ├─ CourseBanner.tsx
│  │  │  │  ├─ CourseBanner.test.tsx
│  │  │  │  ├─ index.ts
│  │  │  │  ├─ styles.ts
│  │  │  ├─ ...
│  │  ├─ ...
│  ├─ reducers/                         # reducer slices files
│  ├─ styles/                           # styled components styles that can be reused globally
│  ├─ test/                             # helper files relating to testing
│  ├─ types/                            # type definition files to be used globally
│  ├─ utils/                            # utility/helper functions to be used globally
│  ├─ App.tsx
│  ├─ index.tsx
│  ├─ ...
├─ dev.dockerfile                       # dockerfile to run in dev env
├─ production.dockerfile                # dockerfile to run in prod env
├─ index.html
├─ package.json
├─ package-lock.json
├─ tsconfig.json                        # specifies the root files and the compiler options required to compile the project
├─ vite.config.ts                       # config file to setup vite
├─ vitest.config.ts                     # config file to setup vitest
├─ .eslintrc                            # eslint config
├─ .prettierrc                          # prettier config
├─ ...
```

### Creating components

Components that can be reusable throughout other pages or are more generalised components (i.e. `Button`) should be created within the `src/component` folder. Each component created must have their own folder created. General layout is that the file `index.ts` will be importing the implementation of the component from another file and exporting it to be used elsewhere in the project. Main implementation of the component should be created in another file entirely.

### Styling components
We are using styled components for CSS rather than CSS modules, stylesheets, JS objects, etc. Styled components should be created in a file separately called `styles.ts` within the component folder.

### Static assets
React recommends importing static assets directly rather than using the `public/` folder. Thus, any static assets used should be stored in the `src/assets/` folder.
