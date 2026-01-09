import { Vendor } from '@ultimate-sf/shared';

// Mock data - In a real app, this would come from a database
const vendors: Vendor[] = [
  {
    id: '1',
    name: 'Taco Fiesta Truck',
    cuisine: 'Mexican',
    area: 'Downtown',
    rating: 4.8,
    isOpen: true,
    priceRange: '$$',
    description: 'Authentic Mexican tacos with fresh ingredients',
    photoUrl: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828'
  },
  {
    id: '2',
    name: 'Pho King Good',
    cuisine: 'Vietnamese',
    area: 'Chinatown',
    rating: 4.6,
    isOpen: true,
    priceRange: '$',
    description: 'Traditional Vietnamese pho and banh mi',
    photoUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43'
  },
  {
    id: '3',
    name: 'BBQ Boss',
    cuisine: 'BBQ',
    area: 'Brooklyn',
    rating: 4.9,
    isOpen: false,
    priceRange: '$$',
    description: 'Slow-smoked meats and homemade sauces',
    photoUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1'
  }
];

export const getAllVendors = (): Vendor[] => {
  return vendors;
};
