import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { authApi } from '../services/api'

interface User {
  id: string
  name: string
  email: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  setUser: (user: User) => void
  loadStoredAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null })
      
      // Llamar a la API real
      const response = await authApi.login(email, password)
      
      const user: User = {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
      }
      
      // Guardar en AsyncStorage
      await AsyncStorage.setItem('token', response.token)
      await AsyncStorage.setItem('user', JSON.stringify(user))
      
      set({
        user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Error al iniciar sesión'
      set({ 
        isLoading: false, 
        error: errorMessage,
        isAuthenticated: false,
      })
      throw new Error(errorMessage)
    }
  },

  logout: async () => {
    try {
      // Limpiar AsyncStorage
      await AsyncStorage.removeItem('token')
      await AsyncStorage.removeItem('user')
      
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        error: null,
      })
    } catch (error) {
      console.error('Error en logout:', error)
    }
  },

  setUser: (user: User) => {
    set({ user })
  },

  loadStoredAuth: async () => {
    try {
      set({ isLoading: true })
      
      const token = await AsyncStorage.getItem('token')
      const userStr = await AsyncStorage.getItem('user')
      
      if (token && userStr) {
        const user = JSON.parse(userStr)
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        })
      } else {
        set({ isLoading: false })
      }
    } catch (error) {
      console.error('Error loading stored auth:', error)
      set({ isLoading: false })
    }
  },
}))
