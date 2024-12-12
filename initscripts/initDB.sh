#!/bin/bash
set -e

# Variables
DATA_DIR="/data"
DOWNLOAD_URL="https://geoportaal.maaamet.ee/index.php?lang_id=1&plugin_act=otsing&andmetyyp=ETAK&dl=1&f=ETAK_Eesti_SHP_kolvikud.zip&page_id=609"
ZIP_FILE="$DATA_DIR/ETAK_Eesti_SHP_kolvikud.zip"

# Download the ZIP file
echo "Downloading shapefiles..."
curl  --progress-bar -o "$ZIP_FILE" -L "$DOWNLOAD_URL"

# Unzip the downloaded file
echo "Unzipping shapefiles..."
unzip -o "$ZIP_FILE" -d "$DATA_DIR"

#create postgis extension in postgre database
psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "CREATE EXTENSION IF NOT EXISTS postgis;"

# Iterate through each .shp file and import it into the database
for SHP_FILE in "$DATA_DIR"/*.shp; do
    # Extract table name from the filename
    TABLE_NAME=$(basename "$SHP_FILE" .shp)
    echo "Importing $SHP_FILE as table $TABLE_NAME..."

    # Import the shapefile using shp2pgsql and psql
    shp2pgsql -D -I -s 3301:4326 -S "$SHP_FILE" "public.$TABLE_NAME" | psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -v ON_ERROR_STOP=1
done

# Clean up
echo "Cleaning up downloaded and unzipped files..."
rm -f "$ZIP_FILE"

rm -f "$DATA_DIR"/*.shp "$DATA_DIR"/*.dbf "$DATA_DIR"/*.shx "$DATA_DIR"/*.prj "$DATA_DIR"/*.cpg

echo "Database initialization completed successfully."
