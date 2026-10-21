import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  MONGODB_URI: process.env.MONGODB_URI || '',
  JWT_SECRET: process.env.JWT_SECRET || 'deep_furniture_dev_jwt_secret_key_change_in_prod',
  CLIENT_URL: (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map(url => url.trim().replace(/\/$/, '')),
  OWNER_USERNAME: process.env.OWNER_USERNAME || '',
  OWNER_PASSWORD: process.env.OWNER_PASSWORD || '',
  DEMO_USERNAME: process.env.DEMO_USERNAME || 'demo',
  DEMO_PASSWORD: process.env.DEMO_PASSWORD || 'demo123',
};
