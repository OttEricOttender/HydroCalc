
import geopandas as gpd
import requests
from sqlalchemy import create_engine
import geojson
import geoalchemy2

pg_connection_url = 'postgresql://postgres:sql@localhost:5432/postgis_waterbasins'

engine = create_engine(pg_connection_url) #loob ühenduse andmebaasiga

BASEURL = 'https://gsavalik.envir.ee/geoserver/eelis/wfs?'

params = {
    'service': 'WFS',
    'version': '2.0.0',
    'request': 'GetFeature',
    'typename': 'eelis:valgla_jarv',
    'srsname': "EPSG:3301",
    'outputFormat': "json"
}

BASEURL2 = "https://gsavalik.envir.ee/geoserver/eelis/ows?service=WMS&version=1.3.0&request=GetCapabilities"
params2 = {
    'service': 'WMS',
    'version': '1.3.0',
    'request': 'GetCapabilities',
    'typename': 'eelis:valgla_jarv',
    'srsname': "EPSG:3301",
    'outputFormat': "json"
}

#Saame kihte laadida
def get_wfs_layers(baseurl):
    # vaata tooreid andmeid https://gsavalik.envir.ee/geoserver/eelis/wfs?service=WFS&version=1.3.0&request=GetFeature&typeName=eelis:alamvesikond_merega&outputFormat=application/json
    response = requests.get(baseurl, params=params)
    #teeb geodataframe, et see andmebaasile oleks vastuvõetav
    gdf = gpd.GeoDataFrame.from_features(geojson.loads(response.content), crs="EPSG:3301")
    return gdf

# Main execution to get GeoDataFrame and upload to PostGIS
gdf = get_wfs_layers(BASEURL)

#sinu postgrese andmebaas millega ühendada
pg = {
    'dbname': 'postgis_waterbasins',
    'user': "postgres",
    'password': "sql",
    'port': '5432',
    'host': 'localhost'
}

# Upload the GeoDataFrame to PostGIS using to_postgis
gdf.to_postgis(name=pg["dbname"], con=engine, schema="public", if_exists='replace', index=False)
