# 🔍 DEBUG: Totales USD en Cards de Transacciones

## 🎯 **PROBLEMA REPORTADO**

Los totales USD en los títulos de las cards de Ingresos y Egresos muestran valores calculados con cotización de 1000 en lugar de usar la cotización correcta (histórica de DB o API en tiempo real).

---

## ✅ **CÓDIGO ACTUAL (YA CORRECTO)**

### **Cálculo de Totales USD:**

```typescript
// Lines 222-240
const monthIncomeUSD = incomeTransactions.reduce((sum, t) => {
  return sum + Number(t.amountUsd || 0)
}, 0)

const monthExpenseUSD = expenseTransactions.reduce((sum, t) => {
  return sum + Number(t.amountUsd || 0)
}, 0)
```

**✅ Este código es CORRECTO:**
- Suma directamente `t.amountUsd` de cada transacción
- Cada transacción ya tiene su USD calculado con su cotización específica
- No usa `currentDolarRate` (que puede ser 1000)

---

### **Visualización en Cards:**

```typescript
// Card de Ingresos (línea 541)
<Text style={styles.totalAmountUSD}>
  {formatUSD(monthIncomeUSD)}
</Text>

// Card de Egresos (línea 589)
<Text style={styles.totalAmountUSD}>
  {formatUSD(monthExpenseUSD)}
</Text>
```

**✅ Este código es CORRECTO:**
- Usa `monthIncomeUSD` y `monthExpenseUSD` directamente
- Son las sumas de los valores USD reales

---

## 🔍 **POSIBLES CAUSAS DEL PROBLEMA**

### **1. Backend no devuelve `amountUsd`**

**Verificar:**
```typescript
// Logs agregados en líneas 223-237
console.log('[MonthlyScreen] Income transaction USD:', {
  description: t.description,
  amountArs: t.amountArs,
  amountUsd: t.amountUsd,        // ← Verificar este valor
  exchangeRate: t.exchangeRate    // ← Verificar este valor
})
```

**Si `amountUsd` es undefined o null:**
- El backend no está calculando/devolviendo este campo
- El reduce suma 0 en lugar del valor correcto

---

### **2. Backend calcula `amountUsd` con cotización incorrecta**

**Verificar en backend:**
```typescript
// ¿Cómo se calcula amountUsd?
amountUsd = amountArs / exchangeRate

// ¿De dónde viene exchangeRate?
// - ¿De la transacción guardada? ✅ Correcto
// - ¿De una cotización fija? ❌ Incorrecto
```

---

### **3. Transacciones sin `exchangeRate` guardado**

**Si las transacciones antiguas no tienen `exchangeRate`:**
```typescript
// Backend debería hacer fallback
exchangeRate = transaction.exchangeRate || getDolarBlueForDate(transaction.date)
amountUsd = amountArs / exchangeRate
```

---

## 🧪 **PASOS PARA DEBUGGEAR**

### **1. Verificar Logs en Consola:**

Recarga la app y busca en la consola:

```
[MonthlyScreen] Income transaction USD: {
  description: "Venta X",
  amountArs: 100000,
  amountUsd: ???,           // ← ¿Qué valor tiene?
  exchangeRate: ???         // ← ¿Qué valor tiene?
}

[MonthlyScreen] Totals USD: {
  monthIncomeUSD: ???,      // ← ¿Qué valor tiene?
  monthExpenseUSD: ???,
  monthBalanceUSD: ???
}
```

---

### **2. Escenarios Posibles:**

#### **Escenario A: `amountUsd` es undefined**
```
amountUsd: undefined
exchangeRate: 1445
```
**Causa:** Backend no devuelve `amountUsd`  
**Solución:** Calcular en frontend temporalmente:
```typescript
const monthIncomeUSD = incomeTransactions.reduce((sum, t) => {
  const usd = t.amountUsd || (Number(t.amountArs) / Number(t.exchangeRate || 1000))
  return sum + usd
}, 0)
```

---

#### **Escenario B: `amountUsd` calculado con 1000**
```
amountUsd: 100.00  (100000 / 1000)
exchangeRate: 1445
```
**Causa:** Backend usa cotización fija de 1000  
**Solución:** Corregir backend para usar `exchangeRate` de la transacción

---

#### **Escenario C: `exchangeRate` es 1000**
```
amountUsd: 69.20  (100000 / 1445)
exchangeRate: 1000
```
**Causa:** Transacciones guardadas con `exchangeRate` = 1000  
**Solución:** Migración de datos o recalcular en backend

---

## 📊 **COMPARACIÓN**

### **Valores Esperados:**

```typescript
// Transacción de Diciembre 2025 (mes actual)
amountArs: 100000
exchangeRate: 1445 (API actual)
amountUsd: 69.20  (100000 / 1445)

// Transacción de Enero 2025 (mes pasado)
amountArs: 100000
exchangeRate: 950 (DB histórico)
amountUsd: 105.26  (100000 / 950)
```

### **Valores Incorrectos:**

```typescript
// Si usa cotización fija de 1000
amountArs: 100000
exchangeRate: 1000 (INCORRECTO)
amountUsd: 100.00  (100000 / 1000)
```

---

## 🔧 **SOLUCIÓN TEMPORAL (Frontend)**

Si el backend no devuelve `amountUsd` correctamente, podemos calcularlo en el frontend:

```typescript
const monthIncomeUSD = incomeTransactions.reduce((sum, t) => {
  // Usar amountUsd si existe, sino calcular con exchangeRate
  const usd = t.amountUsd 
    ? Number(t.amountUsd) 
    : Number(t.amountArs) / Number(t.exchangeRate || currentDolarRate)
  
  console.log('[MonthlyScreen] Calculated USD:', {
    description: t.description,
    amountArs: t.amountArs,
    exchangeRate: t.exchangeRate,
    amountUsd: t.amountUsd,
    calculatedUsd: usd
  })
  
  return sum + usd
}, 0)
```

---

## 🎯 **VERIFICACIÓN**

### **Checklist:**

1. ✅ **Frontend calcula correctamente** - Suma `amountUsd` directamente
2. ❓ **Backend devuelve `amountUsd`** - Verificar con logs
3. ❓ **Backend usa `exchangeRate` correcto** - Verificar con logs
4. ❓ **Transacciones tienen `exchangeRate`** - Verificar con logs

---

## 📝 **LOGS AGREGADOS**

### **Ubicación:**
- Líneas 223-237: Logs de cada transacción
- Líneas 242-246: Logs de totales

### **Qué buscar:**
```
1. ¿amountUsd tiene valor o es undefined?
2. ¿exchangeRate es correcto o es 1000?
3. ¿Los totales USD son correctos?
```

---

## 🚀 **PRÓXIMOS PASOS**

1. **Recarga la app** y ve a Monthly screen
2. **Abre la consola** (F12)
3. **Busca los logs** `[MonthlyScreen]`
4. **Verifica los valores** de `amountUsd` y `exchangeRate`
5. **Reporta** qué valores ves en los logs

---

**Con esta información podremos identificar si el problema está en:**
- ❌ Backend no devuelve `amountUsd`
- ❌ Backend calcula mal `amountUsd`
- ❌ Transacciones sin `exchangeRate`
- ✅ Frontend (ya está correcto)

---

**Implementado por**: Cascade AI  
**Fecha**: Diciembre 2025  
**Versión**: 2.6.1 - Debug USD Totals
