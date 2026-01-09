/**
 * Business entity - Represents a street food vendor business
 */
export interface Business {
  id: string;
  user_id: string;
  name: string;
  description?: string | null;
  image?: string | null;
  longitude: number;
  latitude: number;
  created_at: string;
  updated_at: string;
}

/**
 * Request payload for creating a business
 */
export interface CreateBusinessData {
  name: string;
  description?: string | null;
  image?: string | null;
  longitude: number;
  latitude: number;
}

/**
 * Request payload for updating a business
 */
export interface UpdateBusinessData {
  name?: string;
  description?: string | null;
  image?: string | null;
  longitude?: number;
  latitude?: number;
}
