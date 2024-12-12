# Hydro project with pysheds#

> :warning: **Deprecated:** These instructions aren't up to date.


## Setup Instructions ##

### 1. Set up Conda Environment ###
__1.__ Clone the repository and navigate to the project directory. Then, create a Conda environment (make sure you have Anaconda/Miniconda configured beforehand).

```bash
conda create -n hydro python=3.11.10
```
Once the environment is set up, activate the Conda environment:

```bash
conda activate hydro
```
__2.__ Install packages from conda:

```bash
conda install -c conda-forge --file requirements-conda.txt
```

This will install core GIS and geospatial dependencies as well as numerical and scientific packages.

__3.__ Install pip packages:

```bash
pip install -r requirements-pip.txt
```
This will install packages related to the backend and watershed calculation.

__4.__ Optional packages for Jupyter Notebook:

```bash
pip install matplotlib scikit-image seaborn

```
```bash
conda install notebook ipykernel

```

Install the kernel for the project:

```bash
python -m ipykernel install --user --name hydro --display-name "Python (hydro)"

```
__5.__ Inside Visual Studio Code, make sure to choose the correct interpreter. You can use keyboard shortcut `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS). It should be listed as _Python 3.11.10 ('hydro')_\
__Note:__ You may have to refresh/restart Visual Studio Code for it to be visible. 


### 2. DEM data ###
- [Download DEM data](https://geoportaal.maaamet.ee/est/Ruumiandmed/Korgusandmed/Laadi-korgusandmed-alla-p614.html) 
Maapinna kõrgusmudelid -> Kogu Eesti DTM eraldusvõimega 5m (GeoTIFF, 7.1 GB)
Place it wherever you wish. You have to reference that file in the `delinate.py` script.


### 3. Running the Backend ###
Navigate to `/app` in your CLI and run:
```bash
python main.py
```
Navigate to your browser and use either `http://127.0.0.1:5000/` or `localhost:5000/`.

__You are now ready to interact with the application.__

### 4. Optional - Testing the Frontend functionality ###
Make sure you've installed Live Server in Visual Studio Code. 
Inside VSC, navigate to `app/templates/index.html` and _"Go Live"_.

__Note:__ If the program doesn't react for any reason, try to perform hard refresh in the browser. You can use the keyboard shortcut `Ctrl+Shift+R` (or `Cmd+Shift+R` on macOS).


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
