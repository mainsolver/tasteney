import React, { ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  useColorScheme,
} from 'react-native';
import { Colors } from '@/constants/theme';

export type BadgeVariant = 'default' | 'primary' | 'secondary' | 'outline' | 'surface';

export interface BadgeProps {
  label?: string | number;
  icon?: ReactNode | string;
  variant?: BadgeVariant;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  children?: ReactNode;
}

export function Badge({
  label,
  icon,
  variant = 'default',
  style,
  textStyle,
  children,
}: BadgeProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case 'primary':
        return {
          container: { backgroundColor: colors.primaryContainer },
          text: { color: colors.onPrimary },
        };
      case 'secondary':
        return {
          container: { backgroundColor: colors.secondaryFixed },
          text: { color: colors.onSecondaryFixed },
        };
      case 'outline':
        return {
          container: {
            backgroundColor: 'transparent',
            borderColor: colors.outlineVariant,
            borderWidth: 1,
          },
          text: { color: colors.textSecondary },
        };
      case 'surface':
        return {
          container: { backgroundColor: colors.surfaceContainerHighest },
          text: { color: colors.textSecondary },
        };
      case 'default':
      default:
        return {
          container: { backgroundColor: colors.surfaceContainerLow },
          text: { color: colors.textSecondary },
        };
    }
  };

  const vStyle = getVariantStyles();

  return (
    <View style={[styles.badge, vStyle.container, style]}>
      {typeof icon === 'string' ? (
        <Text style={styles.iconText}>{icon}</Text>
      ) : (
        icon
      )}
      {children ? (
        children
      ) : label !== undefined ? (
        <Text style={[styles.badgeText, vStyle.text, textStyle]}>{label}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
  },
  iconText: {
    fontSize: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
