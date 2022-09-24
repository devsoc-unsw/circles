# Utility container to overwrite the database. Separating the overwriting process
# speeds up development, since we can rebuild and create new containers without
# overwriting every time.

FROM python:3.10.5

WORKDIR /util

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["python3", "-u", "init-database.py"]