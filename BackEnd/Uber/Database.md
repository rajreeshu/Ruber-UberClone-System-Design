```SQL
create database uber_system;

CREATE USER 'uber_application'@'localhost' IDENTIFIED BY 'uber123';

GRANT ALL PRIVILEGES ON uber_system.* TO 'uber_application'@'localhost';

FLUSH PRIVILEGES;

SHOW GRANTS FOR 'uber_application'@'localhost';
```
     
     
```SQL
CREATE TABLE cities (
city_id INT AUTO_INCREMENT PRIMARY KEY,
city_name VARCHAR(100) NOT NULL,
-- City center (single coordinate)
city_center POINT NOT NULL,
-- Optional city boundary
boundary POLYGON NOT NULL,
-- Spatial indexes
SPATIAL INDEX idx_city_center (city_center),
SPATIAL INDEX idx_boundary (boundary)
);

```