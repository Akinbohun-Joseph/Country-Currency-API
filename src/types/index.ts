export interface Country {
  id: number;
  name: string;
  capital: string | null;
  region: string | null;
  population: number;
  currency_code: string | null;
  exchange_rate: number | null;
  estimated_gdp: number | null;
  flag_url: string | null;
  last_refreshed_at: string;
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

export interface RestCountry {
  name: string;
  capital?: string;
  region?: string;
  population: number;
  flag?: string;
  currencies?: Currency[];
}

export interface ExchangeRateResponse {
  result: string;
  base_code: string;
  rates: { [key: string]: number };
  time_last_update_utc?: string;
}

export interface CountryQueryParams {
  region?: string;
  currency?: string;
  sort?: string;
}

export interface StatusResponse {
  total_countries: number;
  last_refreshed_at: string;
}

export interface ErrorResponse {
  error: string;
  details?: any;
}

export interface ValidationErrors {
  [field: string]: string;
}

export interface ProcessedCountry {
  name: string;
  capital: string | null;
  region: string | null;
  population: number;
  currency_code: string | null;
  exchange_rate: number | null;
  estimated_gdp: number | null;
  flag_url: string | null;
}

export interface SummaryData {
  total_countries: number;
  top_countries: Country[];
  last_refreshed_at: string;
}

export interface DatabaseConfig {
  host: string;
  user: string;
  password: string;
  database: string;
  port: number;
}

export function isCountry(value: any): value is Country {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.id === 'number' &&
    typeof value.name === 'string' &&
    typeof value.population === 'number'
  );
}

export function isValidationError(value: any): value is ErrorResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.error === 'string'
  );
}

export enum SortOption {
  GDP_DESC = 'gdp_desc',
  GDP_ASC = 'gdp_asc',
  NAME_ASC = 'name_asc',
  NAME_DESC = 'name_desc'
}

export type DbResult<T> = T[];

export type CountryOrNull = Promise<Country | null>;