# Hydro project with pysheds #

## Setup Instructions ##

### 1. Set up Conda Environment ###
First, clone the repository and navigate to the project directory. Then, create a Conda environment using the provided `environment.yml` file (make sure you have Anaconda/Miniconda configured beforehand).\
__NB!__ If you are on Windows OS, remove the last line `prefix: /opt/anaconda3/envs/hydro` from `environment.yml` before creating the environment.

```bash
conda env create -f environment.yml
```
This will install all necessary dependencies, including PySheds, GeoPandas, and other required libraries.
Once the environment is set up, activate the Conda environment:

```bash
conda activate hydro
```
Inside Visual Studio Code, make sure to choose the correct interpreter: _Python 3.11.10 ('hydro')_

### 2. DEM data ###
- [Download DEM data](https://geoportaal.maaamet.ee/est/Ruumiandmed/Korgusandmed/Laadi-korgusandmed-alla-p614.html) 
Maapinna kõrgusmudelid -> Kogu Eesti DTM eraldusvõimega 5m (GeoTIFF, 7.1 GB)
Place it wherever you wish. You have to reference that file in the `delinate.py` script.


### 3. Running the Backend ###
Navigate to `/app` in your CLI and run:
```bash
python main.py
```


### 4. Running the Frontend ###
Make sure you've installed Live Server in Visual Studio Code. 
Inside VSC, navigate to `app/templates/index.html` and _"Go Live"_.

__You are now ready to interact with the application.__\
__Note:__ If you encounter _No file/directory found_ errors, you may have to create the following folders manually:
`output/epsg3301` and `output/converted`.

### 5. Optional - Running the Watershed Delineation Script ###
To test the script directly, navigate to `/scripts` and run the `delineate.py` script. This will calculate the watershed and river network from a specified point. Use EPSG:3301 coordinate system coordinates as arguments:

```bash
python delineate.py <arg 1> <arg 2>
```
The output GeoJSON files for both the watershed and river network will be generated in the `output/epsg3301` directory.


### 6. Optional - run script in parts via Jupyter Notebook ###
You can also run the Jupyter Notebook file (`delineate.ipynb`, works the same way) to better understand the process and see the intermediate visualization steps:

```bash
jupyter notebook delineate.ipynb
```
