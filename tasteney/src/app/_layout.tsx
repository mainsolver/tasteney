import { useEffect, useRef } from 'react';
import { Platform, useColorScheme } from 'react-native';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider, usePathname, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useTranslation } from 'react-i18next';
import '@/i18n';

import { Colors } from '@/constants/theme';
import { useConnectionPolling } from '@/hooks/use-connection-polling';
import { getUserPreferences } from '@/services/user-preferences';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useConnectionPolling();

  const router = useRouter();
  const pathname = usePathname();
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const hasCheckedWelcome = useRef(false);

  useEffect(() => {
    SplashScreen.hideAsync().catch(console.warn);
  }, []);

  useEffect(() => {
    if (hasCheckedWelcome.current) return;
    hasCheckedWelcome.current = true;

    getUserPreferences().then((prefs) => {
      if (!prefs.hasCompletedWelcome) {
        setTimeout(() => {
          router.push('/welcome-modal');
        }, 100);
      }
    }).catch((err) => {
      console.error('Error checking welcome status:', err);
    });
  }, [router]);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.scrollTo(0, 0);
      document.documentElement?.scrollTo?.(0, 0);
      document.body?.scrollTo?.(0, 0);
    }
  }, [pathname]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="welcome-modal"
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />
        <Stack.Screen name="new-entry" options={{ title: t('nav.logDrink'), headerBackTitle: t('nav.cancel'), headerTintColor: colors.primary }} />
        <Stack.Screen name="entry-detail" options={{ title: t('nav.logDetails'), headerBackTitle: t('nav.back'), headerTintColor: colors.primary }} />
      </Stack>
    </ThemeProvider>
  );
}
