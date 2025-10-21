/**
 * Auth0 Client Configuration
 * Centralized Auth0 setup with validated environment variables
 */

import { Auth0Client } from '@auth0/nextjs-auth0/server';
import { env } from '@/lib/config/env';

/**
 * Auth0 Client Instance
 * Configured with environment variables and custom settings
 */
export const auth0 = new Auth0Client({
  // Auth0Client expects the tenant domain (hostname) for `domain`, not the full URL
  domain: new URL(env.auth0.issuerBaseUrl).hostname,
  clientId: env.auth0.clientId,
  clientSecret: env.auth0.clientSecret,
  appBaseUrl: env.auth0.baseUrl,
  secret: env.auth0.secret,
  
  // Authorization parameters for custom claims
  authorizationParameters: {
    scope: 'openid profile email',
    // Only include audience if provided (AUTH0_AUDIENCE). Using the full issuer URL as audience
    // can cause "Service not found" errors for some Auth0 tenants.
    ...(env.auth0.audience ? { audience: env.auth0.audience } : {}),
  },
  
  // Session configuration
  session: {
    storeIdToken: true,
    storeAccessToken: true,
    cookieLifetime: env.rbac.sessionDuration / 1000, // Convert to seconds
    rolling: true, // Extend session on activity
    rollingDuration: 24 * 60 * 60, // 24 hours rolling window
  },
  
  // Route configuration
  routes: {
    callback: '/auth/callback',
    postLogoutRedirect: '/',
  },
});