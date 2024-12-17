document.addEventListener("DOMContentLoaded", () => {

    // Load and toggle watershed layer (smooth or rugged)
function loadPolygonWithStyle() {
    return new Promise((resolve, reject) => {
        const watershedUrl = document.querySelector('input[name="polygonStyle"]:checked').value === "smooth"
            ? '/output/converted/watershed_buffered.geojson'
            : '/output/converted/watershed.geojson';

        // removing the previous layer (if it exists)
        if (window.watershedLayer) {
            map.removeLayer(window.watershedLayer);
        }

        fetchIfExists(url.concat(watershedUrl), (data) => {
            try {
                // adding new watershed layer to the map
                window.watershedLayer = L.geoJSON(data, {
                    style: {
                        color: 'red',
                        fillColor: 'red',
                        fillOpacity: 0.025,
                        weight: 2
                    }
                }).addTo(map).bindPopup("Valgala");

                resolve(); // layer added -> promise resolved
            } catch (error) {
                console.error("Error adding watershed layer:", error);
                reject(error); // error -> reject promise
            }
        });

        if (window.marker) map.removeLayer(window.marker);      
    });
}


   // Event listener for polygon style toggle (smooth/rugged)
   document.addEventListener("change", (event) => {
    if (event.target.name === "polygonStyle") {
        console.log(`Switching to ${event.target.value} watershed style.`);
        window.currentPolygonStyle = event.target.value;
        // reloading
        loadPolygonWithStyle();
    }
});

// Adding river network layer
function addRiverNetworkLayer() {
    return new Promise((resolve, reject) => {
        fetchIfExists(url.concat('/output/converted/river_network.geojson'), (data) => {
            try {
                // adding the river network layer to the map
                const riverNetworkLayer = L.geoJSON(data, {
                    style: {
                        color: 'blue',
                        weight: 2
                    }
                }).addTo(map).bindPopup("Jõgikond");
                window.riverNetworkLayer = riverNetworkLayer;

                resolve(); 
            } catch (error) {
                console.error("Error adding river network layer:", error);
                reject(error); 
            }
        });
    });
}


function updateLandUsage() {
    return new Promise((resolve, reject) => {
        const landUsageToggle = document.getElementById('landUsageToggle');
        if (!landUsageToggle.checked) {
            // Remove layer if unchecked
            if (window.kolvikudLayer) {
                map.removeLayer(window.kolvikudLayer);
                window.kolvikudLayer = null;
            }
            resolve(); // no action needed, can be resolved immediately
            return;
        }

        fetchIfExists(url.concat('/output/converted/kolvikud.geojson'), (data) => {
            try {
                if (window.kolvikudLayer) {
                    map.removeLayer(window.kolvikudLayer);
                }
                const layers = data.features.map(feature =>
                    L.geoJSON(feature, {
                        style: { color: feature.properties.color }
                    })
                );
                window.kolvikudLayer = L.layerGroup(layers).addTo(map);
                resolve(); // land usage layer successfully updated
            } catch (error) {
                console.error("Error updating land usage layer:", error);
                reject(error); // rejecting the promise on error
            }
        });
    });
}

function updateLayers() {
    console.log("Updating layers...");

    updateMetadataPanel() // others rely on this being rendered first
        .then(() => {
            console.log("Metadata panel updated, proceeding to layer updates.");

            // Chain the auto-zoom after all layer updates
            return Promise.all([
                loadPolygonWithStyle(),
                addRiverNetworkLayer(),
                updateLandUsage()
            ]);
        })
        .then(() => {
            console.log("All layers updated, triggering auto-zoom.");
            autoZoomToBounds(); 
        })
        .catch(error => {
            console.error("Error during layer updates:", error);
        });
}

    // exports
    window.loadPolygonWithStyle = loadPolygonWithStyle;
    window.addRiverNetworkLayer = addRiverNetworkLayer;
    window.updateLandUsage = updateLandUsage;
    window.updateLayers = updateLayers;
});