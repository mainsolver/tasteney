---
sessionId: session-261014-171348-1mu6
---

# Requirements

### Overview & Goals
Tailor sensory tag suggestions on the new-entry screen (`tasteney/src/app/new-entry.tsx` / `tasteney/src/components/sensory-selector.tsx`) to the selected beverage archetype (e.g. Wine, Coffee, Spirits, Beer, Tea, Soda & Tonics, Cocktail, Other). Suggested tags will include both archetype-specific defaults and tags previously logged by the user for that archetype. In each sensory section (Smell, Taste, Aftertaste), suggestions will be ranked with the most frequently used tags first and capped at a maximum of 4 tags.

### Scope
- **In Scope:**
  - Defining archetype-specific default sensory presets for each category (`Smell`, `Taste`, `Aftertaste`) across all 8 beverage archetypes (`Wine`, `Coffee`, `Spirits`, `Beer`, `Tea`, `Soda & Tonics`, `Cocktail`, `Other`).
  - Extracting and aggregating user-added sensory descriptor frequencies filtered by the active beverage archetype from historical entries.
  - Sorting tag recommendations descending by usage count, using default preset order as a deterministic tie-breaker.
  - Limiting tag suggestion chips to a maximum of 4 visible tags per sensory section.
  - Passing the active `archetype` and historical `entries` to `SensorySelector` so suggestions update dynamically whenever the selected archetype changes.
- **Out of Scope:**
  - Modifying entry data storage schema or `SensoryDescriptor` interfaces.
  - Changing descriptor intensity selector behaviors or review/detail views.

### User Stories
- **As a user logging a specific drink type (e.g. Tea or Wine)**, I want to see sensory preset tags that actually match that beverage archetype rather than a generic mixed list, so that logging my tasting notes is faster and more accurate.
- **As a frequent app user**, I want my custom tags and most-used descriptors for that drink archetype to be prioritized at the front of the suggestions list (up to 4 tags), so that my common flavor profiles are immediately one tap away.

### Functional Requirements
- **Archetype-Specific Presets:** Each beverage archetype must have a dedicated curated set of default sensory tags for `Smell`, `Taste`, and `Aftertaste` (e.g. Tea presents tags like *Honey & Blossom*, *Bergamot & Citrus*, *Fresh Grassy & Lemongrass*; Wine presents *Red Berries & Cherry*, *Silky Velvet Tannins*, *French Oak & Vanilla*).
- **User History Integration:** When the user has recorded sensory tags in previous entries for the selected archetype, those tags must be included in the candidate suggestions for that archetype and section.
- **Frequency-Based Ranking:** Suggestions must be sorted in descending order of usage frequency for the active archetype (`count(tag_A) >= count(tag_B)`).
- **Maximum 4 Tags per Section:** Each sensory category section must display at most 4 suggestion tags at any time.
- **Live Reactivity:** Switching the drink archetype on the new-entry page must immediately refresh the sensory suggestion chips to reflect the newly selected archetype and its usage rankings.

### Non-Functional Requirements
- **Performance:** Tag aggregation and ranking must be memoized in `SensorySelector` to prevent recomputations on keystrokes and maintain fluid 60fps scrolling.
- **Localization:** All default presets must integrate seamlessly with existing German/English translation mappings (`translateSensoryTag`).

# Technical Design

### Current Implementation
In `tasteney/src/components/sensory-selector.tsx`, a static global `CATEGORIES` array defines a single fixed list of `presetTags` shared across all drink types. `SensorySelector` does not receive the active `archetype` or `entries` history from `NewEntryScreen`, and suggestions currently display up to 6–8 items without archetype awareness or frequency ranking.

### Key Decisions
- **Archetype Preset Mapping:** Create a centralized configuration dictionary `ARCHETYPE_SENSORY_PRESETS: Record<BeverageArchetype, Record<SensoryCategory, string[]>>` providing tailored presets for all 8 archetypes.
- **Per-Archetype Frequency Aggregation:** Compute descriptor usage counts specifically for `entry.archetype === activeArchetype` and group by category (`Smell`, `Taste`, `Aftertaste` / `Finish`).
- **Unified Ranking & 4-Item Truncation:** Merge user-used tags and default presets, sort descending by frequency (preserving preset order for ties/0-counts), filter out already added tags and search non-matches, and `.slice(0, 4)`.
- **Props Extension:** Pass `archetype: BeverageArchetype` and `entries: DrinkEntry[]` to `SensorySelector` from `NewEntryScreen`.

### Proposed Changes
1. **Define Archetype Presets:**
   In `tasteney/src/components/sensory-selector.tsx`, define `ARCHETYPE_SENSORY_PRESETS` with tailored defaults for Wine, Coffee, Spirits, Beer, Tea, Soda & Tonics, Cocktail, and Other. Ensure missing preset keys exist in `de.ts` and `en.ts`.
2. **Implement Frequency Aggregation & Ranking:**
   Add a memoized calculation in `SensorySelector` that:
   - Scans `entries` where `entry.archetype === archetype` to tally descriptor frequencies per sensory category.
   - Combines user-used descriptors with default presets.
   - Sorts candidates descending by frequency, falls back to default preset index for ties.
3. **Enforce 4-Tag Limit in Suggestions:**
   Update the suggestion rendering logic to slice matching candidate tags to a maximum of 4 items.
4. **Wire Props in NewEntryScreen:**
   Update `<SensorySelector archetype={archetype} entries={entries} ... />` in `tasteney/src/app/new-entry.tsx`.

### Data Models / Contracts
```typescript
interface SensorySelectorProps {
  descriptors: SensoryDescriptor[];
  onChange: (descriptors: SensoryDescriptor[]) => void;
  archetype?: BeverageArchetype;
  entries?: DrinkEntry[];
  onInputActive?: (category: SensoryCategory) => void;
  onCategoryLayout?: (category: SensoryCategory, y: number) => void;
}

type ArchetypeSensoryPresets = Record<
  BeverageArchetype,
  Record<SensoryCategory, string[]>
>;
```

### Components
- **`SensorySelector` (`tasteney/src/components/sensory-selector.tsx`):**
  - Accepts `archetype` and `entries`.
  - Calculates archetype-specific tag frequency and limits rendered suggestions to max 4 tags.
- **`NewEntryScreen` (`tasteney/src/app/new-entry.tsx`):**
  - Passes current `archetype` state and loaded `entries` list to `SensorySelector`.

### File Structure
- `tasteney/src/components/sensory-selector.tsx` (Modified: add archetype-specific preset map, frequency aggregation, max 4 tags limit)
- `tasteney/src/app/new-entry.tsx` (Modified: pass `archetype` and `entries` props to `SensorySelector`)
- `tasteney/src/i18n/locales/en.ts` & `de.ts` (Modified: ensure all archetype preset tags have translations)

### Risks & Mitigations
- **Risk:** New custom tags with special capitalization/accents appearing multiple times.
  - **Mitigation:** Normalize tag names case-insensitively during frequency counting while preserving user's display casing.
- **Risk:** Zero historical entries resulting in empty suggestions.
  - **Mitigation:** Gracefully fall back to the archetype's top 4 default presets when no user tags exist.

# Testing

### Validation Approach
Verify that selecting different archetypes displays relevant preset tags, custom tags logged for an archetype appear in suggestions for that archetype, and each section never shows more than 4 tags.

### Key Scenarios
- **Archetype Switching:**
  - Select 'Wine' and verify Wine presets (e.g. *Red Berries & Cherry*, *Silky Velvet Tannins*).
  - Switch to 'Tea' and verify Tea presets (e.g. *Honey & Blossom*, *Fresh Grassy & Lemongrass*).
- **User-Added Custom & Used Tags:**
  - Create an entry for Coffee with custom tag 'Blueberry Acidity'.
  - Open new entry for Coffee and verify 'Blueberry Acidity' appears among the top 4 suggestions.
  - Open new entry for Wine and verify 'Blueberry Acidity' is NOT shown under Wine.
- **Frequency Reordering:**
  - Log 3 entries of Beer with tag 'Citrus & Lemon Zest' and 1 with 'Crisp Green Apple'.
  - Verify 'Citrus & Lemon Zest' is positioned before 'Crisp Green Apple'.
- **4-Tag Display Ceiling:**
  - Verify each of Smell, Taste, and Aftertaste renders at most 4 suggestion pills.

### Edge Cases
- Archetype with 0 historical entries (displays default top 4 presets).
- Search query filtering (matching filtered tags capped at 4).
- Case-insensitive duplicate avoidance when adding tags.

# Delivery Steps

### ✓ Step 1: Configure archetype-specific sensory presets and translation mappings
Define dedicated default sensory tag dictionaries for each beverage archetype in both English and German.

- Create `ARCHETYPE_SENSORY_PRESETS` in `tasteney/src/components/sensory-selector.tsx` mapping all 8 beverage archetypes (`Wine`, `Coffee`, `Spirits`, `Beer`, `Tea`, `Soda & Tonics`, `Cocktail`, `Other`) to specialized presets for `Smell`, `Taste`, and `Aftertaste`.
- Update `tasteney/src/i18n/locales/en.ts` and `tasteney/src/i18n/locales/de.ts` to ensure full bilingual dictionary support for all archetype-specific preset tags.

### ✓ Step 2: Implement frequency aggregation and tag ranking with 4-tag cap in SensorySelector
Compute per-archetype tag usage frequencies from historical entries and restrict suggestions to the top 4 tags per sensory section.

- Update `SensorySelectorProps` to receive `archetype: BeverageArchetype` and `entries?: DrinkEntry[]`.
- Implement memoized frequency aggregation that tallies user-logged descriptor counts filtered by the active beverage archetype.
- Merge user-logged tags with archetype default presets and rank descending by frequency count with stable tie-breaking.
- Cap visible suggestions to a maximum of 4 chips per category section in `SensorySelector`.
- Pass `archetype` and `entries` from `NewEntryScreen` (`tasteney/src/app/new-entry.tsx`) into `<SensorySelector />`.
- Validate that switching archetypes immediately reflects archetype-tailored suggestions with correct ranking and limits.