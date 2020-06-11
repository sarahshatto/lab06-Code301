-- STEP ONE: SCHEMA TABLE
DROP TABLE IF EXISTS locations;
-- -- THIS TELLS IT TO DELETE ANY EXISTING TABLE

-- THIS CREATES A NEW TABLE, USING VALUES FROM CONSTRUCTOR FOR ROW NAMES
CREATE TABLE locations (
  id SERIAL PRIMARY KEY, 
  search_query VARCHAR(255),
  formatted_query VARCHAR(255),
  latitude DECIMAL(12, 8), 
  longitude DECIMAL(12, 8)
);

-- TELL THE TABLE WHAT VALUES TO PUT INTO THE ROWS 
INSERT INTO locations ( search_query, formatted_query, latitude, longitude) VALUES ('test', 'testusa', 13.2, 12.4);

SELECT * FROM locations; 

-- TEST TABLE IN TERMINAL: $ psql -d city_explorer -f schema.sql