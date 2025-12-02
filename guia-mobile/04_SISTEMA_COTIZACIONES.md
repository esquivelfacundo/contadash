# 💱 Sistema de Cotizaciones del Dólar - Guía Completa

## 🎯 Objetivo

Este documento explica **exhaustivamente** cómo funciona el sistema de cotizaciones del dólar en ContaDash. Es **CRÍTICO** entender esto para replicar correctamente la funcionalidad en mobile.

---

## 📊 Conceptos Fundamentales

### **Dos Tipos de Cotizaciones**

1. **Cotización Actual** (API en tiempo real)
   - Se obtiene de la API externa
   - Cambia diariamente
   - Se usa para meses actuales y futuros

2. **Cotización Histórica** (Base de datos)
   - Se guarda en la base de datos
   - Corresponde al último día de cada mes
   - Se usa para meses pasados

---

## 🔄 Flujo de Cotizaciones

### **Diagrama de Flujo**

```
┌─────────────────────────────────────────────────────────┐
│  Usuario selecciona Mes/Año o crea Transacción         │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │  ¿Mes Actual/Futuro? │
          └──────────┬───────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
    ┌────────┐            ┌──────────┐
    │   SÍ   │            │    NO    │
    └────┬───┘            └────┬─────┘
         │                     │
         ▼                     ▼
┌─────────────────┐   ┌──────────────────┐
│ API Externa     │   │ Base de Datos    │
│ getDolarBlue()  │   │ getDolarBlueFor  │
│                 │   │ Date(lastDay)    │
└────────┬────────┘   └────────┬─────────┘
         │                     │
         └──────────┬──────────┘
                    ▼
         ┌─────────────────────┐
         │  Cotización Obtenida│
         └─────────────────────┘
```

---

## 🔧 Implementación en el Frontend

### **1. En Vista Mensual (`/monthly`)**

#### **Cartelito de Cotización**

**Ubicación**: Arriba de las tablas de transacciones

**Código**:
```typescript
const [currentDolarRate, setCurrentDolarRate] = useState<number>(1000)

const loadDolarRate = async () => {
  try {
    const today = new Date()
    const selectedDate = new Date(year, month - 1, 1)
    
    // Determinar si es mes actual o futuro
    const isCurrentOrFutureMonth = 
      year > today.getFullYear() || 
      (year === today.getFullYear() && month >= today.getMonth() + 1)
    
    if (isCurrentOrFutureMonth) {
      // Mes actual o futuro: usar cotización actual
      const rate = await exchangeApi.getDolarBlue()
      setCurrentDolarRate(rate)
      console.log('📊 Using current rate:', rate)
    } else {
      // Mes pasado: usar cotización histórica del último día del mes
      const lastDayOfMonth = new Date(year, month, 0)
      const dateStr = lastDayOfMonth.toISOString().split('T')[0]
      const rate = await exchangeApi.getDolarBlueForDate(dateStr)
      setCurrentDolarRate(rate)
      console.log('📊 Using historical rate for:', dateStr, rate)
    }
  } catch (error) {
    console.error('Error loading dolar rate:', error)
    // Fallback a cotización actual
    const rate = await exchangeApi.getDolarBlue()
    setCurrentDolarRate(rate)
  }
}

useEffect(() => {
  loadDolarRate()
}, [year, month])
```

**Texto del Cartelito**:
```typescript
const getDateText = () => {
  const today = new Date()
  const isCurrentOrFutureMonth = 
    year > today.getFullYear() || 
    (year === today.getFullYear() && month >= today.getMonth() + 1)
  
  if (isCurrentOrFutureMonth) {
    return `Última actualización: ${new Date().toLocaleDateString('es-AR')}`
  } else {
    const lastDay = new Date(year, month, 0)
    return `Cotización de cierre: ${lastDay.toLocaleDateString('es-AR')}`
  }
}
```

#### **Uso en Tablas de Transacciones**

**Columna USD en Tabla**:
```typescript
// ❌ INCORRECTO - No usar transaction.amountUsd
<TableCell>{formatUSD(transaction.amountUsd)}</TableCell>

// ✅ CORRECTO - Calcular en tiempo real con currentDolarRate
<TableCell>
  {formatUSD(transaction.amountArs / currentDolarRate)}
</TableCell>
```

**Columna Cotización en Tabla**:
```typescript
// Mostrar la cotización específica de la transacción
<TableCell>
  ${Number(transaction.exchangeRate).toFixed(2)}
</TableCell>
```

**Fila de Totales**:
```typescript
// Total ARS: Suma de amountArs
const totalArs = transactions.reduce((sum, t) => sum + t.amountArs, 0)

// Total USD: Suma de amountUsd (valores reales)
const totalUsd = transactions.reduce((sum, t) => sum + t.amountUsd, 0)

// ❌ INCORRECTO
const totalUsd = totalArs / currentDolarRate

// ✅ CORRECTO
const totalUsd = transactions.reduce((sum, t) => sum + Number(t.amountUsd), 0)
```

#### **Cards de Resumen Mensual**

```typescript
// Obtener totales del mes
const monthIncome = incomeTransactions.reduce((sum, t) => sum + t.amountArs, 0)
const monthExpense = expenseTransactions.reduce((sum, t) => sum + t.amountArs, 0)

// Calcular USD usando currentDolarRate del cartelito
const monthIncomeUSD = monthIncome / currentDolarRate
const monthExpenseUSD = monthExpense / currentDolarRate
const monthBalanceUSD = monthIncomeUSD - monthExpenseUSD
```

#### **Cards de Resumen Anual**

```typescript
// Obtener cotización actual de la API (NO del cartelito)
const [currentApiDolarRate, setCurrentApiDolarRate] = useState<number>(1000)

useEffect(() => {
  const loadApiRate = async () => {
    const rate = await exchangeApi.getDolarBlue()
    setCurrentApiDolarRate(rate)
  }
  loadApiRate()
}, [])

// Calcular USD para cards anuales
const yearIncomeUSD = yearSummary.income.ars / currentApiDolarRate
const yearExpenseUSD = yearSummary.expense.ars / currentApiDolarRate
const yearBalanceUSD = yearSummary.balance.ars / currentApiDolarRate
```

---

### **2. En Modales de Transacciones**

#### **Carga Automática de Cotización**

```typescript
const loadExchangeRate = async (date?: string) => {
  try {
    const selectedDate = date || new Date().toISOString().split('T')[0]
    const today = new Date()
    
    // Crear fecha local para evitar problemas de timezone
    const [year, month, day] = selectedDate.split('-').map(Number)
    const transactionDateObj = new Date(year, month - 1, day)
    
    // Determinar si es mes actual o futuro
    const isCurrentOrFutureMonth = 
      transactionDateObj.getFullYear() > today.getFullYear() || 
      (transactionDateObj.getFullYear() === today.getFullYear() && 
       transactionDateObj.getMonth() >= today.getMonth())
    
    let rate: number
    
    if (isCurrentOrFutureMonth) {
      // Mes actual o futuro: cotización actual
      rate = await exchangeApi.getDolarBlue()
      console.log('💹 Using current rate:', rate)
    } else {
      // Mes pasado: cotización histórica del último día del mes
      const lastDayOfMonth = new Date(
        transactionDateObj.getFullYear(),
        transactionDateObj.getMonth() + 1,
        0
      )
      const dateStr = lastDayOfMonth.toISOString().split('T')[0]
      rate = await exchangeApi.getDolarBlueForDate(dateStr)
      console.log('📊 Using historical rate for:', dateStr, rate)
    }
    
    setValue('exchangeRate', rate)
  } catch (error) {
    console.error('Error loading exchange rate:', error)
    // Fallback a cotización actual
    const rate = await exchangeApi.getDolarBlue()
    setValue('exchangeRate', rate || 1000)
  }
}

// Cargar cotización al abrir modal
useEffect(() => {
  if (open) {
    const initialDate = editingTransaction?.date || new Date().toISOString().split('T')[0]
    loadExchangeRate(initialDate)
  }
}, [open])

// Recargar cotización al cambiar fecha
useEffect(() => {
  const subscription = watch((value, { name }) => {
    if (name === 'date' && value.date) {
      loadExchangeRate(value.date)
    }
  })
  return () => subscription.unsubscribe()
}, [watch])
```

#### **Cálculo Automático de USD**

```typescript
// Recalcular USD cuando cambia ARS o Cotización
useEffect(() => {
  const subscription = watch((value) => {
    const ars = value.amountArs
    const rate = value.exchangeRate
    
    if (ars && rate && rate > 0) {
      const usd = ars / rate
      setValue('amountUsd', usd)
    }
  })
  return () => subscription.unsubscribe()
}, [watch, setValue])
```

#### **Helper Text Dinámico**

```typescript
const getExchangeRateHelperText = () => {
  const date = watch('date')
  if (!date) return 'Cotización del dólar blue'
  
  const today = new Date()
  const [year, month] = date.split('-').map(Number)
  const transactionDate = new Date(year, month - 1, 1)
  
  const isCurrentOrFutureMonth = 
    transactionDate.getFullYear() > today.getFullYear() || 
    (transactionDate.getFullYear() === today.getFullYear() && 
     transactionDate.getMonth() >= today.getMonth())
  
  if (isCurrentOrFutureMonth) {
    return '💹 Cotización actual del dólar blue'
  } else {
    return '📊 Cotización histórica del mes seleccionado'
  }
}
```

---

## 🌐 APIs del Backend

### **API 1: Cotización Actual**

**Endpoint**: `GET /api/exchange/dolar-blue`

**Descripción**: Obtiene la cotización actual del dólar blue desde API externa.

**Response**:
```json
{
  "rate": 1435.50,
  "date": "2025-12-01",
  "source": "dolarapi.com"
}
```

**Implementación Backend**:
```typescript
// backend/src/controllers/exchange.controller.ts
export async function getCurrentDolarBlue(req: Request, res: Response) {
  try {
    // Intentar obtener de cache (Redis o memoria)
    const cached = await cache.get('dolar-blue-current')
    if (cached) {
      return res.json(cached)
    }
    
    // Obtener de API externa
    const response = await axios.get('https://dolarapi.com/v1/dolares/blue')
    const rate = response.data.venta
    
    const result = {
      rate: rate,
      date: new Date().toISOString().split('T')[0],
      source: 'dolarapi.com'
    }
    
    // Guardar en cache por 1 hora
    await cache.set('dolar-blue-current', result, 3600)
    
    res.json(result)
  } catch (error) {
    res.status(500).json({ error: 'Error fetching dolar rate' })
  }
}
```

### **API 2: Cotización Histórica**

**Endpoint**: `GET /api/exchange/dolar-blue/date/:date`

**Parámetros**:
- `date`: Fecha en formato YYYY-MM-DD

**Descripción**: Obtiene la cotización histórica de una fecha específica desde la base de datos.

**Response**:
```json
{
  "rate": 1350.00,
  "date": "2025-10-31",
  "source": "database"
}
```

**Implementación Backend**:
```typescript
// backend/src/controllers/exchange.controller.ts
export async function getHistoricalDolarBlue(req: Request, res: Response) {
  try {
    const { date } = req.params
    
    // Buscar en base de datos
    const exchangeRate = await prisma.exchangeRate.findUnique({
      where: { date: new Date(date) }
    })
    
    if (exchangeRate) {
      return res.json({
        rate: Number(exchangeRate.rate),
        date: exchangeRate.date.toISOString().split('T')[0],
        source: 'database'
      })
    }
    
    // Si no existe, intentar obtener de API externa histórica
    // o usar la cotización actual como fallback
    const currentRate = await getCurrentDolarBlueRate()
    
    // Guardar en base de datos para futuras consultas
    const newRate = await prisma.exchangeRate.create({
      data: {
        date: new Date(date),
        rate: currentRate,
        source: 'fallback'
      }
    })
    
    res.json({
      rate: Number(newRate.rate),
      date: newRate.date.toISOString().split('T')[0],
      source: 'fallback'
    })
  } catch (error) {
    res.status(500).json({ error: 'Error fetching historical rate' })
  }
}
```

### **Modelo de Base de Datos**

```prisma
model ExchangeRate {
  id           String   @id @default(cuid())
  date         DateTime @unique
  currencyFrom String   @default("USD") @map("currency_from")
  currencyTo   String   @default("ARS") @map("currency_to")
  rate         Decimal  @db.Decimal(10, 4)
  source       String   @default("manual")
  createdAt    DateTime @default(now()) @map("created_at")

  @@index([date])
  @@index([currencyFrom, currencyTo, date])
  @@map("exchange_rates")
}
```

---

## 📱 Implementación en Mobile

### **Servicio de Exchange**

```typescript
// mobile/src/services/api/exchange.ts
import { apiClient } from './client'

export interface ExchangeRate {
  rate: number
  date: string
  source: string
}

export const exchangeApi = {
  /**
   * Obtiene la cotización actual del dólar blue
   */
  getDolarBlue: async (): Promise<number> => {
    try {
      const response = await apiClient.get<ExchangeRate>('/exchange/dolar-blue')
      return response.data.rate
    } catch (error) {
      console.error('Error fetching current dolar rate:', error)
      return 1000 // Fallback
    }
  },

  /**
   * Obtiene la cotización histórica de una fecha específica
   * @param date Fecha en formato YYYY-MM-DD
   */
  getDolarBlueForDate: async (date: string): Promise<number> => {
    try {
      const response = await apiClient.get<ExchangeRate>(`/exchange/dolar-blue/date/${date}`)
      return response.data.rate
    } catch (error) {
      console.error('Error fetching historical dolar rate:', error)
      // Fallback a cotización actual
      return await exchangeApi.getDolarBlue()
    }
  }
}
```

### **Hook Personalizado**

```typescript
// mobile/src/hooks/useExchangeRate.ts
import { useState, useEffect } from 'react'
import { exchangeApi } from '../services/api/exchange'

export const useExchangeRate = (year: number, month: number) => {
  const [rate, setRate] = useState<number>(1000)
  const [loading, setLoading] = useState(true)
  const [isHistorical, setIsHistorical] = useState(false)

  useEffect(() => {
    const loadRate = async () => {
      try {
        setLoading(true)
        const today = new Date()
        const selectedDate = new Date(year, month - 1, 1)
        
        const isCurrentOrFutureMonth = 
          year > today.getFullYear() || 
          (year === today.getFullYear() && month >= today.getMonth() + 1)
        
        let exchangeRate: number
        
        if (isCurrentOrFutureMonth) {
          exchangeRate = await exchangeApi.getDolarBlue()
          setIsHistorical(false)
        } else {
          const lastDay = new Date(year, month, 0)
          const dateStr = lastDay.toISOString().split('T')[0]
          exchangeRate = await exchangeApi.getDolarBlueForDate(dateStr)
          setIsHistorical(true)
        }
        
        setRate(exchangeRate)
      } catch (error) {
        console.error('Error loading exchange rate:', error)
        setRate(1000)
      } finally {
        setLoading(false)
      }
    }

    loadRate()
  }, [year, month])

  return { rate, loading, isHistorical }
}
```

### **Componente de Cotización**

```typescript
// mobile/src/components/ExchangeRateCard.tsx
import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Card } from 'react-native-paper'
import { useExchangeRate } from '../hooks/useExchangeRate'

interface Props {
  year: number
  month: number
}

export const ExchangeRateCard: React.FC<Props> = ({ year, month }) => {
  const { rate, loading, isHistorical } = useExchangeRate(year, month)

  if (loading) {
    return <Card><Text>Cargando cotización...</Text></Card>
  }

  const getDateText = () => {
    if (isHistorical) {
      const lastDay = new Date(year, month, 0)
      return `Cotización de cierre: ${lastDay.toLocaleDateString('es-AR')}`
    }
    return `Última actualización: ${new Date().toLocaleDateString('es-AR')}`
  }

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.title}>Cotización Dólar Blue</Text>
        <Text style={styles.rate}>${rate.toFixed(2)}</Text>
        <Text style={styles.date}>{getDateText()}</Text>
      </Card.Content>
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    margin: 16,
    backgroundColor: '#1E293B'
  },
  title: {
    fontSize: 14,
    color: '#94A3B8'
  },
  rate: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#10B981',
    marginVertical: 8
  },
  date: {
    fontSize: 12,
    color: '#64748B'
  }
})
```

---

## ⚠️ Casos Especiales y Edge Cases

### **1. Timezone Issues**

**Problema**: `new Date('2025-12-01')` puede interpretarse en UTC y causar desfase.

**Solución**:
```typescript
// ❌ INCORRECTO
const date = new Date('2025-12-01')

// ✅ CORRECTO
const [year, month, day] = '2025-12-01'.split('-').map(Number)
const date = new Date(year, month - 1, day)
```

### **2. Cotización No Disponible**

**Problema**: No hay cotización histórica en la base de datos.

**Solución**:
```typescript
try {
  const rate = await exchangeApi.getDolarBlueForDate(date)
  return rate
} catch (error) {
  // Fallback a cotización actual
  const currentRate = await exchangeApi.getDolarBlue()
  return currentRate
}
```

### **3. API Externa Caída**

**Problema**: La API externa no responde.

**Solución**:
```typescript
try {
  const response = await axios.get('https://dolarapi.com/v1/dolares/blue')
  return response.data.venta
} catch (error) {
  // Usar última cotización guardada en cache
  const lastKnown = await cache.get('dolar-blue-last-known')
  if (lastKnown) return lastKnown
  
  // Fallback final
  return 1000
}
```

### **4. Mes Actual a Mitad de Mes**

**Problema**: ¿Qué cotización usar para transacciones del mes actual?

**Solución**: Siempre usar cotización actual, no histórica.

```typescript
// Si el mes es actual o futuro, usar cotización actual
const isCurrentOrFutureMonth = 
  year > today.getFullYear() || 
  (year === today.getFullYear() && month >= today.getMonth() + 1)
```

### **5. Cambio de Mes a Medianoche**

**Problema**: A las 00:00 del día 1, ¿es mes actual o pasado?

**Solución**: Comparar mes completo, no día.

```typescript
// Comparar solo año y mes, ignorar día
const isCurrentOrFutureMonth = 
  year > today.getFullYear() || 
  (year === today.getFullYear() && month >= today.getMonth() + 1)
```

---

## 🧪 Testing del Sistema de Cotizaciones

### **Casos de Prueba**

```typescript
describe('Exchange Rate System', () => {
  it('should use current rate for current month', async () => {
    const today = new Date()
    const rate = await getExchangeRate(today.getFullYear(), today.getMonth() + 1)
    expect(rate).toBeGreaterThan(0)
  })

  it('should use historical rate for past month', async () => {
    const rate = await getExchangeRate(2025, 10) // Octubre 2025
    expect(rate).toBe(1350) // Cotización histórica conocida
  })

  it('should use current rate for future month', async () => {
    const futureYear = new Date().getFullYear() + 1
    const rate = await getExchangeRate(futureYear, 1)
    expect(rate).toBeGreaterThan(0)
  })

  it('should fallback to current rate if historical not found', async () => {
    const rate = await getExchangeRate(2020, 1) // Muy antiguo
    expect(rate).toBeGreaterThan(0)
  })

  it('should calculate USD correctly in transactions', () => {
    const ars = 100000
    const rate = 1000
    const usd = ars / rate
    expect(usd).toBe(100)
  })

  it('should sum USD correctly in totals', () => {
    const transactions = [
      { amountArs: 100000, amountUsd: 100 },
      { amountArs: 50000, amountUsd: 50 }
    ]
    const totalUsd = transactions.reduce((sum, t) => sum + t.amountUsd, 0)
    expect(totalUsd).toBe(150)
  })
})
```

---

## 📊 Diagrama de Flujo Completo

```
┌─────────────────────────────────────────────────────────────────┐
│                    SISTEMA DE COTIZACIONES                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│ Usuario abre    │
│ Vista Mensual   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ Cargar Cotización del Mes              │
│ loadDolarRate(year, month)             │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ ¿Mes Actual o Futuro?                  │
│ year > today.year ||                   │
│ (year == today.year && month >= today) │
└────────┬────────────────────────────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌───────┐ ┌──────────┐
│  SÍ   │ │    NO    │
└───┬───┘ └────┬─────┘
    │          │
    ▼          ▼
┌─────────────────┐ ┌──────────────────────┐
│ API Externa     │ │ Base de Datos        │
│ GET /dolar-blue │ │ GET /dolar-blue/date │
└────────┬────────┘ └──────────┬───────────┘
         │                     │
         └──────────┬──────────┘
                    ▼
         ┌─────────────────────┐
         │ setCurrentDolarRate │
         │ (rate)              │
         └──────────┬──────────┘
                    │
                    ▼
         ┌─────────────────────────────────┐
         │ Mostrar en Cartelito            │
         │ "Cotización Dólar Blue: $X"     │
         └──────────┬──────────────────────┘
                    │
                    ▼
         ┌─────────────────────────────────┐
         │ Usar en Tablas                  │
         │ USD = ARS / currentDolarRate    │
         └──────────┬──────────────────────┘
                    │
                    ▼
         ┌─────────────────────────────────┐
         │ Usar en Cards Mensuales         │
         │ USD = Total ARS / currentRate   │
         └─────────────────────────────────┘

┌─────────────────┐
│ Usuario crea    │
│ Transacción     │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ Selecciona Fecha                        │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ loadExchangeRate(date)                  │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ ¿Fecha en Mes Actual/Futuro?           │
└────────┬────────────────────────────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌───────┐ ┌──────────┐
│  SÍ   │ │    NO    │
└───┬───┘ └────┬─────┘
    │          │
    ▼          ▼
┌─────────────────┐ ┌──────────────────────┐
│ Cotización      │ │ Cotización Histórica │
│ Actual          │ │ del Último Día       │
└────────┬────────┘ └──────────┬───────────┘
         │                     │
         └──────────┬──────────┘
                    ▼
         ┌─────────────────────┐
         │ setValue(           │
         │   'exchangeRate',   │
         │   rate              │
         │ )                   │
         └──────────┬──────────┘
                    │
                    ▼
         ┌─────────────────────────────────┐
         │ Usuario ingresa ARS             │
         └──────────┬──────────────────────┘
                    │
                    ▼
         ┌─────────────────────────────────┐
         │ Auto-calcular USD               │
         │ USD = ARS / exchangeRate        │
         └──────────┬──────────────────────┘
                    │
                    ▼
         ┌─────────────────────────────────┐
         │ Guardar Transacción             │
         │ POST /api/transactions          │
         │ {                               │
         │   amountArs,                    │
         │   amountUsd,                    │
         │   exchangeRate                  │
         │ }                               │
         └─────────────────────────────────┘
```

---

## 🎯 Checklist de Implementación Mobile

### **Backend (Ya implementado)**
- [x] API de cotización actual
- [x] API de cotización histórica
- [x] Modelo de base de datos
- [x] Cache de cotizaciones
- [x] Fallbacks robustos

### **Mobile (A implementar)**
- [ ] Servicio de exchange API
- [ ] Hook useExchangeRate
- [ ] Componente ExchangeRateCard
- [ ] Lógica en pantalla Monthly
- [ ] Lógica en modales de transacciones
- [ ] Cálculo automático de USD
- [ ] Validaciones de fechas
- [ ] Manejo de timezones
- [ ] Tests unitarios
- [ ] Tests de integración

---

## 📚 Recursos Adicionales

### **APIs Externas de Cotización**

1. **DolarAPI** (Actual)
   - URL: https://dolarapi.com/v1/dolares/blue
   - Gratis
   - Actualización diaria

2. **Alternativas**:
   - https://api.bluelytics.com.ar/v2/latest
   - https://www.dolarsi.com/api/api.php?type=valoresprincipales

### **Documentación**

- [Guía de Cotizaciones](../COTIZACION_USD_GUIDE.md)
- [API Backend](./02_ARQUITECTURA_BACKEND.md)
- [Pantallas Frontend](./01_ANALISIS_COMPLETO_FRONTEND.md)

---

## 🚨 Errores Comunes y Soluciones

### **Error 1: USD incorrecto en totales**

**Síntoma**: Total USD no coincide con suma de transacciones

**Causa**: Dividir total ARS por cotización en lugar de sumar USD reales

**Solución**:
```typescript
// ❌ INCORRECTO
const totalUsd = totalArs / currentDolarRate

// ✅ CORRECTO
const totalUsd = transactions.reduce((sum, t) => sum + t.amountUsd, 0)
```

### **Error 2: Cotización no se actualiza**

**Síntoma**: Cartelito muestra cotización antigua

**Causa**: No se recarga al cambiar mes/año

**Solución**:
```typescript
useEffect(() => {
  loadDolarRate()
}, [year, month]) // Dependencias correctas
```

### **Error 3: Timezone causa mes incorrecto**

**Síntoma**: Diciembre se interpreta como noviembre

**Causa**: `new Date('2025-12-01')` usa UTC

**Solución**:
```typescript
const [year, month, day] = date.split('-').map(Number)
const localDate = new Date(year, month - 1, day)
```

---

**Última actualización**: 1 de Diciembre, 2025  
**Versión**: 1.0.0
