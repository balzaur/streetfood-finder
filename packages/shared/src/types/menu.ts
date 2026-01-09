/**
 * Menu entity - Represents a menu for a business
 */
export interface Menu {
  id: string;
  business_id: string;
  menu: string;
  images: string[];
  created_at: string;
  updated_at: string;
}

/**
 * Request payload for creating a menu
 */
export interface CreateMenuData {
  menu: string;
  images: string[];
}

/**
 * Request payload for updating a menu
 */
export interface UpdateMenuData {
  menu?: string;
  images?: string[];
}
