'use client';

import { createContext, useContext, ReactNode } from 'react';
import { RBACContext } from '@/types/rbac';

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
  role?: string;
  roles?: string[];
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
  if (role && !rbac.hasRole(role as any)) {
    return <>{fallback}</>;
  }
  
  if (roles && !rbac.hasAnyRole(roles as any[])) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

/**
 * Component to show content only to admins
 */
export function AdminOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <WithRole role="Admin" fallback={fallback}>
      {children}
    </WithRole>
  );
}

/**
 * Component to show content to authenticated users
 */
export function AuthenticatedOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <WithRole roles={['Admin', 'Moderator', 'User']} fallback={fallback}>
      {children}
    </WithRole>
  );
}