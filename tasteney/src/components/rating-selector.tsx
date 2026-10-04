import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, useColorScheme } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors, Spacing } from '@/constants/theme';
import { translateScoreDescription } from '@/i18n';

export const SCORE_DESCRIPTIONS: Record<number, string> = {
  1: '1.0 — Flawed / Undrinkable',
  2: '2.0 — Unbalanced / Poor',
  3: '3.0 — Disappointing',
  4: '4.0 — Below Mediocre',
  5: '5.0 — Everyday / Standard',
  6: '6.0 — Pleasant Pour',
  7: '7.0 — Commendable Character',
  8: '8.0 — Highly Distinctive',
  9: '9.0 — Exceptional Expression',
  10: '10.0 — Transcendent Masterwork',
};

interface RatingSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

export function RatingSelector({ value, onChange }: RatingSelectorProps) {
  const scheme = useColorScheme();
  const { t } = useTranslation();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const descriptor = translateScoreDescription(value) || SCORE_DESCRIPTIONS[value] || `${value}.0`;

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceContainerLow }]}>
      <View style={styles.headerRow}>
        <View style={styles.labelCol}>
          <Text style={[styles.subLabel, { color: colors.textSecondary }]}>
            {t('rating.overallAppraisal')}
          </Text>
          <Text style={[styles.descriptorText, { color: colors.primary }]}>
            {descriptor}
          </Text>
        </View>

        <View style={[styles.scoreBadge, { backgroundColor: colors.surfaceContainerHighest }]}>
          <Text style={[styles.scoreBadgeNumber, { color: colors.primary }]}>{value}</Text>
          <Text style={[styles.scoreBadgeTotal, { color: colors.textSecondary }]}>/ 10</Text>
        </View>
      </View>

      {/* 1-10 Pill Selector */}
      <View style={styles.pillRow}>
        {Array.from({ length: 10 }, (_, i) => i + 1).map((score) => {
          const isSelected = score === value;
          return (
            <TouchableOpacity
              key={score}
              activeOpacity={0.7}
              onPress={() => onChange(score)}
              style={[
                styles.scorePill,
                isSelected
                  ? [styles.scorePillSelected, { backgroundColor: colors.primaryContainer }]
                  : [styles.scorePillDefault, { backgroundColor: colors.surfaceContainer }],
              ]}>
              <Text
                style={[
                  styles.scorePillText,
                  isSelected
                    ? [styles.scorePillTextSelected, { color: colors.onPrimary }]
                    : [styles.scorePillTextDefault, { color: colors.textSecondary }],
                ]}>
                {score}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Qualitative Micro-labels */}
      <View style={styles.microLabelsRow}>
        <Text style={[styles.microLabel, { color: colors.textSecondary }]}>{t('rating.subpar')}</Text>
        <Text style={[styles.microLabel, { color: colors.textSecondary }]}>{t('rating.benchmark')}</Text>
        <Text style={[styles.microLabel, { color: colors.textSecondary }]}>{t('rating.masterwork')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: Spacing.four,
    gap: Spacing.two,
    shadowColor: '#4d0011',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: Spacing.one,
  },
  labelCol: {
    flex: 1,
    gap: 2,
  },
  subLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  descriptorText: {
    fontSize: 16,
    fontStyle: 'italic',
    fontWeight: '600',
    marginTop: 2,
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    gap: 2,
  },
  scoreBadgeNumber: {
    fontSize: 18,
    fontWeight: '800',
  },
  scoreBadgeTotal: {
    fontSize: 12,
    fontWeight: '600',
  },
  pillRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
    marginTop: 4,
  },
  scorePill: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scorePillDefault: {},
  scorePillSelected: {
    shadowColor: '#4d0011',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    transform: [{ scale: 1.05 }],
  },
  scorePillText: {
    fontSize: 13,
    fontWeight: '700',
  },
  scorePillTextDefault: {},
  scorePillTextSelected: {
    fontWeight: '800',
  },
  microLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    marginTop: 2,
  },
  microLabel: {
    fontSize: 11,
    opacity: 0.6,
  },
});
