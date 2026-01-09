export interface Vendor {
  id: string;
  name: string;
  cuisine: string;
  area: string;
  rating?: number;
  isOpen: boolean;
  latitude?: number;
  longitude?: number;
  priceRange?: "$" | "$$" | "$$$" | "$$$$";
  description?: string;
  photoUrl?: string;
  address?: string;
  phone?: string;
  hours?: {
    open: string;
    close: string;
  };
  specialties?: string[];
}
