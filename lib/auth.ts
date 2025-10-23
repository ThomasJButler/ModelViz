/**
 * @author Tom Butler
 * @date 2025-10-23
 * @description Demo authentication utilities for development and testing purposes
 */

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

/**
 * Gets the current demo user
 * @return Demo user object
 */
export function getCurrentUser(): User {
  return {
    id: "demo",
    name: "Demo User",
    email: "demo@example.com",
    role: "user"
  };
}

/**
 * Enforces authentication by returning the current user
 * @return Current user object
 */
export function requireAuth(): User {
  return getCurrentUser();
}

/**
 * Checks if a user has admin privileges
 * @param user - User object to check
 * @return True if user is an admin
 */
export function isAdmin(user: any): boolean {
  return user?.role === 'admin';
}
