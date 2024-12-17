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
    

    function findWatershed(retries = 3, delay = 500) {
        if (!window.selectedCoords) {
            alert("Palun vali punkt kaardil.");         
            return;
        }
        const { lat, lng } = window.selectedCoords;
        const validationResult = validateCoordinates(lat, lng); 
        if (!validationResult) return;
        
        const {easting, northing} = validationResult;
    
        performCleanup(); // clean old layers and markers - defined in layers.js
        showMetadataPanel();
        showStatus("Arvutab... Palun oodake.");
    
        fetch(url.concat('/coordinates'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                easting: easting,
                northing: northing,
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            showStatus("Arvutamine valmis.");
            updateLayers(); // trigger layer updates - defined in layers.js
            setTimeout(hideStatus, 3000);
        })
        .catch(error => {
            console.error('Error:', error);
            if (retries > 0) {
                setTimeout(() => findWatershed(retries - 1, delay * 2), delay);
            } else {
                console.log("All retries failed.");
            }
        });
    }
    
    window.findWatershed = findWatershed;

});