import { Request, Response } from 'express';
import * as CountryModel from '../models/country';
import { refreshCountries } from '../services/countryService';
import { generateSummaryImage, getImagePath } from '../services/imageService';
import { promises as fs } from 'fs';
import { validateQueryParams } from '../utils/validation';

export async function refreshCountriesController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    console.log('📥 Received refresh request');
    
    await refreshCountries();
    
    const totalCountries = await CountryModel.getStatus();
    const topCountries = await CountryModel.getTopCountriesByGDP(5);
    
    await generateSummaryImage({
      total_countries: totalCountries.total_countries,
      top_countries: topCountries,
      last_refreshed_at: totalCountries.last_refreshed_at
    });
    
    res.status(200).json({
      message: 'Countries data refreshed successfully',
      total_countries: totalCountries.total_countries,
      last_refreshed_at: totalCountries.last_refreshed_at
    });
    
    console.log('✅ Refresh completed successfully');
    
  } catch (error) {
    console.error('❌ Refresh failed:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (errorMessage.includes('API')) {
      res.status(503).json({
        error: 'External data source unavailable',
        details: errorMessage
      });
    } else {
      res.status(500).json({
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      });
    }
  }
}

export async function getAllCountriesController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const filters = validateQueryParams(req.query);
    const countries = await CountryModel.getAllCountries(filters);
    res.status(200).json(countries);
  } catch (error) {
    console.error('Error getting countries:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
}

export async function getCountryByNameController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { name } = req.params;
    
    if (!name || name.trim() === '') {
      res.status(400).json({
        error: 'Country name is required'
      });
      return;
    }
    
    const country = await CountryModel.getCountryByName(name);
    
    if (!country) {
      res.status(404).json({
        error: 'Country not found'
      });
      return;
    }
    
    res.status(200).json(country);
    
  } catch (error) {
    console.error('Error getting country:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
}

export async function deleteCountryController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { name } = req.params;
    
    if (!name || name.trim() === '') {
      res.status(400).json({
        error: 'Country name is required'
      });
      return;
    }
    
    const deleted = await CountryModel.deleteCountryByName(name);
    
    if (!deleted) {
      res.status(404).json({
        error: 'Country not found'
      });
      return;
    }
    
    res.status(200).json({
      message: `Country "${name}" deleted successfully`
    });
    
  } catch (error) {
    console.error('Error deleting country:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
}

export async function getStatusController(
req: Request, res: Response, next: unknown): Promise<void> {
  try {
    const status = await CountryModel.getStatus();
    res.status(200).json(status);
  } catch (error) {
    console.error('Error getting status:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
}
export async function getSummaryImageController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const imagePath = getImagePath();
    try {
      await fs.access(imagePath);
    } catch {
      res.status(404).json({
        error: 'Summary image not found',
        hint: 'Call POST /countries/refresh to generate the image'
      });
      return;
    }
    
    res.sendFile(imagePath);
    
  } catch (error) {
    console.error('Error sending image:', error);
    res.status(500).json({
      error: 'Error sending image file'
    });
  }
}

