/**
 * Admin Dashboard Utility Functions
 */

import { User, ActivityItem } from '@/types/admin';

/**
 * Get the count of active users
 */
export function getActiveUsersCount(users: User[]): number {
  return users.filter((user) => user.status === 'Active').length;
}

/**
 * Get Tailwind classes for role badge styling
 */
export function getRoleBadgeStyle(role: User['role']): string {
  const styles = {
    Admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    Moderator: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    User: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  };
  return styles[role];
}

/**
 * Get Tailwind classes for status badge styling
 */
export function getStatusBadgeStyle(status: User['status']): string {
  const styles = {
    Active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    Inactive: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };
  return styles[status];
}

/**
 * Get Tailwind classes for activity dot color
 */
export function getActivityDotColor(type: ActivityItem['type']): string {
  const colors = {
    user: 'bg-blue-500',
    system: 'bg-green-500',
    security: 'bg-red-500',
  };
  return colors[type];
}

/**
 * Format date for display
 */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format time for display
 */
export function formatTime(date: string | Date): string {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get user initials from name
 * Handles edge cases: empty strings, multiple spaces, and single names
 */
export function getUserInitials(name: string): string {
  return name
    .split(' ')
    .filter((n) => n.length > 0) // Filter out empty strings from multiple spaces
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
