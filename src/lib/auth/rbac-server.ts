import { auth0 } from '@/lib/auth/auth0';
import { redirect } from 'next/navigation';
import { UserRole, AuthResult } from '@/types/rbac';
import { createRBACContext, canAccessRoute, getDefaultRedirect, extractUserRoles } from '@/lib/rbac';
import { logger } from '@/lib/utils/logger';

/**
 * Server-side RBAC utilities - Simplified role-only system
 */

interface RequireAuthOptions {
  roles?: UserRole[];
  redirectTo?: string;
}

/**
 * Require authentication and optionally check roles/permissions
 * @throws Redirects to login or specified route if requirements not met
 */
export async function requireAuth(options?: RequireAuthOptions): Promise<AuthResult> {
  const startTime = Date.now();
  
  try {
    const session = await auth0.getSession();
    
    if (!session) {
      logger.auth.failed('No session found');
      redirect(options?.redirectTo || '/auth/login');
    }

    // Validate email is present
    if (!session.user.email) {
      logger.auth.failed('Session user missing email', { userId: session.user.sub });
      redirect(options?.redirectTo || '/auth/login');
    }

    // Extract roles from session - pass both user and session for ID token access
    const userRoles = extractUserRoles(session.user);
    logger.rbac.roleExtracted('session', userRoles);

    // Check role requirements
    if (options?.roles && options.roles.length > 0) {
      const hasRequiredRole = options.roles.some(role => userRoles.includes(role));
      
      if (!hasRequiredRole) {
        logger.auth.denied(session.user.email, options.roles, userRoles);
        redirect(getDefaultRedirect(userRoles));
      }
    }

    const duration = Date.now() - startTime;
    logger.auth.success(session.user.email, userRoles, duration);

    return {
      session: session as any,
      user: session.user as any,
      rbac: createRBACContext(session.user, session)
    };
  } catch (error) {
    logger.auth.failed('Authentication error', { error });
    redirect(options?.redirectTo || '/auth/login');
  }
}

/**
 * Require admin role specifically
 */
export async function requireAdmin(redirectTo?: string): Promise<AuthResult> {
  return requireAuth({
    roles: [UserRole.ADMIN],
    redirectTo: redirectTo || '/dashboard'
  });
}

/**
 * Get user session and RBAC context (optional auth)
 * Returns null values if not authenticated
 */
export async function getAuthContext() {
  try {
    const session = await auth0.getSession();
    
    if (!session) {
      return {
        session: null,
        user: null,
        rbac: null,
        isAuthenticated: false
      };
    }
    
    const rbacContext = createRBACContext(session.user, session);
    
    return {
      session,
      user: session.user,
      rbac: rbacContext,
      isAuthenticated: true
    };
  } catch (error) {
    logger.auth.failed('Error in getAuthContext', { error });
    return {
      session: null,
      user: null,
      rbac: null,
      isAuthenticated: false
    };
  }
}

/**
 * Check route access and redirect if necessary
 */
export async function checkRouteAccess(path: string) {
  const { session, rbac } = await getAuthContext();
  
  if (!session || !rbac) {
    // Not authenticated - redirect to login for protected routes
    if (path.startsWith('/admin') || path.startsWith('/dashboard')) {
      redirect('/');
    }
    return { canAccess: true };
  }
  
  const accessCheck = canAccessRoute(rbac.user.roles, path);
  
  if (!accessCheck.canAccess && accessCheck.redirectTo) {
    redirect(accessCheck.redirectTo);
  }
  
  return {
    ...accessCheck,
    rbac
  };
}

/**
 * Handle post-login redirect based on user role
 */
export async function handlePostLoginRedirect() {
  const { rbac } = await getAuthContext();
  
  if (!rbac) {
    redirect('/');
    return;
  }
  
  const defaultRedirect = getDefaultRedirect(rbac.user.roles);
  redirect(defaultRedirect);
}

/**
 * Get user roles from session
 */
export async function getCurrentUserRoles(): Promise<UserRole[]> {
  try {
    const session = await auth0.getSession();
    
    if (!session) {
      return [UserRole.GUEST];
    }
    
    return extractUserRoles(session.user);
  } catch (error) {
    logger.auth.failed('Error getting current user roles', { error });
    return [UserRole.GUEST];
  }
}

/**
 * Check if current user has specific role
 */
export async function currentUserHasRole(role: UserRole): Promise<boolean> {
  const roles = await getCurrentUserRoles();
  return roles.includes(role);
}

/**
 * Check if current user is admin
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  return await currentUserHasRole(UserRole.ADMIN);
}
