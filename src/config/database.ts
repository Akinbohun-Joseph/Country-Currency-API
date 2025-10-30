import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'country_currency_db',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0,
  multipleStatements: true,
  timezone: '+00:00'
});

export async function initializeDatabase(): Promise<void> {
  try {
    console.log('🔄 Initializing database...');
    
    const connection = await pool.getConnection();
    
    try {
      await connection.query(`
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      
      await connection.query(`
        CREATE TABLE IF NOT EXISTS metadata (
          id INT PRIMARY KEY DEFAULT 1,
          last_refreshed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          total_countries INT DEFAULT 0,
          CHECK (id = 1)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      
      await connection.query(`
        INSERT INTO metadata (id, last_refreshed_at, total_countries)
        VALUES (1, CURRENT_TIMESTAMP, 0)
        ON DUPLICATE KEY UPDATE id = id
      `);
      
      console.log('✅ Database initialized successfully');
      
    } finally {
      connection.release();
    }
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  }
}

export async function testConnection(): Promise<boolean> {
  try {
    const connection = await pool.getConnection();
    await connection.query('SELECT 1');
    connection.release();
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}

export async function closeDatabase(): Promise<void> {
  try {
    await pool.end();
    console.log('Database connections closed');
  } catch (error) {
    console.error('Error closing database:', error);
  }
}

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing database...');
  await closeDatabase();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, closing database...');
  await closeDatabase();
  process.exit(0);
});