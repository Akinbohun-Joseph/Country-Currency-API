CREATE DATABASE IF NOT EXISTS country_currency_db;

USE country_currency_db;

CREATE TABLE IF NOT EXISTS countries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  capital VARCHAR(255),
  region VARCHAR(100),
  population BIGINT NOT NULL,
  currency_code VARCHAR(10),
  exchange_rate DECIMAL(15, 4),
  estimated_gdp DECIMAL(20, 2),
  flag_url TEXT,
  last_refreshed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_name (name),
  INDEX idx_region (region),
  INDEX idx_currency (currency_code),
  INDEX idx_gdp (estimated_gdp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS metadata (
  id INT PRIMARY KEY DEFAULT 1,
  last_refreshed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  total_countries INT DEFAULT 0,
  
  CHECK (id = 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO metadata (id, last_refreshed_at, total_countries) 
VALUES (1, CURRENT_TIMESTAMP, 0)
ON DUPLICATE KEY UPDATE id = id;