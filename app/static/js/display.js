document.addEventListener("DOMContentLoaded", () => {

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
                    const smoothChecked = window.currentPolygonStyle === "smooth" ? "checked" : "";
                    const ruggedChecked = window.currentPolygonStyle === "rugged" ? "checked" : "";
                    toggleDiv.innerHTML = `
                        <label>
                            <input type="radio" name="polygonStyle" value="smooth" id="smooth" ${smoothChecked}>
                            Sujuv
                        </label>
                        <label>
                            <input type="radio" name="polygonStyle" value="rugged" id="rugged" ${ruggedChecked}>
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

    //export
    window.updateMetadataPanel = updateMetadataPanel;

});