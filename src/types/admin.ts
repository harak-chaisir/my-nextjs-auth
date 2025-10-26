/**
 * Admin Dashboard Type Definitions
 */

/**
 * ISO 8601 date-time string (e.g., "2025-10-26T14:30:00Z")
 * Used for consistent date/time representation across the application
 */
export type ISODateString = string;

/**
 * User roles in the system with different permission levels
 * - Admin: Full system access
 * - Moderator: Limited administrative access
 * - User: Standard user access
 */
export type UserRole = 'Admin' | 'Moderator' | 'User';

/**
 * User account status
 * - Active: User can access the system
 * - Inactive: User account is disabled
 */
export type UserStatus = 'Active' | 'Inactive';

/**
 * Activity type for categorization and visual indicators
 * - user: User-related activities (blue indicator)
 * - system: System notifications (green indicator)
 * - security: Security alerts (red indicator)
 */
export type ActivityType = 'user' | 'system' | 'security';

/**
 * User entity in the admin dashboard
 */
export interface User {
  /** Unique identifier for the user */
  id: string;
  /** Full name of the user */
  name: string;
  /** Email address for the user */
  email: string;
  /** User's role determining their permission level */
  role: UserRole;
  /** Current account status */
  status: UserStatus;
  /** Last login time in ISO 8601 format (e.g., "2025-10-26T14:30:00Z") */
  lastLogin: ISODateString;
  /** URL to user's avatar image */
  avatar: string;
}

/**
 * Activity log item in the admin dashboard
 */
export interface ActivityItem {
  /** Unique identifier for the activity */
  id: string;
  /** Username or display name of the user who performed the action */
  user: string;
  /** Description of the action performed */
  action: string;
  /** Timestamp when the action occurred in ISO 8601 format (e.g., "2025-10-26T14:30:00Z") */
  timestamp: ISODateString;
  /** Category of activity for visual indicators and filtering */
  type: ActivityType;
}
