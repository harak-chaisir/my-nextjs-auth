'use client';

import { UserRole } from '../../types/rbac';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useEffect, useState } from 'react';

/**
 * Client-side RBAC hook - Simplified role-only system
 */

const CUSTOM_CLAIMS_NAMESPACE = process.env.NEXT_PUBLIC_AUTH0_CUSTOM_CLAIMS_NAMESPACE || 'https://my-app.example.com/roles';

export function useRBAC() {
  const { user, isLoading } = useUser();
  const [roles, setRoles] = useState<UserRole[]>([]);

  useEffect(() => {
    if (user && !isLoading) {
      const userRoles = extractClientUserRoles(user);
      setRoles(userRoles);
    }
  }, [user, isLoading]);

  return {
    user,
    roles,
    isLoading,
    hasRole: (role: UserRole) => roles.includes(role),
    hasAnyRole: (targetRoles: UserRole[]) => targetRoles.some(role => roles.includes(role)),
    isAdmin: () => roles.includes(UserRole.ADMIN),
    isModerator: () => roles.includes(UserRole.MODERATOR),
    isUser: () => roles.includes(UserRole.USER),
  };
}

/**
 * Extract user roles on client side
 */
function extractClientUserRoles(user: Record<string, unknown> | null | undefined): UserRole[] {
  const rolesFromClaims = user?.[CUSTOM_CLAIMS_NAMESPACE];
  if (rolesFromClaims && Array.isArray(rolesFromClaims)) {
    return rolesFromClaims as UserRole[];
  }
  return [UserRole.USER];
}

/**
 * Higher-order component for role-based rendering
 */
export function withRoleGuard<P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles: UserRole[]
) {
  return function RoleGuardedComponent(props: P) {
    const { hasAnyRole, isLoading } = useRBAC();
    
    if (isLoading) {
      return <div>Loading...</div>;
    }
    
    if (!hasAnyRole(allowedRoles)) {
      return <div>Access Denied</div>;
    }
    
    return <Component {...props} />;
  };
}

/**
 * Component for conditional rendering based on roles
 */
interface RoleGuardProps {
  roles?: UserRole[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function RoleGuard({ roles, fallback = null, children }: RoleGuardProps) {
  const rbac = useRBAC();
  
  if (rbac.isLoading) {
    return <div>Loading...</div>;
  }
  
  const hasAccess = !roles || rbac.hasAnyRole(roles);
  
  return <>{hasAccess ? children : fallback}</>;
}