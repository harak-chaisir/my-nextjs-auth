'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { RBACContext, UserRole } from '@/types/rbac';

interface UserSidebarProps {
  user: {
    name?: string;
    email?: string;
    picture?: string;
  };
  rbac: RBACContext;
}

interface MenuItem {
  name: string;
  href: string;
  icon: string;
  requiredRole?: UserRole;
}

export default function UserSidebar({ user, rbac }: UserSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  // Menu items for regular users
  const menuItems: MenuItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Profile', href: '/dashboard/profile', icon: '👤' },
    { name: 'Analytics', href: '/dashboard/analytics', icon: '📈', requiredRole: UserRole.MODERATOR },
    { name: 'Messages', href: '/dashboard/messages', icon: '💬' },
    { name: 'Settings', href: '/dashboard/settings', icon: '⚙️' },
    { name: 'Support', href: '/dashboard/support', icon: '🆘' },
  ];

  // Filter menu items based on roles
  const accessibleMenuItems = menuItems.filter(item => {
    if (!item.requiredRole) return true;
    return rbac.hasRole(item.requiredRole) || rbac.hasRole(UserRole.ADMIN);
  });

  // Show admin panel link if user is admin
  const showAdminPanel = rbac.hasRole(UserRole.ADMIN);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMobileToggle = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Image
              className="rounded-full"
              src={user?.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}`}
              alt={user?.name || 'User'}
              width={32}
              height={32}
            />
            <span className="font-medium text-gray-900 dark:text-white">{user?.name}</span>
          </div>
          <button
            onClick={handleMobileToggle}
            className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <span className="sr-only">Open sidebar</span>
            {isMobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
        lg:z-auto lg:translate-x-0
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'lg:w-16' : 'w-64'}
        transition-all duration-300 ease-in-out
      `}>
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 ${isCollapsed ? 'lg:justify-center' : ''}`}>
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <span className="text-2xl">🏢</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">Dashboard</span>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:block p-1.5 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {isCollapsed ? '→' : '←'}
          </button>
        </div>

        {/* User Info */}
        <div className={`p-4 border-b border-gray-200 dark:border-gray-700 ${isCollapsed ? 'lg:hidden' : ''}`}>
          <div className="flex items-center space-x-3">
            <Image
              className="rounded-full"
              src={user?.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}`}
              alt={user?.name || 'User'}
              width={40}
              height={40}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {rbac.user.roles.join(', ')}
              </p>
            </div>
          </div>
        </div>

        {/* Admin Panel Link */}
        {showAdminPanel && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <Link
              href="/admin"
              className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-md transition-colors"
              onClick={closeMobileMenu}
            >
              <span className="text-lg">⚡</span>
              {!isCollapsed && <span>Admin Panel</span>}
            </Link>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {accessibleMenuItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={closeMobileMenu}
                className={`
                  flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md transition-colors
                  ${isActive
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                `}
                title={isCollapsed ? item.name : ''}
              >
                <span className="text-lg">{item.icon}</span>
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className={`p-4 border-t border-gray-200 dark:border-gray-700 ${isCollapsed ? 'lg:hidden' : ''}`}>
          <Link
            href="/auth/logout"
            className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-md transition-colors"
            onClick={closeMobileMenu}
          >
            <span className="text-lg">🚪</span>
            {!isCollapsed && <span>Sign Out</span>}
          </Link>
        </div>
      </div>
    </>
  );
}