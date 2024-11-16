const latitude= document.getElementById('latitude');
const longitude= document.getElementById('longitude');
const otsi= document.getElementById('otsi');

const url='http://127.0.0.1:5001';

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
        alert("Palun vali punkt kaardil.");
        return;
    }
const { lat, lng } = selectedCoords;
const est97Coords = latLngToEST97(lat, lng);
const rasterBounds = {
    minEasting: 365000.0,
    maxEasting: 740000.0,
    minNorthing: 6375000.0,
    maxNorthing: 6635000.0
}
// Checking boundaries
if (
    est97Coords.easting < rasterBounds.minEasting ||
    est97Coords.easting > rasterBounds.maxEasting ||
    est97Coords.northing < rasterBounds.minNorthing ||
    est97Coords.northing > rasterBounds.maxNorthing
) {
    alert("Palun vali punkt, mis jääb Eesti piiridesse.");
    selectedCoords = null;
    return;
}
performCleanup();
showStatus("Arvutab... Palun oodake.");
fetch(url.concat('/coordinates'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        latitude: lat,
        longitude: lng,
        easting: est97Coords.easting,
        northing: est97Coords.northing
    })
})
    .then(response => {
        if (!response.ok) {
            throw new Error("Request not ready")
        }
        return response.json();
    })
    .then(data => {
        console.log('Success:', data);
        showStatus("Arvutamine valmis.");
        updateLayers(); // reloading layers dynamically
        setTimeout(hideStatus, 3000);

    })
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
        .bindPopup(`Koordinaadid: ${lat}, ${lng}`)
        .openPopup();
});

// Handle coordinates inserted as an input.
otsi.addEventListener('click', function(e) {
    var lat= parseFloat(latitude.value);
    var lng= parseFloat(longitude.value);
    selectedCoords = {lat, lng};

    console.log(`Selected Latitude: ${lat}, Longitude: ${lng}`);

    if (marker) { map.removeLayer(marker); } 

    marker =L.marker([lat, lng]).addTo(map)
        .bindPopup(`Koordinaadid: ${lat}, ${lng}`)
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

function updateLayers() {
    // Load and display watershed layer
    fetchIfExists(url.concat('/output/converted/watershed.geojson'), data => {
        L.geoJSON(data, {
            style: {
                color: 'red',
                fillColor: 'orange',
                fillOpacity: 0.3,
                weight: 2
            }
        }).addTo(map).bindPopup("Valgala");
    });

    // Load and display river network layer
    fetchIfExists(url.concat('/output/converted/river_network.geojson'), data => {
        L.geoJSON(data, {
            style: {
                color: 'blue',
                weight: 2
            }
        }).addTo(map).bindPopup("Jõgikond");
    });

    fetchIfExists(url.concat('/output/converted/metadata.geojson'), data => {
        // Extracting features from metadata
        const features = data.features;
    
        // Find the surface area from the first feature's properties
        const surfaceArea = features[0].properties.surface_area_sqkm;
    
        // Extract coordinates for user and snapped points
        let userCoords, snappedCoords;
    
        features.forEach(feature => {
            if (feature.geometry.user_coords) {
                userCoords = feature.geometry.user_coords;
            } else if (feature.geometry.snapped_coords) {
                snappedCoords = feature.geometry.snapped_coords;
            }
        });
    
        // Displaying markers for user and snapped coordinates (if available)
        if (userCoords) {
            const userCircle = L.circleMarker([userCoords.lat, userCoords.lon], {
                color: 'blue',
                radius: 5
            }).addTo(map).bindPopup("Kasutaja sisestatud koordinaadid");
            circleMarkers.push(userCircle);
    
            document.getElementById('user-coords').innerText = `Kasutaja sisestatud: (${userCoords.lat.toFixed(5)}, ${userCoords.lon.toFixed(5)})`;
        }
    
        if (snappedCoords) {
            const snappedCircle = L.circleMarker([snappedCoords.lat, snappedCoords.lon], {
                color: 'red',
                radius: 5
            }).addTo(map).bindPopup("Vooluveekogu koordinaadid");
            circleMarkers.push(snappedCircle);
    
            document.getElementById('snapped-coords').innerText = `Vooluveekogu: (${snappedCoords.lat.toFixed(5)}, ${snappedCoords.lon.toFixed(5)})`;
        }
    
        document.getElementById('surface-area').innerHTML = `Valgala pindala: ${surfaceArea} km<sup>2</sup>`;
    });

    map.removeLayer(marker);
}

let circleMarkers = [];

function performCleanup() {
    
    map.eachLayer(function(layer) {
        if (layer instanceof L.GeoJSON) {
            map.removeLayer(layer);
        }   
    });
    circleMarkers.forEach(circleMarker => {
        map.removeLayer(circleMarker);
    });
    circleMarkers = []; 
    selectedCoords = null;
}

function showStatus(message) {
    const statusDiv = document.getElementById('status');
    statusDiv.style.display = 'block'; 
    statusDiv.textContent = message; 
}

function hideStatus() {
    const statusDiv = document.getElementById('status');
    statusDiv.style.display = 'none'; 
}



updateLayers();






