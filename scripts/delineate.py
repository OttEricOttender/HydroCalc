#For calculation
import numpy as np
import geopandas as gpd
import rasterio
from pysheds.grid import Grid
from rasterio.windows import from_bounds
#For export
from shapely.geometry import shape

# Provide the local path to the downloaded DEM GeoTIFF file
dem_path = '/opt/homebrew/Cellar/geoserver/2.26.0/libexec/data_dir/data/raster/DTM_5m_eesti.tif' 

# User-defined coordinates for catchment delineation
x, y = 600000.017, 6450000  # hardcoded for now

# Define a window around the coordinates 
buffer = 5000  # 5 km buffer

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
x_snap, y_snap = grid.snap_to_mask(acc > 1000, (x, y)) # x,y are user entered

print(f"Snapped coordinates: {x_snap}, {y_snap}")

# Delineate the catchment based on snapped coordinates and flow direction
catch = grid.catchment(x=x_snap, y=y_snap, fdir=flow_direction, dirmap=dirmap, xytype='coordinate')

# clipping the DEM to the catchment area (needed for river_network later)
grid.clip_to(catch)

# Extract river network - optional for displaying
branches = grid.extract_river_network(flow_direction, acc > 50, dirmap=dirmap)



# converting the catchment into a supported dtype (int32)
catch_int = catch.astype('int32')

# Polygonize the catchment for GeoDataFrame conversion
shapes = grid.polygonize(catch_int)

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
gdf_catchment.to_file('../output/watershed.geojson', driver='GeoJSON')

print("Watershed delineation saved as GeoJSON")


# Convert the river network to a GeoDataFrame for export, saving result as GeoJSON
gdf_river_network = gpd.GeoDataFrame.from_features(branches, crs='EPSG:3301')
gdf_river_network.to_file('../output/river_network.geojson', driver='GeoJSON')

print("River network saved as GeoJSON")