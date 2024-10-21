# Hydro project with pysheds #

## Setup Instructions ##

### 1. Set up Conda Environment ###
First, clone the repository and navigate to the project directory. Then, create a Conda environment using the provided `environment.yml` file (make sure you have Anaconda/Miniconda configured beforehand):

```bash
conda env create -f environment.yml
```
This will install all necessary dependencies, including PySheds, GeoPandas, and other required libraries.


### 2. DEM data ###
- [Download DEM data](https://geoportaal.maaamet.ee/est/Ruumiandmed/Korgusandmed/Laadi-korgusandmed-alla-p614.html) 
Maapinna kõrgusmudelid -> Kogu Eesti DTM eraldusvõimega 5m (GeoTIFF, 7.1 GB)
Place it wherever you wish. You have to reference that file in the script.


### 3. Running the Watershed Delineation Script ###

Once the environment is set up, activate the Conda environment:

```bash
conda activate hydro
```

Navigate to _/scripts_ and run the delineate.py script. This will calculate the watershed and river network from a specified point (hardcoded for now):

```bash
python delineate.py
```
The output GeoJSON files for both the watershed and river network will be generated in the output directory.

### 4. Optional - run script in parts via Jupyter Notebook ###

You can also run the Jupyter Notebook file (delineate.ipynb, works the same way) to better understand the process and see the intermediate visualization steps:

```bash
jupyter notebook delineate.ipynb
```

### 5. Next steps ###
Next steps involve creating a front-end and back-end using leaflet and flask to visualize the data from the output folder on the map.
