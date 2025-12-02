import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { LoginScreen } from '../screens/auth/LoginScreen'
import { DashboardScreen } from '../screens/dashboard/DashboardScreen'
import { MonthlyScreen } from '../screens/monthly/MonthlyScreen'
import { BalanceScreen } from '../screens/balance/BalanceScreen'
import { BudgetsScreen } from '../screens/budgets/BudgetsScreen'
import { AnalyticsScreen } from '../screens/analytics/AnalyticsScreen'
import { SettingsMenuScreen } from '../screens/settings/SettingsMenuScreen'
import { CategoriesSettingsScreen } from '../screens/settings/CategoriesSettingsScreen'
import { ClientsSettingsScreen } from '../screens/settings/ClientsSettingsScreen'
import { CreditCardsSettingsScreen } from '../screens/settings/CreditCardsSettingsScreen'
import { BankAccountsSettingsScreen } from '../screens/settings/BankAccountsSettingsScreen'
import { ProfileScreen } from '../screens/profile/ProfileScreen'
import { colors } from '../theme/colors'
import { useAuthStore } from '../store/authStore'

const Stack = createNativeStackNavigator()

// Configuración de animación fade
const fadeAnimation = {
  animation: 'fade' as const,
  animationDuration: 200,
}

export const AppNavigator = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.surface,
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {!isAuthenticated ? (
          // Auth Stack
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        ) : (
          // Main Stack
          <>
            <Stack.Screen 
              name="Dashboard" 
              component={DashboardScreen}
              options={{ 
                headerShown: false,
                ...fadeAnimation,
              }}
            />
            <Stack.Screen 
              name="Monthly" 
              component={MonthlyScreen}
              options={{ 
                headerShown: false,
                ...fadeAnimation,
              }}
            />
            <Stack.Screen 
              name="Balance" 
              component={BalanceScreen}
              options={{ 
                headerShown: false,
                ...fadeAnimation,
              }}
            />
            <Stack.Screen 
              name="Budgets" 
              component={BudgetsScreen}
              options={{ 
                headerShown: false,
                ...fadeAnimation,
              }}
            />
            <Stack.Screen 
              name="Analytics" 
              component={AnalyticsScreen}
              options={{ 
                headerShown: false,
                ...fadeAnimation,
              }}
            />
            <Stack.Screen 
              name="Settings" 
              component={SettingsMenuScreen}
              options={{ 
                headerShown: false,
                ...fadeAnimation,
              }}
            />
            <Stack.Screen 
              name="CategoriesSettings" 
              component={CategoriesSettingsScreen}
              options={{ 
                headerShown: false,
                ...fadeAnimation,
              }}
            />
            <Stack.Screen 
              name="ClientsSettings" 
              component={ClientsSettingsScreen}
              options={{ 
                headerShown: false,
                ...fadeAnimation,
              }}
            />
            <Stack.Screen 
              name="CreditCardsSettings" 
              component={CreditCardsSettingsScreen}
              options={{ 
                headerShown: false,
                ...fadeAnimation,
              }}
            />
            <Stack.Screen 
              name="BankAccountsSettings" 
              component={BankAccountsSettingsScreen}
              options={{ 
                headerShown: false,
                ...fadeAnimation,
              }}
            />
            <Stack.Screen 
              name="Profile" 
              component={ProfileScreen}
              options={{ 
                headerShown: false,
                ...fadeAnimation,
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}
