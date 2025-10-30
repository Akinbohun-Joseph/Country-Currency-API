import { pool } from '../config/database';
import { Country, ProcessedCountry, StatusResponse } from '../types';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export async function upsertCountry(country: ProcessedCountry): Promise<Country> {
  const query = `
    INSERT INTO countries (
      name,
      capital,
      region,
      population,
      currency_code,
      exchange_rate,
      estimated_gdp,
      flag_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      capital = VALUES(capital),
      region = VALUES(region),
      population = VALUES(population),
      currency_code = VALUES(currency_code),
      exchange_rate = VALUES(exchange_rate),
      estimated_gdp = VALUES(estimated_gdp),
      flag_url = VALUES(flag_url),
      last_refreshed_at = CURRENT_TIMESTAMP
  `;
  
  const values = [
    country.name,
    country.capital,
    country.region,
    country.population,
    country.currency_code,
    country.exchange_rate,
    country.estimated_gdp,
    country.flag_url
  ];
  
  try {
    const [result] = await pool.query<ResultSetHeader>(query, values);
    
    let countryId = result.insertId;
    
    if (countryId === 0) {
      const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT id FROM countries WHERE name = ?',
        [country.name]
      );
      
      if (rows.length > 0) {
        countryId = rows[0].id;
      }
    }
    
    return {
      id: countryId,
      name: country.name,
      capital: country.capital,
      region: country.region,
      population: country.population,
      currency_code: country.currency_code,
      exchange_rate: country.exchange_rate,
      estimated_gdp: country.estimated_gdp,
      flag_url: country.flag_url,
      last_refreshed_at: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Error upserting country:', error);
    throw error;
  }
}

export async function getAllCountries(filters: {
  region?: string;
  currency?: string;
  sort?: string;
}): Promise<Country[]> {
  let query = 'SELECT * FROM countries';
  const conditions: string[] = [];
  const values: any[] = [];
  
  if (filters.region) {
    conditions.push('region = ?');
    values.push(filters.region);
  }
  
  if (filters.currency) {
    conditions.push('currency_code = ?');
    values.push(filters.currency);
  }
  
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  
  if (filters.sort) {
    switch (filters.sort) {
      case 'gdp_desc':
        query += ' ORDER BY estimated_gdp DESC';
        break;
      case 'gdp_asc':
        query += ' ORDER BY estimated_gdp ASC';
        break;
      case 'name_asc':
        query += ' ORDER BY name ASC';
        break;
      case 'name_desc':
        query += ' ORDER BY name DESC';
        break;
    }
  }
  
  try {
    const [rows] = await pool.query<RowDataPacket[]>(query, values);
    
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      capital: row.capital,
      region: row.region,
      population: row.population,
      currency_code: row.currency_code,
      exchange_rate: row.exchange_rate,
      estimated_gdp: row.estimated_gdp,
      flag_url: row.flag_url,
      last_refreshed_at: row.last_refreshed_at
    }));
    
  } catch (error) {
    console.error('Error getting countries:', error);
    throw error;
  }
}

export async function getCountryByName(name: string): Promise<Country | null> {
  try {
    const query = 'SELECT * FROM countries WHERE LOWER(name) = LOWER(?)';
    const [rows] = await pool.query<RowDataPacket[]>(query, [name]);
    
    if (rows.length === 0) {
      return null;
    }
    
    const row = rows[0];
    return {
      id: row.id,
      name: row.name,
      capital: row.capital,
      region: row.region,
      population: row.population,
      currency_code: row.currency_code,
      exchange_rate: row.exchange_rate,
      estimated_gdp: row.estimated_gdp,
      flag_url: row.flag_url,
      last_refreshed_at: row.last_refreshed_at
    };
    
  } catch (error) {
    console.error('Error getting country by name:', error);
    throw error;
  }
}

export async function deleteCountryByName(name: string): Promise<boolean> {
  try {
    const query = 'DELETE FROM countries WHERE LOWER(name) = LOWER(?)';
    const [result] = await pool.query<ResultSetHeader>(query, [name]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error deleting country:', error);
    throw error;
  }
}

export async function updateMetadata(): Promise<void> {
  try {
    const [countResult] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM countries'
    );
    
    const totalCountries = countResult[0].count;
    
    await pool.query(
      'UPDATE metadata SET total_countries = ?, last_refreshed_at = CURRENT_TIMESTAMP WHERE id = 1',
      [totalCountries]
    );
    
  } catch (error) {
    console.error('Error updating metadata:', error);
    throw error;
  }
}

export async function getStatus(): Promise<StatusResponse> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT total_countries, last_refreshed_at FROM metadata WHERE id = 1'
    );
    
    if (rows.length === 0) {
      return {
        total_countries: 0,
        last_refreshed_at: new Date().toISOString()
      };
    }
    
    const row = rows[0];
    return {
      total_countries: row.total_countries,
      last_refreshed_at: row.last_refreshed_at
    };
    
  } catch (error) {
    console.error('Error getting status:', error);
    throw error;
  }
}

export async function getTopCountriesByGDP(limit: number = 5): Promise<Country[]> {
  try {
    const query = `
      SELECT * FROM countries 
      WHERE estimated_gdp IS NOT NULL 
      ORDER BY estimated_gdp DESC 
      LIMIT ?
    `;
    
    const [rows] = await pool.query<RowDataPacket[]>(query, [limit]);
    
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      capital: row.capital,
      region: row.region,
      population: row.population,
      currency_code: row.currency_code,
      exchange_rate: row.exchange_rate,
      estimated_gdp: row.estimated_gdp,
      flag_url: row.flag_url,
      last_refreshed_at: row.last_refreshed_at
    }));
    
  } catch (error) {
    console.error('Error getting top countries:', error);
    throw error;
  }
}