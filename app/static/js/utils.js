document.addEventListener("DOMContentLoaded", () => {

    function showMetadataPanel() {
        const metadataPanel = document.getElementById('metadata-panel');
        if (metadataPanel) {
            metadataPanel.style.display = 'block';
            console.log("Metadata panel visible.");
        } else {
            console.warn("Metadata panel not found in the DOM.");
        }
    }

    
    function showStatus(message) {
        const statusDiv = document.getElementById('status');
        if (statusDiv) {
            statusDiv.style.display = 'block';
            statusDiv.textContent = message;
            console.log(`Status: ${message}`);
        } else {
            console.warn("Status element not found in the DOM.");
        }
    }
    
    function hideStatus() {
        const statusDiv = document.getElementById('status');
        if (statusDiv) {
            statusDiv.style.display = 'none';
            console.log("Status message hidden.");
        } else {
            console.warn("Status element not found in the DOM.");
        }
    }

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
        
            // Expanding the bounds to the extend of the river network
            if (window.riverNetworkLayer) { // more reliable then using conditional waterhshed layers
                bounds.extend(window.riverNetworkLayer.getBounds());
            }
        
            // Including coordinate markers (if available)
            window.circleMarkers.forEach(marker => {
                const markerPosition = marker.getLatLng();
                bounds.extend(markerPosition);
            });
        
            // Final check to see if bounds are valid before fitting
            if (bounds.isValid()) {
                // [100,100] seems reasonable for now, given some river networks don't fully extend to the limits of the waterhsed
                map.fitBounds(bounds, { padding: [100, 100] }); 
                console.log("Map zoom adjusted to fit all layers and markers.");
            } else {
                console.warn("No valid bounds available for zooming. Using default bounds.");
                map.setView([59, 25.5], 8); // if all else fails, revert to default
            }
        }

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

    // exports
    window.showMetadataPanel = showMetadataPanel;
    window.showStatus = showStatus;
    window.hideStatus = hideStatus;
    window.performCleanup = performCleanup;
    window.autoZoomToBounds = autoZoomToBounds;
    window.fetchIfExists = fetchIfExists;

});