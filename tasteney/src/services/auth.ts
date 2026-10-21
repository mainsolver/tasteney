import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENDPOINTS } from './network';

const AUTH_STORAGE_KEY = '@tasteney/auth_session_v1';

export interface UserSession {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN' | string;
  createdAt?: string;
  updatedAt?: string;
}

export async function getStoredUser(): Promise<UserSession | null> {
  try {
    const json = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
    if (!json) return null;
    return JSON.parse(json) as UserSession;
  } catch (err) {
    console.error('Failed to get stored user session:', err);
    return null;
  }
}

export async function setStoredUser(user: UserSession | null): Promise<void> {
  try {
    if (user) {
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch (err) {
    console.error('Failed to update stored user session:', err);
  }
}

export async function registerUser(email: string, password: string): Promise<UserSession> {
  const response = await fetch(ENDPOINTS.register, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
  });

  if (!response.ok) {
    let errorMsg = 'Registration failed';
    try {
      const errorJson = await response.json();
      if (errorJson.message) errorMsg = errorJson.message;
    } catch {
      // fallback
    }
    throw new Error(errorMsg);
  }

  const user = (await response.json()) as UserSession;
  await setStoredUser(user);
  return user;
}

export async function loginUser(email: string, password: string): Promise<UserSession> {
  const response = await fetch(ENDPOINTS.login, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
  });

  if (!response.ok) {
    let errorMsg = 'Login failed';
    try {
      const errorJson = await response.json();
      if (errorJson.message) errorMsg = errorJson.message;
    } catch {
      // fallback
    }
    throw new Error(errorMsg);
  }

  const user = (await response.json()) as UserSession;
  await setStoredUser(user);
  return user;
}

export async function logoutUser(): Promise<void> {
  try {
    await fetch(ENDPOINTS.logout, {
      method: 'POST',
    });
  } catch {
    // Ignore network failure when logging out
  }
  await setStoredUser(null);
}
