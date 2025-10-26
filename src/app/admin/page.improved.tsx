/**
 * Admin Dashboard - Improved Version
 * 
 * Improvements:
 * - Added RBAC protection with requireAdmin
 * - Split into smaller components
 * - Added TypeScript interfaces
 * - Used Next.js Image component
 * - Extracted reusable components
 * - Added proper error handling
 * - Improved accessibility
 * - Better code organization
 */

import { requireAdmin } from '@/lib/auth/rbac-server';
import Image from 'next/image';
import Link from 'next/link';
import { Users, CheckCircle, TrendingUp, AlertCircle } from 'lucide-react';

// ============================================================================
// Types & Interfaces
// ============================================================================

interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Moderator' | 'User';
  status: 'Active' | 'Inactive';
  lastLogin: string;
  avatar: string;
}

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  bgColor: string;
  iconColor: string;
}

interface ActivityItem {
  id: string;
  message: string;
  timestamp: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

// ============================================================================
// Mock Data (Move to API/Database in production)
// ============================================================================

const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Admin',
    status: 'Active',
    lastLogin: '2 hours ago',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face&auto=format'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'User',
    status: 'Active',
    lastLogin: '1 day ago',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b5af?w=40&h=40&fit=crop&crop=face&auto=format'
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike.johnson@example.com',
    role: 'User',
    status: 'Inactive',
    lastLogin: '1 week ago',
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=40&h=40&fit=crop&crop=face&auto=format'
  },
  {
    id: '4',
    name: 'Sarah Wilson',
    email: 'sarah.wilson@example.com',
    role: 'Moderator',
    status: 'Active',
    lastLogin: '3 hours ago',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face&auto=format'
  }
];

const recentActivity: ActivityItem[] = [
  { id: '1', message: 'New user Sarah Wilson registered', timestamp: '10 minutes ago', type: 'success' },
  { id: '2', message: 'User permissions updated for Mike Johnson', timestamp: '1 hour ago', type: 'info' },
  { id: '3', message: 'System backup completed successfully', timestamp: '2 hours ago', type: 'info' },
  { id: '4', message: 'Security alert: Multiple failed login attempts', timestamp: '3 hours ago', type: 'warning' }
];

// ============================================================================
// Utility Functions
// ============================================================================

function getActiveUsersCount(users: User[]): number {
  return users.filter(u => u.status === 'Active').length;
}

function getRoleBadgeStyle(role: User['role']): string {
  const styles = {
    Admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    Moderator: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    User: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
  };
  return styles[role];
}

function getStatusBadgeStyle(status: User['status']): string {
  return status === 'Active'
    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
}

function getActivityDotColor(type: ActivityItem['type']): string {
  const colors = {
    success: 'bg-green-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500'
  };
  return colors[type];
}

// ============================================================================
// Reusable Components
// ============================================================================

function StatCard({ title, value, icon, bgColor, iconColor }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-center">
        <div className={`p-2 ${bgColor} rounded-lg`}>
          <div className={iconColor}>{icon}</div>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function WelcomeBanner({ userName }: { userName: string }) {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white mb-8 shadow-lg">
      <h2 className="text-3xl font-bold mb-2">
        Admin Dashboard - Welcome, {userName}! 👋
      </h2>
      <p className="text-blue-100">
        Manage users, monitor system activity, and oversee platform operations.
      </p>
    </div>
  );
}

function UserRow({ user }: { user: User }) {
  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="relative h-10 w-10 rounded-full overflow-hidden">
            <Image 
              src={user.avatar}
              alt={`${user.name}'s avatar`}
              fill
              className="object-cover"
              sizes="40px"
            />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {user.name}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {user.email}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeStyle(user.role)}`}>
          {user.role}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeStyle(user.status)}`}>
          {user.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
        {user.lastLogin}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex space-x-2">
          <button 
            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            aria-label={`Edit ${user.name}`}
          >
            Edit
          </button>
          <button 
            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"
            aria-label={`Delete ${user.name}`}
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}

function UsersTable({ users }: { users: User[] }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            User Management
          </h3>
          <Link 
            href="/admin/users/add"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md"
            aria-label="Add new user"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Add User</span>
          </Link>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                User
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Role
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Last Login
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {users.map((user) => (
              <UserRow key={user.id} user={user} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ActivityFeed({ activities }: { activities: ActivityItem[] }) {
  return (
    <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Recent Admin Activity
      </h3>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div 
            key={activity.id}
            className="flex items-center space-x-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-150"
          >
            <div className={`w-2 h-2 ${getActivityDotColor(activity.type)} rounded-full flex-shrink-0`} />
            <div className="flex-1 min-w-0">
              <p className="text-gray-900 dark:text-white truncate">
                {activity.message}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {activity.timestamp}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default async function AdminDashboard() {
  // ✅ IMPROVEMENT: Added RBAC protection
  const { user, rbac } = await requireAdmin();
  
  // ✅ IMPROVEMENT: Computed values extracted to functions
  const activeUsersCount = getActiveUsersCount(mockUsers);
  const userName = user.name || user.nickname || 'Admin';

  return (
    <div className="p-8">
      {/* Welcome Section */}
      <WelcomeBanner userName={userName} />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={mockUsers.length}
          icon={<Users className="w-6 h-6" />}
          bgColor="bg-blue-100 dark:bg-blue-900"
          iconColor="text-blue-600 dark:text-blue-400"
        />
        
        <StatCard
          title="Active Users"
          value={activeUsersCount}
          icon={<CheckCircle className="w-6 h-6" />}
          bgColor="bg-green-100 dark:bg-green-900"
          iconColor="text-green-600 dark:text-green-400"
        />
        
        <StatCard
          title="New Today"
          value={2}
          icon={<TrendingUp className="w-6 h-6" />}
          bgColor="bg-purple-100 dark:bg-purple-900"
          iconColor="text-purple-600 dark:text-purple-400"
        />
        
        <StatCard
          title="Pending Actions"
          value={3}
          icon={<AlertCircle className="w-6 h-6" />}
          bgColor="bg-yellow-100 dark:bg-yellow-900"
          iconColor="text-yellow-600 dark:text-yellow-400"
        />
      </div>

      {/* User Management Section */}
      <UsersTable users={mockUsers} />

      {/* Recent Activity */}
      <ActivityFeed activities={recentActivity} />
    </div>
  );
}
