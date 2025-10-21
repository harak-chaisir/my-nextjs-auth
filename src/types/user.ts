import { ObjectId } from 'mongodb';
import { UserRole } from './rbac';

/**
 * User entity as stored in MongoDB
 * Represents the complete user data structure in the database
 */
export interface UserEntity {
  _id: ObjectId;
  auth0Id: string;
  email: string;
  name: string;
  picture?: string;
  emailVerified: boolean;
  roles: UserRole[];
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}

/**
 * Data Transfer Object for User
 * Used for API responses - excludes sensitive data and converts ObjectId to string
 */
export interface UserDTO {
  id: string;
  auth0Id: string;
  email: string;
  name: string;
  picture?: string;
  emailVerified: boolean;
  roles: UserRole[];
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

/**
 * Input data for creating a new user
 * Used when registering a user from Auth0 data
 */
export interface CreateUserInput {
  auth0Id: string;
  email: string;
  name: string;
  picture?: string;
  emailVerified: boolean;
  roles?: UserRole[];
}

/**
 * Input data for updating an existing user
 * All fields are optional to allow partial updates
 */
export interface UpdateUserInput {
  name?: string;
  picture?: string;
  emailVerified?: boolean;
  roles?: UserRole[];
  lastLogin?: Date;
}

/**
 * Auth0 user profile structure
 * Matches the data returned from Auth0 API
 */
export interface Auth0User {
  sub: string;
  name: string;
  email: string;
  picture?: string;
  email_verified: boolean;
  updated_at: string;
  // Auth0 metadata for roles (can be stored in different ways)
  app_metadata?: {
    roles?: UserRole[];
  };
  user_metadata?: {
    roles?: UserRole[];
  };
  'https://myapp.com/roles'?: UserRole[]; // Custom namespace for roles
}