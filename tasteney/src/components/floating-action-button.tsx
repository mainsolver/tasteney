import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
  useColorScheme,
  GestureResponderEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { Colors, Spacing } from '@/constants/theme';

export interface FloatingActionButtonProps {
  onPress?: (event: GestureResponderEvent) => void;
}

export function FloatingActionButton({ onPress }: FloatingActionButtonProps) {
  const router = useRouter();
  const scheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const handlePress = (event: GestureResponderEvent) => {
    if (onPress) {
      onPress(event);
    } else {
      router.push('/new-entry');
    }
  };

  const bottomOffset = Platform.select({
    ios: insets.bottom + 62,
    android: insets.bottom + 70,
    web: Spacing.five,
    default: insets.bottom + 64,
  });

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={t('diary.addDrink')}
      style={[
        styles.fabContainer,
        {
          bottom: bottomOffset,
          backgroundColor: colors.primaryContainer,
          shadowColor: '#4d0011',
        },
      ]}>
      <Text style={[styles.fabText, { color: colors.onPrimary }]}>
        {t('diary.addDrink')}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    right: Spacing.four,
    zIndex: 999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
