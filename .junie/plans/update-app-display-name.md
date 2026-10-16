---
sessionId: session-261014-191400-1ss8
---

# Requirements

### Overview & Goals
The app name is currently displayed with a lowercase "t" (`tasteney`) on iOS home screens. The goal is to update the app's display name to `Tasteney` with a capital "T" across the Expo project configuration.

### Scope
- **In Scope**:
  - Updating the app's name in `tasteney/app.json` (`expo.name`).
- **Out of Scope**:
  - Changing the Expo project slug (`expo.slug: "tasteney"`), scheme (`expo.scheme: "tasteney"`), or bundle identifier (`expo.ios.bundleIdentifier: "com.tasteney.app"`), as internal identifiers are typically kept lowercase.

### User Stories
- As an iPhone user, I want the app icon on my home screen to show "Tasteney" so that the branding is correctly capitalized.

### Functional Requirements
- The app display name on iOS and Android must show as `Tasteney`.

# Technical Design

### Current Implementation
In Expo managed workflow projects (like this one using Expo SDK 52 / React Native 0.76+), native app properties such as `CFBundleDisplayName` (iOS) and `android:label` (Android) are derived directly from `tasteney/app.json`.

Currently, `tasteney/app.json` contains:
```json
{
  "expo": {
    "name": "tasteney",
    "slug": "tasteney",
    ...
  }
}
```

### Key Decisions
- **Update `expo.name`**: Change `"name": "tasteney"` to `"name": "Tasteney"`. This directly controls the visible title and home screen app name on iOS.
- **Retain `expo.slug`**: Keep `"slug": "tasteney"` unchanged so EAS project configuration and Expo project URLs remain unaffected.

### Proposed Changes
1. Edit `tasteney/app.json`:
   - Change `"name": "tasteney"` to `"name": "Tasteney"`.

### File Structure
- **Modified**: `tasteney/app.json`

# Testing

### Validation Approach
- Verify `tasteney/app.json` is valid JSON.
- Run project linter / config check to ensure configuration schema conformance.

### Key Scenarios
- **Expo Config Validation**: Ensure `npx expo config --type public` or equivalent shows `"name": "Tasteney"`.
- **Display Name Verification**: On next build/install via Expo Go or EAS/development client, verify the app label on the iOS device displays as "Tasteney".

# Delivery Steps

### ✓ Step 1: Update app display name in Expo configuration
The app's top-level display name in `tasteney/app.json` is changed from lowercase `"tasteney"` to `"Tasteney"`.

- Open `tasteney/app.json`.
- Update the `"name"` property under `"expo"` from `"tasteney"` to `"Tasteney"`.
- Keep `"slug": "tasteney"` and `"scheme": "tasteney"` intact to preserve internal routing and EAS project identifiers.

### ✓ Step 2: Validate Expo configuration and project integrity
The configuration is validated to ensure JSON syntax is valid and Expo tooling recognizes the updated display name.

- Validate `tasteney/app.json` syntax and structure.
- Run `npm run lint` or Expo config check in `tasteney` directory to ensure no configuration errors exist.
- Verify that on subsequent development builds / prebuilds, iOS `CFBundleDisplayName` resolves to `"Tasteney"`.