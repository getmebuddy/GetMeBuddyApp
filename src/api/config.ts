// src/api/config.ts

interface ApiConfigOptions {
  API_URL: string;
}

interface ApiEnvironments {
  development: ApiConfigOptions;
  staging: ApiConfigOptions;
  production: ApiConfigOptions;
}

const API_CONFIG: ApiEnvironments = {
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