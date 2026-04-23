# Frontend Environment Configuration

## Directory: `frontend/`

This directory contains environment-specific configuration files for the React frontend application.

### Files

#### `.env.development`

- **Purpose**: Development environment configuration
- **Usage**: Automatically loaded when running `npm start`
- **API Base URL**: `http://process.env.REACT_APP_API_BASE_URL`
- **Logging**: Enabled (debug level)

Example:

```
REACT_APP_API_BASE_URL=http://process.env.REACT_APP_API_BASE_URL
REACT_APP_API_TIMEOUT=30000
REACT_APP_ENVIRONMENT=development
REACT_APP_LOG_LEVEL=debug
```

#### `.env.production`

- **Purpose**: Production environment configuration
- **Usage**: Automatically loaded when running `npm run build`
- **API Base URL**: Production API endpoint (e.g., https://api.priestfy.com)
- **Logging**: Disabled (error level only)

Example:

```
REACT_APP_API_BASE_URL=https://api.priestfy.com
REACT_APP_API_TIMEOUT=30000
REACT_APP_ENVIRONMENT=production
REACT_APP_LOG_LEVEL=error
```

#### `.env.example`

- **Purpose**: Template for environment configuration
- **Usage**: Reference file for creating `.env.local` or `.env.*.local` files
- **Should be committed**: Yes

#### `.env.local` (Create as needed)

- **Purpose**: Local overrides for any environment
- **Usage**: Override environment variables locally without affecting others
- **Should be committed**: No (add to `.gitignore`)

### Configuration Files

#### `src/config/apiConfig.js`

- **Purpose**: Centralized API configuration and endpoints
- **Exports**:
  - `API_ENDPOINTS`: Object containing all API endpoint definitions
  - `API_CONFIG`: Configuration object with base URL and settings
  - `buildApiUrl()`: Helper function to build full API URLs
  - `getApiEndpoint()`: Helper function to get dynamic endpoints
- **Usage**:
  ```javascript
  import { API_ENDPOINTS, API_CONFIG } from "./config/apiConfig";
  ```

#### `src/config/axiosInstance.js`

- **Purpose**: Configured Axios instance with interceptors
- **Features**:
  - Development request/response logging
  - Error handling
  - Timeout configuration from environment
- **Usage**:
  ```javascript
  import axiosInstance from "./config/axiosInstance";
  ```

## Environment Variables Reference

| Variable               | Default                                   | Example                  | Description                              |
| ---------------------- | ----------------------------------------- | ------------------------ | ---------------------------------------- |
| REACT_APP_API_BASE_URL | http://process.env.REACT_APP_API_BASE_URL | https://api.priestfy.com | Backend API base URL                     |
| REACT_APP_API_TIMEOUT  | 30000                                     | 45000                    | API request timeout in milliseconds      |
| REACT_APP_ENVIRONMENT  | development                               | production               | Environment name (for conditional logic) |
| REACT_APP_LOG_LEVEL    | debug                                     | error                    | Logging level                            |

## Running the Application

### Development

```bash
cd frontend
npm start
```

- Loads `.env.development`
- Runs on `http://localhost:3000`
- Hot reloads on file changes

### Production Build

```bash
cd frontend
npm run build
```

- Loads `.env.production`
- Creates optimized build in `build/` directory
- Ready for deployment

## API Configuration Structure

### API Endpoints

```javascript
API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/auth/login",
    SIGNUP: "/api/auth/signup",
    // ... other auth endpoints
  },
  PRIESTS: {
    GET_ALL: "/api/auth/priests",
    GET_BY_ID: (id) => `/api/auth/priests/${id}`,
    // ... other priest endpoints
  },
  // ... other resource endpoints
};
```

### API Configuration Object

```javascript
API_CONFIG = {
  baseURL: "http://process.env.REACT_APP_API_BASE_URL",
  timeout: 30000,
  environment: "development",
  isDevelopment: true,
  isProduction: false,
};
```

## Using Configuration in Components

### Basic API Call

```javascript
import axiosInstance from "./config/axiosInstance";
import { API_ENDPOINTS } from "./config/apiConfig";

// In your component
const fetchEvents = async () => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.EVENTS.GET_ALL);
    return response.data;
  } catch (error) {
    console.error("Error fetching events:", error);
  }
};
```

### Dynamic Endpoints

```javascript
import { getApiEndpoint } from "./config/apiConfig";

// With dynamic ID
const priestId = 123;
const url = getApiEndpoint(API_ENDPOINTS.PRIESTS.GET_BY_ID, priestId);
const response = await axiosInstance.get(url);
```

### Conditional Logic Based on Environment

```javascript
import { API_CONFIG } from "./config/apiConfig";

if (API_CONFIG.isDevelopment) {
  console.log("Running in development mode");
}

if (API_CONFIG.isProduction) {
  // Production-only code
}
```

## Migration Guide: Updating Components

### Old Way (Hardcoded URLs)

```javascript
// ❌ DON'T USE
const response = await axios.get(
  "http://process.env.REACT_APP_API_BASE_URL/api/events",
);
```

### New Way (Using Configuration)

```javascript
// ✅ USE THIS
import axiosInstance from "./config/axiosInstance";
import { API_ENDPOINTS } from "./config/apiConfig";

const response = await axiosInstance.get(API_ENDPOINTS.EVENTS.GET_ALL);
```

### Update Steps

1. Replace axios import:

   ```javascript
   // Remove: import axios from 'axios';
   // Add: import axiosInstance from './config/axiosInstance';
   ```

2. Replace API base URL:

   ```javascript
   // Remove: const API_BASE = 'http://process.env.REACT_APP_API_BASE_URL';
   // Add: import { API_ENDPOINTS } from './config/apiConfig';
   ```

3. Replace all API calls:

   ```javascript
   // Old
   await axios.get("http://process.env.REACT_APP_API_BASE_URL/api/priests");

   // New
   await axiosInstance.get(API_ENDPOINTS.PRIESTS.GET_ALL);
   ```

## Build Process

### Development Build

```bash
REACT_APP_API_BASE_URL=http://process.env.REACT_APP_API_BASE_URLnpm start
```

### Production Build

```bash
REACT_APP_API_BASE_URL=https://api.priestfy.com npm run build
```

### Override Environment Variables

```bash
# At runtime
REACT_APP_API_BASE_URL=https://staging-api.priestfy.com npm start

# Or in .env.local (not committed)
REACT_APP_API_BASE_URL=https://custom-api.priestfy.com
```

## Best Practices

1. **Never hardcode API URLs** in components
2. **Use centralized configuration** for all environment-specific values
3. **Add to .gitignore**:

   ```
   .env.local
   .env.*.local
   build/
   ```

4. **Use environment variables for**:
   - API endpoints
   - Feature flags
   - Analytics keys
   - Timeouts and performance settings

5. **Keep .env.example** updated with all required variables

6. **Use TypeScript** for type-safe endpoint definitions (optional enhancement)

## Troubleshooting

### Environment variables not loading

```bash
# Create the file in correct location
ls -la frontend/.env.development

# Restart dev server
npm start
```

### API calls still using hardcoded URLs

```bash
# Search for remaining hardcoded URLs
grep -r "http://process.env.REACT_APP_API_BASE_URL" frontend/src --exclude-dir=node_modules
```

### Build using wrong environment

```bash
# Explicitly set environment
REACT_APP_API_BASE_URL=https://api.priestfy.com npm run build

# Check what was built
grep -r "priestfy.com" frontend/build/static
```

## Performance Considerations

### Lazy Loading Configuration

```javascript
// Only load config when needed
const getConfig = () => {
  return {
    baseURL: process.env.REACT_APP_API_BASE_URL,
    timeout: parseInt(process.env.REACT_APP_API_TIMEOUT),
  };
};
```

### Caching Endpoints

```javascript
// Cache computed endpoints
const cachedEndpoint = API_ENDPOINTS.EVENTS.GET_ALL;
```

## Security

1. **Never commit .env files** with sensitive data
2. **Use .env.local** for local development
3. **Environment variables in CI/CD**: Set as secrets
4. **HTTPS in production**: Always use HTTPS
5. **CORS configuration**: Backend should validate origins

## Documentation

- See [ENVIRONMENT_SETUP.md](../ENVIRONMENT_SETUP.md) for complete setup guide
- See [docker-compose.yml](../docker-compose.yml) for Docker configuration
