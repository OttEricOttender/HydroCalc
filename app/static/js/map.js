const latitude= document.getElementById('latitude');
const longitude= document.getElementById('longitude');
const otsi= document.getElementById('otsi');



var map = L.map('map', {
    crs: L.CRS.EPSG3857, // default map projection, supports EPSG:4326 layers
    center: [59, 25.5], // initial view over Estonia
    zoom: 8
});

// Base layer in EPSG:3857
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

let selectedCoords = null;
let marker = null;

// Convert latitude/longitude to EPSG:3301
function latLngToEST97(lat, lng) {
    var est97Projection = '+proj=lcc +lat_0=57.5175539305556 +lon_0=24 +lat_1=59.3333333333333 +lat_2=58 +x_0=500000 +y_0=6375000 +ellps=GRS80 +units=m +no_defs';
    var wgs84 = '+proj=longlat +datum=WGS84 +no_defs';
    var est97Coords = proj4(wgs84, est97Projection, [lng, lat]);
    return { easting: est97Coords[0], northing: est97Coords[1] };
}

function findWatershed() {
    if (!selectedCoords) {
        alert("Please select a point on the map.");
        return;
    }
const { lat, lng } = selectedCoords;
const est97Coords = latLngToEST97(lat, lng);

fetch('http://127.0.0.1:5000/coordinates', { 
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        latitude: lat,
        longitude: lng,
        easting: est97Coords.easting,
        northing: est97Coords.northing
    })
})
.then(response => response.json())
.then(data => console.log('Success:', data))
.catch(error => console.error('Error:', error));
}

// Handle map click to get and send coordinates
map.on('click', function(e) {
    var lat = e.latlng.lat;
    var lng = e.latlng.lng;
    selectedCoords = {lat, lng};

    console.log(`Selected Latitude: ${lat}, Longitude: ${lng}`);

    if (marker) { map.removeLayer(marker); } 

    marker =L.marker([lat, lng]).addTo(map)
        .bindPopup(`Coordinates: ${lat}, ${lng}`)
        .openPopup();
});

// Handle coordinates inserted as an input.
otsi.addEventListener('click', function(e) {
    var lat= parseFloat(latitude.value);
    var lng= parseFloat(longitude.value);

    console.log(`Selected Latitude: ${lat}, Longitude: ${lng}`);

    if (marker) { map.removeLayer(marker); } 

    marker =L.marker([lat, lng]).addTo(map)
        .bindPopup(`Coordinates: ${lat}, ${lng}`)
        .openPopup();
});

// Helper function for loading GeoJSON layers
function fetchIfExists(url, callback) {
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('File not found');
            }
            return response.json();
        })
        .then(data => callback(data))
        .catch(error => console.log(`${url} not found. Waiting for generation.`));
}

// Load and display watershed layer
fetchIfExists('http://127.0.0.1:5000/output/converted/watershed_wgs84.geojson', data => {
    L.geoJSON(data, {
        style: {
            color: 'red',
            fillColor: 'orange',
            fillOpacity: 0.3,
            weight: 2
        }
    }).addTo(map).bindPopup("Watershed Area");
});

// Load and display river network layer
fetchIfExists('http://127.0.0.1:5000/output/converted/river_network_wgs84.geojson', data => {
    L.geoJSON(data, {
        style: {
            color: 'blue',
            weight: 2
        }
    }).addTo(map).bindPopup("River Network");
});