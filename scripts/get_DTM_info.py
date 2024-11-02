import rasterio

# Path to your DEM file
dem_path = '/opt/homebrew/Cellar/geoserver/2.26.0/libexec/data_dir/data/raster/DTM_5m_eesti.tif'

# Open the DEM file
with rasterio.open(dem_path) as src:
    bounds = src.bounds
    print(src.crs)
    print(f"DEM Boundaries (UTM):\n"
          f"Left (Min Easting): {bounds.left}\n"
          f"Right (Max Easting): {bounds.right}\n"
          f"Bottom (Min Northing): {bounds.bottom}\n"
          f"Top (Max Northing): {bounds.top}\n")
    print(src.meta)
    print()
    print(src.transform)
