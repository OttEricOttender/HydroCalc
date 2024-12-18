document.addEventListener("DOMContentLoaded", () => {

    function findWatershed(retries = 3, delay = 500) {
        if (!window.selectedCoords) {
            alert("Palun vali punkt kaardil.");         
            return;
        }
        const { lat, lng } = window.selectedCoords;
        const validationResult = validateCoordinates(lat, lng); 
        if (!validationResult) return;
        
        // const {easting, northing, snappedCoords} = validationResult; // for the 30m rule version
        const {easting, northing} = validationResult;

    
        performCleanup(); // clean old layers and markers - defined in utils.js
        showMetadataPanel();
        showStatus("Arvutab... Palun oodake.");
    
        fetch(url.concat('/coordinates'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                easting: easting,
                northing: northing
            //    snapped_easting: snappedCoords.easting,
            //    snapped_northing: snappedCoords.northing
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