import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import React, { useState, createContext, useContext } from 'react';

import { useColorScheme } from '@/hooks/useColorScheme';
import { BackendUrlProvider } from '@/components/BackendUrlContext';
import LoginScreen from './login';
import App from './(tabs)/index';

// Create a context for authentication
export const AuthContext = createContext<{ logout: () => void; user: { username: string; password: string; empid?: number } | null; setUser: (user: { username: string; password: string; empid?: number } | null) => void }>({ logout: () => {}, user: null, setUser: () => {} });

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ username: string; password: string; empid?: number } | null>(null);

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  // If not authenticated, show login screen
  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={(user) => { setUser(user); setIsAuthenticated(true); }} />;
  }

  return (
    <AuthContext.Provider value={{ logout: () => { setIsAuthenticated(false); setUser(null); }, user, setUser }}>
    <BackendUrlProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </BackendUrlProvider>
    </AuthContext.Provider>
  );
}
