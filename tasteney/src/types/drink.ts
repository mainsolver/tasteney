export type BeverageArchetype =
  | 'Wine'
  | 'Coffee'
  | 'Spirits'
  | 'Beer'
  | 'Tea'
  | 'Soda & Tonics'
  | 'Cocktail'
  | 'Other';

export const BEVERAGE_SUBTYPES: Record<BeverageArchetype, string[]> = {
  Wine: ['Red', 'White', 'Rose', 'Sparkling', 'Blanc de Noir', 'Other'],
  Coffee: ['Espresso', 'Pour Over', 'Filter', 'Cold Brew', 'Latte / Cappuccino', 'Other'],
  Spirits: ['Whiskey', 'Gin', 'Rum', 'Tequila / Mezcal', 'Vodka', 'Brandy / Cognac', 'Liqueur', 'Other'],
  Beer: ['Lager / Pilsner', 'IPA', 'Stout / Porter', 'Wheat', 'Sour', 'Other'],
  Tea: ['Black', 'Green', 'Oolong', 'White', 'Matcha', 'Herbal', 'Pu-erh', 'Other'],
  'Soda & Tonics': ['Tonic', 'Ginger Beer', 'Cola', 'Sparkling Water / Seltzer', 'Botanical Soda', 'Other'],
  Cocktail: ['Old Fashioned / Spirit-Forward', 'Sour', 'Highball / Fizz', 'Martini', 'Spritz', 'Other'],
  Other: ['Mead', 'Cider', 'Sake', 'Kombucha', 'Other'],
};

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
  country?: string; // Country of origin or tasting
  city?: string; // City / region of origin or tasting
  rating: number; // 1 - 10
  notes: string; // Personal cellar/pairing memo or review
  images: string[]; // One or more image URIs
  archetype: BeverageArchetype;
  subtype?: string;
  sensoryDescriptors?: SensoryDescriptor[];
  createdAt: string; // ISO 8601 string
}
