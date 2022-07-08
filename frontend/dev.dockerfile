FROM node:lts

# Set the current working directory inside the container
WORKDIR /client

# Copy packages.json and package-lock.json into the container
COPY package.json package-lock.json ./

# Install node modules inside the container using the copied package-lock.json
RUN npm ci

# Copy the entire project into the container
COPY . .

EXPOSE 3000

# Run the server
ENTRYPOINT [ "npm", "run", "dev" ]
