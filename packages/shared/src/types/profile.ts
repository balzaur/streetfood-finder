/**
 * Profile entity - Represents a user profile linked to Supabase Auth
 * This extends auth.users with application-specific data
 */
export interface Profile {
  id: string; // References auth.users(id)
  name: string;
  created_at: string;
  updated_at: string;
}

/**
 * Request payload for creating a profile
 * Note: Typically handled automatically by backend auth middleware
 */
export interface CreateProfileData {
  id: string; // auth.users.id from Supabase
  name: string;
}

/**
 * Request payload for updating a profile
 */
export interface UpdateProfileData {
  name?: string;
}

/**
 * Auth session data from Supabase
 */
export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: {
    id: string;
    email?: string;
    user_metadata?: {
      name?: string;
      avatar_url?: string;
    };
  };
}
