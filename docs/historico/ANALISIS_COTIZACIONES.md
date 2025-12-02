# 🔍 ANÁLISIS COMPLETO: SISTEMA DE COTIZACIONES

**Fecha:** 30 de Noviembre, 2025, 05:28 PM  
**Analista:** Sistema de IA

---

## 📋 PROBLEMA IDENTIFICADO

En la imagen se ve que todos los meses muestran **$80.00 USD** cuando tienen **$80,000 ARS**, lo que indica que está usando una cotización de **1000** en todos los casos.

**Problema:** El sistema está usando la cotización ACTUAL para todos los meses, sin importar si el mes ya finalizó o no.

---

## 🎯 COMPORTAMIENTO ESPERADO

### Para Meses Finalizados (ej: Enero 2025)
- ✅ Debe usar la cotización del **último día de ese mes** (31 de Enero 2025)
- ✅ Esa cotización debe quedar "congelada" y no cambiar nunca más
- ✅ Ejemplo: Si el 31/01/2025 la cotización era 950, siempre mostrar $84.21 USD

### Para Mes en Curso (ej: Noviembre 2025)
- ✅ Debe usar la cotización **más reciente disponible**
- ✅ Se actualiza cada vez que hay una nueva cotización
- ✅ Ejemplo: Si hoy la cotización es 1050, mostrar $76.19 USD

### Para Meses Futuros (ej: Diciembre 2025 si estamos en Noviembre)
- ✅ Debe usar la cotización **más reciente disponible**
- ✅ Se actualiza igual que el mes en curso

---

## 🔍 ESTADO ACTUAL DEL CÓDIGO

### 1. Dashboard (`analytics.service.ts`)

**Función:** `getDashboardData()`

```typescript
export async function getDashboardData(userId: string) {
  // ...
  
  // Get current exchange rate
  const currentRate = await getCurrentExchangeRate() // ❌ PROBLEMA: Usa cotización actual para TODO
  
  const [currentMonthStats, previousMonthStats, yearStats, ...] = await Promise.all([
    getMonthStats(userId, currentMonth, currentYear, currentRate),
    getMonthStats(userId, ..., currentRate), // ❌ Mes anterior con cotización actual
    getYearStats(userId, currentYear, currentRate),
    ...
  ])
}
```

**Problema:** Usa `currentRate` para todos los meses, incluso los que ya finalizaron.

### 2. Resumen Anual (`yearly-summary.service.ts`)

**Función:** `getYearlySummary()`

```typescript
export async function getYearlySummary(userId: string, year: number) {
  for (let month = 1; month <= 12; month++) {
    // ...
    
    const incomeUsd = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + Number(t.amountUsd), 0) // ❌ PROBLEMA: Suma USD de transacciones
    
    const expenseUsd = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amountUsd), 0) // ❌ PROBLEMA: Suma USD de transacciones
  }
}
```

**Problema:** Suma los USD de las transacciones directamente, que tienen cotizaciones históricas mezcladas.

### 3. Monthly View (`/monthly`)

**No revisado aún**, pero probablemente tiene el mismo problema.

---

## 💡 SOLUCIÓN PROPUESTA

### Estrategia: Cotización por Mes

Crear una función que determine qué cotización usar según el mes:

```typescript
async function getExchangeRateForMonth(month: number, year: number): Promise<number> {
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()
  
  // Si es un mes futuro o el mes actual, usar cotización más reciente
  if (year > currentYear || (year === currentYear && month >= currentMonth)) {
    const latestRate = await prisma.exchangeRate.findFirst({
      orderBy: { date: 'desc' },
    })
    return latestRate ? Number(latestRate.rate) : 1000
  }
  
  // Si es un mes pasado, usar cotización del último día de ese mes
  const lastDayOfMonth = new Date(year, month, 0) // Último día del mes
  const rateForMonth = await prisma.exchangeRate.findFirst({
    where: {
      date: {
        lte: lastDayOfMonth,
      },
    },
    orderBy: { date: 'desc' },
  })
  
  return rateForMonth ? Number(rateForMonth.rate) : 1000
}
```

### Lógica de la Función

1. **Mes futuro o actual:**
   - Usar cotización más reciente
   - Se actualiza dinámicamente

2. **Mes pasado:**
   - Buscar la cotización más cercana al último día de ese mes
   - Queda "congelada"

---

## 📊 ARCHIVOS A MODIFICAR

### 1. `backend/src/services/analytics.service.ts`

**Cambios necesarios:**

#### Función `getDashboardData()`
```typescript
// ANTES
const currentRate = await getCurrentExchangeRate()
const currentMonthStats = await getMonthStats(userId, currentMonth, currentYear, currentRate)

// DESPUÉS
const currentMonthRate = await getExchangeRateForMonth(currentMonth, currentYear)
const currentMonthStats = await getMonthStats(userId, currentMonth, currentYear, currentMonthRate)
```

#### Función `getMonthlyTrend()`
```typescript
// ANTES
const currentRate = await getCurrentExchangeRate()
for (let i = 0; i < months; i++) {
  const stats = await getMonthStats(userId, month, trendYear, currentRate)
}

// DESPUÉS
for (let i = 0; i < months; i++) {
  const monthRate = await getExchangeRateForMonth(month, trendYear)
  const stats = await getMonthStats(userId, month, trendYear, monthRate)
}
```

#### Función `comparePeriods()`
```typescript
// ANTES
const currentRate = await getCurrentExchangeRate()
const stats1 = period1.month 
  ? getMonthStats(userId, period1.month, period1.year, currentRate)
  : getYearStats(userId, period1.year, currentRate)

// DESPUÉS
const rate1 = period1.month 
  ? await getExchangeRateForMonth(period1.month, period1.year)
  : await getCurrentExchangeRate()
const stats1 = period1.month 
  ? getMonthStats(userId, period1.month, period1.year, rate1)
  : getYearStats(userId, period1.year, rate1)
```

#### Función `generateProjections()`
```typescript
// ANTES
const currentRate = await getCurrentExchangeRate()
for (let i = 5; i >= 0; i--) {
  const stats = await getMonthStats(userId, month, year, currentRate)
}

// DESPUÉS
for (let i = 5; i >= 0; i--) {
  const monthRate = await getExchangeRateForMonth(month, year)
  const stats = await getMonthStats(userId, month, year, monthRate)
}
```

### 2. `backend/src/services/yearly-summary.service.ts`

**Cambios necesarios:**

```typescript
export async function getYearlySummary(userId: string, year: number) {
  const months = []

  for (let month = 1; month <= 12; month++) {
    // ... obtener transacciones ...
    
    const income = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + Number(t.amountArs), 0)

    const expense = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amountArs), 0)
    
    // ✅ NUEVO: Obtener cotización específica para este mes
    const monthRate = await getExchangeRateForMonth(month, year)
    
    // ✅ NUEVO: Convertir con cotización del mes
    const incomeUsd = income / monthRate
    const expenseUsd = expense / monthRate

    months.push({
      month,
      monthName: new Date(year, month - 1).toLocaleString('es', { month: 'long' }),
      income: {
        ars: income,
        usd: incomeUsd,
      },
      expense: {
        ars: expense,
        usd: expenseUsd,
      },
      balance: {
        ars: income - expense,
        usd: incomeUsd - expenseUsd,
      },
    })
  }
  
  // ... resto del código ...
}
```

### 3. Monthly View (si existe)

**Pendiente de revisar**, pero aplicar la misma lógica.

---

## 🧪 CASOS DE PRUEBA

### Caso 1: Mes Pasado (Enero 2025)

**Datos:**
- Fecha actual: 30 de Noviembre 2025
- Mes a consultar: Enero 2025
- Ingresos: $80,000 ARS
- Cotización 31/01/2025: 950

**Resultado esperado:**
- USD: $80,000 / 950 = **$84.21 USD**
- Esta cifra NO debe cambiar nunca más

### Caso 2: Mes Actual (Noviembre 2025)

**Datos:**
- Fecha actual: 30 de Noviembre 2025
- Mes a consultar: Noviembre 2025
- Ingresos: $80,000 ARS
- Cotización actual: 1050

**Resultado esperado:**
- USD: $80,000 / 1050 = **$76.19 USD**
- Esta cifra DEBE actualizarse si cambia la cotización

### Caso 3: Mes Futuro (Diciembre 2025)

**Datos:**
- Fecha actual: 30 de Noviembre 2025
- Mes a consultar: Diciembre 2025
- Ingresos: $80,000 ARS
- Cotización actual: 1050

**Resultado esperado:**
- USD: $80,000 / 1050 = **$76.19 USD**
- Esta cifra DEBE actualizarse si cambia la cotización

---

## 📈 EJEMPLO VISUAL

### Tabla de Resumen Anual 2025 (estando en Noviembre 2025)

| Mes | Ingresos ARS | Cotización | Ingresos USD | Estado |
|-----|--------------|------------|--------------|--------|
| Enero | $80,000 | 950 (31/01) | $84.21 | ✅ Congelado |
| Febrero | $80,000 | 920 (28/02) | $86.96 | ✅ Congelado |
| Marzo | $80,000 | 980 (31/03) | $81.63 | ✅ Congelado |
| ... | ... | ... | ... | ... |
| Octubre | $80,000 | 1020 (31/10) | $78.43 | ✅ Congelado |
| **Noviembre** | **$80,000** | **1050 (actual)** | **$76.19** | 🔄 Se actualiza |
| Diciembre | $0 | 1050 (actual) | $0.00 | 🔄 Se actualiza |

### Cuando pase a Diciembre 2025

| Mes | Ingresos ARS | Cotización | Ingresos USD | Estado |
|-----|--------------|------------|--------------|--------|
| ... | ... | ... | ... | ... |
| **Noviembre** | **$80,000** | **1050 (30/11)** | **$76.19** | ✅ Congelado (ahora) |
| **Diciembre** | **$80,000** | **1080 (actual)** | **$74.07** | 🔄 Se actualiza |

---

## ⚠️ CONSIDERACIONES IMPORTANTES

### 1. Performance

La función `getExchangeRateForMonth()` hace una query a la DB por cada mes. Para optimizar:

```typescript
// Opción 1: Cache en memoria
const rateCache = new Map<string, number>()

// Opción 2: Obtener todas las cotizaciones de una vez
const rates = await prisma.exchangeRate.findMany({
  where: { date: { gte: startOfYear, lte: endOfYear } },
  orderBy: { date: 'asc' },
})
```

### 2. Meses sin Cotización

Si un mes no tiene cotización registrada:
- Usar la cotización más cercana anterior
- O usar un default (ej: 1000)

### 3. Zona Horaria

Asegurarse de que las fechas se comparen correctamente considerando la zona horaria.

---

## 🎯 PLAN DE IMPLEMENTACIÓN

### Paso 1: Crear función helper
- ✅ `getExchangeRateForMonth(month, year)`
- ✅ Con lógica de mes pasado vs actual/futuro

### Paso 2: Actualizar `analytics.service.ts`
- ✅ `getDashboardData()`
- ✅ `getMonthlyTrend()`
- ✅ `comparePeriods()`
- ✅ `generateProjections()`

### Paso 3: Actualizar `yearly-summary.service.ts`
- ✅ `getYearlySummary()`

### Paso 4: Revisar y actualizar Monthly View
- ⚠️ Pendiente de revisar

### Paso 5: Testing
- ✅ Probar con meses pasados
- ✅ Probar con mes actual
- ✅ Probar con meses futuros
- ✅ Verificar que se "congela" al pasar el mes

---

## 📊 RESUMEN

### Problema Actual
- ❌ Usa cotización actual para TODOS los meses
- ❌ Meses pasados cambian cuando cambia la cotización
- ❌ No hay "congelamiento" de cotizaciones históricas

### Solución Propuesta
- ✅ Cotización específica por mes
- ✅ Meses pasados usan cotización del último día del mes
- ✅ Mes actual/futuro usa cotización más reciente
- ✅ Se "congela" automáticamente al pasar el mes

### Archivos a Modificar
1. `backend/src/services/analytics.service.ts`
2. `backend/src/services/yearly-summary.service.ts`
3. Monthly View (pendiente de revisar)

---

**Estado:** ✅ ANÁLISIS COMPLETADO  
**Próximo paso:** Esperar confirmación para implementar

**¿Procedo con la implementación?**
