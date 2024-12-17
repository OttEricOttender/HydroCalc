document.addEventListener("DOMContentLoaded", () => {

function fetchIfExists(url, callback) {
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('File not found');
            }
            return response.json();
        })
        .then(data => {
            callback(data);
        })
        .catch(error => {
            console.log(`${url} not found. Waiting for generation...`, error);
        });
}

// Load and toggle watershed layer (smooth or rugged)
function loadPolygonWithStyle() {
    return new Promise((resolve, reject) => {
        const watershedUrl = document.querySelector('input[name="polygonStyle"]:checked').value === "smooth"
            ? '/output/converted/watershed_buffered.geojson'
            : '/output/converted/watershed.geojson';

        // removing the previous layer (if it exists)
        if (window.waterShedLayer) {
            map.removeLayer(window.waterShedLayer);
        }

        fetchIfExists(url.concat(watershedUrl), (data) => {
            try {
                // adding new watershed layer to the map
                window.waterShedLayer = L.geoJSON(data, {
                    style: {
                        color: 'red',
                        fillColor: 'orange',
                        fillOpacity: 0.1,
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

function addCoordinateMarkers(userCoords, snappedCoords) {
    // Removing existing markers from the map
    if (window.circleMarkers.length) {
        window.circleMarkers.forEach(marker => map.removeLayer(marker));
        window.circleMarkers = [];
    }

    // Adding a marker for user-entered coordinates
    if (userCoords) {
        const userCircle = L.circleMarker([userCoords.lat, userCoords.lon], {
            color: 'blue',
            radius: 5,
        }).addTo(map).bindPopup("Kasutaja sisestatud koordinaadid");
        window.circleMarkers.push(userCircle);

        // Update sidebar with user coordinates
        const userCoordsDiv = document.getElementById('user-coords');
        if (userCoordsDiv) {
            userCoordsDiv.innerText = `Kasutaja sisestatud: (${userCoords.lat.toFixed(4)}, ${userCoords.lon.toFixed(4)})`;
        }
    }

    // Add a marker for snapped coordinates
    if (snappedCoords) {
        const snappedCircle = L.circleMarker([snappedCoords.lat, snappedCoords.lon], {
            color: 'red',
            radius: 5,
        }).addTo(map).bindPopup("Vooluveekogu koordinaadid");
        window.circleMarkers.push(snappedCircle);

        // Update sidebar with snapped coordinates
        const snappedCoordsDiv = document.getElementById('snapped-coords');
        if (snappedCoordsDiv) {
            snappedCoordsDiv.innerText = `Vooluveekogu: (${snappedCoords.lat.toFixed(4)}, ${snappedCoords.lon.toFixed(4)})`;
        }
    }
}


    // Dynamic metadata panel update
    function updateMetadataPanel() {
        return new Promise((resolve, reject) => {
            fetchIfExists(url.concat('/output/converted/metadata.geojson'), (data) => {
                try {
                    const features = data.features;
                    const metadataPanel = document.getElementById('metadata-panel');
    
                    if (!metadataPanel) {
                        reject("Metadata panel not found in the DOM.");
                        return;
                    }
    
                    // removing any leftover elements except for the `status` div
                    Array.from(metadataPanel.children).forEach(child => {
                        if (child.id !== 'status') {
                            metadataPanel.removeChild(child);
                        }
                    });
    
                    // adding watershed style and kõlvikud toggle
                    const toggleDiv = document.createElement('div');
                    const isLandUsageEnabled = window.kolvikudLayer ? "checked" : "";

                    toggleDiv.innerHTML = `
                        <label>
                            <input type="radio" name="polygonStyle" value="smooth" id="smooth" checked>
                            Sujuv
                        </label>
                        <label>
                            <input type="radio" name="polygonStyle" value="rugged" id="rugged">
                            Täpne
                        </label>
                        <label>
                            <input type="checkbox" name="landUsageToggle" id="landUsageToggle" ${isLandUsageEnabled}>
                            Kõlvikud
                        </label>
                    `;
                    metadataPanel.appendChild(toggleDiv);
    
                    // adding user and snapped coordinates
                    let userCoords, snappedCoords;
                    features.forEach(feature => {
                        if (feature.geometry?.user_coords) {
                            userCoords = feature.geometry.user_coords;
                        }
                        if (feature.geometry?.snapped_coords) {
                            snappedCoords = feature.geometry.snapped_coords;
                        }
                    });

                    // Render coordinate markers and update sidebar
                    addCoordinateMarkers(userCoords, snappedCoords);
    
                    const coordsSection = document.createElement('div');
                    coordsSection.innerHTML = `
                        <p><b>Koordinaadid:</b></p>
                        <div class="info-item">
                            <div class="color-dot" id="dot-blue"></div>
                            <div id="user-coords">
                                Kasutaja sisestatud: (${userCoords?.lat.toFixed(4) || "-"}, ${userCoords?.lon.toFixed(4) || "-"})
                            </div>
                        </div>
                        <div class="info-item">
                            <div class="color-dot" id="dot-red"></div>
                            <div id="snapped-coords">
                                Vooluveekogu: (${snappedCoords?.lat.toFixed(4) || "-"}, ${snappedCoords?.lon.toFixed(4) || "-"})
                            </div>
                        </div>
                    `;
                    metadataPanel.appendChild(coordsSection);
    
                    // adding surface area
                    const surfaceArea = features[0]?.properties?.surface_area_sqkm;
                    const areaSection = document.createElement('div');
                    areaSection.id = "surface-area";
                    areaSection.innerHTML = `<b>Lisainfo:</b><br>Valgala pindala: ${surfaceArea?.toFixed(2) || "-"} km²`;
                    metadataPanel.appendChild(areaSection);
    
                    // adding land usage percentages (if enabled)
                    const landUsageToggle = document.getElementById('landUsageToggle');
                    if (landUsageToggle && landUsageToggle.checked) {
                        const kolvikudDiv = document.createElement('div');
                        kolvikudDiv.className = "kolvikud";

                        features.forEach(feature => {
                            if (feature.properties?.group_name && feature.properties?.proportion && feature.properties?.color) {
                                // div element for each kõlvik proportion item
                                const itemDiv = document.createElement('div');
                                itemDiv.className = "kolvikud-item";

                                // adding color to better identify
                                const colorDot = document.createElement('span');
                                colorDot.style.display = "inline-block";
                                colorDot.style.width = "12px";
                                colorDot.style.height = "12px";
                                colorDot.style.borderRadius = "50%";
                                colorDot.style.backgroundColor = feature.properties.color;
                                colorDot.style.marginRight = "8px";
                                itemDiv.appendChild(colorDot);


                                const textNode = document.createTextNode(`${feature.properties.group_name}: ${feature.properties.proportion.toFixed(2)} %`);
                                itemDiv.appendChild(textNode);

                                kolvikudDiv.appendChild(itemDiv); // appending the kõlvik to others
                            }
                        });
                        metadataPanel.appendChild(kolvikudDiv);
                    }
    
                    resolve(); // metadata panel is fully rendered
                } catch (error) {
                    reject(error); // handling any rendering errors
                }
            });
        });
    }
    

    // event listener for kõlvikud and info rendering
   document.addEventListener("change", async (event) => {
    if (event.target.name === "landUsageToggle") {
            try {
                await updateLandUsage(); // it has to update first (avoid race-conditions)
                await updateMetadataPanel();

            } catch (error) {
                console.error("Error updating land usage or metadata panel:", error);
            }
        }
    });


    // removing all GeoJSON layers (used for the watershed, river network, land usage, etc.)
    function performCleanup() {
    map.eachLayer(function (layer) {
        if (layer instanceof L.GeoJSON) {
            map.removeLayer(layer);
        }
    });

    // removing all circle markers (used for user-selected or snapped coordinates)
    window.circleMarkers.forEach(circleMarker => {
        map.removeLayer(circleMarker);
    });
    window.circleMarkers = [];


    selectedCoords = null; // reset 

    // clearing metadata panel (except the status div)
    const metadataPanel = document.getElementById('metadata-panel');
    Array.from(metadataPanel.children).forEach(child => {
        if (child.id !== 'status') {
            metadataPanel.removeChild(child);
        }
    });
    console.log("Cleanup complete. Layers, metadata panel, and selected coordinates reset.");
}

function autoZoomToBounds() {
    const bounds = L.latLngBounds(); // init. an empty bounds object

    /*
    // Expanding the bounds to "match" the watershed layer
    if (window.waterShedLayer) {
        const watershedBounds = window.waterShedLayer.getBounds();
        if (watershedBounds.isValid()) {
            bounds.extend(watershedBounds);
        } else {
            console.warn("Invalid bounds for watershed layer - skipping...");
        }
    } */ 


    if (window.riverNetworkLayer) {
        bounds.extend(window.waterShedLayer.getBounds());
    }

    // Including coordinate markers (if available)
    window.circleMarkers.forEach(marker => {
        const markerPosition = marker.getLatLng();
        bounds.extend(markerPosition);
    });

    // Final check to see if bounds are valid before fitting
    if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [30, 30] }); // 100,100 for now
        console.log("Map zoom adjusted to fit all layers and markers.");
    } else {
        console.warn("No valid bounds available for zooming. Using default bounds.");
        map.setView([59, 25.5], 8); // if all else fails, revert to default
    }
}



function updateLayers() {
    console.log("Updating layers...");

    updateMetadataPanel()
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


// Global scope for functions
window.performCleanup = performCleanup;
window.updateLayers = updateLayers;
});