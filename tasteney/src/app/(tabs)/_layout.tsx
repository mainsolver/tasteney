import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSegments, usePathname } from 'expo-router';

import AppTabs from '@/components/app-tabs';
import { FloatingActionButton } from '@/components/floating-action-button';

export default function TabLayout() {
  const segments = useSegments();
  const pathname = usePathname();

  const isProfileTab =
    (segments as readonly string[]).includes('profile') ||
    pathname === '/profile' ||
    pathname.startsWith('/profile');

  return (
    <View style={styles.container}>
      <AppTabs />
      {!isProfileTab && <FloatingActionButton />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});