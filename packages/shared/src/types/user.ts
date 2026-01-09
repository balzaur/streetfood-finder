/**
 * User entity - Represents a vendor user account
 */
export interface User {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

/**
 * User identity - OAuth provider link to user
 */
export interface UserIdentity {
  id: string;
  user_id: string;
  provider: string;
  provider_user_id: string;
  provider_email?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Request payload for Facebook login
 */
export interface FacebookLoginData {
  name: string;
  provider: string;
  provider_user_id: string;
  provider_email?: string | null;
}

/**
 * Response from Facebook login (create or get)
 */
export interface FacebookLoginResult {
  user: User;
  identity: UserIdentity;
  isNewUser: boolean;
}

/**
 * Request payload for user update
 */
export interface UpdateUserData {
  name: string;
}

/**
 * Request payload for creating user identity
 */
export interface CreateUserIdentityData {
  user_id: string;
  provider: string;
  provider_user_id: string;
  provider_email?: string | null;
}
