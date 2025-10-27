/**
 * JWT Token Utilities
 * Centralized JWT decoding and validation logic
 */

import { UserRole, JWTPayload, Auth0Session } from '@/types/rbac';
import { env } from '@/lib/config/env';
import { logger } from '@/lib/utils/logger';

/**
 * JWT Decode Error
 */
export class JWTDecodeError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'JWTDecodeError';
  }
}

/**
 * Token cache entry
 */
interface TokenCacheEntry {
  roles: UserRole[] | null;
  exp: number;
}

/**
 * Token cache for performance optimization
 */
class TokenCache {
  private cache = new Map<string, TokenCacheEntry>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Auto-cleanup every 5 minutes
    if (typeof window === 'undefined') { // Server-side only
      this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }
  }

  get(token: string): TokenCacheEntry | null {
    const entry = this.cache.get(token);
    
    if (!entry) {
      logger.rbac.cacheMiss(this.getTokenPreview(token));
      return null;
    }
    
    if (entry.exp <= Date.now()) {
      this.cache.delete(token);
      logger.rbac.cacheMiss(this.getTokenPreview(token));
      return null;
    }
    
    logger.rbac.cacheHit(this.getTokenPreview(token));
    return entry;
  }

  set(token: string, roles: UserRole[] | null, exp: number): void {
    this.cache.set(token, { roles, exp });
    
    // Prevent cache from growing too large
    if (this.cache.size > env.rbac.maxCacheSize) {
      this.evictOldest();
    }
  }

  private cleanup(): void {
    const now = Date.now();
    let removed = 0;
    
    for (const [key, value] of this.cache.entries()) {
      if (value.exp <= now) {
        this.cache.delete(key);
        removed++;
      }
    }
    
    if (removed > 0) {
      logger.debug('Token cache cleanup completed', { removed, remaining: this.cache.size });
    }
  }

  private evictOldest(): void {
    const entries = Array.from(this.cache.entries());
    const toRemove = entries.slice(0, entries.length - env.rbac.maxCacheSize);
    toRemove.forEach(([key]) => this.cache.delete(key));
    
    logger.debug('Cache size limit reached, evicted oldest entries', { removed: toRemove.length });
  }

  private getTokenPreview(token: string): string {
    return token.substring(0, 20) + '...';
  }

  clear(): void {
    this.cache.clear();
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clear();
  }
}

const tokenCache = new TokenCache();

/**
 * Extract ID token from session (handles multiple possible structures)
 */
export function extractIdToken(session: Auth0Session | Record<string, unknown> | null | undefined): string | null {
  if (!session) return null;

  const sessionObj = session as Record<string, unknown>;
  const tokenSetObj = sessionObj.tokenSet as Record<string, unknown> | undefined;
  const tokensObj = sessionObj.tokens as Record<string, unknown> | undefined;

  const possibleLocations = [
    tokenSetObj?.idToken,
    sessionObj.idToken,
    sessionObj.id_token,
    tokensObj?.idToken,
    tokensObj?.id_token,
  ];

  for (const token of possibleLocations) {
    if (typeof token === 'string' && token.length > 0) {
      return token;
    }
  }

  return null;
}

/**
 * Decode JWT token without verification (for extracting claims)
 * @throws {JWTDecodeError} If token format is invalid
 */
export function decodeJWT(token: string): JWTPayload {
  try {
    const parts = token.split('.');
    
    if (parts.length !== 3) {
      throw new JWTDecodeError('Invalid JWT format: expected 3 parts');
    }

    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64').toString('utf-8')
    );

    return payload as JWTPayload;
  } catch (error) {
    if (error instanceof JWTDecodeError) {
      throw error;
    }
    throw new JWTDecodeError(
      'Failed to decode JWT token',
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Extract roles from JWT payload with caching
 */
export function extractRolesFromToken(
  session: Auth0Session | Record<string, unknown> | null | undefined,
  namespace: string = env.rbac.customClaimsNamespace
): UserRole[] | null {
  try {
    const idToken = extractIdToken(session);
    
    if (!idToken) {
      logger.debug('No ID token found in session');
      return null;
    }

    // Check cache first
    const cached = tokenCache.get(idToken);
    if (cached !== null) {
      logger.rbac.cacheHit(idToken.substring(0, 20));
      return cached.roles;
    }

    logger.rbac.cacheMiss(idToken.substring(0, 20));

    // Decode token
    const payload = decodeJWT(idToken);
    
    // Extract roles from custom namespace
    const roles = payload[namespace] as UserRole[] | undefined;
    
    // Cache the result
    const expiration = (payload.exp * 1000) || (Date.now() + env.rbac.tokenCacheTTL);
    tokenCache.set(idToken, roles || null, expiration);

    if (roles && roles.length > 0) {
      logger.rbac.roleExtracted('ID Token', roles);
      return roles;
    }

    logger.debug('No roles found in ID token custom claims', { namespace });
    return null;
  } catch (error) {
    logger.error('Failed to extract roles from token', error);
    return null;
  }
}

/**
 * Validate JWT token expiration
 */
export function isTokenExpired(token: string): boolean {
  try {
    const payload = decodeJWT(token);
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

/**
 * Get token expiration time in milliseconds
 */
export function getTokenExpiration(token: string): number | null {
  try {
    const payload = decodeJWT(token);
    return payload.exp * 1000;
  } catch {
    return null;
  }
}

// Export cache for testing purposes
export const __testing__ = {
  tokenCache,
  clearCache: () => tokenCache.clear(),
};
