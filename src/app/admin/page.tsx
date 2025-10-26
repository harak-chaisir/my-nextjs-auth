'use client';

import { useState } from 'react';
import { Users, CheckCircle, TrendingUp, AlertCircle } from 'lucide-react';

// Components
import {
  StatCard,
  WelcomeBanner,
  UsersTable,
  ActivityFeed,
} from '@/components/admin';

// Data & Utils
import { mockUsers, mockActivities } from '@/lib/data/mock-data';
import { getActiveUsersCount } from '@/lib/utils/admin-utils';
import { User } from '@/types/admin';

/**
 * Admin Dashboard
 * 
 * Protected admin-only page for managing users and viewing system activity.
 * Uses RBAC to ensure only users with Admin role can access.
 */
export default function AdminDashboard() {
  const [users, setUsers] = useState(mockUsers);

  const handleEditUser = (user: User) => {
    console.log('Edit user:', user);
    // TODO: Implement edit functionality
    // Example: Open modal, navigate to edit page, etc.
    alert(`Edit user: ${user.name}\n\nTODO: Implement edit functionality`);
  };

  const handleDeleteUser = (user: User) => {
    console.log('Delete user:', user);
    
    const confirmed = window.confirm(
      `Are you sure you want to delete ${user.name}?\n\nThis action cannot be undone.`
    );
    
    if (confirmed) {
      // Remove user from the list
      setUsers(users.filter(u => u.id !== user.id));
      alert(`User ${user.name} has been deleted.`);
      // TODO: Make API call to delete user from backend
    }
  };

  // Computed values
  const activeUsersCount = getActiveUsersCount(users);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <WelcomeBanner userName="Admin" />

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={users.length}
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
            title="Growth"
            value="+12%"
            icon={<TrendingUp className="w-6 h-6" />}
            bgColor="bg-yellow-100 dark:bg-yellow-900"
            iconColor="text-yellow-600 dark:text-yellow-400"
          />
          <StatCard
            title="Issues"
            value="3"
            icon={<AlertCircle className="w-6 h-6" />}
            bgColor="bg-red-100 dark:bg-red-900"
            iconColor="text-red-600 dark:text-red-400"
          />
        </div>

        {/* Users Table */}
        <div className="mb-8">
          <UsersTable 
            users={users}
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
          />
        </div>

        {/* Recent Activity */}
        <ActivityFeed activities={mockActivities} />
      </div>
    </div>
  );
}
