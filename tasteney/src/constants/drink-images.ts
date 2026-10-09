import { BeverageArchetype } from '@/types/drink';

export const ARCHETYPE_FALLBACK_IMAGES: Record<BeverageArchetype, any> = {
  Wine: require('@/assets/images/drinks/wine.jpg'),
  Coffee: require('@/assets/images/drinks/coffee.jpg'),
  Spirits: require('@/assets/images/drinks/spirits.jpg'),
  Beer: require('@/assets/images/drinks/beer.jpg'),
  Tea: require('@/assets/images/drinks/tea.jpg'),
  'Soda & Tonics': require('@/assets/images/drinks/soda.jpg'),
  Cocktail: require('@/assets/images/drinks/cocktail.jpg'),
  Other: require('@/assets/images/drinks/other.jpg'),
};

export const DEFAULT_ENTRY_IMAGE = ARCHETYPE_FALLBACK_IMAGES.Wine;

export function getArchetypeFallbackImage(archetype?: string) {
  if (archetype && (archetype as BeverageArchetype) in ARCHETYPE_FALLBACK_IMAGES) {
    return ARCHETYPE_FALLBACK_IMAGES[archetype as BeverageArchetype];
  }
  return DEFAULT_ENTRY_IMAGE;
}
