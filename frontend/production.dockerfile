FROM node:lts

# Install serve
RUN npm install -g serve

# Set the current working directory inside the container
WORKDIR /client

# Copy packages.json and package-lock.json into the container
COPY package.json package-lock.json ./

# Install node modules inside the container using the copied package.json
RUN npm install

# Copy the entire project into the container
COPY . .

EXPOSE 3000

# Give the deploy script permissions
RUN ["chmod", "+x", "/client/scripts/deploy.sh"]

# Run the server
ENTRYPOINT [ "/client/scripts/deploy.sh" ]
