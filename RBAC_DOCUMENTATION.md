# Role-Based Access Control (RBAC) System Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Role Hierarchy](#role-hierarchy)
4. [How It Works](#how-it-works)
5. [Configuration](#configuration)
6. [Usage Guide](#usage-guide)
7. [API Reference](#api-reference)
8. [Examples](#examples)
9. [Troubleshooting](#troubleshooting)
10. [Best Practices](#best-practices)

---

## Overview

This RBAC system provides **role-based access control** for a Next.js 15 application using Auth0 authentication. It's designed to be simple, performant, and maintainable - using roles only (no permissions) for a cleaner mental model.

### Key Features

- ✅ **Simple Role Hierarchy**: Admin → Moderator → User → Guest
- ✅ **No Permission System**: Direct role checks for simplicity
- ✅ **Zero External Dependencies**: Custom implementation, fully typed
- ✅ **Auth0 Integration**: Extracts roles from JWT tokens and user profiles
- ✅ **Server & Client Support**: Works with App Router and Client Components
- ✅ **Fail-Safe Design**: Never crashes, always returns safe defaults
- ✅ **Performance Optimized**: JWT caching, early returns, minimal overhead
- ✅ **TypeScript First**: Fully typed with comprehensive type safety

### System Statistics

- **Lines of Code**: ~800 (33% reduction from previous version)
- **Core Module**: 270 lines (45% smaller than before)
- **Type Definitions**: 97 lines
- **Build Time**: ~4-5 seconds
- **Bundle Impact**: Minimal (~10KB)

---

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                        Application                          │
├─────────────────────────────────────────────────────────────┤
│  Server Components          │      Client Components        │
│  - requireAuth()            │      - useRBAC()              │
│  - requireAdmin()           │      - RoleGuard              │
│  - getAuthContext()         │      - AdminOnly              │
└───────────────┬─────────────┴──────────────┬────────────────┘
                │                            │
        ┌───────▼───────────┐       ┌────────▼────────────┐
        │  rbac-server.ts   │       │  rbac-client.tsx    │
        │  (Server Utils)   │       │  (Client Hook)      │
        └────────┬──────────┘       └─────────┬───────────┘
                 │                            │
                 └──────────┬─────────────────┘
                            │
                    ┌───────▼──────────┐
                    │    rbac.ts       │
                    │  (Core Logic)    │
                    │  - Role Check    │
                    │  - Hierarchy     │
                    │  - Extraction    │
                    └────────┬─────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
      ┌───────▼──────┐ ┌────▼─────┐ ┌─────▼──────┐
      │    jwt.ts    │ │ env.ts   │ │ logger.ts  │
      │ (Token Util) │ │ (Config) │ │ (Logging)  │
      └──────────────┘ └──────────┘ └────────────┘
```

### File Structure

```
src/
├── types/
│   └── rbac.ts                    # Type definitions
│       ├── UserRole enum
│       ├── RoleDefinition interface
│       ├── RBACContext interface
│       └── Auth0 types
│
├── lib/
│   ├── rbac.ts                    # Core RBAC logic
│   │   ├── RBAC_CONFIG           # Role & route config
│   │   ├── Role checking functions
│   │   ├── Role extraction logic
│   │   └── RBAC context creation
│   │
│   ├── auth/
│   │   ├── rbac-server.ts        # Server-side utilities
│   │   │   ├── requireAuth()
│   │   │   ├── requireAdmin()
│   │   │   └── getAuthContext()
│   │   │
│   │   ├── rbac-client.tsx       # Client-side hook
│   │   │   ├── useRBAC()
│   │   │   ├── RoleGuard
│   │   │   └── withRoleGuard()
│   │   │
│   │   └── auth0.js               # Auth0 client config
│   │
│   ├── config/
│   │   └── env.ts                # Environment config
│   │       └── RBAC_ADMIN_EMAILS
│   │
│   └── utils/
│       ├── jwt.ts                # JWT token handling
│       │   ├── Token caching
│       │   ├── Role extraction
│       │   └── Token validation
│       │
│       └── logger.ts             # Structured logging
│
├── hooks/
│   └── useRBAC.tsx               # React context hooks
│       ├── WithRole component
│       ├── AdminOnly component
│       └── AuthenticatedOnly component
│
└── middleware.ts                  # Route protection
```

---

## Role Hierarchy

### Role Definitions

```typescript
Admin (Level 100)
  ├─ Full system access
  ├─ Can access all routes
  ├─ Can act as any lower role
  └─ Default redirect: /admin

Moderator (Level 50)
  ├─ Content management access
  ├─ Can access /dashboard and /moderator
  ├─ Can act as User and Guest
  └─ Default redirect: /dashboard

User (Level 10)
  ├─ Standard authenticated user
  ├─ Can access /dashboard
  ├─ Can act as Guest
  └─ Default redirect: /dashboard

Guest (Level 1)
  ├─ Unauthenticated or minimal access
  ├─ Can access public routes only
  └─ Default redirect: /
```

### Hierarchy Rules

1. **Higher roles inherit lower role access**
   - Admin can do everything Moderator, User, and Guest can do
   - Moderator can do everything User and Guest can do
   - User can do everything Guest can do

2. **Level-based comparison**
   ```typescript
   canActAsRole(UserRole.ADMIN, UserRole.USER) // true
   canActAsRole(UserRole.USER, UserRole.ADMIN) // false
   ```

3. **Access level calculation**
   ```typescript
   getAccessLevel([UserRole.ADMIN, UserRole.USER]) // 100 (highest)
   ```

---

## How It Works

### 1. Authentication Flow

```
┌─────────────┐
│   User      │
│  Visits App │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  Middleware     │ ◄─── Checks Auth0 session
│  (middleware.ts)│
└────────┬────────┘
         │
         ├─── No Session ──────► Redirect to /
         │
         └─── Has Session
                  │
                  ▼
         ┌────────────────┐
         │  Auth0 Session │
         │  - user profile│
         │  - JWT tokens  │
         └────────┬───────┘
                  │
                  ▼
         ┌────────────────────┐
         │  Role Extraction   │
         │  Priority:         │
         │  1. ID Token       │
         │  2. User Profile   │
         │  3. Admin Email    │
         │  4. Default Role   │
         └────────┬───────────┘
                  │
                  ▼
         ┌────────────────────┐
         │  RBAC Context      │
         │  - roles: []       │
         │  - hasRole()       │
         │  - hasAnyRole()    │
         │  - getAccessLevel()│
         └────────┬───────────┘
                  │
                  ▼
         ┌────────────────────┐
         │  Route Access      │
         │  Check             │
         └────────┬───────────┘
                  │
                  ├─── Access Denied ──► Redirect to default route
                  │
                  └─── Access Granted ──► Render page
```

### 2. Role Extraction Process

The system tries to extract roles in this order:

#### Priority 1: ID Token (JWT)
```typescript
// From Auth0 JWT token custom claims
session.idToken → decode JWT → payload[namespace] → roles
Example: ['Admin', 'User']
```

#### Priority 2: User Profile Properties
```typescript
// Strategies in order:
1. user[customClaimsNamespace]     // Auth0 custom namespace
2. user.roles                       // Direct roles property
3. user.app_metadata.roles          // App metadata
```

#### Priority 3: Admin Email List
```typescript
// Check if user email is in RBAC_ADMIN_EMAILS
if (email === 'admin@example.com') {
  return [UserRole.ADMIN];
}
```

#### Priority 4: Default Role
```typescript
// Fallback for authenticated users
return [UserRole.USER]; // Default
```

### 3. Role Checking Logic

```typescript
// Example: hasAnyRole([UserRole.MODERATOR, UserRole.ADMIN])

1. Get user's access level
   userLevel = getAccessLevel(userRoles) // e.g., 100 for Admin

2. Check each target role
   for (targetRole of targetRoles) {
     targetLevel = getRoleDefinition(targetRole).level
     
     if (userLevel >= targetLevel) {
       return true; // User's level is high enough
     }
   }

3. Return result
   return false; // User doesn't have sufficient access
```

### 4. Route Protection

```typescript
// middleware.ts checks every request

1. Parse request path
   path = request.nextUrl.pathname

2. Get Auth0 session
   session = await auth0.getSession()

3. If protected route (e.g., /admin)
   ├─ No session → redirect to /
   ├─ Has session → extract roles
   └─ Check access:
      ├─ canAccessRoute(roles, path)
      │   ├─ Allowed → continue
      │   └─ Denied → redirect to user's default route

4. Public route → allow access
```

### 5. Server-Side Protection

```typescript
// In page.tsx or layout.tsx

export default async function AdminPage() {
  // 1. Call requireAuth (or requireAdmin)
  const { user, rbac } = await requireAuth({
    roles: [UserRole.ADMIN]
  });
  
  // 2. If user doesn't have required role:
  //    → Automatically redirects to appropriate route
  
  // 3. If authorized, continue rendering
  return <AdminDashboard user={user} rbac={rbac} />;
}
```

### 6. Client-Side Protection

```typescript
// In client component

function MyComponent() {
  // 1. Get RBAC context
  const { user, roles, hasRole, isAdmin } = useRBAC();
  
  // 2. Check roles dynamically
  if (isAdmin()) {
    return <AdminPanel />;
  }
  
  // 3. Or use conditional rendering
  return (
    <AdminOnly fallback={<div>Access Denied</div>}>
      <SecretContent />
    </AdminOnly>
  );
}
```

### 7. JWT Token Caching

```typescript
// Performance optimization

1. User authenticates → receives JWT token

2. First role extraction
   ├─ Decode JWT
   ├─ Extract roles from custom claims
   └─ Cache: token → { roles, exp }

3. Subsequent extractions (same token)
   ├─ Check cache
   ├─ If cached and not expired → return cached roles
   └─ If expired → decode again

4. Automatic cleanup
   └─ Every 5 minutes, remove expired entries
```

---

## Configuration

### Environment Variables

Create or update `.env.local`:

```bash
# ============================================================================
# Auth0 Configuration (Required)
# ============================================================================

# Auth0 secret for session encryption (generate with: openssl rand -hex 32)
AUTH0_SECRET='your-secret-key-here'

# Your application URL
AUTH0_BASE_URL='http://localhost:3000'

# Auth0 tenant domain
AUTH0_ISSUER_BASE_URL='https://your-tenant.auth0.com'

# Auth0 application credentials
AUTH0_CLIENT_ID='your-client-id'
AUTH0_CLIENT_SECRET='your-client-secret'

# API audience (optional, for API access tokens)
AUTH0_AUDIENCE='https://your-api.com'

# ============================================================================
# RBAC Configuration (Required)
# ============================================================================

# Custom claims namespace for roles in JWT
# This should match your Auth0 Action configuration
RBAC_CUSTOM_CLAIMS_NAMESPACE='https://my-app.example.com/roles'

# Comma-separated list of admin emails
# Users with these emails will automatically get Admin role
RBAC_ADMIN_EMAILS='admin@example.com,harak.chaisir@gmail.com,superadmin@company.com'

# ============================================================================
# Optional RBAC Settings (with defaults)
# ============================================================================

# Maximum number of JWT tokens to cache (default: 100)
RBAC_MAX_CACHE_SIZE='100'

# Token cache TTL in milliseconds (default: 3600000 = 1 hour)
RBAC_TOKEN_CACHE_TTL='3600000'
```

### Auth0 Setup

#### 1. Create Auth0 Action for Custom Claims

Go to Auth0 Dashboard → Actions → Flows → Login

Create a new action:

```javascript
/**
 * Add custom claims to ID token
 * @param {Event} event - Details about the user and the context
 * @param {PostLoginAPI} api - Methods and utilities to help change the behavior
 */
exports.onExecutePostLogin = async (event, api) => {
  const namespace = 'https://my-app.example.com/roles';
  
  // Get user roles from app_metadata
  const roles = event.user.app_metadata?.roles || ['User'];
  
  // Add roles to ID token
  api.idToken.setCustomClaim(namespace, roles);
  
  // Optionally add to access token
  api.accessToken.setCustomClaim(namespace, roles);
};
```

#### 2. Assign Roles to Users

Option A: Via Auth0 Dashboard
```
Users → Select User → User Metadata → app_metadata:
{
  "roles": ["Admin"]
}
```

Option B: Via Management API
```javascript
await managementClient.updateAppMetadata(
  { id: userId },
  { roles: ['Admin', 'Moderator'] }
);
```

Option C: Use Admin Email List (Easiest)
```bash
# Add email to .env.local
RBAC_ADMIN_EMAILS='your-email@example.com'
```

### Route Configuration

Edit `src/lib/rbac.ts`:

```typescript
export const RBAC_CONFIG: RBACConfig = {
  roles: [
    { role: UserRole.ADMIN, name: 'Administrator', description: 'Full system access', level: 100 },
    { role: UserRole.MODERATOR, name: 'Moderator', description: 'Content moderation', level: 50 },
    { role: UserRole.USER, name: 'User', description: 'Standard user', level: 10 },
    { role: UserRole.GUEST, name: 'Guest', description: 'Limited access', level: 1 }
  ],
  
  routes: [
    // Exact path match
    { 
      path: '/admin', 
      requiredRole: UserRole.ADMIN, 
      redirectTo: '/dashboard' 
    },
    
    // Wildcard path (all routes under /admin)
    { 
      path: '/admin/*', 
      requiredRole: UserRole.ADMIN, 
      redirectTo: '/dashboard' 
    },
    
    // Multiple allowed roles
    { 
      path: '/dashboard', 
      allowedRoles: [UserRole.USER, UserRole.MODERATOR, UserRole.ADMIN], 
      redirectTo: '/' 
    },
    
    // Moderator and above
    { 
      path: '/moderator', 
      allowedRoles: [UserRole.MODERATOR, UserRole.ADMIN], 
      redirectTo: '/dashboard' 
    }
  ],
  
  defaultRole: UserRole.USER,
  
  defaultRedirect: {
    [UserRole.ADMIN]: '/admin',
    [UserRole.MODERATOR]: '/dashboard',
    [UserRole.USER]: '/dashboard',
    [UserRole.GUEST]: '/'
  }
};
```

---

## Usage Guide

### Server-Side Usage (App Router)

#### Basic Authentication

```typescript
// app/dashboard/page.tsx
import { requireAuth } from '@/lib/auth/rbac-server';

export default async function DashboardPage() {
  // Require authentication (any authenticated user)
  const { user, rbac } = await requireAuth();
  
  return (
    <div>
      <h1>Welcome {user.name}</h1>
      <p>Your roles: {rbac.user.roles.join(', ')}</p>
    </div>
  );
}
```

#### Role-Based Protection

```typescript
// app/admin/page.tsx
import { requireAdmin } from '@/lib/auth/rbac-server';
import { UserRole } from '@/types/rbac';

export default async function AdminPage() {
  // Option 1: Use requireAdmin helper
  const { user, rbac } = await requireAdmin();
  
  // Option 2: Use requireAuth with specific roles
  const { user, rbac } = await requireAuth({
    roles: [UserRole.ADMIN]
  });
  
  // Option 3: Multiple roles
  const { user, rbac } = await requireAuth({
    roles: [UserRole.ADMIN, UserRole.MODERATOR]
  });
  
  return <AdminDashboard user={user} rbac={rbac} />;
}
```

#### Optional Authentication

```typescript
// app/page.tsx
import { getAuthContext } from '@/lib/auth/rbac-server';

export default async function HomePage() {
  // Get auth context without requiring login
  const { user, rbac, isAuthenticated } = await getAuthContext();
  
  if (isAuthenticated) {
    return <div>Welcome back, {user.name}!</div>;
  }
  
  return <div>Welcome, Guest!</div>;
}
```

#### Dynamic Role Checks

```typescript
// app/dashboard/layout.tsx
import { requireAuth } from '@/lib/auth/rbac-server';
import { UserRole } from '@/types/rbac';

export default async function DashboardLayout({ children }) {
  const { user, rbac } = await requireAuth();
  
  // Check if user is admin
  const isAdmin = rbac.hasRole(UserRole.ADMIN);
  
  // Check if user has any elevated role
  const isElevated = rbac.hasAnyRole([UserRole.ADMIN, UserRole.MODERATOR]);
  
  return (
    <div>
      <nav>
        {isAdmin && <Link href="/admin">Admin Panel</Link>}
        {isElevated && <Link href="/moderator">Moderation</Link>}
      </nav>
      {children}
    </div>
  );
}
```

### Client-Side Usage (Components)

#### Basic Hook Usage

```typescript
'use client';

import { useRBAC } from '@/lib/auth/rbac-client';
import { UserRole } from '@/types/rbac';

export default function MyComponent() {
  const { user, roles, isLoading, hasRole, hasAnyRole, isAdmin } = useRBAC();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  return (
    <div>
      <h2>Hello {user?.name}</h2>
      
      {/* Direct role check */}
      {isAdmin() && <button>Admin Action</button>}
      
      {/* Specific role check */}
      {hasRole(UserRole.MODERATOR) && <button>Moderate Content</button>}
      
      {/* Multiple roles check */}
      {hasAnyRole([UserRole.ADMIN, UserRole.MODERATOR]) && (
        <div>Elevated Access Content</div>
      )}
    </div>
  );
}
```

#### Conditional Rendering with Components

```typescript
'use client';

import { AdminOnly, AuthenticatedOnly, WithRole } from '@/hooks/useRBAC';
import { RoleGuard } from '@/lib/auth/rbac-client';

export default function MyPage() {
  return (
    <div>
      {/* Show only to admins */}
      <AdminOnly fallback={<div>Admin access required</div>}>
        <AdminPanel />
      </AdminOnly>
      
      {/* Show to any authenticated user */}
      <AuthenticatedOnly fallback={<div>Please log in</div>}>
        <UserDashboard />
      </AuthenticatedOnly>
      
      {/* Show to specific roles */}
      <WithRole 
        roles={['Admin', 'Moderator']} 
        fallback={<div>Insufficient access</div>}
      >
        <ModerationTools />
      </WithRole>
      
      {/* Alternative syntax */}
      <RoleGuard roles={[UserRole.ADMIN]}>
        <SecretContent />
      </RoleGuard>
    </div>
  );
}
```

#### Higher-Order Component

```typescript
'use client';

import { withRoleGuard } from '@/lib/auth/rbac-client';
import { UserRole } from '@/types/rbac';

// Define your component
function AdminDashboard() {
  return <div>Admin Dashboard</div>;
}

// Wrap with role guard
export default withRoleGuard(AdminDashboard, [UserRole.ADMIN]);
```

---

## API Reference

### Core Functions (`src/lib/rbac.ts`)

#### `hasRole(userRoles, targetRole)`
Check if user has a specific role (exact match).

```typescript
hasRole(userRoles: UserRole[], targetRole: UserRole): boolean

// Example
if (hasRole(rbac.user.roles, UserRole.ADMIN)) {
  // User is an admin
}
```

#### `hasAnyRole(userRoles, targetRoles)`
Check if user has any of the target roles (with hierarchy support).

```typescript
hasAnyRole(userRoles: UserRole[], targetRoles: UserRole[]): boolean

// Example
if (hasAnyRole(rbac.user.roles, [UserRole.ADMIN, UserRole.MODERATOR])) {
  // User is admin or moderator (or higher)
}
```

#### `getAccessLevel(userRoles)`
Get numeric access level (highest role's level).

```typescript
getAccessLevel(userRoles: UserRole[]): number

// Example
const level = getAccessLevel([UserRole.ADMIN, UserRole.USER]); // 100
```

#### `canActAsRole(userRole, targetRole)`
Check if one role can act as another role (hierarchy check).

```typescript
canActAsRole(userRole: UserRole, targetRole: UserRole): boolean

// Example
canActAsRole(UserRole.ADMIN, UserRole.USER); // true
canActAsRole(UserRole.USER, UserRole.ADMIN); // false
```

#### `getRoleHierarchy(role)`
Get all roles that are included by having a specific role.

```typescript
getRoleHierarchy(role: UserRole): UserRole[]

// Example
getRoleHierarchy(UserRole.ADMIN); 
// Returns: [Admin, Moderator, User, Guest]
```

#### `extractUserRoles(user)`
Extract roles from Auth0 user object (never throws).

```typescript
extractUserRoles(user: Auth0User | any): UserRole[]

// Example
const roles = extractUserRoles(session.user);
```

#### `createRBACContext(user, session?)`
Create RBAC context with all helper methods (never throws).

```typescript
createRBACContext(user: Auth0User, session?: Auth0Session): RBACContext

// Example
const rbac = createRBACContext(session.user, session);
```

#### `canAccessRoute(userRoles, path)`
Check if user can access a specific route.

```typescript
canAccessRoute(userRoles: UserRole[], path: string): {
  canAccess: boolean;
  redirectTo?: string;
  reason?: string;
}

// Example
const access = canAccessRoute(rbac.user.roles, '/admin');
if (!access.canAccess) {
  redirect(access.redirectTo);
}
```

### Server-Side Functions (`src/lib/auth/rbac-server.ts`)

#### `requireAuth(options?)`
Require authentication with optional role restrictions.

```typescript
requireAuth(options?: {
  roles?: UserRole[];
  redirectTo?: string;
}): Promise<AuthResult>

// Example
const { user, rbac } = await requireAuth({
  roles: [UserRole.ADMIN],
  redirectTo: '/unauthorized'
});
```

#### `requireAdmin(redirectTo?)`
Shorthand for requiring admin role.

```typescript
requireAdmin(redirectTo?: string): Promise<AuthResult>

// Example
const { user, rbac } = await requireAdmin('/dashboard');
```

#### `getAuthContext()`
Get authentication context without requiring login.

```typescript
getAuthContext(): Promise<{
  user: Auth0User | null;
  rbac: RBACContext | null;
  isAuthenticated: boolean;
}>

// Example
const { isAuthenticated, rbac } = await getAuthContext();
```

#### `getCurrentUserRoles()`
Get current user's roles or Guest if not authenticated.

```typescript
getCurrentUserRoles(): Promise<UserRole[]>

// Example
const roles = await getCurrentUserRoles();
```

#### `isCurrentUserAdmin()`
Check if current user is an admin.

```typescript
isCurrentUserAdmin(): Promise<boolean>

// Example
if (await isCurrentUserAdmin()) {
  // Allow admin action
}
```

### Client-Side Hook (`src/lib/auth/rbac-client.tsx`)

#### `useRBAC()`
React hook for accessing RBAC context in client components.

```typescript
useRBAC(): {
  user: User | null;
  roles: UserRole[];
  isLoading: boolean;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  isAdmin: () => boolean;
  isModerator: () => boolean;
  isUser: () => boolean;
}

// Example
const { user, roles, hasRole, isAdmin, isLoading } = useRBAC();
```

### Types (`src/types/rbac.ts`)

#### `UserRole`
Enum of available user roles.

```typescript
enum UserRole {
  ADMIN = 'Admin',
  MODERATOR = 'Moderator',
  USER = 'User',
  GUEST = 'Guest'
}
```

#### `RBACContext`
Interface for RBAC context object.

```typescript
interface RBACContext {
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
```

---

## Examples

### Example 1: Multi-Tier Dashboard

```typescript
// app/dashboard/page.tsx
import { requireAuth } from '@/lib/auth/rbac-server';
import { UserRole } from '@/types/rbac';

export default async function DashboardPage() {
  const { user, rbac } = await requireAuth();
  
  const isAdmin = rbac.hasRole(UserRole.ADMIN);
  const isModerator = rbac.hasRole(UserRole.MODERATOR);
  
  return (
    <div>
      <h1>Dashboard</h1>
      
      {/* Everyone sees this */}
      <section>
        <h2>Your Stats</h2>
        <UserStats user={user} />
      </section>
      
      {/* Moderators and above */}
      {rbac.hasAnyRole([UserRole.MODERATOR, UserRole.ADMIN]) && (
        <section>
          <h2>Moderation Queue</h2>
          <ModerationQueue />
        </section>
      )}
      
      {/* Admins only */}
      {isAdmin && (
        <section>
          <h2>System Administration</h2>
          <AdminControls />
        </section>
      )}
    </div>
  );
}
```

### Example 2: Dynamic Navigation

```typescript
// components/Navigation.tsx
'use client';

import { useRBAC } from '@/lib/auth/rbac-client';
import { UserRole } from '@/types/rbac';
import Link from 'next/link';

export default function Navigation() {
  const { user, hasAnyRole, isAdmin, isLoading } = useRBAC();
  
  if (isLoading) return <nav>Loading...</nav>;
  
  return (
    <nav>
      <Link href="/">Home</Link>
      
      {user && (
        <>
          <Link href="/dashboard">Dashboard</Link>
          
          {hasAnyRole([UserRole.MODERATOR, UserRole.ADMIN]) && (
            <Link href="/moderator">Moderation</Link>
          )}
          
          {isAdmin() && (
            <Link href="/admin">Admin Panel</Link>
          )}
        </>
      )}
    </nav>
  );
}
```

### Example 3: API Route Protection

```typescript
// app/api/admin/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth/auth0';
import { createRBACContext } from '@/lib/rbac';
import { UserRole } from '@/types/rbac';

export async function GET(request: NextRequest) {
  try {
    const session = await auth0.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const rbac = createRBACContext(session.user, session);
    
    if (!rbac.hasRole(UserRole.ADMIN)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Admin action
    const users = await fetchAllUsers();
    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
```

### Example 4: Conditional Form Fields

```typescript
'use client';

import { useRBAC } from '@/lib/auth/rbac-client';
import { UserRole } from '@/types/rbac';

export default function UserForm() {
  const { hasAnyRole } = useRBAC();
  const canEditSensitiveFields = hasAnyRole([UserRole.ADMIN, UserRole.MODERATOR]);
  
  return (
    <form>
      <input name="name" placeholder="Name" />
      <input name="email" placeholder="Email" />
      
      {canEditSensitiveFields && (
        <>
          <select name="role">
            <option value="User">User</option>
            <option value="Moderator">Moderator</option>
            {hasAnyRole([UserRole.ADMIN]) && (
              <option value="Admin">Admin</option>
            )}
          </select>
          
          <input name="permissions" placeholder="Special Permissions" />
        </>
      )}
      
      <button type="submit">Save</button>
    </form>
  );
}
```

### Example 5: Server Action with RBAC

```typescript
// app/actions/user-actions.ts
'use server';

import { auth0 } from '@/lib/auth/auth0';
import { createRBACContext } from '@/lib/rbac';
import { UserRole } from '@/types/rbac';

export async function deleteUser(userId: string) {
  const session = await auth0.getSession();
  
  if (!session) {
    return { error: 'Not authenticated' };
  }
  
  const rbac = createRBACContext(session.user, session);
  
  if (!rbac.hasRole(UserRole.ADMIN)) {
    return { error: 'Insufficient permissions' };
  }
  
  // Perform admin action
  await database.users.delete(userId);
  
  return { success: true };
}
```

---

## Troubleshooting

### Common Issues

#### 1. User Not Getting Admin Role

**Symptoms**: User logs in but doesn't have Admin role.

**Solutions**:
1. **Check environment variable**
   ```bash
   # Verify .env.local has your email
   RBAC_ADMIN_EMAILS='your-email@example.com'
   ```

2. **Check Auth0 custom claims**
   ```javascript
   // Verify Auth0 Action is adding roles to ID token
   console.log('User app_metadata:', event.user.app_metadata);
   ```

3. **Check logs**
   ```bash
   # Look for role extraction in terminal
   [RBAC] Role extracted from: "Admin Email List" → ["Admin"]
   ```

4. **Test extraction**
   ```typescript
   // Add temporary logging
   const roles = extractUserRoles(session.user);
   console.log('Extracted roles:', roles);
   ```

#### 2. Roles Not Appearing in JWT

**Symptoms**: Roles show in profile but not in token.

**Solutions**:
1. **Verify Auth0 Action is deployed**
   - Go to Auth0 Dashboard → Actions → Flows → Login
   - Ensure action is in the flow and deployed

2. **Check namespace matches**
   ```bash
   # .env.local
   RBAC_CUSTOM_CLAIMS_NAMESPACE='https://my-app.example.com/roles'
   
   # Must match Auth0 Action
   const namespace = 'https://my-app.example.com/roles';
   ```

3. **Test token manually**
   ```typescript
   import { decodeJWT } from '@/lib/utils/jwt';
   const payload = decodeJWT(session.idToken);
   console.log('Token payload:', payload);
   ```

#### 3. Access Denied on Protected Route

**Symptoms**: User is logged in but gets redirected.

**Solutions**:
1. **Check route configuration**
   ```typescript
   // Verify RBAC_CONFIG.routes includes the path
   { path: '/admin', requiredRole: UserRole.ADMIN }
   ```

2. **Verify user has required role**
   ```typescript
   const { rbac } = await getAuthContext();
   console.log('User roles:', rbac?.user.roles);
   console.log('Required role:', UserRole.ADMIN);
   ```

3. **Check middleware**
   ```typescript
   // middleware.ts should not block the route incorrectly
   if (pathname.startsWith('/admin')) {
     // Check logic here
   }
   ```

#### 4. TypeScript Errors

**Symptoms**: Build fails with type errors.

**Solutions**:
1. **Import types correctly**
   ```typescript
   import { UserRole, RBACContext } from '@/types/rbac';
   ```

2. **Check for old permission imports**
   ```typescript
   // Remove this if it exists
   import { Permission } from '@/types/rbac'; // ❌ Doesn't exist anymore
   ```

3. **Update RBACContext usage**
   ```typescript
   // Old (with permissions)
   rbac.hasPermission(Permission.VIEW_ANALYTICS) // ❌
   
   // New (roles only)
   rbac.hasAnyRole([UserRole.MODERATOR, UserRole.ADMIN]) // ✅
   ```

#### 5. Session Expired or Invalid

**Symptoms**: Random redirects to login page.

**Solutions**:
1. **Check AUTH0_SECRET**
   ```bash
   # Generate new secret if needed
   openssl rand -hex 32
   ```

2. **Verify cookie settings**
   ```typescript
   // auth0.js should have correct config
   session: {
     cookie: {
       sameSite: 'lax',
       secure: process.env.NODE_ENV === 'production'
     }
   }
   ```

3. **Clear browser cookies**
   - Open DevTools → Application → Cookies
   - Delete `appSession` cookie
   - Log in again

### Debugging Tools

#### Enable Debug Logging

```typescript
// src/lib/config/env.ts
export const env = {
  // ... other config
  debug: process.env.NODE_ENV === 'development',
};

// In rbac.ts, add logging
if (env.debug) {
  console.log('Role extraction:', { user, roles });
}
```

#### Check RBAC Context

```typescript
// Add to any page to debug
export default async function DebugPage() {
  const { user, rbac } = await requireAuth();
  
  return (
    <div>
      <h1>RBAC Debug Info</h1>
      <pre>{JSON.stringify(rbac, null, 2)}</pre>
    </div>
  );
}
```

#### Test API Endpoint

```typescript
// app/api/rbac-test/route.ts
export async function GET() {
  const session = await auth0.getSession();
  const rbac = session ? createRBACContext(session.user, session) : null;
  
  return Response.json({
    authenticated: !!session,
    user: session?.user,
    roles: rbac?.user.roles,
    accessLevel: rbac?.getAccessLevel()
  });
}
```

---

## Best Practices

### ✅ DO

1. **Always use TypeScript types**
   ```typescript
   import { UserRole } from '@/types/rbac';
   
   const role: UserRole = UserRole.ADMIN; // ✅ Type-safe
   const role = 'Admin'; // ❌ String literals can have typos
   ```

2. **Use role hierarchy**
   ```typescript
   // ✅ Leverages hierarchy (Admin automatically passes)
   if (rbac.hasAnyRole([UserRole.MODERATOR, UserRole.ADMIN])) { }
   
   // ❌ Verbose and error-prone
   if (rbac.hasRole(UserRole.MODERATOR) || rbac.hasRole(UserRole.ADMIN)) { }
   ```

3. **Fail gracefully**
   ```typescript
   // ✅ Handle loading state
   if (isLoading) return <Spinner />;
   if (!user) return <LoginPrompt />;
   
   // ❌ Can cause hydration errors
   return user ? <Content /> : null;
   ```

4. **Centralize role checks**
   ```typescript
   // ✅ Create reusable functions
   export function canManageUsers(rbac: RBACContext): boolean {
     return rbac.hasAnyRole([UserRole.ADMIN, UserRole.MODERATOR]);
   }
   
   // Use throughout app
   if (canManageUsers(rbac)) { }
   ```

5. **Use environment variables for admins**
   ```bash
   # ✅ Easy to change without code deployment
   RBAC_ADMIN_EMAILS='admin@company.com'
   
   # ❌ Hardcoded (requires code change)
   const ADMINS = ['admin@company.com'];
   ```

### ❌ DON'T

1. **Don't skip server-side checks**
   ```typescript
   // ❌ Client-only protection is NOT secure
   export default function AdminPage() {
     const { isAdmin } = useRBAC();
     if (!isAdmin()) return <Forbidden />;
     return <AdminContent />;
   }
   
   // ✅ Always protect on server first
   export default async function AdminPage() {
     await requireAdmin(); // Server-side protection
     return <AdminContent />;
   }
   ```

2. **Don't use string literals**
   ```typescript
   // ❌ Typo-prone
   if (rbac.hasRole('Amin' as any)) { } // Typo: Amin instead of Admin
   
   // ✅ Type-safe
   if (rbac.hasRole(UserRole.ADMIN)) { }
   ```

3. **Don't check roles in middleware for everything**
   ```typescript
   // ❌ Middleware should only check authentication
   if (pathname.startsWith('/dashboard')) {
     const roles = extractRoles(session);
     if (!roles.includes('Admin')) return redirect('/');
   }
   
   // ✅ Let page-level requireAuth handle it
   // middleware.ts only checks session existence
   // pages use requireAuth({ roles: [...] })
   ```

4. **Don't mix authorization logic**
   ```typescript
   // ❌ Scattered role checks
   if (user.email === 'admin@company.com') { }
   if (user.roles.includes('Admin')) { }
   if (user.metadata?.admin === true) { }
   
   // ✅ Use RBAC system consistently
   if (rbac.hasRole(UserRole.ADMIN)) { }
   ```

5. **Don't forget error boundaries**
   ```typescript
   // ❌ Can crash on unexpected errors
   const rbac = createRBACContext(session.user);
   
   // ✅ Already handled - createRBACContext never throws
   // But still wrap in try-catch for database calls, etc.
   try {
     const rbac = createRBACContext(session.user);
     await database.query();
   } catch (error) {
     logger.error('Error:', error);
   }
   ```

### Security Best Practices

1. **Always validate on server**
   - Client-side checks are for UX only
   - Server-side checks are for security
   - Never trust client-side data

2. **Use environment variables**
   - Admin emails in `.env.local`
   - Never commit secrets to git
   - Use different values per environment

3. **Implement audit logging**
   ```typescript
   // Log sensitive actions
   logger.info('User action', {
     userId: user.sub,
     role: rbac.user.roles,
     action: 'delete_user',
     targetUserId: targetId
   });
   ```

4. **Limit token lifetime**
   ```bash
   # Configure in Auth0 Dashboard
   ID Token Expiration: 1 hour
   Access Token Expiration: 24 hours
   Refresh Token Expiration: 30 days
   ```

5. **Review role assignments regularly**
   - Audit who has Admin access
   - Remove inactive admin accounts
   - Use time-limited elevated access when possible

### Performance Best Practices

1. **Leverage JWT caching**
   - Tokens are automatically cached
   - Reduces redundant decoding
   - Automatic cleanup of expired entries

2. **Use early returns**
   ```typescript
   // ✅ Exit early for performance
   if (!user) return null;
   if (!rbac.hasRole(UserRole.ADMIN)) return <Forbidden />;
   return <AdminPanel />;
   ```

3. **Minimize role extraction calls**
   ```typescript
   // ❌ Multiple extractions
   const roles1 = extractUserRoles(user);
   const roles2 = extractUserRoles(user);
   
   // ✅ Extract once, reuse
   const rbac = createRBACContext(user, session);
   // Use rbac throughout component
   ```

4. **Use static generation where possible**
   ```typescript
   // For pages that don't need per-request auth
   export const dynamic = 'force-static';
   ```

---

## Conclusion

This RBAC system provides a **simple, secure, and performant** way to manage role-based access control in your Next.js application. By focusing on roles instead of permissions, it maintains a clear mental model while providing all the access control you need.

### Key Takeaways

1. **Simple is better** - Role-only system is easier to understand and maintain
2. **Type safety matters** - Full TypeScript support prevents runtime errors
3. **Server-first security** - Always validate on server, client is for UX
4. **Zero dependencies** - Custom implementation gives you full control
5. **Performance optimized** - JWT caching, early returns, minimal overhead

### Getting Help

- Check the logs (structured JSON logging)
- Review the examples in this document
- Verify Auth0 configuration
- Ensure environment variables are set correctly

### Future Enhancements

While the current system is production-ready, consider these enhancements if needed:
- Role expiration dates
- Audit logging dashboard
- Role request/approval workflow
- Multi-tenancy support
- GraphQL API protection

---

**Version**: 2.0  
**Last Updated**: January 21, 2025  
**Status**: Production Ready ✅  
**Lines of Code**: ~800  
**Bundle Size**: ~10KB  
**Build Time**: ~4-5 seconds
