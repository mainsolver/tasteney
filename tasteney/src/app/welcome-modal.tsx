import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { Colors, Spacing, MaxContentWidth } from '@/constants/theme';
import { Card } from '@/components/card';
import { Button } from '@/components/button';
import { Badge } from '@/components/badge';
import { getUserPreferences, setUserPreferences } from '@/services/user-preferences';

export default function WelcomeModalScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const [allowAlcohol, setAllowAlcohol] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getUserPreferences().then((prefs) => {
      setAllowAlcohol(prefs.showAlcoholInfo);
    });
  }, []);

  const handleContinue = async () => {
    setIsSaving(true);
    try {
      await setUserPreferences({
        hasCompletedWelcome: true,
        showAlcoholInfo: allowAlcohol,
      });

      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Failed to save welcome preferences:', error);
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + (Platform.OS === 'web' ? Spacing.four : Spacing.three),
            paddingBottom: insets.bottom + Spacing.six,
          },
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Welcome Badge & Title */}
          <View style={styles.headerSection}>
            <Badge variant="secondary" label={t('welcome.badge')} style={styles.badge} />

            <Text style={[styles.title, { color: colors.text }]}>
              {t('welcome.title')}
            </Text>

            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {t('welcome.subtitle')}
            </Text>
          </View>

          {/* Features Highlights */}
          <Card variant="flat" style={styles.featuresCard}>
            <View style={styles.featureRow}>
              <Text style={styles.featureEmoji}>📖</Text>
              <View style={styles.featureTextWrapper}>
                <Text style={[styles.featureHeading, { color: colors.text }]}>
                  {t('welcome.featureLogTitle')}
                </Text>
                <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
                  {t('welcome.featureLogDesc')}
                </Text>
              </View>
            </View>
          </Card>

          {/* Alcohol & Legal Age Checkbox Question */}
          <Card variant="elevated" style={styles.preferenceCard}>
            <View style={styles.preferenceHeaderRow}>
              <Text style={[styles.preferenceHeader, { color: colors.primary }]}>
                {t('welcome.preferenceSectionTitle')}
              </Text>
            </View>
            <Text style={[styles.preferencePrompt, { color: colors.textSecondary }]}>
              {t('welcome.preferencePrompt')}
            </Text>
            <Badge
                variant={allowAlcohol ? 'primary' : 'secondary'}
                label={
                  allowAlcohol
                      ? t('profile.alcoholEnabledBadge')
                      : t('profile.alcoholDisabledBadge')
                }
            />

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setAllowAlcohol((prev) => !prev)}
              style={[
                styles.checkboxRow,
                {
                  borderColor: allowAlcohol ? colors.primary : colors.outlineVariant,
                  backgroundColor: allowAlcohol
                    ? scheme === 'dark'
                      ? 'rgba(182, 32, 60, 0.15)'
                      : 'rgba(182, 32, 60, 0.06)'
                    : colors.surfaceContainerLow,
                },
              ]}>
              <View
                style={[
                  styles.checkboxBox,
                  {
                    borderColor: allowAlcohol ? colors.primary : colors.outline,
                    backgroundColor: allowAlcohol ? colors.primary : 'transparent',
                  },
                ]}>
                {allowAlcohol ? <Text style={styles.checkmark}>✓</Text> : null}
              </View>

              <View style={styles.checkboxLabelContainer}>
                <Text style={[styles.checkboxLabel, { color: colors.text }]}>
                  {t('welcome.alcoholCheckboxLabel')}
                </Text>
                <Text style={[styles.checkboxSubtext, { color: colors.textSecondary }]}>
                  {t('welcome.alcoholCheckboxSubtext')}
                </Text>
              </View>
            </TouchableOpacity>

            <View style={styles.profileHintRow}>
              <Text style={styles.hintIcon}>ℹ️</Text>
              <Text style={[styles.profileHintText, { color: colors.outline }]}>
                {t('welcome.profileHint')}
              </Text>
            </View>
          </Card>

          {/* Action Button */}
          <View style={styles.actionContainer}>
            <Button
              variant="container"
              size="lg"
              title={t('welcome.continueButton')}
              loading={isSaving}
              onPress={handleContinue}
              fullWidth
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
  },
  container: {
    maxWidth: MaxContentWidth,
    width: '100%',
    gap: Spacing.four,
  },
  headerSection: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  badge: {
    marginBottom: Spacing.one,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    paddingHorizontal: Spacing.two,
  },
  featuresCard: {
    gap: Spacing.three,
    padding: Spacing.four,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  featureEmoji: {
    fontSize: 24,
  },
  featureTextWrapper: {
    flex: 1,
    gap: 2,
  },
  featureHeading: {
    fontSize: 14,
    fontWeight: '700',
  },
  featureDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  preferenceCard: {
    gap: Spacing.three,
    padding: Spacing.four,
  },
  preferenceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  preferenceHeader: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  preferencePrompt: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: -Spacing.one,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 16,
  },
  checkboxLabelContainer: {
    flex: 1,
    gap: 4,
  },
  checkboxLabel: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  checkboxSubtext: {
    fontSize: 12,
    lineHeight: 16,
  },
  profileHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.one,
  },
  hintIcon: {
    fontSize: 14,
  },
  profileHintText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
  actionContainer: {
    marginTop: Spacing.two,
    width: '100%',
  },
});
