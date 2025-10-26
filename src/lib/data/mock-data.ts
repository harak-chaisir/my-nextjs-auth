/**
 * Mock Data for Admin Dashboard
 * TODO: Replace with real API calls
 */

import { User, ActivityItem } from '@/types/admin';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Admin',
    status: 'Active',
    lastLogin: '2025-01-20',
    avatar: 'https://i.pravatar.cc/150?img=1',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'Moderator',
    status: 'Active',
    lastLogin: '2025-01-19',
    avatar: 'https://i.pravatar.cc/150?img=2',
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    role: 'User',
    status: 'Inactive',
    lastLogin: '2025-01-15',
    avatar: 'https://i.pravatar.cc/150?img=3',
  },
  {
    id: '4',
    name: 'Alice Williams',
    email: 'alice@example.com',
    role: 'User',
    status: 'Active',
    lastLogin: '2025-01-20',
    avatar: 'https://i.pravatar.cc/150?img=4',
  },
];

export const mockActivities: ActivityItem[] = [
  {
    id: '1',
    user: 'John Doe',
    action: 'Updated user permissions',
    timestamp: '2 minutes ago',
    type: 'user',
  },
  {
    id: '2',
    user: 'System',
    action: 'Backup completed successfully',
    timestamp: '1 hour ago',
    type: 'system',
  },
  {
    id: '3',
    user: 'Jane Smith',
    action: 'Modified security settings',
    timestamp: '3 hours ago',
    type: 'security',
  },
  {
    id: '4',
    user: 'Bob Johnson',
    action: 'Created new user account',
    timestamp: '5 hours ago',
    type: 'user',
  },
];
