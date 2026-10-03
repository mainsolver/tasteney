/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#1c1c19',
    background: '#fcf9f4',
    backgroundElement: '#f6f3ee',
    backgroundSelected: '#ebe8e3',
    textSecondary: '#554243',
    primary: '#4d0011',
    primaryContainer: '#6b1724',
    onPrimary: '#ffffff',
    secondary: '#7b5902',
    secondaryFixed: '#ffdea4',
    onSecondaryFixed: '#261900',
    surfaceContainerLowest: '#ffffff',
    surfaceContainerLow: '#f6f3ee',
    surfaceContainer: '#f0ede9',
    surfaceContainerHigh: '#ebe8e3',
    surfaceContainerHighest: '#e5e2dd',
    outline: '#887272',
    outlineVariant: '#dbc0c0',
  },
  dark: {
    text: '#f3f0eb',
    background: '#1c1c19',
    backgroundElement: '#2d2b28',
    backgroundSelected: '#3c3935',
    textSecondary: '#dbc0c0',
    primary: '#ffb3b6',
    primaryContainer: '#6b1724',
    onPrimary: '#ffffff',
    secondary: '#ffdea4',
    secondaryFixed: '#fdce73',
    onSecondaryFixed: '#261900',
    surfaceContainerLowest: '#161513',
    surfaceContainerLow: '#22201d',
    surfaceContainer: '#2d2b28',
    surfaceContainerHigh: '#35332f',
    surfaceContainerHighest: '#423f3a',
    outline: '#9f8888',
    outlineVariant: '#554243',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
