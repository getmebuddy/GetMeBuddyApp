// src/api/config.js or similar file
const API_CONFIG = {
    // Development
    development: {
      API_URL: 'http://localhost:8000/api',
    },
    // Staging
    staging: {
      API_URL: 'https://staging-api.getmebuddy.com/api',
    },
    // Production
    production: {
      API_URL: 'https://api.getmebuddy.com/api',
    }
  };
  
  // Determine current environment (you can set this based on build config)
  const ENVIRONMENT = __DEV__ ? 'development' : 'production';
  
  export const API_URL = API_CONFIG[ENVIRONMENT].API_URL;