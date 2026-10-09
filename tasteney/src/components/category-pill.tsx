import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  useColorScheme,
} from 'react-native';
import { Colors, Spacing } from '@/constants/theme';

export interface CategoryPillProps {
  label: string;
  icon?: string;
  isSelected?: boolean;
  onPress: () => void;
  count?: number;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  activeOpacity?: number;
}

export function CategoryPill({
  label,
  icon,
  isSelected = false,
  onPress,
  count,
  style,
  labelStyle,
  activeOpacity = 0.7,
}: CategoryPillProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <TouchableOpacity
      activeOpacity={activeOpacity}
      onPress={onPress}
      style={[
        styles.pill,
        isSelected
          ? [styles.pillActive, { backgroundColor: colors.secondaryFixed }]
          : [
              styles.pillInactive,
              {
                backgroundColor: colors.surfaceContainerLow,
                borderColor: colors.outlineVariant,
              },
            ],
        style,
      ]}>
      {icon ? <Text style={styles.icon}>{icon}</Text> : null}
      <Text
        style={[
          styles.label,
          isSelected
            ? [styles.labelActive, { color: colors.onSecondaryFixed }]
            : [styles.labelInactive, { color: colors.textSecondary }],
          labelStyle,
        ]}>
        {label}
      </Text>
      {count !== undefined && count > 0 && (
        <View
          style={[
            styles.badge,
            isSelected
              ? { backgroundColor: colors.onSecondaryFixed }
              : { backgroundColor: colors.surfaceContainerHighest },
          ]}>
          <Text
            style={[
              styles.badgeText,
              isSelected ? { color: colors.secondaryFixed } : { color: colors.textSecondary },
            ]}>
            {count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one + 2,
    borderRadius: 20,
    gap: 6,
  },
  pillActive: {
    shadowColor: '#4d0011',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  pillInactive: {
    borderWidth: 1,
  },
  icon: {
    fontSize: 14,
  },
  label: {
    fontSize: 13,
  },
  labelActive: {
    fontWeight: '700',
  },
  labelInactive: {
    fontWeight: '500',
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
    minWidth: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
});
