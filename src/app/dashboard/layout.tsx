import { ReactNode } from 'react';
import { requireAuth } from '@/lib/auth/rbac-server';
import { UserRole } from '@/types/rbac';
import Sidebar from '@/components/Sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  // Require authentication for users, moderators, or admins
  const { session } = await requireAuth({
    roles: [UserRole.USER, UserRole.MODERATOR, UserRole.ADMIN],
    redirectTo: '/'
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar user={session.user} />
      <div className="lg:pl-64 transition-all duration-300">
        <main className="min-h-screen pt-16 lg:pt-0">
          {children}
        </main>
      </div>
    </div>
  );
}