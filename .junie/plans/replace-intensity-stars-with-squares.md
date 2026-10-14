---
sessionId: session-261014-145959-tqul
---

# Requirements

### Overview & Goals
The goal of this enhancement is to maximize visual clarity and cognitive efficiency when viewing drink entries in the entry-detail screen. Replacing the five-star unicode glyphs with a crisp, segmented square bar structure provides an immediate, intuitive visual gauge of sensory intensity (1–5) while improving layout predictability and visual balance across diverse screen sizes and platforms.

### Scope
- **In Scope:**
  - Replacing the star-based intensity rendering in `tasteney/src/app/entry-detail.tsx` within sensory descriptor chips.
  - Creating a square-based segmented bar component structure using native `View` elements.
  - Ensuring optimal contrast, spacing, and theme alignment across both light and dark color modes.
  - Preserving accessibility semantics for screen readers.
- **Out of Scope:**
  - Modifying the intensity selection controls on the new entry / edit entry screen (`sensory-selector.tsx`).
  - Altering the overall 1–10 drink rating bar or other score displays.
  - Changing the underlying data model (`DrinkEntry` / `SensoryDescriptor`).

### User Stories
- **As a drink enthusiast reviewing a tasting entry**, I want sensory impression intensities to appear as clear, segmented square bars so that I can quickly assess the flavor profile at a glance without visual ambiguity.
- **As a user in either light or dark mode**, I want high-contrast filled and empty square indicators so that intensity levels are effortlessly distinguishable in any lighting condition.

### Functional Requirements
- For each sensory descriptor with an `intensity` value (1–5), display a horizontal bar containing 5 distinct square blocks.
- Exactly `intensity` number of squares must be highlighted as active/filled.
- The remaining `5 - intensity` squares must be styled in a muted/inactive state.
- The segmented bar must maintain compact dimensions that fit harmoniously inside the existing sensory chip badge without expanding line height or wrapping awkwardly.

# Technical Design

### Current Implementation
In `tasteney/src/app/entry-detail.tsx` (lines 436–444), sensory descriptors are mapped inside `sensoryChipsWrapper`. If `desc.intensity` is present, it renders a text element repeating the unicode star character:

```tsx
{desc.intensity ? (
  <View style={[styles.intensityBadge, { backgroundColor: colors.surfaceContainerHighest }]}>
    <Text style={[styles.intensityText, { color: colors.primary }]}>
      {'★'.repeat(desc.intensity)}
      <Text style={{ opacity: 0.3 }}>{'★'.repeat(5 - desc.intensity)}</Text>
    </Text>
  </View>
) : null}
```

While functional, glyph-based rendering is susceptible to platform-dependent font baseline alignment differences, inconsistent glyph sizing between operating systems (iOS, Android, Web), and lower visual distinction compared to clean geometric UI bars.

### Key Decisions
1. **Geometric View Elements vs Unicode Glyphs**:
   - *Chosen Approach*: Render 5 discrete `<View>` square elements within a flexbox row container.
   - *Rationale*: Geometric UI components eliminate font glyph rendering variance across platforms, ensure pixel-perfect square aspect ratios, and provide precise control over gap, corner rounding, and fill states.
2. **Color & Contrast Token Utilization**:
   - *Chosen Approach*: Use `colors.primary` for filled intensity squares and `colors.surfaceContainerHigh` (or `colors.outlineVariant` / low opacity) for unfilled squares, housed within `colors.surfaceContainerHighest` or transparent badge background.
   - *Rationale*: Maximizes visual utility by aligning directly with the existing Material 3 theme palette in `constants/theme.ts` while maintaining accessibility contrast ratios in both light and dark modes.

### Proposed Changes
Update the sensory chip rendering block and stylesheet in `tasteney/src/app/entry-detail.tsx`:

1. **JSX Structure**:
   Replace the `<Text>` star element with a mapped array `[1, 2, 3, 4, 5]` inside a container `View`:
   ```tsx
   {desc.intensity ? (
     <View
       style={[styles.intensityBadge, { backgroundColor: colors.surfaceContainerHighest }]}
       accessible={true}
       accessibilityLabel={`${desc.intensity} of 5`}>
       <View style={styles.intensitySquareBar}>
         {[1, 2, 3, 4, 5].map((level) => {
           const isFilled = level <= desc.intensity;
           return (
             <View
               key={level}
               style={[
                 styles.intensitySquare,
                 {
                   backgroundColor: isFilled ? colors.primary : colors.surfaceContainerHigh,
                   opacity: isFilled ? 1 : 0.4,
                 },
               ]}
             />
           );
         })}
       </View>
     </View>
   ) : null}
   ```

2. **Style Additions**:
   ```tsx
   intensityBadge: {
     paddingHorizontal: 6,
     paddingVertical: 4,
     borderRadius: 6,
     justifyContent: 'center',
     alignItems: 'center',
   },
   intensitySquareBar: {
     flexDirection: 'row',
     alignItems: 'center',
     gap: 3,
   },
   intensitySquare: {
     width: 6,
     height: 6,
     borderRadius: 1.5,
   },
   ```

### File Structure
- `tasteney/src/app/entry-detail.tsx` (modified): Update intensity rendering and styles within sensory chips.

# Testing

### Validation Approach
Verify that the replacement optimizes visual precision and functionality without introducing layout shifts or theme regressions.

### Key Scenarios
- **Intensity Levels 1 through 5**:
  - Intensity 1: 1 filled square, 4 unfilled squares.
  - Intensity 3: 3 filled squares, 2 unfilled squares.
  - Intensity 5: 5 filled squares, 0 unfilled squares.
- **Light & Dark Theme Verification**:
  - Light mode: Filled squares render in primary burgundy (`#4d0011`) with clear contrast against surface backgrounds.
  - Dark mode: Filled squares render in primary rose (`#ffb3b6`) with high visibility.
- **Multiple Sensory Chips**:
  - Descriptors across Aroma, Taste, and Finish categories render neatly in wrapped chip containers without layout distortion.

### Edge Cases
- **Missing or Zero Intensity**: Chips with undefined or null intensity render only the descriptor label, with no empty badge rendered.
- **Narrow Viewport / Wrap**: Chips wrap gracefully on narrow screen widths without clipping square segments.

# Delivery Steps

### ✓ Step 1: Implement square segmented intensity indicator in entry-detail
The sensory chips in the entry-detail screen display a 5-segment square bar representing intensity.

- Replace the unicode star text (`★`) in `entry-detail.tsx` with a row of 5 square segments (`View` elements).
- Bind the filled/unfilled state of each square to `desc.intensity` (1 to 5).
- Add container styling (`intensitySquareBar`) and individual segment styling (`intensitySquare`) to `styles`.

### ✓ Step 2: Refine theme integration, contrast, and accessibility
The square intensity indicators adapt seamlessly to both light and dark color schemes with proper accessibility attributes.

- Configure filled squares with `colors.primary` and inactive squares with `colors.surfaceContainerHigh` or `colors.outlineVariant` with balanced contrast in both light and dark themes.
- Add accessible labeling to ensure screen readers announce the numeric intensity score (e.g., "3/5").
- Verify alignment, padding, and layout consistency within the sensory chips.