const path = require('path');
const crypto = require('crypto');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const isProduction = process.env.NODE_ENV === 'production';

const getRequired = (name, devFallback) => {
  const value = process.env[name];
  const placeholders = ['your_value_here', 'your_anthropic_api_key_here'];
  if (value && value.trim() && !placeholders.includes(value.trim())) {
    return value.trim();
  }
  if (isProduction) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  if (devFallback) {
    return devFallback;
  }
  return '';
};

const jwtSecret = getRequired('JWT_SECRET', 'isds_dev_jwt_secret_do_not_use_in_prod');
const adminSecretKey = getRequired('ADMIN_SECRET_KEY', crypto.randomBytes(18).toString('hex'));

const frontendUrl = getRequired('FRONTEND_URL', 'http://localhost:5173');

const corsOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
if (!corsOrigins.includes(frontendUrl)) {
  corsOrigins.push(frontendUrl);
}
if (!isProduction) {
  corsOrigins.push('http://localhost:5173', 'http://127.0.0.1:5173');
}

const smtp = {
  host: process.env.SMTP_HOST || '',
  port: parseInt(process.env.SMTP_PORT, 10) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  user: process.env.SMTP_USER || '',
  pass: process.env.SMTP_PASS || '',
  from: process.env.SMTP_FROM || 'noreply@isds.edu',
};

module.exports = {
  isProduction,
  port: parseInt(process.env.PORT, 10) || 5000,
  jwtSecret,
  adminSecretKey,
  databaseUrl: process.env.DATABASE_URL || '',
  frontendUrl,
  corsOrigins,
  anthropicApiKey: getRequired('ANTHROPIC_API_KEY', ''),
  firebaseProjectId: getRequired('FIREBASE_PROJECT_ID', ''),
  firebaseServiceAccountBase64: getRequired('FIREBASE_SERVICE_ACCOUNT_BASE64', ''),
  smtp,
  uploadDir: path.join(__dirname, '..', 'uploads'),
};
