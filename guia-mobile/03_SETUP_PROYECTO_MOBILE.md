# 🚀 Setup del Proyecto Mobile - ContaDash

## 🎯 Objetivo

Este documento te guía paso a paso para configurar el proyecto móvil desde cero con todas las dependencias y configuraciones necesarias.

---

## 📋 Pre-requisitos

### **Software Necesario**

```bash
# Node.js (versión 18 o superior)
node --version  # v18.0.0 o superior

# npm o yarn
npm --version   # 9.0.0 o superior

# Git
git --version

# Expo CLI (se instalará globalmente)
npm install -g expo-cli eas-cli
```

### **Cuentas Necesarias**

1. **Expo Account** - https://expo.dev/signup
2. **Apple Developer** (para iOS) - $99/año
3. **Google Play Console** (para Android) - $25 único

---

## 🏗️ Paso 1: Crear Proyecto

### **1.1 Inicializar Proyecto**

```bash
cd /home/lidius/Documents/contadash
npx create-expo-app mobile --template blank-typescript
cd mobile
```

### **1.2 Estructura Inicial**

```
mobile/
├── App.tsx
├── app.json
├── package.json
├── tsconfig.json
└── assets/
```

---

## 📦 Paso 2: Instalar Dependencias

### **2.1 Navegación**

```bash
npx expo install \
  @react-navigation/native \
  @react-navigation/native-stack \
  @react-navigation/bottom-tabs \
  @react-navigation/drawer \
  react-native-screens \
  react-native-safe-area-context \
  react-native-gesture-handler \
  react-native-reanimated
```

### **2.2 UI Components**

```bash
npx expo install \
  react-native-paper \
  react-native-vector-icons \
  @react-native-picker/picker \
  react-native-modal \
  react-native-calendars
```

### **2.3 Gráficos**

```bash
npm install victory-native
npx expo install react-native-svg
```

### **2.4 Estado y Data Fetching**

```bash
npm install \
  zustand \
  @tanstack/react-query \
  axios
```

### **2.5 Formularios y Validaciones**

```bash
npm install \
  react-hook-form \
  zod \
  @hookform/resolvers
```

### **2.6 Storage**

```bash
npx expo install \
  @react-native-async-storage/async-storage \
  expo-secure-store
```

### **2.7 Utilidades**

```bash
npm install \
  date-fns \
  numeral
```

### **2.8 Features Móviles**

```bash
npx expo install \
  expo-camera \
  expo-image-picker \
  expo-document-picker \
  expo-file-system \
  expo-local-authentication \
  expo-notifications
```

---

## 📁 Paso 3: Estructura de Carpetas

### **3.1 Crear Estructura**

```bash
mkdir -p src/{screens,components,navigation,services,store,hooks,utils,types,theme,constants}
mkdir -p src/screens/{auth,dashboard,monthly,analytics,budgets,reports,settings,profile}
mkdir -p src/components/{common,forms,cards,modals}
mkdir -p src/services/api
```

### **3.2 Estructura Completa**

```
mobile/
├── src/
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── RegisterScreen.tsx
│   │   │   ├── ForgotPasswordScreen.tsx
│   │   │   ├── ResetPasswordScreen.tsx
│   │   │   └── VerifyEmailScreen.tsx
│   │   ├── dashboard/
│   │   │   └── DashboardScreen.tsx
│   │   ├── monthly/
│   │   │   └── MonthlyScreen.tsx
│   │   ├── analytics/
│   │   │   └── AnalyticsScreen.tsx
│   │   ├── budgets/
│   │   │   └── BudgetsScreen.tsx
│   │   ├── reports/
│   │   │   └── ReportsScreen.tsx
│   │   ├── settings/
│   │   │   └── SettingsScreen.tsx
│   │   └── profile/
│   │       └── ProfileScreen.tsx
│   │
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Loading.tsx
│   │   │   └── ErrorMessage.tsx
│   │   ├── forms/
│   │   │   ├── TransactionForm.tsx
│   │   │   ├── CategoryPicker.tsx
│   │   │   ├── ClientPicker.tsx
│   │   │   ├── DatePicker.tsx
│   │   │   └── AmountInput.tsx
│   │   ├── cards/
│   │   │   ├── TransactionCard.tsx
│   │   │   ├── SummaryCard.tsx
│   │   │   ├── CategoryCard.tsx
│   │   │   └── CreditCardCard.tsx
│   │   └── modals/
│   │       ├── TransactionModal.tsx
│   │       ├── FilterModal.tsx
│   │       └── ConfirmModal.tsx
│   │
│   ├── navigation/
│   │   ├── AppNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   ├── MainNavigator.tsx
│   │   └── types.ts
│   │
│   ├── services/
│   │   └── api/
│   │       ├── client.ts
│   │       ├── auth.ts
│   │       ├── transactions.ts
│   │       ├── categories.ts
│   │       ├── clients.ts
│   │       ├── creditCards.ts
│   │       ├── bankAccounts.ts
│   │       ├── budgets.ts
│   │       ├── recurring.ts
│   │       ├── analytics.ts
│   │       ├── reports.ts
│   │       └── exchange.ts
│   │
│   ├── store/
│   │   ├── auth.store.ts
│   │   ├── transactions.store.ts
│   │   └── settings.store.ts
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useTransactions.ts
│   │   ├── useExchangeRate.ts
│   │   └── useDebounce.ts
│   │
│   ├── utils/
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   ├── storage.ts
│   │   └── constants.ts
│   │
│   ├── types/
│   │   ├── api.types.ts
│   │   ├── navigation.types.ts
│   │   └── models.types.ts
│   │
│   ├── theme/
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   └── spacing.ts
│   │
│   └── constants/
│       ├── api.ts
│       └── config.ts
│
├── App.tsx
├── app.json
├── package.json
└── tsconfig.json
```

---

## ⚙️ Paso 4: Configuración

### **4.1 app.json**

```json
{
  "expo": {
    "name": "ContaDash",
    "slug": "contadash",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "dark",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#0F172A"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.contadash.app",
      "buildNumber": "1.0.0",
      "infoPlist": {
        "NSCameraUsageDescription": "ContaDash necesita acceso a la cámara para escanear recibos",
        "NSPhotoLibraryUsageDescription": "ContaDash necesita acceso a tus fotos para adjuntar comprobantes",
        "NSFaceIDUsageDescription": "ContaDash usa Face ID para autenticación segura"
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#0F172A"
      },
      "package": "com.contadash.app",
      "versionCode": 1,
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "USE_BIOMETRIC",
        "USE_FINGERPRINT"
      ]
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-router",
      [
        "expo-camera",
        {
          "cameraPermission": "Permitir que ContaDash acceda a tu cámara"
        }
      ],
      [
        "expo-local-authentication",
        {
          "faceIDPermission": "Permitir que ContaDash use Face ID"
        }
      ]
    ],
    "extra": {
      "eas": {
        "projectId": "tu-project-id"
      }
    }
  }
}
```

### **4.2 tsconfig.json**

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@screens/*": ["src/screens/*"],
      "@services/*": ["src/services/*"],
      "@store/*": ["src/store/*"],
      "@hooks/*": ["src/hooks/*"],
      "@utils/*": ["src/utils/*"],
      "@types/*": ["src/types/*"],
      "@theme/*": ["src/theme/*"],
      "@constants/*": ["src/constants/*"]
    }
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    ".expo/types/**/*.ts",
    "expo-env.d.ts"
  ]
}
```

### **4.3 babel.config.js**

```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            '@': './src',
            '@components': './src/components',
            '@screens': './src/screens',
            '@services': './src/services',
            '@store': './src/store',
            '@hooks': './src/hooks',
            '@utils': './src/utils',
            '@types': './src/types',
            '@theme': './src/theme',
            '@constants': './src/constants'
          }
        }
      ],
      'react-native-reanimated/plugin'
    ]
  };
};
```

---

## 🎨 Paso 5: Archivos Base

### **5.1 src/constants/api.ts**

```typescript
export const API_CONFIG = {
  BASE_URL: __DEV__ 
    ? 'http://192.168.0.81:3000/api'  // Tu IP local
    : 'https://api.contadash.com/api',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3
}

export const ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  VERIFY_EMAIL: '/auth/verify-email',
  
  // Transactions
  TRANSACTIONS: '/transactions',
  TRANSACTION_STATS: '/transactions/stats',
  MONTHLY_WITH_CARDS: '/transactions/monthly-with-cards',
  
  // Categories
  CATEGORIES: '/categories',
  
  // Clients
  CLIENTS: '/clients',
  
  // Credit Cards
  CREDIT_CARDS: '/credit-cards',
  
  // Bank Accounts
  BANK_ACCOUNTS: '/bank-accounts',
  
  // Budgets
  BUDGETS: '/budgets',
  
  // Recurring
  RECURRING: '/recurring-transactions',
  
  // Analytics
  ANALYTICS_DASHBOARD: '/analytics/dashboard',
  ANALYTICS_EVOLUTION: '/analytics/monthly-evolution',
  ANALYTICS_CATEGORIES: '/analytics/category-evolution',
  ANALYTICS_CLIENTS: '/analytics/client-income',
  ANALYTICS_CARDS: '/analytics/card-spending',
  ANALYTICS_COMPARISON: '/analytics/year-comparison',
  ANALYTICS_ANOMALIES: '/analytics/anomalies',
  
  // Reports
  REPORTS_GENERATE: '/reports/generate',
  
  // Exchange
  EXCHANGE_CURRENT: '/exchange/dolar-blue',
  EXCHANGE_HISTORICAL: '/exchange/dolar-blue/date',
  
  // User
  USER_PROFILE: '/users/profile',
  USER_CHANGE_PASSWORD: '/users/change-password'
}
```

### **5.2 src/theme/colors.ts**

```typescript
export const colors = {
  // Primary
  primary: '#10B981',
  primaryDark: '#059669',
  primaryLight: '#34D399',
  
  // Secondary
  secondary: '#3B82F6',
  secondaryDark: '#2563EB',
  secondaryLight: '#60A5FA',
  
  // Accent
  accent: '#8B5CF6',
  accentDark: '#7C3AED',
  accentLight: '#A78BFA',
  
  // Status
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Income/Expense
  income: '#10B981',
  expense: '#EF4444',
  
  // Background
  background: '#0F172A',
  backgroundLight: '#1E293B',
  backgroundDark: '#020617',
  
  // Surface
  surface: '#1E293B',
  surfaceLight: '#334155',
  surfaceDark: '#0F172A',
  
  // Text
  text: '#F1F5F9',
  textSecondary: '#94A3B8',
  textTertiary: '#64748B',
  textDisabled: '#475569',
  
  // Border
  border: '#334155',
  borderLight: '#475569',
  borderDark: '#1E293B',
  
  // White/Black
  white: '#FFFFFF',
  black: '#000000',
  
  // Transparent
  transparent: 'transparent',
  
  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)'
}
```

### **5.3 src/theme/typography.ts**

```typescript
export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    light: 'System'
  },
  
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36
  },
  
  fontWeight: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700'
  },
  
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75
  }
}
```

### **5.4 src/theme/spacing.ts**

```typescript
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64
}
```

### **5.5 src/utils/formatters.ts**

```typescript
export const formatCurrency = (amount: number, currency: 'ARS' | 'USD' = 'ARS'): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: currency === 'ARS' ? 0 : 2
  }).format(amount)
}

export const formatDate = (date: Date | string, format: string = 'dd/MM/yyyy'): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('es-AR')
}

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('es-AR').format(num)
}

export const formatPercentage = (value: number): string => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
}
```

### **5.6 src/utils/storage.ts**

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as SecureStore from 'expo-secure-store'

export const storage = {
  // Token (seguro)
  async setToken(token: string): Promise<void> {
    await SecureStore.setItemAsync('token', token)
  },
  
  async getToken(): Promise<string | null> {
    return await SecureStore.getItemAsync('token')
  },
  
  async removeToken(): Promise<void> {
    await SecureStore.deleteItemAsync('token')
  },
  
  // User data (normal)
  async setUser(user: any): Promise<void> {
    await AsyncStorage.setItem('user', JSON.stringify(user))
  },
  
  async getUser(): Promise<any | null> {
    const user = await AsyncStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },
  
  async removeUser(): Promise<void> {
    await AsyncStorage.removeItem('user')
  },
  
  // Generic
  async setItem(key: string, value: any): Promise<void> {
    await AsyncStorage.setItem(key, JSON.stringify(value))
  },
  
  async getItem(key: string): Promise<any | null> {
    const item = await AsyncStorage.getItem(key)
    return item ? JSON.parse(item) : null
  },
  
  async removeItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(key)
  },
  
  async clear(): Promise<void> {
    await AsyncStorage.clear()
    await SecureStore.deleteItemAsync('token')
  }
}
```

---

## 🔌 Paso 6: API Client

### **6.1 src/services/api/client.ts**

```typescript
import axios, { AxiosInstance, AxiosError } from 'axios'
import { API_CONFIG } from '@constants/api'
import { storage } from '@utils/storage'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      async (config) => {
        const token = await storage.getToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token inválido o expirado
          await storage.clear()
          // Navegar a login (implementar con navigation)
        }
        return Promise.reject(error)
      }
    )
  }

  public getClient(): AxiosInstance {
    return this.client
  }
}

export const apiClient = new ApiClient().getClient()
```

---

## 🎯 Paso 7: Verificar Instalación

### **7.1 Ejecutar Proyecto**

```bash
# Iniciar servidor de desarrollo
npx expo start

# Opciones:
# - Presiona 'i' para iOS simulator
# - Presiona 'a' para Android emulator
# - Escanea QR con Expo Go app
```

### **7.2 Verificar Dependencias**

```bash
# Ver todas las dependencias instaladas
npm list --depth=0

# Verificar versiones
npx expo-doctor
```

### **7.3 Limpiar Cache (si hay problemas)**

```bash
# Limpiar cache de Expo
npx expo start -c

# Limpiar cache de npm
npm cache clean --force

# Reinstalar node_modules
rm -rf node_modules
npm install
```

---

## 📱 Paso 8: Configurar EAS

### **8.1 Inicializar EAS**

```bash
# Login en Expo
eas login

# Configurar EAS
eas build:configure
```

### **8.2 eas.json**

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {}
  }
}
```

---

## ✅ Checklist de Setup

- [ ] Node.js instalado (v18+)
- [ ] Expo CLI instalado
- [ ] Proyecto creado con TypeScript
- [ ] Todas las dependencias instaladas
- [ ] Estructura de carpetas creada
- [ ] Archivos de configuración creados
- [ ] Archivos base creados (theme, utils, constants)
- [ ] API client configurado
- [ ] Proyecto ejecuta sin errores
- [ ] EAS configurado
- [ ] Git inicializado

---

## 🚨 Problemas Comunes

### **Error: Metro bundler no inicia**

```bash
npx expo start -c
```

### **Error: Dependencias incompatibles**

```bash
npx expo install --fix
```

### **Error: TypeScript**

```bash
npm install --save-dev @types/react @types/react-native
```

### **Error: iOS Simulator**

```bash
# Instalar Xcode Command Line Tools
xcode-select --install
```

### **Error: Android Emulator**

- Instalar Android Studio
- Configurar AVD (Android Virtual Device)
- Agregar ANDROID_HOME al PATH

---

## 📚 Recursos

- **Expo Docs**: https://docs.expo.dev
- **React Navigation**: https://reactnavigation.org
- **React Native Paper**: https://callstack.github.io/react-native-paper
- **Victory Native**: https://commerce.nearform.com/open-source/victory-native

---

**Última actualización**: 1 de Diciembre, 2025  
**Versión**: 1.0.0
