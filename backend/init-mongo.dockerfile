# Latest python image
FROM python:3

WORKDIR /util

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["python3", "-u", "init-database.py"]