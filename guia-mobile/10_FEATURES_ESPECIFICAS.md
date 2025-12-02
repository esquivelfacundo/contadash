# ⭐ Features Específicas - ContaDash Mobile

## 🎯 Objetivo

Implementación de funcionalidades específicas de la app móvil.

---

## 🔄 Transacciones Recurrentes

### **Hook useRecurring**

```typescript
// src/hooks/useRecurring.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { recurringApi } from '@services/api/recurring'

export const useRecurring = () => {
  const queryClient = useQueryClient()

  const { data: recurring, isLoading } = useQuery({
    queryKey: ['recurring'],
    queryFn: recurringApi.getAll
  })

  const createMutation = useMutation({
    mutationFn: recurringApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring'] })
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => recurringApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring'] })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: recurringApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring'] })
    }
  })

  return {
    recurring,
    isLoading,
    create: createMutation.mutate,
    update: updateMutation.mutate,
    delete: deleteMutation.mutate
  }
}
```

---

## 💰 Presupuestos

### **Hook useBudgets**

```typescript
// src/hooks/useBudgets.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { budgetsApi } from '@services/api/budgets'

export const useBudgets = (month: number, year: number) => {
  const queryClient = useQueryClient()

  const { data: budgets, isLoading } = useQuery({
    queryKey: ['budgets', month, year],
    queryFn: () => budgetsApi.getAll(month, year)
  })

  const createMutation = useMutation({
    mutationFn: budgetsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
    }
  })

  return {
    budgets,
    isLoading,
    create: createMutation.mutate
  }
}
```

---

## 📊 Analytics

### **Hook useAnalytics**

```typescript
// src/hooks/useAnalytics.ts
import { useQuery } from '@tanstack/react-query'
import { analyticsApi } from '@services/api/analytics'

export const useAnalytics = () => {
  const dashboard = useQuery({
    queryKey: ['analytics-dashboard'],
    queryFn: analyticsApi.getDashboard
  })

  const evolution = useQuery({
    queryKey: ['analytics-evolution', 2025],
    queryFn: () => analyticsApi.getMonthlyEvolution(2025)
  })

  return {
    dashboard: dashboard.data,
    evolution: evolution.data,
    isLoading: dashboard.isLoading || evolution.isLoading
  }
}
```

---

**Última actualización**: 1 de Diciembre, 2025  
**Versión**: 1.0.0
