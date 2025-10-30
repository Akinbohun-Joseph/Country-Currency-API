import axios from 'axios';
import { RestCountry, ExchangeRateResponse, ProcessedCountry } from '../types';
import { upsertCountry, updateMetadata } from '../models/country';

const COUNTRIES_API_URL = process.env.COUNTRIES_API_URL || 
  'https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies';
  
const EXCHANGE_API_URL = process.env.EXCHANGE_API_URL || 
  'https://open.er-api.com/v6/latest/USD';

const API_TIMEOUT = 10000;

async function fetchCountriesData(): Promise<RestCountry[]> {
  try {
    console.log('📡 Fetching countries from RestCountries API...');
    
    const response = await axios.get<RestCountry[]>(COUNTRIES_API_URL, {
      timeout: API_TIMEOUT
    });
    
    console.log(`✅ Fetched ${response.data.length} countries`);
    return response.data;
    
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Countries API request timed out');
      }
      if (error.response) {
        throw new Error(
          `Countries API returned ${error.response.status}: ${error.response.statusText}`
        );
      }
      if (error.request) {
        throw new Error('Countries API did not respond');
      }
    }
    throw new Error(`Failed to fetch countries data: ${error}`);
  }
}

async function fetchExchangeRates(): Promise<{ [key: string]: number }> {
  try {
    console.log('💱 Fetching exchange rates...');
    
    const response = await axios.get<ExchangeRateResponse>(EXCHANGE_API_URL, {
      timeout: API_TIMEOUT
    });
    
    if (response.data.result !== 'success') {
      throw new Error('Exchange rates API returned non-success result');
    }
    
    console.log(`✅ Fetched exchange rates for ${Object.keys(response.data.rates).length} currencies`);
    return response.data.rates;
    
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Exchange rates API request timed out');
      }
      if (error.response) {
        throw new Error(
          `Exchange rates API returned ${error.response.status}: ${error.response.statusText}`
        );
      }
      if (error.request) {
        throw new Error('Exchange rates API did not respond');
      }
    }
    throw new Error(`Failed to fetch exchange rates: ${error}`);
  }
}

function processCountryData(
  country: RestCountry,
  exchangeRates: { [key: string]: number }
): ProcessedCountry {
  let currencyCode: string | null = null;
  
  if (country.currencies && country.currencies.length > 0) {
    currencyCode = country.currencies[0].code;
  }
  
  let exchangeRate: number | null = null;
  
  if (currencyCode) {
    exchangeRate = exchangeRates[currencyCode] || null;
  }
  
  let estimatedGDP: number | null = null;
  
  if (exchangeRate !== null) {
    const multiplier = Math.random() * (2000 - 1000) + 1000;
    estimatedGDP = (country.population * multiplier) / exchangeRate;
  }
  
  return {
    name: country.name,
    capital: country.capital || null,
    region: country.region || null,
    population: country.population,
    currency_code: currencyCode,
    exchange_rate: exchangeRate,
    estimated_gdp: estimatedGDP,
    flag_url: country.flag || null
  };
}

export async function refreshCountries(): Promise<void> {
  try {
    console.log('🔄 Starting countries refresh...');
    
    const [countriesData, exchangeRates] = await Promise.all([
      fetchCountriesData(),
      fetchExchangeRates()
    ]);
    
    console.log(`📊 Processing ${countriesData.length} countries...`);
    
    const processedCountries: ProcessedCountry[] = countriesData.map(country =>
      processCountryData(country, exchangeRates)
    );
    
    console.log('💾 Saving countries to database...');
    
    const batchSize = 10;
    for (let i = 0; i < processedCountries.length; i += batchSize) {
      const batch = processedCountries.slice(i, i + batchSize);
      
      await Promise.all(
        batch.map(country => upsertCountry(country))
      );
      
      const progress = Math.min(i + batchSize, processedCountries.length);
      console.log(`  ↳ Saved ${progress}/${processedCountries.length} countries`);
    }
    
    await updateMetadata();
    
    console.log('✅ Countries refresh completed successfully!');
    
  } catch (error) {
    console.error('❌ Countries refresh failed:', error);
    throw error;
  }
}

export function validateCountriesData(countriesData: any): boolean {
  if (!Array.isArray(countriesData)) {
    return false;
  }
  
  if (countriesData.length === 0) {
    return false;
  }
  
  const firstCountry = countriesData[0];
  if (!firstCountry.name || typeof firstCountry.name !== 'string') {
    return false;
  }
  if (typeof firstCountry.population !== 'number') {
    return false;
  }
  
  return true;
}

export function getRandomMultiplier(min: number = 1000, max: number = 2000): number {
  return Math.random() * (max - min) + min;
}

export function formatGDP(gdp: number): string {
  if (gdp >= 1_000_000_000_000) {
    return `$${(gdp / 1_000_000_000_000).toFixed(2)}T`;
  } else if (gdp >= 1_000_000_000) {
    return `$${(gdp / 1_000_000_000).toFixed(2)}B`;
  } else if (gdp >= 1_000_000) {
    return `$${(gdp / 1_000_000).toFixed(2)}M`;
  } else {
    return `$${gdp.toFixed(2)}`;
  }
}

export async function checkAPIsHealth(): Promise<{
  countries: boolean;
  exchange: boolean;
}> {
  const result = {
    countries: false,
    exchange: false
  };
  
  try {
    await axios.get(COUNTRIES_API_URL, { timeout: 5000 });
    result.countries = true;
  } catch (error) {
    console.error('Countries API health check failed:', error);
  }
  
  try {
    await axios.get(EXCHANGE_API_URL, { timeout: 5000 });
    result.exchange = true;
  } catch (error) {
    console.error('Exchange rates API health check failed:', error);
  }
  
  return result;
}