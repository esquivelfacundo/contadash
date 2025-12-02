# 📋 GUÍA DE IMPLEMENTACIÓN: Balance y Presupuestos Mobile

## 🎯 **OBJETIVO**

Implementar las pantallas de **Balance** y **Presupuestos** en la aplicación mobile, replicando la funcionalidad del frontend desktop.

---

## 📊 **SECCIÓN 1: BALANCE**

### **Funcionalidad Desktop:**
- Muestra balance por método de pago (Efectivo, MercadoPago, Cuentas Bancarias, Crypto)
- Selector de año
- 4 tarjetas de resumen: Total Ingresos, Total Egresos, Balance Total, Métodos de Pago
- Tabla con detalle por método de pago
- Calcula balance considerando saldo inicial de cuentas bancarias

### **Datos Necesarios:**
- Transacciones del año seleccionado
- Cuentas bancarias con sus saldos

### **Componentes a Crear:**
1. **BalanceScreen.tsx** - Pantalla principal
2. Integración con APIs existentes

### **Estructura:**
```typescript
interface PaymentMethodBalance {
  method: string
  label: string
  icon: string
  totalIncome: number
  totalExpense: number
  balance: number
  transactionCount: number
  bankAccount?: any
}
```

### **Lógica Principal:**
1. Cargar transacciones del año
2. Cargar cuentas bancarias
3. Procesar transacciones por método de pago
4. Calcular totales
5. Mostrar en cards y tabla

---

## 💰 **SECCIÓN 2: PRESUPUESTOS**

### **Funcionalidad Desktop:**
- CRUD de presupuestos mensuales por categoría
- Selector de mes/año
- Resumen general (Total presupuestado, Total gastado, Diferencia)
- Cards por presupuesto con barra de progreso
- Estados: OK (verde), Warning (amarillo), Exceeded (rojo)
- Función copiar presupuestos de un mes a otro

### **Datos Necesarios:**
- Presupuestos del mes/año seleccionado
- Categorías de EXPENSE
- Gastos reales del mes

### **Componentes a Crear:**
1. **BudgetsScreen.tsx** - Pantalla principal
2. **BudgetFormModal.tsx** - Modal para crear/editar presupuesto
3. **BudgetCard.tsx** - Card individual de presupuesto
4. API de presupuestos en mobile

### **Estructura:**
```typescript
interface Budget {
  id: string
  categoryId: string
  category: {
    id: string
    name: string
    type: string
  }
  month: number
  year: number
  amount: number
  spent: number
  remaining: number
  percentage: number
  status: 'ok' | 'warning' | 'exceeded'
}
```

---

## 🔧 **PLAN DE IMPLEMENTACIÓN**

### **FASE 1: Balance Screen**
1. ✅ Crear `/src/screens/balance/BalanceScreen.tsx`
2. ✅ Implementar selector de año
3. ✅ Implementar cards de resumen
4. ✅ Implementar lista de métodos de pago
5. ✅ Procesar transacciones por método
6. ✅ Calcular totales

### **FASE 2: Budgets API**
1. ✅ Crear `/src/services/api.ts` - budgetsApi
2. ✅ Endpoints: getAll, getSummary, create, update, delete, copy

### **FASE 3: Budgets Screen**
1. ✅ Crear `/src/screens/budgets/BudgetsScreen.tsx`
2. ✅ Implementar selector de mes/año
3. ✅ Implementar cards de resumen
4. ✅ Implementar lista de presupuestos
5. ✅ Implementar BudgetFormModal
6. ✅ Implementar función copiar

### **FASE 4: Navegación**
1. ✅ Agregar rutas en AppNavigator
2. ✅ Verificar FloatingNavBar funciona en nuevas pantallas

---

## 📝 **ARCHIVOS A CREAR**

### **Balance:**
- `/src/screens/balance/BalanceScreen.tsx`

### **Presupuestos:**
- `/src/screens/budgets/BudgetsScreen.tsx`
- `/src/components/BudgetFormModal.tsx`

### **API:**
- Agregar `budgetsApi` a `/src/services/api.ts`

### **Navegación:**
- Actualizar `/src/navigation/AppNavigator.tsx`

---

## 🎨 **DISEÑO MOBILE**

### **Balance Screen:**
```
┌─────────────────────────────────────┐
│ AppHeader                           │
├─────────────────────────────────────┤
│ [Selector Año: 2025 ▼]             │
├─────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐            │
│ │Ingresos │ │ Egresos │            │
│ │$500,000 │ │$300,000 │            │
│ └─────────┘ └─────────┘            │
│ ┌─────────┐ ┌─────────┐            │
│ │ Balance │ │ Métodos │            │
│ │$200,000 │ │    5    │            │
│ └─────────┘ └─────────┘            │
├─────────────────────────────────────┤
│ 💵 Efectivo                         │
│ Ingresos: $100,000                  │
│ Egresos: $50,000                    │
│ Balance: $50,000                    │
├─────────────────────────────────────┤
│ 🏦 Banco Nación (ARS)               │
│ Ingresos: $300,000                  │
│ Egresos: $200,000                   │
│ Balance: $250,000 (con saldo)       │
├─────────────────────────────────────┤
│ ... más métodos                     │
└─────────────────────────────────────┘
```

### **Budgets Screen:**
```
┌─────────────────────────────────────┐
│ AppHeader                           │
├─────────────────────────────────────┤
│ [Mes: Diciembre ▼] [Año: 2025 ▼]   │
│ [Copiar] [+ Nuevo]                  │
├─────────────────────────────────────┤
│ Presupuestado: $300,000             │
│ Gastado: $250,000                   │
│ Disponible: $50,000                 │
├─────────────────────────────────────┤
│ 🍔 Alimentación                     │
│ ████████░░ 80% ($80,000/$100,000)   │
│ [Editar] [Eliminar]                 │
├─────────────────────────────────────┤
│ 🚗 Transporte                       │
│ ██████████ 100% ($50,000/$50,000)   │
│ [Editar] [Eliminar]                 │
├─────────────────────────────────────┤
│ ... más presupuestos                │
└─────────────────────────────────────┘
```

---

## 🔄 **FLUJOS DE USUARIO**

### **Balance:**
1. Usuario navega a Balance
2. Ve año actual por defecto
3. Puede cambiar año
4. Ve resumen en cards
5. Scroll para ver todos los métodos
6. Cada método muestra ingresos, egresos, balance

### **Presupuestos:**
1. Usuario navega a Presupuestos
2. Ve mes/año actual por defecto
3. Puede cambiar mes/año
4. Ve resumen general
5. Ve lista de presupuestos con progreso
6. Puede crear nuevo presupuesto
7. Puede editar presupuesto existente
8. Puede eliminar presupuesto
9. Puede copiar presupuestos de otro mes

---

## 🧪 **TESTING**

### **Balance:**
- [ ] Carga datos del año actual
- [ ] Cambiar año recarga datos
- [ ] Totales se calculan correctamente
- [ ] Cuentas bancarias muestran saldo inicial
- [ ] Métodos sin transacciones no aparecen
- [ ] Scroll funciona correctamente

### **Presupuestos:**
- [ ] Carga presupuestos del mes actual
- [ ] Cambiar mes/año recarga datos
- [ ] Crear presupuesto funciona
- [ ] Editar presupuesto funciona
- [ ] Eliminar presupuesto funciona
- [ ] Copiar presupuestos funciona
- [ ] Barras de progreso correctas
- [ ] Estados (ok/warning/exceeded) correctos
- [ ] Colores según estado

---

## 📊 **APIS NECESARIAS**

### **Ya Existentes:**
- ✅ `transactionsApi.getAll()` - Para balance
- ✅ `bankAccountsApi.getAll()` - Para balance
- ✅ `categoriesApi.getAll()` - Para presupuestos

### **A Crear:**
- ⚠️ `budgetsApi.getSummary(month, year)` - Resumen de presupuestos
- ⚠️ `budgetsApi.create(data)` - Crear presupuesto
- ⚠️ `budgetsApi.update(id, data)` - Actualizar presupuesto
- ⚠️ `budgetsApi.delete(id)` - Eliminar presupuesto
- ⚠️ `budgetsApi.copy(fromMonth, fromYear, toMonth, toYear)` - Copiar presupuestos

---

## 🎯 **RESULTADO ESPERADO**

Al finalizar la implementación:

1. ✅ **Balance Screen** completamente funcional
   - Selector de año
   - Cards de resumen
   - Lista de métodos de pago
   - Cálculos correctos

2. ✅ **Budgets Screen** completamente funcional
   - Selector de mes/año
   - Cards de resumen
   - Lista de presupuestos con progreso
   - CRUD completo
   - Función copiar

3. ✅ **Navegación** funcionando
   - FloatingNavBar en ambas pantallas
   - AppHeader en ambas pantallas
   - Transiciones suaves

4. ✅ **Integración completa**
   - APIs conectadas
   - Datos reales del backend
   - Errores manejados
   - Loading states

---

**Implementado por**: Cascade AI  
**Fecha**: Diciembre 2025  
**Versión**: 3.0.0 - Balance y Presupuestos Mobile
