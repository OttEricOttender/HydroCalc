# lightweight Miniconda base image
FROM continuumio/miniconda3:latest

# working directory inside the container (does not reference any project folders)
WORKDIR /hydro

# Copying only requirements files first (to optimize caching)
COPY requirements-conda.txt requirements-pip.txt ./

RUN conda config --set solver classic

# Installing dependencies
RUN apt-get update && apt-get install -y postgresql-client   build-essential libpq-dev
RUN conda install -y -c conda-forge python=3.11.10
RUN conda install -y -c conda-forge --file requirements-conda.txt
RUN pip install --no-cache-dir -r requirements-pip.txt




ENV PROJ_LIB=/opt/conda/share/proj


# Copying the relevant project files into the container
COPY app/ /hydro/app
COPY data/ /hydro/data
COPY output/epsg3301 /hydro/output/epsg3301
COPY output/converted /hydro/output/converted
COPY scripts/ /hydro/scripts

# running the Flask app
WORKDIR /hydro/app

EXPOSE 5000

CMD ["python", "main.py"]