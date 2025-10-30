import { createCanvas } from 'canvas';
import fs from 'fs/promises';
import path from 'path';
import { SummaryData } from '../types';
import { formatGDP } from './countryService';

const CACHE_DIR = path.join(process.cwd(), 'cache');
const IMAGE_PATH = path.join(CACHE_DIR, 'summary.png');

const IMAGE_WIDTH = 800;
const IMAGE_HEIGHT = 600;

async function ensureCacheDir(): Promise<void> {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating cache directory:', error);
  }
}

export async function generateSummaryImage(data: SummaryData): Promise<void> {
  try {
    await ensureCacheDir();
    
    const canvas = createCanvas(IMAGE_WIDTH, IMAGE_HEIGHT);
    const ctx = canvas.getContext('2d');
    
    const gradient = ctx.createLinearGradient(0, 0, 0, IMAGE_HEIGHT);
    gradient.addColorStop(0, '#1e3c72');
    gradient.addColorStop(1, '#2a5298');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Country Statistics Summary', IMAGE_WIDTH / 2, 80);
    
    ctx.font = '32px Arial';
    ctx.fillText(
      `Total Countries: ${data.total_countries}`,
      IMAGE_WIDTH / 2,
      150
    );
    
    ctx.font = 'bold 28px Arial';
    ctx.fillText('Top 5 Countries by GDP', IMAGE_WIDTH / 2, 220);
    
    ctx.font = '24px Arial';
    ctx.textAlign = 'left';
    
    let yPosition = 270;
    const xStart = 100;
    
    data.top_countries.forEach((country, index) => {
      const rank = index + 1;
      const gdpFormatted = country.estimated_gdp 
        ? formatGDP(country.estimated_gdp)
        : 'N/A';
      
      const text = `${rank}. ${country.name} - ${gdpFormatted}`;
      
      ctx.fillText(text, xStart, yPosition);
      yPosition += 40;
    });
    
    ctx.textAlign = 'center';
    ctx.font = '20px Arial';
    ctx.fillText(
      `Last Refreshed At: ${new Date(data.last_refreshed_at).toLocaleString()}`,
      IMAGE_WIDTH / 2,
      IMAGE_HEIGHT - 40
    );
    
    const buffer = canvas.toBuffer('image/png');
    await fs.writeFile(IMAGE_PATH, buffer);
    
    console.log('✅ Summary image generated successfully at', IMAGE_PATH);
    
  } catch (error) {
    console.error('❌ Error generating summary image:', error);
  }
}


export function getImagePath(): string {
  return IMAGE_PATH;
}

export async function deleteImage(): Promise<void> {
  try {
    await fs.unlink(IMAGE_PATH);
    console.log('Summary image deleted');
  } catch (error) {
    if ((error as any).code !== 'ENOENT') {
      console.error('Error deleting image:', error);
    }
  }
}
