# Utility container to overwrite the database. Separating the overwriting process
# speeds up development, since we can rebuild and create new containers without
# overwriting every time.

FROM python:3.11.5-alpine

WORKDIR /util

RUN pip install --no-cache-dir redis==5.0.3

COPY "init-sessionsdb.py" .

CMD ["python3", "-u", "init-sessionsdb.py"]