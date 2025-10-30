import { ValidationErrors, CountryQueryParams, SortOption } from '../types';

export function validateCountryData(data: any): {
  isValid: boolean;
  errors: ValidationErrors;
} {
  const errors: ValidationErrors = {};
  
  if (!data.name) {
    errors.name = 'is required';
  } else if (typeof data.name !== 'string') {
    errors.name = 'must be a string';
  } else if (data.name.trim().length === 0) {
    errors.name = 'cannot be empty';
  } else if (data.name.length > 255) {
    errors.name = 'must be less than 255 characters';
  }
  
  if (data.population === undefined || data.population === null) {
    errors.population = 'is required';
  } else if (typeof data.population !== 'number') {
    errors.population = 'must be a number';
  } else if (data.population < 0) {
    errors.population = 'must be a positive number';
  } else if (!Number.isInteger(data.population)) {
    errors.population = 'must be an integer';
  }
  
  if (!data.currency_code) {
    errors.currency_code = 'is required';
  } else if (typeof data.currency_code !== 'string') {
    errors.currency_code = 'must be a string';
  } else if (data.currency_code.trim().length !== 3) {
    errors.currency_code = 'must be a 3-letter ISO code (e.g., NGN, USD)';
  } else if (!/^[A-Z]{3}$/.test(data.currency_code.trim())) {
    errors.currency_code = 'must contain only uppercase letters (e.g., NGN, USD)';
  }
  
  if (data.capital !== undefined && data.capital !== null) {
    if (typeof data.capital !== 'string') {
      errors.capital = 'must be a string';
    } else if (data.capital.length > 255) {
      errors.capital = 'must be less than 255 characters';
    }
  }
  
  if (data.region !== undefined && data.region !== null) {
    if (typeof data.region !== 'string') {
      errors.region = 'must be a string';
    } else if (data.region.length > 100) {
      errors.region = 'must be less than 100 characters';
    }
  }
  
  if (data.exchange_rate !== undefined && data.exchange_rate !== null) {
    if (typeof data.exchange_rate !== 'number') {
      errors.exchange_rate = 'must be a number';
    } else if (data.exchange_rate <= 0) {
      errors.exchange_rate = 'must be a positive number';
    }
  }
  
  if (data.flag_url !== undefined && data.flag_url !== null) {
    if (typeof data.flag_url !== 'string') {
      errors.flag_url = 'must be a string';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateQueryParams(params: any): CountryQueryParams {
  const validated: CountryQueryParams = {};
  
  if (params.region && typeof params.region === 'string') {
    validated.region = params.region.trim();
  }
  
  if (params.currency && typeof params.currency === 'string') {
    validated.currency = params.currency.trim().toUpperCase();
  }
  
  if (params.sort && typeof params.sort === 'string') {
    const sortValue = params.sort.trim().toLowerCase();
    const validSorts = Object.values(SortOption);
    if (validSorts.includes(sortValue as SortOption)) {
      validated.sort = sortValue;
    }
  }
  
  return validated;
}

export function isValidNumber(value: any): boolean {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

export function sanitizeString(value: string): string {
  return value
    .trim()
    .replace(/[<>]/g, '')
    .slice(0, 255);
}