# Node v17 causing digital envelope routines error as at Dec '21.
FROM node:16.13.0

# Set the current working directory inside the container
WORKDIR /client

# Copy packages.json and package-lock.json into the container
COPY package.json package-lock.json ./

# Install node modules inside the container using the copied package.json
RUN npm install

# Copy the entire project into the container
COPY . .

EXPOSE 3000

# Run the server
ENTRYPOINT [ "npm", "start" ]
