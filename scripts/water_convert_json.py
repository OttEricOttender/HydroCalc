import json
from pyproj import Transformer
import os

# Setting up the transformer (EPSG:3301 -> EPSG:4326)
transformer = Transformer.from_crs("EPSG:3301", "EPSG:4326", always_xy=True)


def convert_coords(easting, northing):
    longitude, latitude = transformer.transform(easting, northing)
    return longitude, latitude


def convert_polygon(input_path, output_path):
    print(f"Converting (Polygon): {input_path} -> {output_path}")
    try:
        # Load the GeoJSON file
        with open(input_path, 'r') as file:
            geojson_data = json.load(file)
        
        # Process features
        for feature in geojson_data['features']:
            geometry_type = feature['geometry']['type']
            coordinates = feature['geometry']['coordinates']
            
            if geometry_type == "Polygon":
                feature['geometry']['coordinates'] = [
                    [convert_coords(coord[0], coord[1]) for coord in ring]
                    for ring in coordinates
                ]
            
            elif geometry_type == "MultiPolygon":
                feature['geometry']['coordinates'] = [
                    [[convert_coords(coord[0], coord[1]) for coord in ring] for ring in polygon]
                    for polygon in coordinates
                ]
        
        # Save the converted GeoJSON
        with open(output_path, 'w') as file:
            json.dump(geojson_data, file, indent=2)
        
        print(f"Successfully converted: {input_path} -> {output_path}")
    
    except Exception as e:
        print(f"Error converting Polygon data: {e}")


def convert_linestring(input_path, output_path):
    print(f"Converting (LineString): {input_path} -> {output_path}")
    try:
        with open(input_path, 'r') as file:
            geojson_data = json.load(file)

        for feature in geojson_data['features']:
            geometry_type = feature['geometry']['type']
            coordinates = feature['geometry']['coordinates']
            
            if geometry_type == "LineString":
                feature['geometry']['coordinates'] = [
                    convert_coords(coord[0], coord[1]) for coord in coordinates
                ]
            elif geometry_type == "MultiLineString":
                feature['geometry']['coordinates'] = [
                    [convert_coords(coord[0], coord[1]) for coord in line] for line in coordinates
                ]

        with open(output_path, 'w') as file:
            json.dump(geojson_data, file, indent=2)
        
        print(f"Successfully converted: {input_path} -> {output_path}")
    except Exception as e:
        print(f"Error converting LineString data: {e}")

# Input/Output paths
input_sea_areas = "../data/epsg3301/kr_mereala.json"

epsg3301_files = [
    "../data/epsg3301/kr_mereala.json",
    "../data/epsg3301/kr_jarv.json",
    "../data/epsg3301/kr_vooluvesi.json"
]

output_sea_areas = "../data/converted/kr_mereala.geojson"
output_lakes = "../data/converted/kr_jarv.geojson"
output_watercourse = "../data/converted/kr_vooluvesi.geojson"
    
try:
    convert_polygon(epsg3301_files[0], output_sea_areas)
    convert_polygon(epsg3301_files[1], output_lakes)
    convert_linestring(epsg3301_files[2], output_watercourse)
except Exception as e:
    print(f"An error occurred: {e}")
