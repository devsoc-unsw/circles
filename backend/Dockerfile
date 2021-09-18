# Latest python image
FROM python:3.7.4

# Set current working directory inside container to /backend
WORKDIR /backend

# pip install the venv python modules
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy entire backend into the container
COPY . .

# Expose port 8000 to the outside world
EXPOSE 8000

# Run the server
CMD ["python3", "./runserver.py"]
