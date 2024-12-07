#For coordinates reception
import sys
#For Raster DEM data
import urllib.request
#For calculation
import numpy as np
import geopandas as gpd
import rasterio
from pysheds.grid import Grid
from rasterio.windows import from_bounds
#For export
from shapely.geometry import shape
import json
#For cleanup
import os


# Provide the local path to the downloaded DEM GeoTIFF file
dem_path = '../data/DTM_5m_eesti.tif'
if not os.path.exists(dem_path):
    print("Raster file missing. Downloading...")
    urllib.request.urlretrieve(
        "https://geoportaal.maaamet.ee/index.php?lang_id=1&plugin_act=otsing&andmetyyp=mp_korgusmudelid&dl=1&f=DTM_5m_eesti.tif&page_id=614",
        dem_path
    )
    print("Raster file downloaded.")


# Parsing coordinates from command-line args
if len(sys.argv) >= 3:
    try:
        x, y = float(sys.argv[1]), float(sys.argv[2])
        print(f"Using provided coordinates: Easting {x}, Northing {y}")
    except ValueError:
        print("Error: Coordinates must be numeric.")
        sys.exit(1)
else:
    print("Error: Coordinates not provided.")
    sys.exit(1)


# Define a window around the coordinates 
buffer = 7500  # meters

try:
    # Open the DEM using rasterio
    with rasterio.open(dem_path) as src:
        # Calculate bounds around the point
        left = x - buffer
        right = x + buffer
        bottom = y - buffer
        top = y + buffer

        
        # Read the window from the DEM around the specified point
        window = from_bounds(left, bottom, right, top, transform=src.transform)
        dem_window = src.read(1, window=window)
        transform = src.window_transform(window)
        profile = src.profile
        profile.update({
            'transform': transform,
            'height': dem_window.shape[0],
            'width': dem_window.shape[1],
            'count': 1
        })
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)

# Create a temporary file to save the DEM window
temp_dem_path = '../data/temp_dem_window.tif'
with rasterio.open(temp_dem_path, 'w', **profile) as dst:
    dst.write(dem_window, 1)

print("DEM window saved to temporary file:", temp_dem_path)
print("DEM window read complete")


# Initialize Pysheds grid and read the raster data
grid = Grid.from_raster(temp_dem_path, data_name='dem')

# Read the DEM data from the grid as a Raster object
dem_raster = grid.read_raster(temp_dem_path)

# filling pits, depressions, and resolving flats
pit_filled_dem = grid.fill_pits(dem_raster)
flooded_dem = grid.fill_depressions(pit_filled_dem)   
inflated_dem = grid.resolve_flats(flooded_dem)

print("Filling pits, depressions, and resolving flats complete")


# Direction map for flow directions
dirmap = (64, 128, 1, 2, 4, 8, 16, 32)

# Calculate flow direction using the conditioned DEM
flow_direction = grid.flowdir(inflated_dem, dirmap=dirmap)

print("Flow direction complete")

# calculating the flow accumulation
acc = grid.accumulation(flow_direction, dirmap=dirmap)

# Snap pour point to high accumulation cell
# Value 1000 is for snapping from a meaningful point, we can adjust it in the future if needed
x_snap, y_snap = grid.snap_to_mask(acc > 700, (x, y)) # x,y are user entered

print(f"Snapped coordinates: {x_snap}, {y_snap}")

# Delineate the catchment based on snapped coordinates and flow direction
catch = grid.catchment(x=x_snap, y=y_snap, fdir=flow_direction, dirmap=dirmap, xytype='coordinate')

# clipping the DEM to the catchment area (needed for river_network later)
grid.clip_to(catch)

# Extract river network - optional for displaying
branches = grid.extract_river_network(flow_direction, acc > 50, dirmap=dirmap)


# converting the catchment into a supported dtype (int32)
#catch_int = catch.astype('int32')

# Polygonize the catchment for GeoDataFrame conversion
shapes = grid.polygonize(catch.astype('int32'))

# conversion of the polygonized shapes into GeoJSON-like features
geojson_features = []
for geom, value in shapes:
    if value == 1: # including only areas inside the catchment
        feature = {
            "type": "Feature",
            "geometry": shape(geom).__geo_interface__,
            "properties": {"value": value}
        }
        geojson_features.append(feature)


# Convert to GeoDataFrame for export
gdf_catchment = gpd.GeoDataFrame.from_features(geojson_features, crs='EPSG:3301')

# Save the result as GeoJSON
gdf_catchment.to_file('../output/epsg3301/watershed.geojson', driver='GeoJSON')

print("Watershed delineation saved as GeoJSON")


# Convert the river network to a GeoDataFrame for export, saving result as GeoJSON
gdf_river_network = gpd.GeoDataFrame.from_features(branches, crs='EPSG:3301')
gdf_river_network.to_file('../output/epsg3301/river_network.geojson', driver='GeoJSON')

print("River network saved as GeoJSON")

# Calculating the surface area
total_area_sqkm = (gdf_catchment['geometry'].area.sum()) / 1e6
user_coords = (x,y)
snapped_coords = (x_snap, y_snap)

# Prepare metadata dictionary
metadata = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": {
                "surface_area_sqkm": total_area_sqkm,
            },
             "type": "Feature",
            "geometry": {"type": "Point", "user_coords": user_coords},
        },
        {
            "type": "Feature",
            "geometry": {"type": "Point", "snapped_coords": snapped_coords}
        }
    ]
}

# Save metadata as GeoJSON
with open('../output/epsg3301/metadata.geojson', 'w') as f:
    json.dump(metadata, f)

print("Metadata saved as GeoJSON")

if os.path.exists(temp_dem_path):
    os.remove(temp_dem_path)
    print(f"Temporary file {temp_dem_path} deleted.")