 // The code that has been commented out is intended for the 30m rule check (from the water source)

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

/*
function calculateClosestWaterPoint(lat, lng, waterBodies) {
    let closestDistance = Infinity;
    let closestPoint = null;

    waterBodies.features.forEach(feature => {
        const coords = feature.geometry.coordinates;

        if (feature.geometry.type === "Polygon" || feature.geometry.type === "MultiPolygon") {
            coords.flat(Infinity).forEach(point => {
                const distance = calculateDistance(lat, lng, point[1], point[0]); // GeoJSON is [lng, lat]
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestPoint = point;
                }
            });
        } else if (feature.geometry.type === "LineString") {
            coords.forEach(point => {
                const distance = calculateDistance(lat, lng, point[1], point[0]);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestPoint = point;
                }
            });
        }
    });

    return { closestDistance, closestPoint };
}

// Helper function: calculating distance between two lat/lon points (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // distance in meters
}
*/

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
    /*
    // distance validation
    const thresholdDistance = 30; // 30 meters
    const seaResult = calculateClosestWaterPoint(lat, lng, window.sea);
    const lakesResult = calculateClosestWaterPoint(lat, lng, window.lakes);
    const riversResult = calculateClosestWaterPoint(lat, lng, window.rivers);

    const results = [seaResult, lakesResult, riversResult].filter(
        result => result.closestDistance <= thresholdDistance
    );

        if (results.length === 0) {
        alert("Teie valitud koordinaadid ei asu ühegi veekogu lähedal (max " + thresholdDistance + "m)");
        return false;
    }

    // finding the closest valid point
    const closestResult = results.reduce((a, b) =>
        a.closestDistance < b.closestDistance ? a : b
    );

    const snappedCoords = latLngToEST97(closestResult.closestPoint[1], closestResult.closestPoint[0]);
    return { easting: est97Coords.easting, northing: est97Coords.northing, snappedCoords };
    */
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