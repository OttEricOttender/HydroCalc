from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS
import subprocess

app = Flask(__name__)
CORS(app)


@app.route('/')
def home():
    return render_template('index.html')

@app.route('/output/<path:filename>')
def get_file(filename):
    return send_from_directory('../output', filename)



@app.route('/coordinates', methods=['POST'])
def receive_coordinates():
    data = request.get_json()
    lat = data.get('latitude')
    lng = data.get('longitude')
    easting = data.get('easting')
    northing = data.get('northing')
    #snapped_easting = data.get('snapped_easting')  
    #snapped_northing = data.get('snapped_northing')

    # Log received data for testing
    print(f"Received coordinates: Latitude: {lat}, Longitude: {lng}")
    print(f"EPSG:3301 Coordinates: Easting: {easting}, Northing: {northing}")

    # -- Calling the watershed delineation script --
    
    # This is with frontend 30m buffer validaton included - not implemented in the script yet
    #subprocess.call(['python', '../scripts/delineate.py', str(easting), str(northing), str(snapped_easting), str(snapped_northing)]) 
    # Regular behavior - script works
    subprocess.call(['python', '../scripts/delineate.py', str(easting), str(northing)])

    # Convert GeoJSON to WGS84
    subprocess.call(['python', '../scripts/convert_geojson.py'])


    return jsonify({"status": "success", "message": "Coordinates received"}), 200

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)

