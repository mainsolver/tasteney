import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { Colors, Spacing, MaxContentWidth, BottomTabInset } from '@/constants/theme';
import { Card } from '@/components/card';
import { Button } from '@/components/button';
import { Badge } from '@/components/badge';
import { getDrinkEntries } from '@/services/storage';
import { getUserPreferences } from '@/services/user-preferences';
import { DrinkEntry } from '@/types/drink';
import {
  pingConnection,
  getConnectionStatus,
  subscribeConnectionStatus,
  ConnectionStatus,
} from '@/services/network';
import {
  getStoredUser,
  registerUser,
  loginUser,
  logoutUser,
  UserSession,
} from '@/services/auth';

export default function ProfileScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  // Entries & Statistics State
  const [entries, setEntries] = useState<DrinkEntry[]>([]);

  // Preferences State
  const [showAlcoholInfo, setShowAlcoholInfo] = useState(false);

  // Connection State
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(getConnectionStatus());
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);

  // Auth & Form State
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccessMessage, setAuthSuccessMessage] = useState<string | null>(null);

  const checkBackendConnection = useCallback(async () => {
    setIsCheckingConnection(true);
    try {
      await pingConnection();
    } catch {
      // Handled inside pingConnection
    } finally {
      setIsCheckingConnection(false);
    }
  }, []);

  // Load entries for statistics
  const loadData = useCallback(async () => {
    try {
      const data = await getDrinkEntries();
      setEntries(data);
      const user = await getStoredUser();
      setCurrentUser(user);
      const prefs = await getUserPreferences();
      setShowAlcoholInfo(prefs.showAlcoholInfo);
    } catch (err) {
      console.error('Failed to load profile data:', err);
    }
  }, []);

  // Re-load statistics and check connectivity on screen focus
  useFocusEffect(
    useCallback(() => {
      loadData();
      checkBackendConnection();
    }, [loadData, checkBackendConnection])
  );

  // Subscribe to connection changes
  useEffect(() => {
    const unsubscribe = subscribeConnectionStatus((status) => {
      setConnectionStatus(status);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // Compute Statistics
  const statistics = useMemo(() => {
    const totalDrinks = entries.length;

    const uniqueProducers = new Set(
      entries
        .map((e) => e.manufacturer?.trim())
        .filter((m): m is string => Boolean(m && m.length > 0))
        .map((m) => m.toLowerCase())
    ).size;

    const uniqueCities = new Set(
      entries
        .map((e) => e.city?.trim())
        .filter((c): c is string => Boolean(c && c.length > 0))
        .map((c) => c.toLowerCase())
    ).size;

    const uniqueCountries = new Set(
      entries
        .map((e) => e.country?.trim())
        .filter((c): c is string => Boolean(c && c.length > 0))
        .map((c) => c.toLowerCase())
    ).size;

    return {
      totalDrinks,
      uniqueProducers,
      uniqueCities,
      uniqueCountries,
    };
  }, [entries]);

  // Auth Form Handlers
  const handleAuthSubmit = async () => {
    setAuthError(null);
    setAuthSuccessMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setAuthError(t('profile.errors.emailRequired'));
      return;
    }

    if (!password || password.length < 6) {
      setAuthError(t('profile.errors.passwordRequired'));
      return;
    }

    setIsAuthSubmitting(true);
    try {
      if (authMode === 'register') {
        const user = await registerUser(trimmedEmail, password);
        setCurrentUser(user);
        setEmail('');
        setPassword('');
        setAuthSuccessMessage(t('profile.register.successMessage'));
      } else {
        const user = await loginUser(trimmedEmail, password);
        setCurrentUser(user);
        setEmail('');
        setPassword('');
        setAuthSuccessMessage(t('profile.login.successMessage'));
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '';
      if (authMode === 'register') {
        setAuthError(
          errorMessage.includes('already exists') || errorMessage.includes('400')
            ? t('profile.errors.registerFailed')
            : errorMessage || t('profile.errors.registerFailed')
        );
      } else {
        setAuthError(
          errorMessage.includes('Invalid') || errorMessage.includes('401')
            ? t('profile.errors.loginFailed')
            : errorMessage || t('profile.errors.loginFailed')
        );
      }
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setCurrentUser(null);
      setAuthSuccessMessage(null);
      setAuthError(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const isOnline = connectionStatus.isOnline === true;
  const isOffline = connectionStatus.isOnline === false;

  const formattedLastChecked = useMemo(() => {
    if (!connectionStatus.lastCheckedAt) return null;
    const d = connectionStatus.lastCheckedAt;
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }, [connectionStatus.lastCheckedAt]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.screenContainer, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + (Platform.OS === 'web' ? Spacing.four : Spacing.two),
            backgroundColor: colors.surfaceContainerLowest,
            borderBottomColor: colors.surfaceContainerHigh,
          },
        ]}>
        <View style={styles.headerContent}>
          <Text style={[styles.headerSubtitle, { color: colors.secondary }]}>
            {t('profile.headerSub')}
          </Text>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {t('profile.headerTitle')}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: insets.bottom + BottomTabInset + Spacing.six,
          },
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.innerContainer}>
          {/* SECTION 1: STATISTICS OVERVIEW */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {t('profile.statsTitle')}
              </Text>
            </View>

            <View style={styles.statsGrid}>
              {/* Stat 1: Drinks Logged */}
              <Card variant="elevated" style={styles.statCard}>
                <View style={styles.statCardHeader}>
                  <Text style={styles.statCardEmoji}>🍷</Text>
                  <Text style={[styles.statCardNumber, { color: colors.primary }]}>
                    {statistics.totalDrinks}
                  </Text>
                </View>
                <Text style={[styles.statCardLabel, { color: colors.text }]}>
                  {t('profile.stats.drinksLogged')}
                </Text>
                <Text style={[styles.statCardSubLabel, { color: colors.textSecondary }]}>
                  {t('profile.stats.drinksLoggedSubtitle')}
                </Text>
              </Card>

              {/* Stat 2: Producers */}
              <Card variant="elevated" style={styles.statCard}>
                <View style={styles.statCardHeader}>
                  <Text style={styles.statCardEmoji}>🏰</Text>
                  <Text style={[styles.statCardNumber, { color: colors.primary }]}>
                    {statistics.uniqueProducers}
                  </Text>
                </View>
                <Text style={[styles.statCardLabel, { color: colors.text }]}>
                  {t('profile.stats.producers')}
                </Text>
                <Text style={[styles.statCardSubLabel, { color: colors.textSecondary }]}>
                  {t('profile.stats.producersSubtitle')}
                </Text>
              </Card>

              {/* Stat 3: Cities */}
              <Card variant="elevated" style={styles.statCard}>
                <View style={styles.statCardHeader}>
                  <Text style={styles.statCardEmoji}>🏙️</Text>
                  <Text style={[styles.statCardNumber, { color: colors.primary }]}>
                    {statistics.uniqueCities}
                  </Text>
                </View>
                <Text style={[styles.statCardLabel, { color: colors.text }]}>
                  {t('profile.stats.cities')}
                </Text>
                <Text style={[styles.statCardSubLabel, { color: colors.textSecondary }]}>
                  {t('profile.stats.citiesSubtitle')}
                </Text>
              </Card>

              {/* Stat 4: Countries */}
              <Card variant="elevated" style={styles.statCard}>
                <View style={styles.statCardHeader}>
                  <Text style={styles.statCardEmoji}>🌍</Text>
                  <Text style={[styles.statCardNumber, { color: colors.primary }]}>
                    {statistics.uniqueCountries}
                  </Text>
                </View>
                <Text style={[styles.statCardLabel, { color: colors.text }]}>
                  {t('profile.stats.countries')}
                </Text>
                <Text style={[styles.statCardSubLabel, { color: colors.textSecondary }]}>
                  {t('profile.stats.countriesSubtitle')}
                </Text>
              </Card>
            </View>
          </View>

          {/* SECTION 2: CONTENT & ALCOHOL PREFERENCES */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {t('profile.preferencesTitle')}
              </Text>
              <Badge
                variant={showAlcoholInfo ? 'primary' : 'secondary'}
                label={
                  showAlcoholInfo
                    ? t('profile.alcoholEnabledBadge')
                    : t('profile.alcoholDisabledBadge')
                }
              />
            </View>

            <Card variant="elevated" style={styles.preferenceCard}>
              <View style={styles.preferenceInfoBox}>
                <Text style={[styles.preferenceTitle, { color: colors.text }]}>
                  {t('profile.alcoholSettingTitle')}
                </Text>
                <Text style={[styles.preferenceSubtitle, { color: colors.textSecondary }]}>
                  {showAlcoholInfo
                    ? t('profile.alcoholSettingActiveDesc')
                    : t('profile.alcoholSettingInactiveDesc')}
                </Text>
              </View>

              <Button
                variant="outline"
                size="md"
                title={t('profile.changeAlcoholPreferenceButton')}
                onPress={() => router.push('/welcome-modal')}
                style={styles.changePreferenceButton}
              />
            </Card>
          </View>

          {/* SECTION 3: BACKEND CONNECTION STATUS */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {t('profile.connectionTitle')}
              </Text>
            </View>

            <Card
              variant="elevated"
              style={[
                styles.connectionCard,
                {
                  borderColor: isOnline
                    ? colors.secondaryFixed
                    : isOffline
                    ? colors.dangerContainer
                    : colors.outlineVariant,
                },
              ]}>
              <View style={styles.connectionCardHeader}>
                <View style={styles.connectionServerInfo}>
                  <Text style={[styles.connectionServerTitle, { color: colors.text }]}>
                    api.tasteney.com
                  </Text>
                  {formattedLastChecked && (
                    <Text style={[styles.connectionLastChecked, { color: colors.textSecondary }]}>
                      {t('profile.lastChecked', { time: formattedLastChecked })}
                    </Text>
                  )}
                </View>

                {isCheckingConnection ? (
                  <View style={styles.checkingBadge}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={[styles.checkingText, { color: colors.textSecondary }]}>
                      {t('profile.checking')}
                    </Text>
                  </View>
                ) : isOnline ? (
                  <View
                    style={[
                      styles.statusPill,
                      { backgroundColor: '#e6f4ea', borderColor: '#34a853' },
                    ]}>
                    <View style={[styles.statusDot, { backgroundColor: '#34a853' }]} />
                    <Text style={[styles.statusPillText, { color: '#137333' }]}>
                      {t('profile.online')}
                    </Text>
                  </View>
                ) : (
                  <View
                    style={[
                      styles.statusPill,
                      { backgroundColor: '#fce8e6', borderColor: '#d93025' },
                    ]}>
                    <View style={[styles.statusDot, { backgroundColor: '#d93025' }]} />
                    <Text style={[styles.statusPillText, { color: '#c5221f' }]}>
                      {t('profile.offline')}
                    </Text>
                  </View>
                )}
              </View>

              {isOffline && (
                <View style={styles.offlineActionRow}>
                  <Text style={[styles.offlineHintText, { color: colors.textSecondary }]}>
                    {t('profile.connectionOfflineHint')}
                  </Text>
                  <Button
                    variant="container"
                    size="md"
                    title={t('profile.retryConnection')}
                    icon="🔄"
                    loading={isCheckingConnection}
                    onPress={checkBackendConnection}
                  />
                </View>
              )}
            </Card>
          </View>

          {/* SECTION 3: ACCOUNT & CLOUD BACKUP / REGISTRATION & LOGIN */}
          {isOnline ? (
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  {t('profile.accountTitle')}
                </Text>
              </View>

              {/* Recommendation Callout */}
              <View
                style={[
                  styles.recommendationBanner,
                  {
                    backgroundColor: colors.surfaceContainerLowest,
                    borderColor: colors.secondaryFixed,
                  },
                ]}>
                <View style={styles.recommendationTopRow}>
                  <Badge variant="secondary" label={`✨ ${t('profile.recommendationBadge')}`} />
                </View>
                <Text style={[styles.recommendationTitle, { color: colors.primary }]}>
                  {t('profile.recommendationTitle')}
                </Text>
                <Text style={[styles.recommendationDesc, { color: colors.textSecondary }]}>
                  {t('profile.recommendationDescription')}
                </Text>
              </View>

              {/* If Logged In: Show Account Details */}
              {currentUser ? (
                <Card variant="elevated" style={styles.loggedInCard}>
                  <View style={styles.loggedInHeader}>
                    <View style={[styles.avatarCircle, { backgroundColor: colors.secondaryFixed }]}>
                      <Text style={[styles.avatarText, { color: colors.onSecondaryFixed }]}>
                        {currentUser.email.slice(0, 1).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.loggedInInfo}>
                      <Text style={[styles.loggedInEmail, { color: colors.text }]}>
                        {currentUser.email}
                      </Text>
                      <Badge
                        variant="primary"
                        label={`🛡️ ${currentUser.role || 'USER'}`}
                        style={styles.roleBadge}
                      />
                    </View>
                  </View>

                  <View
                    style={[
                      styles.backupStatusBox,
                      { backgroundColor: colors.surfaceContainerLow },
                    ]}>
                    <Text style={[styles.backupStatusTitle, { color: colors.text }]}>
                      ☁️ {t('profile.loggedIn.backupStatus')}
                    </Text>
                    <Text style={[styles.backupStatusDesc, { color: colors.textSecondary }]}>
                      {t('profile.loggedIn.backupDescription')}
                    </Text>
                  </View>

                  <Button
                    variant="outline"
                    size="md"
                    title={t('profile.loggedIn.logoutButton')}
                    onPress={handleLogout}
                    style={styles.logoutButton}
                  />
                </Card>
              ) : (
                /* Registration / Login Form */
                <Card variant="elevated" style={styles.formCard}>
                  <View style={styles.formHeader}>
                    <Text style={[styles.formTitle, { color: colors.text }]}>
                      {authMode === 'register'
                        ? t('profile.register.title')
                        : t('profile.login.title')}
                    </Text>
                    <Text style={[styles.formSubtitle, { color: colors.textSecondary }]}>
                      {authMode === 'register'
                        ? t('profile.register.subtitle')
                        : t('profile.login.subtitle')}
                    </Text>
                  </View>

                  {/* Feedback Messages */}
                  {authError && (
                    <View
                      style={[
                        styles.feedbackBox,
                        { backgroundColor: '#fce8e6', borderColor: '#d93025' },
                      ]}>
                      <Text style={[styles.feedbackText, { color: '#c5221f' }]}>{authError}</Text>
                    </View>
                  )}

                  {authSuccessMessage && (
                    <View
                      style={[
                        styles.feedbackBox,
                        { backgroundColor: '#e6f4ea', borderColor: '#34a853' },
                      ]}>
                      <Text style={[styles.feedbackText, { color: '#137333' }]}>
                        {authSuccessMessage}
                      </Text>
                    </View>
                  )}

                  {/* Form Inputs */}
                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: colors.text }]}>
                      {authMode === 'register'
                        ? t('profile.register.emailLabel')
                        : t('profile.login.emailLabel')}
                    </Text>
                    <TextInput
                      style={[
                        styles.textInput,
                        {
                          backgroundColor: colors.surfaceContainerLow,
                          borderColor: colors.outlineVariant,
                          color: colors.text,
                        },
                      ]}
                      placeholder={
                        authMode === 'register'
                          ? t('profile.register.emailPlaceholder')
                          : t('profile.login.emailPlaceholder')
                      }
                      placeholderTextColor={colors.outline}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      value={email}
                      onChangeText={(val) => {
                        setEmail(val);
                        setAuthError(null);
                      }}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: colors.text }]}>
                      {authMode === 'register'
                        ? t('profile.register.passwordLabel')
                        : t('profile.login.passwordLabel')}
                    </Text>
                    <TextInput
                      style={[
                        styles.textInput,
                        {
                          backgroundColor: colors.surfaceContainerLow,
                          borderColor: colors.outlineVariant,
                          color: colors.text,
                        },
                      ]}
                      placeholder={
                        authMode === 'register'
                          ? t('profile.register.passwordPlaceholder')
                          : t('profile.login.passwordPlaceholder')
                      }
                      placeholderTextColor={colors.outline}
                      secureTextEntry
                      autoCapitalize="none"
                      autoCorrect={false}
                      value={password}
                      onChangeText={(val) => {
                        setPassword(val);
                        setAuthError(null);
                      }}
                    />
                  </View>

                  {/* Submit Button */}
                  <Button
                    variant="container"
                    size="lg"
                    title={
                      authMode === 'register'
                        ? t('profile.register.submitButton')
                        : t('profile.login.submitButton')
                    }
                    loading={isAuthSubmitting}
                    onPress={handleAuthSubmit}
                    fullWidth
                    style={styles.submitButton}
                  />

                  {/* Switch between Register and Login */}
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => {
                      setAuthMode((prev) => (prev === 'register' ? 'login' : 'register'));
                      setAuthError(null);
                      setAuthSuccessMessage(null);
                    }}
                    style={styles.switchLinkWrapper}>
                    <Text style={[styles.switchLinkText, { color: colors.secondary }]}>
                      {authMode === 'register'
                        ? t('profile.register.switchLink')
                        : t('profile.login.switchLink')}
                    </Text>
                  </TouchableOpacity>
                </Card>
              )}
            </View>
          ) : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
    borderBottomWidth: 1,
  },
  headerContent: {
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
  },
  innerContainer: {
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
    gap: Spacing.five,
  },
  section: {
    gap: Spacing.three,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  statCard: {
    flexBasis: '47%',
    flexGrow: 1,
    padding: Spacing.four,
    borderRadius: 20,
    gap: Spacing.one,
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.half,
  },
  statCardEmoji: {
    fontSize: 22,
  },
  statCardNumber: {
    fontSize: 28,
    fontWeight: '800',
  },
  statCardLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  statCardSubLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  connectionCard: {
    borderRadius: 20,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  connectionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  connectionServerInfo: {
    gap: 2,
  },
  connectionServerTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  connectionLastChecked: {
    fontSize: 12,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  checkingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  checkingText: {
    fontSize: 12,
    fontWeight: '500',
  },
  offlineActionRow: {
    gap: Spacing.three,
    marginTop: Spacing.one,
  },
  offlineHintText: {
    fontSize: 13,
    lineHeight: 18,
  },
  recommendationBanner: {
    borderRadius: 20,
    borderWidth: 1.5,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  recommendationTopRow: {
    flexDirection: 'row',
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  recommendationDesc: {
    fontSize: 13,
    lineHeight: 19,
  },
  formCard: {
    borderRadius: 20,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  formHeader: {
    gap: 4,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  formSubtitle: {
    fontSize: 13,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  textInput: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: 12,
    fontSize: 15,
  },
  submitButton: {
    marginTop: Spacing.two,
  },
  switchLinkWrapper: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
  },
  switchLinkText: {
    fontSize: 13,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  feedbackBox: {
    padding: Spacing.three,
    borderRadius: 12,
    borderWidth: 1,
  },
  feedbackText: {
    fontSize: 13,
    fontWeight: '600',
  },
  loggedInCard: {
    borderRadius: 20,
    padding: Spacing.four,
    gap: Spacing.four,
  },
  loggedInHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800',
  },
  loggedInInfo: {
    flex: 1,
    gap: 4,
  },
  loggedInEmail: {
    fontSize: 16,
    fontWeight: '700',
  },
  roleBadge: {
    alignSelf: 'flex-start',
  },
  backupStatusBox: {
    padding: Spacing.three,
    borderRadius: 14,
    gap: 4,
  },
  backupStatusTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  backupStatusDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
  logoutButton: {
    alignSelf: 'flex-start',
  },
  preferenceCard: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  preferenceInfoBox: {
    gap: Spacing.one,
  },
  preferenceTitle: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  preferenceSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  changePreferenceButton: {
    alignSelf: 'flex-start',
  },
});
