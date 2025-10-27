'use client';

import { createContext, useContext, ReactNode } from 'react';
import { RBACContext, UserRole } from '@/types/rbac';

/**
 * React Context for RBAC
 */
const RBACReactContext = createContext<RBACContext | null>(null);

/**
 * RBAC Provider Component
 */
interface RBACProviderProps {
  children: ReactNode;
  rbacContext: RBACContext;
}

export function RBACProvider({ children, rbacContext }: RBACProviderProps) {
  return (
    <RBACReactContext.Provider value={rbacContext}>
      {children}
    </RBACReactContext.Provider>
  );
}

/**
 * Hook to use RBAC context in components
 */
export function useRBAC(): RBACContext {
  const context = useContext(RBACReactContext);
  
  if (!context) {
    throw new Error('useRBAC must be used within an RBACProvider');
  }
  
  return context;
}

/**
 * Higher-order component for role-based rendering
 */
interface WithRoleProps {
  children: ReactNode;
  role?: UserRole;
  roles?: UserRole[];
  fallback?: ReactNode;
}

export function WithRole({
  children,
  role,
  roles,
  fallback = null
}: WithRoleProps) {
  const rbac = useRBAC();
  
  // Check role access
  if (role && !rbac.hasRole(role)) {
    return <>{fallback}</>;
  }
  
  if (roles && !rbac.hasAnyRole(roles)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

/**
 * Component to show content only to admins
 */
export function AdminOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <WithRole role={UserRole.ADMIN} fallback={fallback}>
      {children}
    </WithRole>
  );
}

/**
 * Component to show content to authenticated users
 */
export function AuthenticatedOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <WithRole roles={[UserRole.ADMIN, UserRole.MODERATOR, UserRole.USER]} fallback={fallback}>
      {children}
    </WithRole>
  );
}