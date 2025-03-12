document.addEventListener("DOMContentLoaded", () => {
    // --- Defining globals ---
    window.url = 'http://127.0.0.1:5001'; // dynamic URL

    // Leaflet map instance
    window.map = L.map('map', {
        crs: L.CRS.EPSG3857, // default map projection, supports EPSG:4326 layers
        center: [59, 25.5], // initial view over Estonia
        zoom: 8
    });

    // Global variables
    window.latitude = null;
    window.longitude = null;
    window.selectedCoords = null; // stores validated coordinates (easting, northing)
    window.marker = null;         // marker for selected coordinates
    window.circleMarkers = [];    // array for user/snapped coordinate markers
    window.watershedLayer = null; // active watershed layer
    window.kolvikudLayer = null; // active land usage layer

    // Flags
    window.currentPolygonStyle = "smooth"; // "Sujuv" vs "Täpne" toggle state

    
    // GeoJSON global storage
    window.sea = null;    // Sea areas 
    window.lakes = null;  // Lakes 
    window.rivers = null; // Flowing water bodies 
    

    console.log("Global variables initialized.");

    // --- Defining globals complete ---

    // Add base layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // tutorial popup functionality
    const tutorialBtn = document.getElementById('tutorial_button');
    const tutorial = document.getElementById('tutorial');

    // Event listener for toggling tutorial
    tutorialBtn.addEventListener("click", () => {
        tutorial.classList.toggle("open");
    });

});