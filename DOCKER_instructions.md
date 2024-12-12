# Docker Instructions for Hydro Project # 

## Prerequisites ##

__1.__ Docker must be installed and running.\
__2.__ It is highly recommended to place the [DEM raster file](#raster) (DTM_5m_eesti.tif) in the `data/` folder to speed up the build time.
__NB!__ You need roughly 14 GB of storage space to run the program with Docker.


## Running the app ## 

In the project root, simply execute the following command:
```bash
docker compose up --build
```
Once the build has completed, the application will be accessible at http://127.0.0.1:5001.\
You can still edit the files in the `app/` and `script/` folders while the services are running.\
Next time, you can simply run the services with:
```bash
docker compose up
```





> :warning: **Old Instructions:**

## Prerequisites ##

__1.__ Docker must be installed and running.\
__2.__ The project includes all necessary files, except for the DEM raster file (DTM_5m_eesti.tif).\
Before proceeding, read about the DEM [Raster File Handling](#raster).


## Build the Docker Image ## 
Run the following command from the project directory (where the Dockerfile is located):
```bash
docker build -t hydro_project .
```

## Run the Docker Container ##
```bash
docker run -p 5001:5000 hydro_project
```
The application will be accessible at http://127.0.0.1:5001.

Port 5001 is mapped to the container's internal port 5000.


## Raster File Handling ##
<a id="raster"></a>

__Option 1:__ Automatic Download

If the raster file is missing in /data, the container will attempt to download it at runtime. Currently, the download progress won't display in real time due to Docker's logging behavior.

__Option 2:__ Manual Placement

To skip the download, copy the raster file (DTM_5m_eesti.tif) to the data directory before building or running the container.

__Note:__ Docker image with the raster file included at build time is 9.61 GB.
