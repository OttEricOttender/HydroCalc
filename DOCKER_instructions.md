# Docker Instructions for Hydro Project # 

## Prerequisites ##

__1.__ Docker must be installed and running.
__2.__ The project includes all necessary files, except for the DEM raster file (DTM_5m_eesti.tif).
Before proceeding, read about the DEM raster file [options](#raster).


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
