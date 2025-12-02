# 🗄️ Estado Global - Zustand Stores

## 🎯 Objetivo

Gestión de estado global con Zustand y React Query.

---

## 🔐 Auth Store

```typescript
// src/store/auth.store.ts
import { create } from 'zustand'
import { storage } from '@utils/storage'

interface User {
  id: string
  email: string
  name: string
  plan: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (token: string, user: User) => Promise<void>
  logout: () => Promise<void>
  loadUser: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  login: async (token, user) => {
    await storage.setToken(token)
    await storage.setUser(user)
    set({ token, user, isAuthenticated: true })
  },

  logout: async () => {
    await storage.clear()
    set({ token: null, user: null, isAuthenticated: false })
  },

  loadUser: async () => {
    const token = await storage.getToken()
    const user = await storage.getUser()
    if (token && user) {
      set({ token, user, isAuthenticated: true })
    }
  }
}))
```

---

## ⚙️ Settings Store

```typescript
// src/store/settings.store.ts
import { create } from 'zustand'
import { storage } from '@utils/storage'

interface SettingsState {
  currency: 'ARS' | 'USD'
  theme: 'light' | 'dark'
  biometricEnabled: boolean
  setCurrency: (currency: 'ARS' | 'USD') => Promise<void>
  setTheme: (theme: 'light' | 'dark') => Promise<void>
  setBiometric: (enabled: boolean) => Promise<void>
  loadSettings: () => Promise<void>
}

export const useSettingsStore = create<SettingsState>((set) => ({
  currency: 'ARS',
  theme: 'dark',
  biometricEnabled: false,

  setCurrency: async (currency) => {
    await storage.setItem('currency', currency)
    set({ currency })
  },

  setTheme: async (theme) => {
    await storage.setItem('theme', theme)
    set({ theme })
  },

  setBiometric: async (enabled) => {
    await storage.setItem('biometric', enabled)
    set({ biometricEnabled: enabled })
  },

  loadSettings: async () => {
    const currency = await storage.getItem('currency') || 'ARS'
    const theme = await storage.getItem('theme') || 'dark'
    const biometric = await storage.getItem('biometric') || false
    set({ currency, theme, biometricEnabled: biometric })
  }
}))
```

---

## 🔄 React Query Setup

```typescript
// src/config/queryClient.ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 10 * 60 * 1000, // 10 minutos
      retry: 3,
      refetchOnWindowFocus: false
    }
  }
})
```

---

**Última actualización**: 1 de Diciembre, 2025  
**Versión**: 1.0.0
