const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const REQUIRED_VARS = [
  'MONGODB_URI',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'JWT_REFRESH_EXPIRES_IN',
  'SEED_ADMIN_EMAIL',
  'SEED_ADMIN_PASSWORD',
];

const loadAndValidateEnv = () => {
  const envPath = path.resolve(process.cwd(), '.env');

  if (!fs.existsSync(envPath)) {
    throw new Error('.env file is missing. Copy .env.example to .env and fill in the values.');
  }

  const result = dotenv.config({ path: envPath });

  if (result.error) {
    throw new Error(`Failed to load .env: ${result.error.message}`);
  }

  const missing = REQUIRED_VARS.filter((key) => !process.env[key]?.trim());

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  if (process.env.NODE_ENV === 'production' && !process.env.CORS_ORIGIN?.trim()) {
    throw new Error('CORS_ORIGIN is required in production');
  }
};

module.exports = loadAndValidateEnv;
