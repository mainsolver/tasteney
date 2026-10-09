import React, { ReactNode } from 'react';
import {
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
  useColorScheme,
} from 'react-native';
import { Colors, Spacing } from '@/constants/theme';

export interface CardProps {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'elevated' | 'outlined' | 'flat';
}

export function Card({ children, style, variant = 'elevated' }: CardProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'outlined':
        return {
          backgroundColor: colors.surfaceContainerLowest,
          borderColor: colors.outlineVariant,
          borderWidth: 1,
        };
      case 'flat':
        return {
          backgroundColor: colors.surfaceContainerLow,
        };
      case 'elevated':
      default:
        return {
          backgroundColor: colors.surfaceContainerLowest,
          borderColor: colors.outlineVariant,
          borderWidth: 1,
          shadowColor: '#4d0011',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
          elevation: 2,
        };
    }
  };

  return (
    <View style={[styles.card, getVariantStyles(), style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: Spacing.four,
    overflow: 'hidden',
  },
});
