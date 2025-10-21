/**
 * RBAC (Role-Based Access Control) Type Definitions
 * Simplified role-only system without permissions
 */

/**
 * Available user roles in the system
 * Roles are hierarchical: Admin > Moderator > User > Guest
 */
export enum UserRole {
  ADMIN = 'Admin',
  MODERATOR = 'Moderator',
  USER = 'User',
  GUEST = 'Guest'
}

/**
 * Role definition with hierarchy level
 */
export interface RoleDefinition {
  role: UserRole;
  name: string;
  description: string;
  level: number; // Higher number = higher access (Admin=100, Moderator=50, User=10, Guest=1)
}

/**
 * User role assignment with metadata
 */
export interface UserRoleAssignment {
  userId: string;
  role: UserRole;
  assignedBy: string;
  assignedAt: Date;
  expiresAt?: Date;
  isActive: boolean;
}

/**
 * RBAC Context for user session
 * Simplified to only handle roles, not permissions
 */
export interface RBACContext {
  user: {
    id: string;
    email: string;
    name: string;
    roles: UserRole[];
  };
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  getAccessLevel: () => number;
  canActAs: (role: UserRole) => boolean;
  getEffectiveRoles: () => UserRole[];
}

/**
 * Route access configuration
 * Simplified to role-based only
 */
export interface RouteAccess {
  path: string;
  requiredRole?: UserRole;
  allowedRoles?: UserRole[];
  redirectTo?: string;
  fallbackRoute?: string;
}

/**
 * RBAC configuration for the application
 */
export interface RBACConfig {
  roles: RoleDefinition[];
  routes: RouteAccess[];
  defaultRole: UserRole;
  defaultRedirect: Record<UserRole, string>;
}

/**
 * Auth0 Session structure (for better type safety)
 */
export interface Auth0Session {
  user: Auth0User;
  tokenSet?: {
    idToken?: string;
    accessToken?: string;
  };
  idToken?: string;
  accessToken?: string;
}

/**
 * Auth0 User profile
 */
export interface Auth0User {
  sub: string;
  email: string;
  name: string;
  nickname?: string;
  picture?: string;
  email_verified?: boolean;
  [key: string]: unknown; // For custom claims
}

/**
 * JWT Token Payload
 */
export interface JWTPayload {
  sub: string;
  email: string;
  name: string;
  exp: number;
  iat: number;
  [key: string]: unknown; // For custom claims
}

/**
 * Authentication result with metrics
 */
export interface AuthResult {
  session: Auth0Session;
  user: Auth0User;
  rbac: RBACContext;
  executionTimeMs?: number;
}

/**
 * Route access check result
 */
export interface RouteAccessResult {
  canAccess: boolean;
  redirectTo?: string;
  reason?: string;
  rbac?: RBACContext;
}