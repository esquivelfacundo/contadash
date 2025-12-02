# 🧭 Navegación Completa - React Navigation

## 🎯 Objetivo

Sistema completo de navegación para la app móvil.

---

## 📱 App Navigator

```typescript
// src/navigation/AppNavigator.tsx
import React, { useEffect } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { useAuthStore } from '@store/auth.store'
import { AuthNavigator } from './AuthNavigator'
import { MainNavigator } from './MainNavigator'

export const AppNavigator = () => {
  const { isAuthenticated, loadUser } = useAuthStore()

  useEffect(() => {
    loadUser()
  }, [])

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  )
}
```

---

## 🔐 Auth Navigator

```typescript
// src/navigation/AuthNavigator.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { LoginScreen } from '@screens/auth/LoginScreen'
import { RegisterScreen } from '@screens/auth/RegisterScreen'
import { ForgotPasswordScreen } from '@screens/auth/ForgotPasswordScreen'

const Stack = createNativeStackNavigator()

export const AuthNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  )
}
```

---

## 🏠 Main Navigator

```typescript
// src/navigation/MainNavigator.tsx
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createDrawerNavigator } from '@react-navigation/drawer'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

const Tab = createBottomTabNavigator()
const Drawer = createDrawerNavigator()

export const MainNavigator = () => {
  return (
    <Drawer.Navigator>
      <Drawer.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{
          drawerIcon: ({ color }) => <Icon name="view-dashboard" size={24} color={color} />
        }}
      />
      <Drawer.Screen 
        name="Monthly" 
        component={MonthlyScreen}
        options={{
          drawerIcon: ({ color }) => <Icon name="calendar-month" size={24} color={color} />
        }}
      />
      <Drawer.Screen 
        name="Analytics" 
        component={AnalyticsScreen}
        options={{
          drawerIcon: ({ color }) => <Icon name="chart-line" size={24} color={color} />
        }}
      />
      <Drawer.Screen 
        name="Budgets" 
        component={BudgetsScreen}
        options={{
          drawerIcon: ({ color }) => <Icon name="wallet" size={24} color={color} />
        }}
      />
      <Drawer.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          drawerIcon: ({ color }) => <Icon name="cog" size={24} color={color} />
        }}
      />
    </Drawer.Navigator>
  )
}
```

---

**Última actualización**: 1 de Diciembre, 2025  
**Versión**: 1.0.0
