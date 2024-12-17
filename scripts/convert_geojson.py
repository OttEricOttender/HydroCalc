import json
from pyproj import Transformer
import os

# setting up the transformer (EPSG:3301 -> EPSG:4326)
transformer = Transformer.from_crs("EPSG:3301", "EPSG:4326", always_xy=True)

def convert_coords(easting, northing):
    # transforming the coords
    longitude, latitude = transformer.transform(easting, northing)
    return longitude, latitude

def convert_watershed(input_path, output_path):
    
    # loading
    with open(input_path, 'r') as file:
        geojson_data = json.load(file)

    # Convert polygon coordinates
    polygon_coords = geojson_data['features'][0]['geometry']['coordinates'][0]
    converted_coords = [convert_coords(coord[0], coord[1]) for coord in polygon_coords]
    geojson_data['features'][0]['geometry']['coordinates'][0] = converted_coords

    # saving
    with open(output_path, 'w') as file:
        json.dump(geojson_data, file, indent=2)

    print(f"Converted {input_path} from EPSG:3301 to WGS84 and saved as {output_path}")

def convert_river_network(input_path, output_path):

    with open(input_path, 'r') as file:
        geojson_data = json.load(file)

    # Convert LineString coordinates
    for feature in geojson_data['features']:
        coords = feature['geometry']['coordinates']
        feature['geometry']['coordinates'] = [
            convert_coords(coord[0], coord[1]) for coord in coords
        ]

    # saving
    with open(output_path, 'w') as file:
        json.dump(geojson_data, file, indent=2)

    print(f"Converted {input_path} from EPSG:3301 to WGS84 and saved as {output_path}")


def convert_metadata_coords(input_path, output_path):
    with open(input_path, 'r') as file:
        metadata = json.load(file)

    for feature in metadata['features']:
        if feature['geometry'] is None:
            continue

        if "user_coords" in feature['geometry']:
            # Convert user coordinates
            user_x, user_y = feature['geometry']['user_coords']
            user_latlon = convert_coords(user_x, user_y)
            feature['geometry']['user_coords'] = {"lat": user_latlon[1], "lon": user_latlon[0]}
        elif "snapped_coords" in feature['geometry']:
            snap_x, snap_y = feature['geometry']['snapped_coords']
            snap_latlon = convert_coords(snap_x, snap_y)
            feature['geometry']['snapped_coords'] = {"lat": snap_latlon[1], "lon": snap_latlon[0]}

    with open(output_path, 'w') as file:
        json.dump(metadata, file)
    print(f"Converted {input_path} from EPSG:3301 to WGS84 and saved as {output_path}")


epsg3301_files = [
    "../output/epsg3301/watershed.geojson",
    "../output/epsg3301/river_network.geojson",
    "../output/epsg3301/metadata.geojson",
    "../output/epsg3301/watershed_buffered.geojson"
]

output_watershed = "../output/converted/watershed.geojson"
output_watershed_buffered = "../output/converted/watershed_buffered.geojson"
output_river_network = "../output/converted/river_network.geojson"
output_metadata = "../output/converted/metadata.geojson"

try:
    convert_watershed(epsg3301_files[0], output_watershed)
    convert_river_network(epsg3301_files[1], output_river_network)
    convert_metadata_coords(epsg3301_files[2], output_metadata)
    convert_watershed(epsg3301_files[3], output_watershed_buffered)
except Exception as e:
    print("here", e)


for file in epsg3301_files:
    if os.path.exists(file):
        os.remove(file)
        print(f"EPSG:3301 temporary file {file} deleted.")