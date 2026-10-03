import {DarkTheme, DefaultTheme, Stack, ThemeProvider} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import {Colors} from "@/constants/theme";

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();
    const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="new-entry" options={{ title: 'Log Drink', headerBackTitle: 'Back', headerTintColor: colors.primary }} />
            <Stack.Screen name="entry-detail" options={{ title: 'Log details' ,headerBackTitle: 'Back', headerTintColor: colors.primary }} />
        </Stack>
    </ThemeProvider>
  );
}
