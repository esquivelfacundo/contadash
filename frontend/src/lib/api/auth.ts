import { apiClient } from './client'

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput {
  email: string
  password: string
  name: string
  company?: string
}

export interface AuthResponse {
  user: {
    id: string
    email: string
    name: string
    company?: string
    plan: string
  }
  token: string
  refreshToken: string
}

export const authApi = {
  login: async (data: LoginInput): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', data)
    return response.data
  },

  register: async (data: RegisterInput): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/register', data)
    return response.data
  },

  getProfile: async () => {
    const response = await apiClient.get('/auth/profile')
    return response.data.user
  },

  logout: async () => {
    await apiClient.post('/auth/logout')
  },

  requestPasswordReset: async (email: string) => {
    const response = await apiClient.post('/auth/request-password-reset', { email })
    return response.data
  },

  resetPassword: async (token: string, password: string) => {
    const response = await apiClient.post('/auth/reset-password', { token, password })
    return response.data
  },

  sendVerificationEmail: async () => {
    const response = await apiClient.post('/auth/send-verification-email')
    return response.data
  },

  verifyEmail: async (token: string) => {
    const response = await apiClient.post('/auth/verify-email', { token })
    return response.data
  },
}
