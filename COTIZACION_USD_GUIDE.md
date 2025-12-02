# 📊 Guía de Cotización USD en Monthly

## 🎯 Objetivo
Mostrar correctamente los totales USD en la vista mensual, sumando los valores USD reales de las transacciones en lugar de hacer conversiones incorrectas.

## 🔍 Problema Identificado
- **Comportamiento incorrecto**: Total USD = Total ARS ÷ 1000 (cotización fija incorrecta)
- **Comportamiento correcto**: Total USD = Suma de todos los `amountUsd` de las transacciones

## 📋 Lógica de Cotización por Período

### 🕐 **Meses Pasados (Históricos)**
- **Fuente**: Base de datos (tabla `ExchangeRate`)
- **Cotización**: Último día del mes correspondiente
- **Razón**: Cotización "congelada" del cierre del mes
- **Ejemplo**: Octubre 2025 → Cotización del 31/10/2025

### 📅 **Mes Actual**
- **Fuente**: API del dólar (cotización actual)
- **Cotización**: Se actualiza en tiempo real
- **Comportamiento**: Cambia durante el mes según API
- **Al finalizar**: Se "congela" la cotización del último día

### 🔮 **Meses Futuros**
- **Fuente**: API del dólar (cotización actual)
- **Cotización**: Misma que el mes actual
- **Razón**: No podemos predecir cotizaciones futuras

## 🏗️ Arquitectura del Sistema

### 📊 **Base de Datos Histórica**
```sql
-- Tabla ExchangeRate
- date: Fecha de la cotización
- rate: Valor del dólar blue
- source: 'historical' | 'api' | 'cron'
```

**Datos disponibles**: Enero 2020 → Presente

### 🤖 **Cron Job Automático**
- **Frecuencia**: Diario a las 20:00
- **Función**: Capturar cotización del día desde API
- **Propósito**: Crear historial propio para consultas futuras

### 🔄 **API Externa**
- **Uso**: Cotización actual del dólar blue
- **Limitación**: No tiene histórico
- **Solución**: Complementamos con nuestra DB histórica

## 💰 Cálculo Correcto de Totales USD

### ✅ **Método Correcto**
```typescript
// Cada transacción ya tiene su amountUsd calculado con la cotización correcta
const totalUSD = transactions.reduce((sum, t) => sum + Number(t.amountUsd), 0)
```

### ❌ **Método Incorrecto (Actual)**
```typescript
// NO HACER: Conversión con cotización fija
const totalUSD = totalARS / 1000  // ❌ Cotización fija incorrecta
```

## 🎯 Implementación en Monthly

### 📊 **Flujo de Datos**
1. **Cargar transacciones** del mes seleccionado
2. **Cada transacción** ya tiene `amountUsd` calculado correctamente
3. **Sumar directamente** los `amountUsd` para obtener total
4. **Mostrar resultado** sin conversiones adicionales

### 🔧 **Código Objetivo**
```typescript
// Totales correctos
const monthIncomeUSD = incomeTransactions.reduce((sum, t) => sum + Number(t.amountUsd), 0)
const monthExpenseUSD = expenseTransactions.reduce((sum, t) => sum + Number(t.amountUsd), 0)

// NO hacer conversiones adicionales
const monthIncomeUSDReal = monthIncomeUSD  // ✅ Usar valor real
const monthExpenseUSDReal = monthExpenseUSD  // ✅ Usar valor real
```

## 🧪 Casos de Prueba

### 📝 **Ejemplo Práctico**
- **Transacciones del mes**:
  - Transacción 1: $80,000 ARS → $55.36 USD (cotización 1445)
- **Total correcto**:
  - ARS: $80,000
  - USD: $55.36 (suma directa)
- **Total incorrecto actual**:
  - USD: $80.00 (80,000 ÷ 1000) ❌

### ✅ **Verificación**
- **Suma manual**: $55.36 USD
- **Sistema debe mostrar**: $55.36 USD
- **NO debe mostrar**: $80.00 USD

## 🚀 Beneficios de la Corrección

### 💡 **Precisión**
- **Totales exactos** basados en cotizaciones reales
- **Sin aproximaciones** ni cotizaciones fijas incorrectas

### 📈 **Consistencia**
- **Valores coherentes** entre transacciones individuales y totales
- **Historial preciso** para análisis financiero

### 🔍 **Transparencia**
- **Trazabilidad** de cada cotización utilizada
- **Auditoría** completa de conversiones USD

## 🛠️ Archivos a Modificar

### 📄 **Frontend**
- `/app/monthly/page.tsx` - Lógica de cálculo de totales
- Eliminar todas las referencias a cotización fija 1000

### 🔧 **Backend** (Ya implementado)
- Cron job para captura diaria
- API endpoints para cotización histórica
- Base de datos con historial completo

## 📋 Checklist de Implementación

- [ ] Eliminar cotización fija 1000
- [ ] Usar suma directa de `amountUsd`
- [ ] Verificar totales en vista mensual
- [ ] Probar con diferentes meses
- [ ] Validar consistencia histórica

---

**🎯 Objetivo Final**: Mostrar totales USD reales basados en las cotizaciones específicas de cada transacción, eliminando por completo cualquier referencia a cotización fija de 1000.
