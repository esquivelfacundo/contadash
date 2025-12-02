# 📊 Análisis Completo - Página de Movimientos (Monthly)

## 🎯 Funcionalidades Principales

### 1. **Navegación Temporal**
- ✅ Selector de año (últimos 6 años)
- ✅ Tabs de meses (12 meses scrolleables)
- ✅ Navegación fluida entre períodos

### 2. **Resúmenes y Totales**
- ✅ **Resumen Anual** (3 cards):
  - Ingresos del año (ARS + USD)
  - Egresos del año (ARS + USD)
  - Balance del año (ARS + USD)
- ✅ **Resumen Mensual** (4 cards):
  - Ingresos del mes (ARS + USD con cotización)
  - Egresos del mes (ARS + USD con cotización)
  - Balance del mes (ARS + USD con cotización)
  - Cantidad de transacciones

### 3. **Cotización del Dólar**
- ✅ Card informativa con cotización actual/histórica
- ✅ Lógica inteligente:
  - Mes actual/futuro → Cotización actual de API
  - Mes pasado → Cotización histórica del cierre del mes
- ✅ Fecha de actualización/cierre mostrada

### 4. **Tablas de Transacciones**
- ✅ **Tabla de Ingresos** con columnas:
  - Fecha
  - Categoría (con icono)
  - Descripción
  - Cliente/Empresa
  - Método de Pago
  - Monto ARS
  - Monto USD
  - Cotización
  - Acciones (Ver documento, Editar, Eliminar)
- ✅ **Tabla de Egresos** (mismas columnas)
- ✅ Fila de totales al final de cada tabla

### 5. **Acciones CRUD**
- ✅ **Crear**: Botones "Nuevo Ingreso" y "Nuevo Egreso"
- ✅ **Editar**: Botón de edición en cada transacción
- ✅ **Eliminar**: Botón de eliminación con confirmación
- ✅ **Ver documento**: Visualizador de archivos adjuntos

### 6. **Modales Especializados**
- ✅ **IncomeTransactionDialog**: Modal para ingresos
- ✅ **ExpenseTransactionDialog**: Modal para egresos
- ✅ **RecurringTransactionsModal**: Gestión de transacciones recurrentes
- ✅ **TransactionHistoryModal**: Historial completo
- ✅ **DocumentViewer**: Visor de comprobantes
- ✅ **Delete Confirmation**: Diálogo de confirmación

### 7. **Métodos de Pago**
- 💵 Efectivo
- 💳 MercadoPago
- 🏦 Cuenta Bancaria (con nombre)
- ₿ Criptomoneda
- 💳 Tarjeta de Crédito (legacy)

### 8. **Sistema de Archivos**
- ✅ Carga de comprobantes
- ✅ Visualización de documentos
- ✅ Indicador visual en tabla

### 9. **Placeholders de Tarjetas**
- ✅ Transacciones placeholder para cuotas de tarjetas
- ✅ No se pueden eliminar (solo editar para crear transacción real)

## 🔌 APIs Utilizadas

### 1. **transactionsApi**
- `getMonthlyWithCreditCards(month, year)` - Obtener transacciones del mes con placeholders
- `getStats(undefined, year)` - Obtener resumen anual
- `delete(id)` - Eliminar transacción

### 2. **exchangeApi**
- `getDolarBlue()` - Cotización actual
- `getDolarBlueForDate(date)` - Cotización histórica

## 📱 Adaptación para Mobile

### Cambios Necesarios:

#### 1. **Layout**
- Reemplazar `DashboardLayout` por estructura mobile
- Header sticky con AppHeader
- FloatingNavBar en la parte inferior

#### 2. **Tablas → Cards/Acordeones**
- Tablas no son mobile-friendly
- Convertir a cards expandibles o lista vertical
- Mantener toda la información visible

#### 3. **Modales**
- Adaptar IncomeTransactionDialog para mobile
- Adaptar ExpenseTransactionDialog para mobile
- Modales fullscreen en mobile

#### 4. **Navegación**
- Tabs horizontales scrolleables (mantener)
- Selector de año adaptado a mobile
- Botones de acción optimizados

#### 5. **Cards de Resumen**
- Scroll horizontal (como en dashboard)
- Tamaños adaptados a mobile
- Gap reducido

## 🎨 Componentes a Crear/Adaptar

### Nuevos:
1. `MonthlyScreen.tsx` - Pantalla principal
2. `TransactionCard.tsx` - Card individual de transacción
3. `TransactionList.tsx` - Lista de transacciones
4. Mobile versions de modales

### Adaptar:
1. `IncomeTransactionDialog` → Mobile version
2. `ExpenseTransactionDialog` → Mobile version
3. `DocumentViewer` → Mobile version

## 📋 Plan de Implementación

### Fase 1: Estructura Base
1. Crear MonthlyScreen.tsx
2. Implementar navegación (año/mes)
3. Implementar cards de resumen

### Fase 2: Transacciones
1. Crear TransactionCard component
2. Implementar listas de ingresos/egresos
3. Conectar con API

### Fase 3: CRUD
1. Adaptar modales de creación/edición
2. Implementar eliminación
3. Implementar visualización de documentos

### Fase 4: Features Avanzadas
1. Transacciones recurrentes
2. Historial completo
3. Sistema de archivos

## ✅ Checklist de Funcionalidades

- [ ] Navegación año/mes
- [ ] Resumen anual (3 cards)
- [ ] Resumen mensual (4 cards)
- [ ] Card de cotización
- [ ] Lista de ingresos
- [ ] Lista de egresos
- [ ] Crear ingreso
- [ ] Crear egreso
- [ ] Editar transacción
- [ ] Eliminar transacción
- [ ] Ver documento adjunto
- [ ] Transacciones recurrentes
- [ ] Historial completo
- [ ] Totales correctos
- [ ] Formato de moneda
- [ ] Estados de carga
- [ ] Manejo de errores
