# Use the official PostGIS image
FROM postgis/postgis:latest

RUN apt-get update && \
    apt-get install -y postgis curl unzip

COPY initscripts/ /docker-entrypoint-initdb.d/

