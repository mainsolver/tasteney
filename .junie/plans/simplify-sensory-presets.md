---
sessionId: session-261014-182840-28b8
---

# Requirements

### Overview & Goals
Simplify the sensory descriptor presets in the sensory selector component by converting all multi-word and compound presets (e.g., "Red Berries & Cherry", "French Oak & Vanilla", "Silky Velvet Tannins") into clean, single-word tags (e.g., "Berry", "Oak", "Tannins"). This prevents cognitive overload and makes tagging quick and intuitive for users.

### Scope
- **In Scope:**
  - Update `ARCHETYPE_SENSORY_PRESETS` in `tasteney/src/components/sensory-selector.tsx` to use strictly single-word tags across all beverage archetypes (`Wine`, `Coffee`, `Spirits`, `Beer`, `Tea`, `Soda & Tonics`, `Cocktail`, `Other`) and categories (`Smell`, `Taste`, `Aftertaste`).
  - Update placeholder example strings in `CATEGORIES` within `sensory-selector.tsx`.
  - Update `en.ts` and `de.ts` translation files with the new single-word presets under `sensory.presetTags` and updated category placeholder strings.
  - Maintain backwards compatibility in `presetTags` so existing journal entries with multi-word tags continue to display and translate properly.
- **Out of Scope:**
  - Changes to descriptor intensity ranking logic, custom descriptor input functionality, or data schema.
  - Changes to backend APIs or persistence layer.

### User Stories
- As a beverage enthusiast logging a tasting entry, I want sensory preset chips to be simple single words so that I can quickly select aromas, flavors, and finishes without feeling overwhelmed by complex descriptions.
- As a German-speaking user, I want single-word sensory presets to be accurately translated into clean German single words.

### Functional Requirements
- Every preset chip provided in `ARCHETYPE_SENSORY_PRESETS` for every archetype and category must consist of a single word.
- Preset suggestions rendered in `SensorySelector` must display the translated single-word label based on the active language.
- Autocomplete, ranking, and deduplication logic in `SensorySelector` must continue to operate seamlessly with the single-word tags.
- Existing tasting records that contain previous multi-word tags must still render correctly without broken translations.

# Technical Design

### Current Implementation
- `tasteney/src/components/sensory-selector.tsx` defines `ARCHETYPE_SENSORY_PRESETS` with 4 multi-word presets per category for each archetype (e.g., `'Red Berries & Cherry'`, `'Silky Velvet Tannins'`).
- `CATEGORIES` defines placeholder strings with multi-word examples (e.g., `'Floral Violet, French Oak'`).
- `tasteney/src/i18n/locales/en.ts` and `tasteney/src/i18n/locales/de.ts` provide translation maps under `sensory.presetTags` and `sensory.categories.*.placeholder`.

### Proposed Changes
- Replace multi-word strings in `ARCHETYPE_SENSORY_PRESETS` with concise single-word terms:
  - **Wine**:
    - Smell: `['Berry', 'Cherry', 'Oak', 'Earthy']`
    - Taste: `['Blackberry', 'Cherry', 'Apple', 'Peach']`
    - Aftertaste: `['Tannins', 'Minerality', 'Acidity', 'Oak']`
  - **Coffee**:
    - Smell: `['Roast', 'Caramel', 'Hazelnut', 'Floral']`
    - Taste: `['Chocolate', 'Espresso', 'Butterscotch', 'Citrus']`
    - Aftertaste: `['Bitter', 'Warmth', 'Vanilla', 'Sweet']`
  - **Spirits**:
    - Smell: `['Smoky', 'Oak', 'Caramel', 'Spicy']`
    - Taste: `['Cinnamon', 'Tobacco', 'Honey', 'Pepper']`
    - Aftertaste: `['Oak', 'Smoky', 'Warmth', 'Vanilla']`
  - **Beer**:
    - Smell: `['Citrus', 'Tropical', 'Herbal', 'Apple']`
    - Taste: `['Apple', 'Nutty', 'Grassy', 'Cherry']`
    - Aftertaste: `['Acidity', 'Bitter', 'Saline', 'Minerality']`
  - **Tea**:
    - Smell: `['Honey', 'Floral', 'Herbal', 'Citrus']`
    - Taste: `['Bergamot', 'Grassy', 'Peach', 'Honey']`
    - Aftertaste: `['Sweet', 'Minerality', 'Acidity', 'Tannins']`
  - **Soda & Tonics**:
    - Smell: `['Citrus', 'Herbal', 'Tropical', 'Apple']`
    - Taste: `['Citrus', 'Apple', 'Cherry', 'Peach']`
    - Aftertaste: `['Acidity', 'Saline', 'Minerality', 'Sweet']`
  - **Cocktail**:
    - Smell: `['Citrus', 'Herbal', 'Floral', 'Spicy']`
    - Taste: `['Citrus', 'Cinnamon', 'Cherry', 'Honey']`
    - Aftertaste: `['Acidity', 'Vanilla', 'Smoky', 'Oak']`
  - **Other**:
    - Smell: `['Apple', 'Honey', 'Earthy', 'Tropical']`
    - Taste: `['Apple', 'Honey', 'Peach', 'Grassy']`
    - Aftertaste: `['Acidity', 'Sweet', 'Saline', 'Minerality']`
- Add single-word translations to `sensory.presetTags` in `en.ts` and `de.ts`:
  - `Berry` -> `Beere`, `Cherry` -> `Kirsche`, `Oak` -> `Eiche`, `Earthy` -> `Erdig`, `Blackberry` -> `Brombeere`, `Apple` -> `Apfel`, `Peach` -> `Pfirsich`, `Tannins` -> `Tannine`, `Minerality` -> `Mineralik`, `Acidity` -> `Säure`, `Roast` -> `Röstung`, `Caramel` -> `Karamell`, `Hazelnut` -> `Haselnuss`, `Floral` -> `Blumig`, `Chocolate` -> `Schokolade`, `Espresso` -> `Espresso`, `Butterscotch` -> `Buttertoffee`, `Citrus` -> `Zitrus`, `Bitter` -> `Bitter`, `Warmth` -> `Wärme`, `Vanilla` -> `Vanille`, `Sweet` -> `Süß`, `Smoky` -> `Rauchig`, `Spicy` -> `Würzig`, `Cinnamon` -> `Zimt`, `Tobacco` -> `Tabak`, `Honey` -> `Honig`, `Pepper` -> `Pfeffer`, `Tropical` -> `Tropisch`, `Herbal` -> `Kräuter`, `Nutty` -> `Nussig`, `Grassy` -> `Grasig`, `Saline` -> `Salzig`, `Bergamot` -> `Bergamotte`.
- Update input placeholders to single-word examples (e.g., `Floral, Oak`, `Chocolate, Citrus`, `Tannins, Minerality`).

### File Structure
- `tasteney/src/components/sensory-selector.tsx`: Update `ARCHETYPE_SENSORY_PRESETS` and placeholder strings.
- `tasteney/src/i18n/locales/en.ts`: Add new tag translations and update placeholders.
- `tasteney/src/i18n/locales/de.ts`: Add new German tag translations and update placeholders.

# Testing

### Validation Approach
- Verify that every preset tag in `ARCHETYPE_SENSORY_PRESETS` consists of a single word without spaces, ampersands, or compound phrasing.
- Verify that each tag is present in both `en.ts` and `de.ts` localization files.
- Verify TypeScript compilation passes without errors.

### Key Scenarios
- **Preset rendering**: Switching between beverage archetypes displays the corresponding single-word chips for Smell, Taste, and Aftertaste.
- **Localization**: Switching between English and German correctly translates all single-word preset chips.
- **Chip selection and intensity**: Tapping a single-word preset chip adds the descriptor with intensity selection and removal capability.
- **Search and custom tags**: Typing in the search input suggests matching single-word presets or allows creating custom tags.
- **Backward compatibility**: Existing tasting entries with legacy multi-word tags continue to render their translated names correctly.

# Delivery Steps

### ✓ Step 1: Simplify archetype presets in SensorySelector
Single-word sensory descriptors are configured for all beverage archetypes and input placeholder examples are simplified.

- Update `ARCHETYPE_SENSORY_PRESETS` in `tasteney/src/components/sensory-selector.tsx` replacing compound multi-word tags (e.g., `Red Berries & Cherry`, `French Oak & Vanilla`, `Silky Velvet Tannins`) with concise single-word descriptors (e.g., `Berry`, `Oak`, `Tannins`) across all archetypes (`Wine`, `Coffee`, `Spirits`, `Beer`, `Tea`, `Soda & Tonics`, `Cocktail`, `Other`).
- Update fallback placeholder examples in `CATEGORIES` in `tasteney/src/components/sensory-selector.tsx` to reference single-word descriptors.

### ✓ Step 2: Update localization dictionaries with single-word tags and translations
English and German translation dictionaries support all single-word preset tags while preserving backwards compatibility.

- Add all new single-word sensory descriptors and their German translations to `sensory.presetTags` in `tasteney/src/i18n/locales/en.ts` and `tasteney/src/i18n/locales/de.ts`.
- Retain existing multi-word dictionary mappings in `sensory.presetTags` to maintain backward compatibility for existing user entries.
- Update placeholder strings under `sensory.categories.*.placeholder` in `en.ts` and `de.ts` to reflect the new single-word examples.