FROM node:lts

# Set the current working directory inside the container
WORKDIR /client

# @circles/degree-eval is a file: dependency (../packages/degree-eval); npm does not install its deps
COPY --from=degree-eval package.json package-lock.json /packages/degree-eval/
RUN cd /packages/degree-eval && npm ci --omit=dev
COPY --from=degree-eval src /packages/degree-eval/src
# stand-in degree documents for the evaluator (VITE_DEGREE_EVAL) until the backend serves them
COPY --from=degree-eval test-data/examples /packages/degree-eval/test-data/examples

# Copy packages.json and package-lock.json into the container
COPY package.json package-lock.json ./

# Install node modules inside the container using the copied package-lock.json
RUN npm ci

# Copy the entire project into the container
COPY . .

EXPOSE 3000

# Run the server
ENTRYPOINT [ "npm", "start" ]
