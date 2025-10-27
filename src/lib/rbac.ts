/**
 * Simplified RBAC System - Role-Only (No Permissions)
 * Clean, maintainable role-based access control
 */

import { UserRole, RoleDefinition, RBACConfig, RBACContext, Auth0User, Auth0Session } from '@/types/rbac';
import { env } from '@/lib/config/env';
import { logger } from '@/lib/utils/logger';
import { extractRolesFromToken } from '@/lib/utils/jwt';

/**
 * RBAC Configuration - Simple hierarchical roles
 * Higher level = more access (Admin=100, Moderator=50, User=10, Guest=1)
 */
export const RBAC_CONFIG: RBACConfig = {
  roles: [
    { role: UserRole.ADMIN, name: 'Administrator', description: 'Full system access', level: 100 },
    { role: UserRole.MODERATOR, name: 'Moderator', description: 'Content moderation', level: 50 },
    { role: UserRole.USER, name: 'User', description: 'Standard user', level: 10 },
    { role: UserRole.GUEST, name: 'Guest', description: 'Limited access', level: 1 }
  ],
  routes: [
    { path: '/admin', requiredRole: UserRole.ADMIN, redirectTo: '/dashboard' },
    { path: '/admin/*', requiredRole: UserRole.ADMIN, redirectTo: '/dashboard' },
    { path: '/dashboard', allowedRoles: [UserRole.USER, UserRole.MODERATOR, UserRole.ADMIN], redirectTo: '/' },
    { path: '/moderator', allowedRoles: [UserRole.MODERATOR, UserRole.ADMIN], redirectTo: '/dashboard' }
  ],
  defaultRole: UserRole.USER,
  defaultRedirect: {
    [UserRole.ADMIN]: '/admin',
    [UserRole.MODERATOR]: '/dashboard',
    [UserRole.USER]: '/dashboard',
    [UserRole.GUEST]: '/'
  }
};

// ============================================================================
// Core Role Functions
// ============================================================================

/**
 * Get role definition by role enum
 */
export function getRoleDefinition(role: UserRole): RoleDefinition | undefined {
  return RBAC_CONFIG.roles.find(r => r.role === role);
}

/**
 * Get the highest access level from user roles
 */
export function getAccessLevel(userRoles: UserRole[]): number {
  return Math.max(0, ...userRoles.map(role => getRoleDefinition(role)?.level || 0));
}

/**
 * Check if user has a specific role
 */
export function hasRole(userRoles: UserRole[], targetRole: UserRole): boolean {
  return userRoles.includes(targetRole);
}

/**
 * Check if user has any of the target roles (with hierarchy support)
 * Higher roles inherit lower role access
 */
export function hasAnyRole(userRoles: UserRole[], targetRoles: UserRole[]): boolean {
  const userLevel = getAccessLevel(userRoles);
  return targetRoles.some(role => {
    const targetLevel = getRoleDefinition(role)?.level || 0;
    return userLevel >= targetLevel;
  });
}

/**
 * Get role hierarchy - all roles that are included by having a higher level role
 */
export function getRoleHierarchy(role: UserRole): UserRole[] {
  const roleLevel = getRoleDefinition(role)?.level || 0;
  return RBAC_CONFIG.roles
    .filter(r => r.level <= roleLevel)
    .map(r => r.role);
}

/**
 * Check if a role can act as another role (hierarchy check)
 */
export function canActAsRole(userRole: UserRole, targetRole: UserRole): boolean {
  const userLevel = getRoleDefinition(userRole)?.level || 0;
  const targetLevel = getRoleDefinition(targetRole)?.level || 0;
  return userLevel >= targetLevel;
}

/**
 * Get effective roles including hierarchy
 */
export function getEffectiveRoles(roles: UserRole[]): UserRole[] {
  const effectiveRoles = new Set<UserRole>();
  roles.forEach(role => {
    getRoleHierarchy(role).forEach(r => effectiveRoles.add(r));
  });
  return Array.from(effectiveRoles);
}

// ============================================================================
// Route Access Control
// ============================================================================

/**
 * Get default redirect path based on highest role
 */
export function getDefaultRedirect(userRoles: UserRole[]): string {
  const highestRole = RBAC_CONFIG.roles
    .filter(r => userRoles.includes(r.role))
    .sort((a, b) => b.level - a.level)[0];
  
  return highestRole ? RBAC_CONFIG.defaultRedirect[highestRole.role] : RBAC_CONFIG.defaultRedirect[RBAC_CONFIG.defaultRole];
}

/**
 * Check if user can access a specific route
 */
export function canAccessRoute(userRoles: UserRole[], path: string): {
  canAccess: boolean;
  redirectTo?: string;
  reason?: string;
} {
  const route = RBAC_CONFIG.routes.find(r => 
    r.path.endsWith('/*') ? path.startsWith(r.path.slice(0, -2)) : r.path === path
  );
  
  if (!route) return { canAccess: true };
  
  if (route.requiredRole && !hasRole(userRoles, route.requiredRole)) {
    return {
      canAccess: false,
      redirectTo: route.redirectTo || getDefaultRedirect(userRoles),
      reason: `Requires ${route.requiredRole} role`
    };
  }
  
  if (route.allowedRoles && !hasAnyRole(userRoles, route.allowedRoles)) {
    return {
      canAccess: false,
      redirectTo: route.redirectTo || getDefaultRedirect(userRoles),
      reason: `Requires one of: ${route.allowedRoles.join(', ')}`
    };
  }
  
  return { canAccess: true };
}

// ============================================================================
// Role Extraction
// ============================================================================

/**
 * Safely extract and validate roles from various data types
 */
function safeExtractRoles(data: unknown): UserRole[] {
  if (!data) return [];
  
  const rolesArray = Array.isArray(data) ? data : [data];
  return rolesArray.filter((role): role is UserRole => 
    Object.values(UserRole).includes(role as UserRole)
  );
}

/**
 * Check if email is in admin list (no patterns, direct match only)
 */
function isAdminEmail(email?: string): boolean {
  if (!email) return false;
  return env.rbac.adminEmails.some(adminEmail => 
    email.toLowerCase() === adminEmail.toLowerCase()
  );
}

/**
 * Extract user roles from Auth0 user object
 * @throws Never throws - always returns at least the default role
 */
export function extractUserRoles(user: Auth0User | Record<string, unknown>): UserRole[] {
  if (!user) {
    logger.warn('extractUserRoles: null/undefined user');
    return [RBAC_CONFIG.defaultRole];
  }

  // Cast for dynamic property access
  const userObj = user as Record<string, unknown>;

  // Try extraction strategies in order
  const strategies = [
    () => safeExtractRoles(userObj[env.rbac.customClaimsNamespace] as unknown),
    () => safeExtractRoles(userObj.roles as unknown),
    () => safeExtractRoles((userObj.app_metadata as Record<string, unknown>)?.roles as unknown),
    () => isAdminEmail(userObj.email as string | undefined) ? [UserRole.ADMIN] : []
  ];
  
  for (const strategy of strategies) {
    try {
      const roles = strategy();
      if (roles.length > 0) {
        logger.rbac.roleExtracted('User Profile', roles);
        return roles;
      }
    } catch (error) {
      logger.error('Role extraction strategy failed', error);
    }
  }
  
  logger.debug('No roles found, using default', { defaultRole: RBAC_CONFIG.defaultRole });
  return [RBAC_CONFIG.defaultRole];
}

// ============================================================================
// RBAC Context Creation
// ============================================================================

/**
 * Create RBAC context for a user
 * @throws Never throws - always returns a valid context
 */
export function createRBACContext(user: Auth0User | Record<string, unknown>, session?: Auth0Session | Record<string, unknown>): RBACContext {
  const startTime = Date.now();
  
  try {
    if (!user) {
      throw new Error('User is required');
    }
    
    // Extract roles (ID token first, then user profile)
    let roles: UserRole[] = [];
    
    if (session) {
      try {
        const tokenRoles = extractRolesFromToken(session, env.rbac.customClaimsNamespace);
        if (tokenRoles && tokenRoles.length > 0) {
          roles = tokenRoles;
        }
      } catch (error) {
        logger.error('Failed to extract roles from token', error);
      }
    }
    
    if (roles.length === 0) {
      roles = extractUserRoles(user);
    }
    
    logger.performance.measure('createRBACContext', Date.now() - startTime, {
      userId: (user as Record<string, unknown>).sub || (user as Record<string, unknown>).id,
      rolesCount: roles.length
    });

    const userObj = user as Record<string, unknown>;
    
    return {
      user: {
        id: (userObj.sub as string) || (userObj.id as string),
        email: userObj.email as string,
        name: userObj.name as string,
        roles
      },
      hasRole: (role: UserRole) => hasRole(roles, role),
      hasAnyRole: (targetRoles: UserRole[]) => hasAnyRole(roles, targetRoles),
      getAccessLevel: () => getAccessLevel(roles),
      canActAs: (role: UserRole) => roles.some(userRole => canActAsRole(userRole, role)),
      getEffectiveRoles: () => getEffectiveRoles(roles)
    };
  } catch (error) {
    logger.error('Critical error creating RBAC context, using defaults', error);
    
    const defaultRoles = [RBAC_CONFIG.defaultRole];
    const userObj = user as Record<string, unknown> | null | undefined;
    
    return {
      user: {
        id: ((userObj?.sub || userObj?.id) as string) || 'unknown',
        email: (userObj?.email as string) || 'unknown',
        name: (userObj?.name as string) || 'unknown',
        roles: defaultRoles
      },
      hasRole: (role: UserRole) => role === RBAC_CONFIG.defaultRole,
      hasAnyRole: (targetRoles: UserRole[]) => targetRoles.includes(RBAC_CONFIG.defaultRole),
      getAccessLevel: () => RBAC_CONFIG.roles.find(r => r.role === RBAC_CONFIG.defaultRole)?.level || 0,
      canActAs: () => false,
      getEffectiveRoles: () => defaultRoles
    };
  }
}

/**
 * Get highest role from a list of roles
 */
export function getHighestRole(roles: UserRole[]): UserRole {
  const sorted = roles
    .map(role => ({ role, level: getRoleDefinition(role)?.level || 0 }))
    .sort((a, b) => b.level - a.level);
  
  return sorted[0]?.role || RBAC_CONFIG.defaultRole;
}

/**
 * Get all user roles from multiple sources
 */
export function getAllUserRoles(user: Auth0User): UserRole[] {
  return extractUserRoles(user);
}
