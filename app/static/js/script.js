// init. the map, set the view to Estonia's coordinates and a zoom level of 7
var map = L.map('map').setView([58.5953, 25.0136], 7); // Estonia's coordinates

// a base layer using OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// the GeoServer WMS layer from Maa-amet

/*
L.tileLayer.wms('http://localhost:9090/geoserver/estonia_maps/wms', {
    layers: 'maaamet:HALDUSPIIRID', 
    format: 'image/png',
    transparent: true,
    attribution: 'Maa-amet'
}).addTo(map);

L.tileLayer.wms('http://localhost:9090/geoserver/estonia_maps/wms', {
    layers: 'maaamet:eesti_ala', 
    format: 'image/png',
    transparent: true,
    attribution: 'Maa-amet'
}).addTo(map);

*/