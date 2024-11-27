import json
from pyproj import Transformer

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

# Paths for input and output
input_river_network = "../output/epsg3301/river_network.geojson"
output_river_network = "../output/converted/river_network_wgs84.geojson"
input_watershed = "../output/epsg3301/watershed.geojson"
output_watershed = "../output/converted/watershed_wgs84.geojson"
input_watershed_buffered = "../output/epsg3301/watershed_buffered.geojson"
output_watershed_buffered = "../output/converted/watershed_buffered_wgs84.geojson"


convert_watershed(input_watershed, output_watershed)
convert_watershed(input_watershed_buffered, output_watershed_buffered)
convert_river_network(input_river_network, output_river_network)
