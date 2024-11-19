import psycopg2

# Database connection details
db_params = {
    'dbname': 'postgis_waterbasins',
    'user': 'postgres',
    'password': 'sql',
    'host': 'localhost',  # e.g., 'localhost' or an IP address
    'port': '5432'  # default PostgreSQL port
}

def getClosestRiverCoordinates(lat, lng):
    try:
        conn = psycopg2.connect(**db_params)
        cursor = conn.cursor()
        print("Connected to the database successfully.")

        # Example Query: Fetch water basins within a specified distance from a point
        # Replace with your own table and query
        point = f'SRID=4326;POINT({lat} {lng})'
        distance = 200  # Distance in meters
        query = f"""
        SELECT geom, geographicalname_geographicalname_spelling_spellingofname_text FROM public.eesvoolud 
        where ST_DWithin(geom, {point}, 250)
        order by ST_Distance(geom, {point})
        LIMIT 1;
        """

        # Execute the query with parameters
        cursor.execute(query, (point, distance))

        # Fetch the results
        results = cursor.fetchall()
        for row in results:
            print(row)

    except Exception as e:
        print(f"Error connecting to the database: {e}")
    finally:
        # Close the cursor and connection
        if cursor:
            cursor.close()
        if conn:
            conn.close()
