# Latest python image
FROM python:3

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
ENTRYPOINT ["python3", "-u", "runserver.py", "--overwrite=True"]
