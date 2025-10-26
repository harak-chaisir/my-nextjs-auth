import { ReactNode } from 'react';
import { requireAdmin } from '@/lib/auth/rbac-server';
import Sidebar from '@/components/Sidebar';

interface AdminLayoutProps {
  children: ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  // Require admin role - automatically redirects if not admin
  const { user } = await requireAdmin('/dashboard');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar user={user} />
      <div className="lg:pl-64 transition-all duration-300">
        <main className="min-h-screen pt-16 lg:pt-0">
          {children}
        </main>
      </div>
    </div>
  );
}