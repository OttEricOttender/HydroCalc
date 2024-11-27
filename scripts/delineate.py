#For calculation
import json
import urllib
from sqlite3 import DatabaseError

import geojson
import numpy as np
import geopandas as gpd
import rasterio
import requests
from pyproj import CRS, Transformer
from pysheds.grid import Grid
from rasterio.windows import from_bounds
#For export
from shapely.geometry import shape, Point, Polygon
from shapely import to_geojson
#For coordinates reception
import sys
#For database connection
import psycopg2
from config import load_config
import os

transformer = Transformer.from_crs("EPSG:3301", "EPSG:4326", always_xy=True)


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

point = Point(x, y)
lon, lat = transformer.transform(x, y)
point2 = Point(lon, lat)



# Calculate the square's corners
buffer_distance = 1
min_x, min_y = point.x - buffer_distance, point.y - buffer_distance
max_x, max_y = point.x + buffer_distance, point.y + buffer_distance
"""
# Create the square polygon from the bounding box
#square_polygon = Polygon([(min_x, min_y), (min_x, max_y), (max_x, max_y), (max_x, min_y), (min_x, min_y)])
polygon_point = point.buffer(5)

url_eelis = "https://gsavalik.envir.ee/geoserver/eelis/ows?"
url_maaparandus = "https://inspire.geoportaal.ee/geoserver/HY_eesvoolud/wfs?"

params_valg = dict(
        service= 'WFS',
        version= '1.0.0',
        request= 'GetFeature',
        typename= 'eelis:valgla_vooluvesi',
        srsname= 'EPSG:4326',
        CQL_FILTER= f"INTERSECTS(shape,{polygon_point})",
        maxFeatures= "10",
        outputFormat= 'json',
)

params_eesvoolud = dict(
    service='WFS',
    version='2.0.0',
    request='GetFeature',
    typenames='HY_eesvoolud:HY.PhysicalWaters.Waterbodies_eesvool',
    srsname='EPSG:3301',
    CQL_FILTER= f"DWithin(geom, POINT({x} {y}), 100, meters)",
    maxFeatures="10",
    outputFormat='application/json',
)

params_joed = dict(
    service='WFS',
    version='1.0.0',
    request='GetFeature',
    typename='eelis:kr_vooluvesi',
    srsname='EPSG:4326',
    CQL_FILTER=f"INTERSECTS(shape,{polygon_point})",
    maxFeatures="10",
    outputFormat='application/json',
)

# Fetch data from WFS using requests
r = requests.get(url_eelis, params=params_valg)
data = gpd.GeoDataFrame.from_features(geojson.loads(r.content), crs="EPSG:4326")

r_eesvoolud = requests.get(url_maaparandus, params=params_eesvoolud)

prepare = requests.PreparedRequest()
prepare.prepare_url(url_maaparandus, params_eesvoolud)
print(prepare.url)

#eesvoolud = gpd.GeoDataFrame.from_features(geojson.loads(r_eesvoolud.content), crs="EPSG:4326")
#eesvoolud.to_csv("../output/csv/eesvoolud.csv", index=False)
#print(eesvoolud["geographicalname_geographicalname_spelling_spellingofname_text"])
#print(data.columns)
#print(data["veekogu_tyyp"], data["pindala"], data["veekogu_nimi"])
"""
# User-defined coordinates for catchment delineation
# x, y = 600000.017, 6450000  # hardcoded for testing script-only

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
        est_proj = "+proj=lcc +lat_0=57.5175539305556 +lon_0=24 +lat_1=59.3333333333333 +lat_2=58 +x_0=500000 +y_0=6375000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"
        new_crs = CRS.from_proj4(est_proj)
        profile.update({
            'crs': src.crs,
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
gdf_catchment_buffered = gpd.GeoDataFrame.from_features(geojson_features, crs='EPSG:3301').buffer(5).simplify(10)
gdf_catchment_4326 = gdf_catchment_buffered.to_crs(epsg=4326)

# Save the result as GeoJSON
gdf_catchment.to_file('../output/epsg3301/watershed.geojson', driver='GeoJSON')
gdf_catchment_buffered.to_file('../output/epsg3301/watershed_buffered.geojson', driver='GeoJSON')
print("Watershed delineation saved as GeoJSON")


# Convert the river network to a GeoDataFrame for export, saving result as GeoJSON
gdf_river_network = gpd.GeoDataFrame.from_features(branches, crs='EPSG:3301')
gdf_river_network.to_file('../output/epsg3301/river_network.geojson', driver='GeoJSON')
print("River network saved as GeoJSON")


catchment = gdf_catchment_4326[0]
print(catchment)
tabelid = ["e_301_muu_kolvik_a", "e_301_muu_kolvik_ka", "e_301_muu_kolvik_p", "e_302_ou_a",
           "e_303_haritav_maa_a", "e_304_lage_a", "e_305_puittaimestik_a",
           "e_305_puittaimestik_j", "e_305_puittaimestik_p", "e_306_margala_a",
           " e_306_margala_ka", "e_307_turbavali_a"]

color_map = {
    "e_301_muu_kolvik_a": "#FF0000",  # Red
    "e_301_muu_kolvik_ka": "#00FF00",  # Green
    "e_301_muu_kolvik_p": "#0000FF",  # Blue
    "e_302_ou_a": "#FFFF00",  # Yellow
    "e_303_haritav_maa_a": "#FF00FF",  # Magenta
    "e_304_lage_a": "#00FFFF",  # Cyan
    "e_305_puittaimestik_a": "#FFA500",  # Orange
    "e_305_puittaimestik_j": "#800080",  # Purple
    "e_305_puittaimestik_p": "#FFC0CB",  # Pink
    "e_306_margala_a": "#A52A2A",  # Brown
    "e_306_margala_ka": "#008000",  # Dark Green
    "e_307_turbavali_a": "#808080",  # Gray
}

results = []
for tabel in tabelid:
    try:
        config = load_config()
        with psycopg2.connect(**config) as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    f"""SELECT ST_AsGeoJSON(ST_Intersection(area.geom, ST_GeomFromText(%s, 4326)), 9)
                        FROM public.{tabel} as area
                        WHERE ST_Intersects(area.geom, ST_GeomFromText(%s, 4326))
                        AND NOT ST_IsEmpty(ST_Intersection(area.geom, ST_GeomFromText(%s, 4326)));
                    """, (str(catchment), str(catchment), str(catchment))
                )
                result = cursor.fetchall()
                if len(result) > 0:
                    results.append((tabel, result))  # Store table name with result
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)

kolvikud = []
for tabel, result in results:

    color = color_map.get(tabel.strip(), "#000000")
    geom = result  # This should be the geometry
    geom_dict = json.loads(result[0][0])

    feature = {
        "type": "Feature",
        "geometry": geom_dict,
        "properties": {
            "value": 1.0,
            "name": tabel,
            "color": color,
            }
    }
    kolvikud.append(feature)

# Convert the collected features into a GeoDataFrame
gdf_kolvikud = gpd.GeoDataFrame.from_features(kolvikud, crs='EPSG:3301')

# Export the GeoDataFrame to a shapefile
gdf_kolvikud.to_file('../output/epsg3301/kolvikud.geojson', driver='GeoJSON')