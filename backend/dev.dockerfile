
# Sets up the backend, opening it to reload on change
# Python image
FROM python:3.10.5-slim

# install nodemon

RUN apt-get update \
    && apt-get install nodejs npm -y \
    && npm install -g nodemon

# gcc required for python-Levenshtein
RUN apt-get install gcc -y \
    && apt-get clean

# Set current working directory inside container to /backend
WORKDIR /backend

# pip install the venv python modules
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy entire backend into the container
COPY . .

# Expose port 8000 to the outside world
EXPOSE 8000

# Run the server
ENTRYPOINT nodemon --exec python3 -u runserver.py
