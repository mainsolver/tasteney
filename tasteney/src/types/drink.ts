export type BeverageArchetype =
  | 'Wine'
  | 'Coffee'
  | 'Spirits'
  | 'Beer'
  | 'Tea'
  | 'Soda & Tonics'
  | 'Cocktail'
  | 'Other';

export type SensoryCategory = 'Smell' | 'Taste' | 'Aftertaste';

export interface SensoryDescriptor {
  id: string;
  name: string;
  category: 'Smell' | 'Taste' | 'Aftertaste' | 'Finish';
  intensity: number; // 1 to 5
}

export interface DrinkEntry {
  id: string;
  name: string;
  manufacturer: string; // Winery, Brewery, Roastery, Estate or Producer
  rating: number; // 1 - 10
  notes: string; // Personal cellar/pairing memo or review
  images: string[]; // One or more image URIs
  archetype: BeverageArchetype;
  sensoryDescriptors?: SensoryDescriptor[];
  createdAt: string; // ISO 8601 string
}
