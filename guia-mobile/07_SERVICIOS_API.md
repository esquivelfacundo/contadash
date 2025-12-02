# 🔌 Servicios API - ContaDash Mobile

## 🎯 Objetivo

Implementación completa de todos los servicios API para la app móvil.

---

## 🔐 Auth Service

```typescript
// src/services/api/auth.ts
import { apiClient } from './client'
import { storage } from '@utils/storage'

export const authApi = {
  async login(email: string, password: string) {
    const response = await apiClient.post('/auth/login', { email, password })
    await storage.setToken(response.data.token)
    await storage.setUser(response.data.user)
    return response.data
  },

  async register(name: string, email: string, password: string) {
    const response = await apiClient.post('/auth/register', { name, email, password })
    return response.data
  },

  async logout() {
    await storage.clear()
  },

  async forgotPassword(email: string) {
    const response = await apiClient.post('/auth/forgot-password', { email })
    return response.data
  }
}
```

---

## 💰 Transactions Service

```typescript
// src/services/api/transactions.ts
import { apiClient } from './client'

export const transactionsApi = {
  async getAll(filters?: any) {
    const response = await apiClient.get('/transactions', { params: filters })
    return response.data.transactions
  },

  async getById(id: string) {
    const response = await apiClient.get(`/transactions/${id}`)
    return response.data.transaction
  },

  async create(data: any) {
    const response = await apiClient.post('/transactions', data)
    return response.data.transaction
  },

  async update(id: string, data: any) {
    const response = await apiClient.put(`/transactions/${id}`, data)
    return response.data.transaction
  },

  async delete(id: string) {
    await apiClient.delete(`/transactions/${id}`)
  },

  async getStats(month?: number, year?: number) {
    const response = await apiClient.get('/transactions/stats', {
      params: { month, year }
    })
    return response.data.stats
  },

  async getMonthlyWithCreditCards(month: number, year: number) {
    const response = await apiClient.get('/transactions/monthly-with-cards', {
      params: { month, year }
    })
    return response.data
  }
}
```

---

## 💱 Exchange Service

```typescript
// src/services/api/exchange.ts
import { apiClient } from './client'

export const exchangeApi = {
  async getDolarBlue(): Promise<number> {
    try {
      const response = await apiClient.get('/exchange/dolar-blue')
      return response.data.rate
    } catch (error) {
      console.error('Error fetching current rate:', error)
      return 1000
    }
  },

  async getDolarBlueForDate(date: string): Promise<number> {
    try {
      const response = await apiClient.get(`/exchange/dolar-blue/date/${date}`)
      return response.data.rate
    } catch (error) {
      console.error('Error fetching historical rate:', error)
      return await this.getDolarBlue()
    }
  }
}
```

---

## 📊 Analytics Service

```typescript
// src/services/api/analytics.ts
import { apiClient } from './client'

export const analyticsApi = {
  async getDashboard() {
    const response = await apiClient.get('/analytics/dashboard')
    return response.data
  },

  async getMonthlyEvolution(year: number) {
    const response = await apiClient.get('/analytics/monthly-evolution', {
      params: { year }
    })
    return response.data
  },

  async getCategoryEvolution(period: number) {
    const response = await apiClient.get('/analytics/category-evolution', {
      params: { period }
    })
    return response.data
  }
}
```

---

**Última actualización**: 1 de Diciembre, 2025  
**Versión**: 1.0.0
