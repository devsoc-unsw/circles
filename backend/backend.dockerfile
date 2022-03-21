# Sets up the backend, without writing data into the database.

# Latest python image
FROM python:3-slim

# Set current working directory inside container to /backend
WORKDIR /backend

# pip install the venv python modules
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy entire backend into the container
COPY . .

# Expose port 8000 to the outside world
EXPOSE 8000

# ENV OVERWRITE='False'

# Run the server
ENTRYPOINT ["python3", "-u", "runserver.py", "--overwrite"]
