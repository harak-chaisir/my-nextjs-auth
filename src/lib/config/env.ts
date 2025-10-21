/**
 * Environment Configuration with Validation
 * Ensures all required environment variables are present and valid
 */

interface EnvironmentConfig {
  auth0: {
    issuerBaseUrl: string;
    clientId: string;
    clientSecret: string;
    baseUrl: string;
    // Optional audience for API access (leave empty if not using)
    audience?: string;
    secret: string;
  };
  app: {
    nodeEnv: 'development' | 'production' | 'test';
    isProduction: boolean;
    isDevelopment: boolean;
  };
  rbac: {
    customClaimsNamespace: string;
    tokenCacheTTL: number;
    maxCacheSize: number;
    sessionDuration: number;
    adminEmails: string[];
  };
}

/**
 * Validate that a required environment variable exists
 */
function requireEnv(key: string): string {
  const value = process.env[key];
  
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}\n` +
      `Please add it to your .env.local file.`
    );
  }
  
  return value;
}

/**
 * Get optional environment variable with default value
 */
function getEnv(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

/**
 * Validate environment configuration on startup
 */
function validateEnvironment(): EnvironmentConfig {
  try {
    const nodeEnv = getEnv('NODE_ENV', 'development') as EnvironmentConfig['app']['nodeEnv'];
    
    return {
      auth0: {
        issuerBaseUrl: requireEnv('AUTH0_ISSUER_BASE_URL'),
        clientId: requireEnv('AUTH0_CLIENT_ID'),
        clientSecret: requireEnv('AUTH0_CLIENT_SECRET'),
        baseUrl: requireEnv('AUTH0_BASE_URL'),
        audience: getEnv('AUTH0_AUDIENCE', ''),
        secret: requireEnv('AUTH0_SECRET'),
      },
      app: {
        nodeEnv,
        isProduction: nodeEnv === 'production',
        isDevelopment: nodeEnv === 'development',
      },
      rbac: {
        customClaimsNamespace: getEnv(
          'RBAC_CUSTOM_CLAIMS_NAMESPACE',
          'https://my-app.example.com/roles'
        ),
        tokenCacheTTL: parseInt(getEnv('RBAC_TOKEN_CACHE_TTL', '60000'), 10), // 1 minute
        maxCacheSize: parseInt(getEnv('RBAC_MAX_CACHE_SIZE', '1000'), 10),
        sessionDuration: parseInt(getEnv('RBAC_SESSION_DURATION', '28800000'), 10), // 8 hours
        adminEmails: getEnv('RBAC_ADMIN_EMAILS', 'harak.chaisir@gmail.com,admin@example.com')
          .split(',')
          .map(email => email.trim())
          .filter(email => email.length > 0),
      },
    };
  } catch (error) {
    console.error('❌ Environment validation failed:', error);
    throw error;
  }
}

/**
 * Validated environment configuration
 * Throws error if required variables are missing
 */
export const env: EnvironmentConfig = validateEnvironment();

/**
 * Log environment status (safe for production)
 */
if (env.app.isDevelopment) {
  console.log('🔧 Environment:', env.app.nodeEnv);
  console.log('🔐 Auth0 Domain:', env.auth0.issuerBaseUrl);
  console.log('🌐 App Base URL:', env.auth0.baseUrl);
}
