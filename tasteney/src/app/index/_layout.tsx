import { Stack } from 'expo-router/stack';

export default function IndexLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="new-entry" />
    </Stack>
  );
}
