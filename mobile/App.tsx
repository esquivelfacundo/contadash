import React, { useEffect, useState } from 'react';
import { StatusBar, View, ActivityIndicator } from 'react-native';
import { Provider as PaperProvider, MD3DarkTheme } from 'react-native-paper';
import { useFonts } from 'expo-font';
import { AppNavigator } from './src/navigation/AppNavigator';
import { colors } from './src/theme/colors';
import { useAuthStore } from './src/store/authStore';
import { TransactionModalProvider } from './src/context/TransactionModalContext';
import { GlobalTransactionModals } from './src/components/GlobalTransactionModals';
import { SplashScreen } from './src/components/SplashScreen';

const theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: colors.primary,
    secondary: colors.secondary,
    background: colors.background,
    surface: colors.surface,
    error: colors.error,
  },
};

function AppContent() {
  const loadStoredAuth = useAuthStore((state) => state.loadStoredAuth)
  const isLoading = useAuthStore((state) => state.isLoading)
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    loadStoredAuth()
  }, [])

  // Mostrar splash screen
  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />
  }

  // Mostrar loading después del splash
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  return (
    <TransactionModalProvider>
      <AppNavigator />
      <GlobalTransactionModals />
    </TransactionModalProvider>
  )
}

export default function App() {
  const [fontsLoaded] = useFonts({
    'Satisfy': require('./assets/fonts/Satisfy-Regular.ttf'),
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <PaperProvider theme={theme}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <AppContent />
    </PaperProvider>
  );
}
