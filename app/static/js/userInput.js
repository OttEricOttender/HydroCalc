 document.addEventListener("DOMContentLoaded", () => {
// DOM elements for latitude/longitude input and button
 window.latitude = document.getElementById('latitude');
 window.longitude = document.getElementById('longitude');
const otsi = document.getElementById('otsi');

// Convert latitude/longitude to EPSG:3301
function latLngToEST97(lat, lng) {
    var est97Projection = '+proj=lcc +lat_0=57.5175539305556 +lon_0=24 +lat_1=59.3333333333333 +lat_2=58 +x_0=500000 +y_0=6375000 +ellps=GRS80 +units=m +no_defs';
    var wgs84 = '+proj=longlat +datum=WGS84 +no_defs';
    var est97Coords = proj4(wgs84, est97Projection, [lng, lat]);
    return { easting: est97Coords[0], northing: est97Coords[1] };
}

// Boundary validation function
function validateCoordinates(lat, lng) {
    const est97Coords = latLngToEST97(lat, lng);
    const rasterBounds = {
        minEasting: 365000.0,
        maxEasting: 740000.0,
        minNorthing: 6375000.0,
        maxNorthing: 6635000.0
    };

    // checking if coordinates fall within bounds
    if (
        est97Coords.easting < rasterBounds.minEasting ||
        est97Coords.easting > rasterBounds.maxEasting ||
        est97Coords.northing < rasterBounds.minNorthing ||
        est97Coords.northing > rasterBounds.maxNorthing
    ) {
        alert("Palun vali punkt, mis jääb Eesti piiridesse.");
        return false;
    }

    return est97Coords;
}

// Handle map click to get and send coordinates
map.on('click', function(e) {
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;
    
    window.selectedCoords = {lat, lng};

    // updating display of selected coords
    window.latitude.value = lat.toFixed(4);
    window.longitude.value = lng.toFixed(4);

    console.log(`Selected Latitude: ${lat}, Longitude: ${lng}`);

    if (marker) { map.removeLayer(marker); }

    marker =L.marker([lat, lng]).addTo(map)
        .bindPopup(`Koordinaadid: ${lat.toFixed(4)}, ${lng.toFixed(4)}`)
        .openPopup();
});

// Handle coordinates inserted as an input.
otsi.addEventListener('click', function() {
    const lat= parseFloat(latitude.value);
    const lng= parseFloat(longitude.value);

    window.selectedCoords = {lat, lng};

    // updating display of selected coords
    window.latitude.value = lat.toFixed(4);
    window.longitude.value = lng.toFixed(4);
    
    console.log(`Selected Latitude: ${lat}, Longitude: ${lng}`);

    if (marker) { map.removeLayer(marker); }

    marker =L.marker([lat, lng]).addTo(map)
        .bindPopup(`Koordinaadid: ${lat.toFixed(4)}, ${lng.toFixed(4)}`)
        .openPopup();
});

window.validateCoordinates = validateCoordinates;
});