# 📊 Análisis Completo del Frontend - ContaDash

## 🎯 Objetivo

Este documento contiene un análisis **exhaustivo** de todas las pantallas, componentes, y funcionalidades del frontend web de ContaDash. Cada sección describe en detalle qué hace, cómo funciona, y qué necesitas replicar en mobile.

---

## 📱 Pantallas del Sistema (20 Total)

### **1. 🔐 Pantallas de Autenticación (5)**

#### **1.1 Login (`/login`)**

**Archivo**: `/frontend/src/app/login/page.tsx`

**Funcionalidad**:
- Formulario de inicio de sesión con email y contraseña
- Validación de campos requeridos
- Llamada a API `/api/auth/login`
- Almacenamiento de token JWT en localStorage
- Redirección a `/dashboard` después del login exitoso
- Link a "¿Olvidaste tu contraseña?"
- Link a "Crear cuenta"

**Estados**:
```typescript
const [email, setEmail] = useState('')
const [password, setPassword] = useState('')
const [loading, setLoading] = useState(false)
const [error, setError] = useState('')
```

**API Calls**:
```typescript
// POST /api/auth/login
{
  email: string
  password: string
}

// Response
{
  token: string
  user: {
    id: string
    email: string
    name: string
  }
}
```

**Componentes UI**:
- TextField para email (type="email")
- TextField para password (type="password", secureTextEntry en mobile)
- Button de submit con loading state
- Alert para mostrar errores
- Links de navegación

**Validaciones**:
- Email requerido y formato válido
- Password requerido (mínimo 6 caracteres)

**Mobile Considerations**:
- Usar KeyboardAvoidingView
- Agregar "Recordarme" con AsyncStorage
- Implementar biometría opcional (Face ID/Touch ID)
- Auto-focus en email al abrir

---

#### **1.2 Register (`/register`)**

**Archivo**: `/frontend/src/app/register/page.tsx`

**Funcionalidad**:
- Formulario de registro con nombre, email, contraseña
- Confirmación de contraseña
- Validación de campos
- Llamada a API `/api/auth/register`
- Envío de email de verificación
- Redirección a `/verify-email` con mensaje

**Estados**:
```typescript
const [name, setName] = useState('')
const [email, setEmail] = useState('')
const [password, setPassword] = useState('')
const [confirmPassword, setConfirmPassword] = useState('')
const [loading, setLoading] = useState(false)
const [error, setError] = useState('')
```

**API Calls**:
```typescript
// POST /api/auth/register
{
  name: string
  email: string
  password: string
}

// Response
{
  message: string
  user: {
    id: string
    email: string
    name: string
  }
}
```

**Validaciones**:
- Nombre requerido (mínimo 2 caracteres)
- Email requerido y formato válido
- Password requerido (mínimo 8 caracteres)
- Password debe coincidir con confirmación
- Password debe tener mayúscula, minúscula, número

**Mobile Considerations**:
- Mostrar requisitos de contraseña en tiempo real
- Indicador de fortaleza de contraseña
- Auto-capitalize para nombre
- KeyboardAvoidingView

---

#### **1.3 Forgot Password (`/forgot-password`)**

**Archivo**: `/frontend/src/app/forgot-password/page.tsx`

**Funcionalidad**:
- Formulario con solo email
- Envío de email con link de reset
- Mensaje de confirmación
- Link para volver a login

**Estados**:
```typescript
const [email, setEmail] = useState('')
const [loading, setLoading] = useState(false)
const [success, setSuccess] = useState(false)
const [error, setError] = useState('')
```

**API Calls**:
```typescript
// POST /api/auth/forgot-password
{
  email: string
}

// Response
{
  message: string
}
```

**Mobile Considerations**:
- Mensaje de éxito más prominente
- Timer de 60 segundos para reenviar
- Botón para abrir email app

---

#### **1.4 Reset Password (`/reset-password`)**

**Archivo**: `/frontend/src/app/reset-password/page.tsx`

**Funcionalidad**:
- Recibe token por URL query param
- Formulario con nueva contraseña y confirmación
- Validación del token
- Actualización de contraseña
- Redirección a login

**Estados**:
```typescript
const [token, setToken] = useState('')
const [password, setPassword] = useState('')
const [confirmPassword, setConfirmPassword] = useState('')
const [loading, setLoading] = useState(false)
const [error, setError] = useState('')
```

**API Calls**:
```typescript
// POST /api/auth/reset-password
{
  token: string
  password: string
}

// Response
{
  message: string
}
```

**Mobile Considerations**:
- Deep linking para abrir desde email
- Validación de token al cargar
- Indicador de fortaleza de contraseña

---

#### **1.5 Verify Email (`/verify-email`)**

**Archivo**: `/frontend/src/app/verify-email/page.tsx`

**Funcionalidad**:
- Recibe token por URL query param
- Verificación automática al cargar
- Mensaje de éxito o error
- Botón para reenviar email
- Link a login

**Estados**:
```typescript
const [token, setToken] = useState('')
const [loading, setLoading] = useState(true)
const [verified, setVerified] = useState(false)
const [error, setError] = useState('')
```

**API Calls**:
```typescript
// POST /api/auth/verify-email
{
  token: string
}

// Response
{
  message: string
}
```

**Mobile Considerations**:
- Deep linking desde email
- Animación de éxito
- Auto-redirección a login después de 3 segundos

---

### **2. 📊 Dashboard (`/dashboard`)**

**Archivo**: `/frontend/src/app/dashboard/page.tsx`

**Descripción**: Pantalla principal con resumen ejecutivo del mes actual.

#### **Secciones del Dashboard**:

##### **2.1 Header con Filtros**
- Selector de mes (dropdown con 12 meses)
- Selector de año (dropdown con años disponibles)
- Botón de toggle ARS/USD

**Estados**:
```typescript
const [selectedYear, setSelectedYear] = useState(currentYear)
const [selectedCategoryMonth, setSelectedCategoryMonth] = useState(currentMonth)
const [showUSD, setShowUSD] = useState(false)
```

##### **2.2 Cards de Resumen (4 cards)**

**Card 1: Ingresos del Mes**
- Monto total en ARS
- Monto total en USD
- Porcentaje de cambio vs mes anterior
- Icono de TrendingUp/TrendingDown
- Color verde (#10B981)

**Card 2: Egresos del Mes**
- Monto total en ARS
- Monto total en USD
- Porcentaje de cambio vs mes anterior
- Icono de TrendingUp/TrendingDown
- Color rojo (#EF4444)

**Card 3: Balance del Mes**
- Diferencia Ingresos - Egresos en ARS
- Diferencia en USD
- Porcentaje de cambio
- Color azul (#3B82F6)

**Card 4: Transacciones Totales**
- Número de transacciones del mes
- Desglose: X ingresos, Y egresos
- Color gris (#6B7280)

**API Call**:
```typescript
// GET /api/analytics/dashboard
const response = await analyticsApi.getDashboard()

// Response
{
  currentMonth: {
    income: { ars: number, usd: number },
    expense: { ars: number, usd: number },
    balance: { ars: number, usd: number },
    transactionCount: number
  },
  previousMonth: {
    income: { ars: number, usd: number },
    expense: { ars: number, usd: number }
  },
  percentageChange: {
    income: number,
    expense: number,
    balance: number
  }
}
```

##### **2.3 Gráfico de Evolución Mensual**

**Tipo**: Gráfico de líneas (Chart.js)

**Datos**:
- Eje X: Meses del año (Ene, Feb, Mar, ...)
- Eje Y: Montos en ARS o USD
- 3 líneas:
  - Ingresos (verde)
  - Egresos (rojo)
  - Balance (azul)

**Características**:
- Toggle para cambiar entre ARS y USD
- Tooltips al hacer hover
- Leyenda interactiva
- Responsive

**Estados**:
```typescript
const [chartData, setChartData] = useState({
  labels: string[],
  datasets: [{
    label: 'Ingresos',
    data: number[],
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)'
  }, {
    label: 'Egresos',
    data: number[],
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)'
  }, {
    label: 'Balance',
    data: number[],
    borderColor: '#3B82F6',
    backgroundColor: 'rgba(59, 130, 246, 0.1)'
  }]
})
```

**API Call**:
```typescript
// GET /api/analytics/monthly-evolution?year=2025
const response = await analyticsApi.getMonthlyEvolution(year)

// Response
{
  months: string[],
  income: number[],
  expense: number[],
  balance: number[]
}
```

**Mobile Adaptation**:
- Usar Victory Native Charts
- Gráfico más compacto
- Scroll horizontal si es necesario
- Simplificar tooltips (tap en lugar de hover)

##### **2.4 Sección: Categorías y Tarjetas de Crédito**

**Layout**: Grid de 2 columnas

**Columna Izquierda: Categorías por Mes**

**Header**:
- Título: "Categorías por Mes"
- Select para tipo: Ingresos / Egresos

**Contenido**:
- Lista de categorías con:
  - Icono de color
  - Nombre de categoría
  - Monto total
  - Número de transacciones
- Paginación (5 categorías por página)
- Botones de navegación (anterior/siguiente)

**Estados**:
```typescript
const [categoryType, setCategoryType] = useState<'INCOME' | 'EXPENSE'>('INCOME')
const [categoryData, setCategoryData] = useState<any[]>([])
const [categoryPage, setCategoryPage] = useState(0)
const [categoryLoading, setCategoryLoading] = useState(false)
```

**API Call**:
```typescript
// GET /api/categories
const categories = await categoriesApi.getAll()

// GET /api/transactions?month=12&year=2025&categoryId=xxx
const transactions = await transactionsApi.getAll({
  month: selectedMonth,
  year: selectedYear,
  categoryId: category.id
})

// Calcular totales por categoría
const categoryTotals = categories.map(cat => ({
  id: cat.id,
  name: cat.name,
  color: cat.color,
  icon: cat.icon,
  total: transactions
    .filter(t => t.categoryId === cat.id)
    .reduce((sum, t) => sum + t.amountArs, 0),
  count: transactions.filter(t => t.categoryId === cat.id).length
}))
```

**Columna Derecha: Tarjetas de Crédito**

**Diseño**: Estilo Apple Wallet (cards apiladas)

**Características**:
- Cards apiladas con efecto 3D
- Hover para expandir
- Colores por banco
- Información mostrada:
  - Nombre del banco
  - Nombre de la tarjeta
  - Últimos 4 dígitos
  - Saldo disponible / límite
  - Día de cierre / vencimiento

**Estados**:
```typescript
const [creditCards, setCreditCards] = useState<any[]>([])
const [cardsLoading, setCardsLoading] = useState(false)
```

**API Call**:
```typescript
// GET /api/credit-cards
const cards = await creditCardsApi.getAll()

// Response
[{
  id: string
  name: string
  bank: string
  lastFourDigits: string
  creditLimit: number
  closingDay: number
  dueDay: number
  isActive: boolean
}]
```

**Mobile Adaptation**:
- Carousel horizontal para tarjetas
- Swipe entre tarjetas
- Tap para ver detalles
- Animaciones suaves

##### **2.5 Últimas Transacciones**

**Tabla con columnas**:
- Fecha
- Tipo (Ingreso/Egreso)
- Categoría
- Descripción
- Monto ARS
- Monto USD

**Características**:
- Paginación (10 transacciones por página)
- Filtro por tipo
- Ordenamiento por fecha (desc)
- Click en fila para ver detalles

**Estados**:
```typescript
const [transactions, setTransactions] = useState<any[]>([])
const [transactionPage, setTransactionPage] = useState(0)
```

**API Call**:
```typescript
// GET /api/transactions?month=12&year=2025&limit=10&page=1
const response = await transactionsApi.getAll({
  month: selectedMonth,
  year: selectedYear,
  limit: 10,
  page: transactionPage + 1
})
```

**Mobile Adaptation**:
- Convertir tabla a FlatList
- Cards compactas por transacción
- Pull-to-refresh
- Infinite scroll

##### **2.6 Componentes Adicionales**

**PeriodComparison Component**:
- Comparación mes actual vs anterior
- Gráfico de barras comparativo
- Porcentajes de cambio

**ProjectionsChart Component**:
- Proyección de ingresos/egresos
- Basado en promedio de últimos 3 meses
- Gráfico de líneas con área sombreada

**Mobile Considerations para Dashboard**:
- Scroll vertical para todas las secciones
- Cards más compactas
- Gráficos simplificados
- Tabs en lugar de grid de 2 columnas
- Bottom sheet para filtros
- Pull-to-refresh en toda la pantalla

---

### **3. 📅 Vista Mensual (`/monthly`)**

**Archivo**: `/frontend/src/app/monthly/page.tsx`

**Descripción**: Pantalla más compleja del sistema. Gestión completa de transacciones del mes.

#### **Estructura de la Pantalla**:

##### **3.1 Header Superior**

**Elementos**:
- Título: "Movimientos"
- Subtítulo: "Resumen detallado por mes y año"
- Botones de acción:
  - "Transacciones Recurrentes" (abre modal)
  - "Historial de Transacciones" (abre modal)
- Selector de año (dropdown)

**Estados**:
```typescript
const [year, setYear] = useState(currentYear)
const [month, setMonth] = useState(currentMonth)
const [recurringModalOpen, setRecurringModalOpen] = useState(false)
const [historyModalOpen, setHistoryModalOpen] = useState(false)
```

##### **3.2 Cards de Resumen Anual (3 cards)**

**Card 1: Ingresos [Año]**
- Total de ingresos del año en ARS
- Total en USD (usando cotización actual de la API)
- Color verde

**Card 2: Egresos [Año]**
- Total de egresos del año en ARS
- Total en USD (usando cotización actual de la API)
- Color morado

**Card 3: Balance [Año]**
- Diferencia Ingresos - Egresos en ARS
- Diferencia en USD
- Color azul

**API Call**:
```typescript
// GET /api/transactions/stats?year=2025
const yearData = await transactionsApi.getStats(undefined, year)

// Response
{
  income: { ars: number, usd: number },
  expense: { ars: number, usd: number },
  balance: { ars: number, usd: number },
  count: number
}
```

**IMPORTANTE - Sistema de Cotizaciones**:
```typescript
// Obtener cotización actual de la API para resumen anual
const currentApiRate = await exchangeApi.getDolarBlue()

// Los totales USD de las cards anuales se calculan:
const incomeUSD = yearSummary.income.ars / currentApiRate
const expenseUSD = yearSummary.expense.ars / currentApiRate
const balanceUSD = yearSummary.balance.ars / currentApiRate
```

##### **3.3 Navegación de Meses (12 tabs)**

**Diseño**: Tabs horizontales con scroll

**Meses**:
- Enero, Febrero, Marzo, Abril, Mayo, Junio
- Julio, Agosto, Septiembre, Octubre, Noviembre, Diciembre

**Características**:
- Tab activo destacado
- Scroll horizontal
- Click para cambiar de mes
- Indicador visual del mes actual

**Estados**:
```typescript
const [selectedMonth, setSelectedMonth] = useState(currentMonth)
```

**Mobile Adaptation**:
- Tabs más compactas
- Swipe entre meses
- Indicador de mes actual más prominente

##### **3.4 Cartelito de Cotización del Dólar**

**CRÍTICO**: Este componente es fundamental para el sistema.

**Contenido**:
- Título: "Cotización Dólar Blue"
- Monto: $1,435.00 (ejemplo)
- Fecha: "Última actualización: 01/12/2025" o "Cotización de cierre: 31/10/2025"

**Lógica de Cotización**:
```typescript
const [currentDolarRate, setCurrentDolarRate] = useState<number>(1000)

const loadDolarRate = async () => {
  const today = new Date()
  const selectedDate = new Date(year, month - 1, 1)
  
  // Determinar si es mes actual o futuro
  const isCurrentOrFutureMonth = 
    year > today.getFullYear() || 
    (year === today.getFullYear() && month >= today.getMonth() + 1)
  
  if (isCurrentOrFutureMonth) {
    // Mes actual o futuro: usar cotización actual de la API
    const rate = await exchangeApi.getDolarBlue()
    setCurrentDolarRate(rate)
  } else {
    // Mes pasado: usar cotización histórica del último día del mes
    const lastDayOfMonth = new Date(year, month, 0)
    const dateStr = lastDayOfMonth.toISOString().split('T')[0]
    const rate = await exchangeApi.getDolarBlueForDate(dateStr)
    setCurrentDolarRate(rate)
  }
}

useEffect(() => {
  loadDolarRate()
}, [year, month])
```

**APIs de Cotización**:
```typescript
// API 1: Cotización actual
// GET /api/exchange/dolar-blue
{
  rate: number,
  date: string,
  source: string
}

// API 2: Cotización histórica
// GET /api/exchange/dolar-blue/date/:date
{
  rate: number,
  date: string,
  source: string
}
```

**Texto del Cartelito**:
- **Mes actual/futuro**: "Última actualización: [fecha actual]"
- **Mes pasado**: "Cotización de cierre: [último día del mes]"

##### **3.5 Sección de Ingresos**

**Header**:
- Título: "Ingresos"
- Botón: "+ Agregar Ingreso" (abre modal)

**Tabla de Ingresos**:

**Columnas**:
1. Fecha (formato: DD/MM/YYYY)
2. Cliente (nombre o "-")
3. Categoría (con icono de color)
4. Descripción
5. ARS (monto en pesos)
6. USD (calculado como: ARS / currentDolarRate)
7. Cotización (cotización específica de la transacción)
8. Acciones (editar/eliminar)

**IMPORTANTE - Cálculo de USD en Tabla**:
```typescript
// Cada fila muestra:
<TableCell>{formatUSD(transaction.amountArs / currentDolarRate)}</TableCell>
<TableCell>${Number(transaction.exchangeRate).toFixed(2)}</TableCell>

// NO usar transaction.amountUsd en la tabla
// Usar el cálculo en tiempo real con currentDolarRate del cartelito
```

**Fila de Totales**:
- Total ARS: Suma de todos los amountArs
- Total USD: Suma de todos los amountUsd (valores reales de las transacciones)
- Cotización: Promedio ponderado

**IMPORTANTE - Total USD**:
```typescript
// El total USD se calcula sumando los USD reales de cada transacción
const totalIncomeUSD = incomeTransactions.reduce(
  (sum, t) => sum + Number(t.amountUsd), 
  0
)

// NO dividir el total ARS por la cotización del cartelito
```

**Estados**:
```typescript
const [incomeTransactions, setIncomeTransactions] = useState<any[]>([])
const [incomeDialogOpen, setIncomeDialogOpen] = useState(false)
const [editingTransaction, setEditingTransaction] = useState<any>(null)
```

**API Calls**:
```typescript
// GET /api/transactions?month=12&year=2025&type=INCOME
const incomes = await transactionsApi.getAll({
  month: selectedMonth,
  year: selectedYear,
  type: 'INCOME'
})
```

##### **3.6 Sección de Egresos**

**Estructura idéntica a Ingresos**, pero:
- Color rojo en lugar de verde
- Categorías de tipo EXPENSE
- Sin columna de Cliente
- Puede tener columna de Tarjeta de Crédito o Método de Pago

**Columnas**:
1. Fecha
2. Categoría
3. Descripción
4. Método de Pago (Efectivo, MercadoPago, Banco, Crypto)
5. ARS
6. USD (calculado como: ARS / currentDolarRate)
7. Cotización
8. Acciones

**Fila de Totales**: Igual que ingresos

##### **3.7 Cards de Resumen Mensual (3 cards)**

**Ubicación**: Debajo de las tablas

**Card 1: Ingresos [Mes]**
- Total de ingresos del mes en ARS
- Total en USD (calculado como: ARS / currentDolarRate)
- Color verde

**Card 2: Egresos [Mes]**
- Total de egresos del mes en ARS
- Total en USD (calculado como: ARS / currentDolarRate)
- Color morado

**Card 3: Balance [Mes]**
- Diferencia Ingresos - Egresos en ARS
- Diferencia en USD (calculado)
- Color azul

**IMPORTANTE - Cálculo de USD en Cards Mensuales**:
```typescript
// Las cards mensuales usan el currentDolarRate del cartelito
const monthIncomeUSD = monthIncome / currentDolarRate
const monthExpenseUSD = monthExpense / currentDolarRate
const monthBalanceUSD = monthIncomeUSD - monthExpenseUSD
```

##### **3.8 Modales de Transacciones**

**Modal de Ingreso** (`IncomeTransactionDialog.tsx`):

**Campos**:
1. **Fecha** (DatePicker)
   - Por defecto: fecha actual
   - Formato: YYYY-MM-DD
   - Al cambiar fecha, recalcula cotización automáticamente

2. **Cliente** (Select)
   - Lista de clientes activos
   - Opcional
   - Permite crear nuevo cliente inline

3. **Categoría** (Select)
   - Solo categorías de tipo INCOME
   - Requerido
   - Muestra icono y color

4. **Descripción** (TextField)
   - Requerido
   - Máximo 200 caracteres

5. **Monto ARS** (NumberField)
   - Requerido
   - Formato: $1,234.56
   - Mínimo: 0.01

6. **Cotización** (NumberField)
   - Auto-calculado según fecha
   - Editable manualmente
   - Formato: $1,234.56

7. **Monto USD** (NumberField)
   - Auto-calculado: ARS / Cotización
   - Read-only
   - Formato: $1,234.56

8. **Método de Pago** (Select)
   - Efectivo, MercadoPago, Cuenta Bancaria, Crypto
   - Si es Cuenta Bancaria, mostrar select de cuentas

9. **Cuenta Bancaria** (Select - condicional)
   - Solo si método = Cuenta Bancaria
   - Filtrado por moneda (ARS o USD según cotización)

10. **Notas** (TextArea)
    - Opcional
    - Máximo 500 caracteres

11. **Adjuntos** (FileUpload)
    - Opcional
    - Imágenes o PDFs
    - Máximo 5MB por archivo

**Lógica de Cotización Automática**:
```typescript
const loadExchangeRate = async (date: string) => {
  const today = new Date()
  const transactionDate = new Date(date)
  
  const isCurrentOrFutureMonth = 
    transactionDate.getFullYear() > today.getFullYear() || 
    (transactionDate.getFullYear() === today.getFullYear() && 
     transactionDate.getMonth() >= today.getMonth())
  
  if (isCurrentOrFutureMonth) {
    // Usar cotización actual
    const rate = await exchangeApi.getDolarBlue()
    setValue('exchangeRate', rate)
  } else {
    // Usar cotización histórica del último día del mes
    const lastDay = new Date(
      transactionDate.getFullYear(),
      transactionDate.getMonth() + 1,
      0
    )
    const dateStr = lastDay.toISOString().split('T')[0]
    const rate = await exchangeApi.getDolarBlueForDate(dateStr)
    setValue('exchangeRate', rate)
  }
}

// Recalcular USD cuando cambia ARS o Cotización
useEffect(() => {
  const ars = watch('amountArs')
  const rate = watch('exchangeRate')
  if (ars && rate) {
    setValue('amountUsd', ars / rate)
  }
}, [watch('amountArs'), watch('exchangeRate')])
```

**Validaciones**:
```typescript
const schema = z.object({
  date: z.string().min(1, 'Fecha requerida'),
  categoryId: z.string().min(1, 'Categoría requerida'),
  description: z.string().min(1, 'Descripción requerida'),
  amountArs: z.number().min(0.01, 'Monto debe ser mayor a 0'),
  exchangeRate: z.number().min(0.01, 'Cotización debe ser mayor a 0'),
  amountUsd: z.number(),
  clientId: z.string().optional(),
  paymentMethod: z.enum(['CASH', 'MERCADOPAGO', 'BANK_ACCOUNT', 'CRYPTO']),
  bankAccountId: z.string().optional(),
  notes: z.string().optional()
})
```

**API Call**:
```typescript
// POST /api/transactions
{
  date: string,
  type: 'INCOME',
  categoryId: string,
  clientId?: string,
  description: string,
  amountArs: number,
  amountUsd: number,
  exchangeRate: number,
  paymentMethod: string,
  bankAccountId?: string,
  notes?: string,
  attachmentUrl?: string
}
```

**Modal de Egreso** (`ExpenseTransactionDialog.tsx`):

**Diferencias con Ingreso**:
- No tiene campo de Cliente
- Categorías de tipo EXPENSE
- Puede tener Tarjeta de Crédito
- Puede tener Método de Pago específico

**Campos adicionales**:
- **Tarjeta de Crédito** (Select - opcional)
- **Cuotas** (Number - si hay tarjeta)

**Mobile Considerations para Modales**:
- Usar bottom sheet en lugar de modal centrado
- Scroll vertical para todos los campos
- DatePicker nativo de cada plataforma
- NumberPad para campos numéricos
- Botón de cámara para adjuntos
- Validación en tiempo real
- Guardar como borrador automáticamente

##### **3.9 Funcionalidades Adicionales**

**Editar Transacción**:
- Click en icono de editar
- Abre modal con datos pre-cargados
- Permite modificar todos los campos
- PUT /api/transactions/:id

**Eliminar Transacción**:
- Click en icono de eliminar
- Confirmación con dialog
- DELETE /api/transactions/:id

**Filtros**:
- Por tipo (Ingreso/Egreso/Todos)
- Por categoría
- Por cliente
- Por rango de fechas
- Por monto (min/max)

**Búsqueda**:
- Por descripción
- Por monto
- Por categoría

**Exportar**:
- Excel
- PDF
- CSV

**Mobile Considerations para Vista Mensual**:
- Tabs para separar Ingresos y Egresos
- FlatList con pull-to-refresh
- Swipe para editar/eliminar
- FAB para agregar transacción
- Bottom sheet para filtros
- Cartelito de cotización sticky en top
- Cards de resumen colapsables

---

### **4. 📈 Analytics (`/analytics`)**

**Archivo**: `/frontend/src/app/analytics/page.tsx`

**Descripción**: Pantalla de análisis avanzado con múltiples gráficos y reportes.

#### **Estructura**:

##### **4.1 Header con Filtros**

**Filtros disponibles**:
- Período: 3, 6, 12, 24 meses
- Año específico: 2024, 2025, 2026

**Tabs de Análisis (5)**:
1. Evolución por Categorías
2. Ingresos por Clientes
3. Consumos por Tarjetas
4. Comparativo Anual
5. Alertas y Anomalías

##### **4.2 Tab 1: Evolución por Categorías**

**Gráfico**: Líneas múltiples

**Datos**:
- Eje X: Meses
- Eje Y: Montos
- Una línea por categoría (máximo 8)
- Colores dinámicos por categoría
- Líneas punteadas para egresos

**Características**:
- Leyenda interactiva (click para ocultar/mostrar)
- Tooltips con detalles
- Zoom y pan
- Exportar imagen

**API Call**:
```typescript
// GET /api/analytics/category-evolution?period=12
const data = await analyticsApi.getCategoryEvolution(period)

// Response
{
  labels: string[],
  datasets: [{
    label: string,
    data: number[],
    borderColor: string,
    type: 'INCOME' | 'EXPENSE'
  }]
}
```

##### **4.3 Tab 2: Ingresos por Clientes**

**Gráfico**: Líneas por cliente

**Datos**:
- Evolución mensual de ingresos por cliente
- Top 10 clientes
- Comparación entre clientes

**Características**:
- Filtro por cliente
- Suma total por cliente
- Porcentaje del total

**API Call**:
```typescript
// GET /api/analytics/client-income?period=12
const data = await analyticsApi.getClientIncome(period)
```

##### **4.4 Tab 3: Consumos por Tarjetas**

**Gráfico**: Barras apiladas

**Datos**:
- Gastos mensuales por tarjeta
- Comparación con límite de crédito
- Alertas de sobre-gasto

**API Call**:
```typescript
// GET /api/analytics/card-spending?period=12
const data = await analyticsApi.getCardSpending(period)
```

##### **4.5 Tab 4: Comparativo Anual**

**Gráficos**: Barras comparativas

**Datos**:
- Año actual vs año anterior
- Por mes
- Por categoría
- Porcentajes de crecimiento

**API Call**:
```typescript
// GET /api/analytics/year-comparison?year=2025
const data = await analyticsApi.getYearComparison(year)
```

##### **4.6 Tab 5: Alertas y Anomalías**

**Lista de alertas**:
- Transacciones inusuales (>3 desviaciones estándar)
- Gastos excesivos
- Categorías con aumento significativo
- Presupuestos excedidos

**Características**:
- Severidad: Alta, Media, Baja
- Fecha de detección
- Descripción del problema
- Acción sugerida

**API Call**:
```typescript
// GET /api/analytics/anomalies?period=12
const data = await analyticsApi.getAnomalies(period)

// Response
[{
  id: string,
  date: string,
  type: string,
  severity: 'high' | 'medium' | 'low',
  description: string,
  amount: number,
  category: string,
  suggestion: string
}]
```

**Mobile Considerations para Analytics**:
- Tabs horizontales con scroll
- Gráficos simplificados
- Tap para ver detalles
- Scroll horizontal en gráficos anchos
- Bottom sheet para filtros
- Exportar como imagen o PDF

---

### **5. 💰 Presupuestos (`/budgets`)**

**Archivo**: `/frontend/src/app/budgets/page.tsx`

**Descripción**: Gestión de presupuestos mensuales por categoría.

#### **Funcionalidades**:

##### **5.1 Lista de Presupuestos**

**Vista**: Grid de cards

**Cada card muestra**:
- Categoría (icono y nombre)
- Mes y año
- Presupuesto: $100,000
- Gastado: $75,000
- Restante: $25,000
- Barra de progreso (75%)
- Estado: OK / Alerta / Excedido

**Colores**:
- Verde: < 70%
- Amarillo: 70-90%
- Naranja: 90-100%
- Rojo: > 100%

**Estados**:
```typescript
const [budgets, setBudgets] = useState<any[]>([])
const [selectedMonth, setSelectedMonth] = useState(currentMonth)
const [selectedYear, setSelectedYear] = useState(currentYear)
const [dialogOpen, setDialogOpen] = useState(false)
```

**API Call**:
```typescript
// GET /api/budgets?month=12&year=2025
const budgets = await budgetsApi.getAll(month, year)

// Response
[{
  id: string,
  categoryId: string,
  category: {
    id: string,
    name: string,
    icon: string,
    color: string
  },
  month: number,
  year: number,
  amountArs: number,
  amountUsd: number,
  spent: number,
  remaining: number,
  percentage: number
}]
```

##### **5.2 Crear/Editar Presupuesto**

**Modal con campos**:
1. Categoría (Select)
2. Mes (Select)
3. Año (Select)
4. Monto ARS (Number)
5. Monto USD (Number - auto-calculado)

**Validaciones**:
- Categoría requerida
- Mes y año requeridos
- Monto > 0
- No duplicar presupuesto para misma categoría/mes/año

**API Calls**:
```typescript
// POST /api/budgets
{
  categoryId: string,
  month: number,
  year: number,
  amountArs: number,
  amountUsd: number
}

// PUT /api/budgets/:id
{
  amountArs: number,
  amountUsd: number
}

// DELETE /api/budgets/:id
```

##### **5.3 Alertas de Presupuesto**

**Notificaciones cuando**:
- Se alcanza el 70% del presupuesto
- Se alcanza el 90% del presupuesto
- Se excede el 100% del presupuesto

**Mobile Considerations**:
- Grid de 1 columna en móvil
- Swipe para editar/eliminar
- FAB para crear presupuesto
- Push notifications para alertas
- Gráfico circular de progreso

---

### **6. 📊 Reportes (`/reports`)**

**Archivo**: `/frontend/src/app/reports/page.tsx`

**Descripción**: Generación y exportación de reportes personalizados.

#### **Tipos de Reportes**:

##### **6.1 Reporte de Ingresos**

**Filtros**:
- Rango de fechas
- Cliente
- Categoría
- Método de pago

**Contenido**:
- Lista de transacciones
- Totales por categoría
- Totales por cliente
- Gráficos de distribución

**Exportar**:
- PDF
- Excel
- CSV

##### **6.2 Reporte de Egresos**

**Filtros**:
- Rango de fechas
- Categoría
- Tarjeta de crédito
- Método de pago

**Contenido**:
- Lista de transacciones
- Totales por categoría
- Totales por tarjeta
- Gráficos de distribución

##### **6.3 Reporte de Balance**

**Contenido**:
- Resumen mensual
- Ingresos vs Egresos
- Balance acumulado
- Proyecciones

##### **6.4 Reporte de Impuestos**

**Contenido**:
- Ingresos gravados
- Gastos deducibles
- Cálculo de impuestos
- Documentación de respaldo

**API Call**:
```typescript
// POST /api/reports/generate
{
  type: 'income' | 'expense' | 'balance' | 'tax',
  startDate: string,
  endDate: string,
  filters: {
    categoryId?: string,
    clientId?: string,
    creditCardId?: string
  },
  format: 'pdf' | 'excel' | 'csv'
}

// Response
{
  url: string,
  filename: string,
  size: number
}
```

**Mobile Considerations**:
- Formulario de filtros en bottom sheet
- Preview del reporte antes de exportar
- Compartir directamente desde la app
- Guardar en Files app (iOS) o Downloads (Android)

---

### **7. ⚙️ Configuración (`/settings`)**

**Archivo**: `/frontend/src/app/settings/page.tsx`

**Descripción**: Configuración de datos maestros en tabs.

#### **Tabs de Configuración (4)**:

##### **7.1 Tab: Categorías**

**Componente**: `CategoriesTab.tsx`

**Funcionalidades**:
- Lista de categorías de ingresos y egresos
- Crear nueva categoría
- Editar categoría existente
- Eliminar categoría (si no tiene transacciones)
- Cambiar color e icono

**Campos de Categoría**:
1. Nombre (requerido)
2. Tipo: Ingreso / Egreso (requerido)
3. Color (color picker)
4. Icono (emoji picker)
5. Activa (switch)

**API Calls**:
```typescript
// GET /api/categories
const categories = await categoriesApi.getAll()

// POST /api/categories
{
  name: string,
  type: 'INCOME' | 'EXPENSE',
  color: string,
  icon: string
}

// PUT /api/categories/:id
{
  name?: string,
  color?: string,
  icon?: string,
  isActive?: boolean
}

// DELETE /api/categories/:id
```

##### **7.2 Tab: Clientes**

**Componente**: `ClientsTab.tsx`

**Funcionalidades**:
- Lista de clientes
- Crear nuevo cliente
- Editar cliente
- Desactivar cliente
- Ver historial de transacciones

**Campos de Cliente**:
1. Nombre/Empresa (requerido)
2. Email (opcional)
3. Teléfono (opcional)
4. Responsable (opcional)
5. Activo (switch)

**API Calls**:
```typescript
// GET /api/clients
const clients = await clientsApi.getAll()

// POST /api/clients
{
  company: string,
  email?: string,
  phone?: string,
  responsible?: string
}

// PUT /api/clients/:id
{
  company?: string,
  email?: string,
  phone?: string,
  responsible?: string,
  active?: boolean
}

// DELETE /api/clients/:id
```

##### **7.3 Tab: Tarjetas de Crédito**

**Componente**: `CreditCardsTab.tsx`

**Funcionalidades**:
- Lista de tarjetas
- Crear nueva tarjeta
- Editar tarjeta
- Desactivar tarjeta
- Ver consumos del mes

**Campos de Tarjeta**:
1. Nombre (requerido)
2. Banco (requerido)
3. Últimos 4 dígitos (requerido)
4. Límite de crédito (opcional)
5. Día de cierre (1-31)
6. Día de vencimiento (1-31)
7. Activa (switch)

**API Calls**:
```typescript
// GET /api/credit-cards
const cards = await creditCardsApi.getAll()

// POST /api/credit-cards
{
  name: string,
  bank: string,
  lastFourDigits: string,
  creditLimit?: number,
  closingDay: number,
  dueDay: number
}

// PUT /api/credit-cards/:id
{
  name?: string,
  creditLimit?: number,
  closingDay?: number,
  dueDay?: number,
  isActive?: boolean
}

// DELETE /api/credit-cards/:id
```

##### **7.4 Tab: Cuentas Bancarias**

**Componente**: `BankAccountsTab.tsx`

**Funcionalidades**:
- Lista de cuentas bancarias
- Crear nueva cuenta
- Editar cuenta
- Desactivar cuenta
- Ver movimientos

**Campos de Cuenta**:
1. Nombre (requerido)
2. Banco (requerido)
3. Tipo: Caja de Ahorro / Cuenta Corriente / Inversión (requerido)
4. Número de cuenta (requerido)
5. Moneda: ARS / USD (requerido)
6. Saldo (opcional)
7. Activa (switch)

**API Calls**:
```typescript
// GET /api/bank-accounts
const accounts = await bankAccountsApi.getAll()

// POST /api/bank-accounts
{
  name: string,
  bank: string,
  accountType: 'SAVINGS' | 'CHECKING' | 'INVESTMENT',
  accountNumber: string,
  currency: 'ARS' | 'USD',
  balance?: number
}

// PUT /api/bank-accounts/:id
{
  name?: string,
  balance?: number,
  isActive?: boolean
}

// DELETE /api/bank-accounts/:id
```

**Mobile Considerations para Settings**:
- Tabs en la parte superior
- Swipe entre tabs
- FlatList para cada lista
- Swipe para editar/eliminar
- FAB para crear nuevo
- Bottom sheet para formularios

---

### **8. 🔄 Transacciones Recurrentes (Modal)**

**Componente**: `RecurringTransactionsModal.tsx`

**Descripción**: Gestión de transacciones que se repiten automáticamente.

#### **Funcionalidades**:

##### **8.1 Lista de Recurrentes**

**Columnas**:
- Tipo (Ingreso/Egreso)
- Categoría
- Descripción
- Monto ARS
- Frecuencia (Diaria, Semanal, Mensual, Anual)
- Día del mes
- Fecha inicio
- Fecha fin (opcional)
- Activa (switch)
- Acciones

**Estados**:
```typescript
const [recurring, setRecurring] = useState<any[]>([])
const [dialogOpen, setDialogOpen] = useState(false)
```

**API Call**:
```typescript
// GET /api/recurring-transactions
const recurring = await recurringTransactionsApi.getAll()

// Response
[{
  id: string,
  type: 'INCOME' | 'EXPENSE',
  categoryId: string,
  category: { name: string, icon: string, color: string },
  description: string,
  amountArs: number,
  amountUsd: number,
  exchangeRate: number,
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY',
  dayOfMonth?: number,
  startDate: string,
  endDate?: string,
  isActive: boolean
}]
```

##### **8.2 Crear/Editar Recurrente**

**Campos**:
1. Tipo: Ingreso / Egreso
2. Categoría
3. Cliente (si es ingreso)
4. Descripción
5. Monto ARS
6. Cotización
7. Monto USD (auto-calculado)
8. Frecuencia: Diaria / Semanal / Mensual / Anual
9. Día del mes (si es mensual)
10. Fecha inicio
11. Fecha fin (opcional)
12. Método de pago
13. Cuenta bancaria (si aplica)
14. Notas

**Lógica de Generación**:
- Las transacciones se generan automáticamente cuando se consulta un mes
- Se crean solo si no existen ya
- Usan la cotización del día de generación

**API Calls**:
```typescript
// POST /api/recurring-transactions
{
  type: 'INCOME' | 'EXPENSE',
  categoryId: string,
  clientId?: string,
  description: string,
  amountArs: number,
  amountUsd: number,
  exchangeRate: number,
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY',
  dayOfMonth?: number,
  startDate: string,
  endDate?: string,
  paymentMethod: string,
  bankAccountId?: string,
  notes?: string
}

// PUT /api/recurring-transactions/:id
// DELETE /api/recurring-transactions/:id
```

**Mobile Considerations**:
- Modal full-screen
- Scroll vertical
- DatePicker nativo
- Frequency picker con wheel
- Toggle para activar/desactivar

---

### **9. 📜 Historial de Transacciones (Modal)**

**Componente**: `TransactionHistoryModal.tsx`

**Descripción**: Búsqueda y filtrado avanzado de transacciones.

#### **Funcionalidades**:

##### **9.1 Filtros Avanzados**

**Filtros disponibles**:
- Rango de fechas (desde/hasta)
- Tipo (Ingreso/Egreso/Todos)
- Categoría (multi-select)
- Cliente (multi-select)
- Tarjeta de crédito (multi-select)
- Método de pago (multi-select)
- Monto mínimo
- Monto máximo
- Búsqueda por texto (descripción/notas)

**Estados**:
```typescript
const [filters, setFilters] = useState({
  startDate: '',
  endDate: '',
  type: 'ALL',
  categoryIds: [],
  clientIds: [],
  creditCardIds: [],
  paymentMethods: [],
  minAmount: null,
  maxAmount: null,
  search: ''
})
const [transactions, setTransactions] = useState<any[]>([])
const [page, setPage] = useState(1)
const [totalPages, setTotalPages] = useState(1)
```

**API Call**:
```typescript
// GET /api/transactions?startDate=2025-01-01&endDate=2025-12-31&type=INCOME&...
const response = await transactionsApi.getAll({
  startDate: filters.startDate,
  endDate: filters.endDate,
  type: filters.type !== 'ALL' ? filters.type : undefined,
  categoryId: filters.categoryIds.join(','),
  clientId: filters.clientIds.join(','),
  creditCardId: filters.creditCardIds.join(','),
  paymentMethod: filters.paymentMethods.join(','),
  minAmount: filters.minAmount,
  maxAmount: filters.maxAmount,
  search: filters.search,
  page: page,
  limit: 50
})
```

##### **9.2 Resultados**

**Vista**: Tabla paginada

**Columnas**:
- Fecha
- Tipo
- Categoría
- Cliente/Tarjeta
- Descripción
- ARS
- USD
- Acciones

**Características**:
- Ordenamiento por columna
- Paginación
- Exportar resultados
- Selección múltiple
- Acciones en lote (eliminar, exportar)

**Mobile Considerations**:
- Bottom sheet para filtros
- FlatList con infinite scroll
- Cards compactas
- Swipe para acciones
- Chips para filtros activos
- Pull-to-refresh

---

### **10. 👤 Perfil (`/profile`)**

**Archivo**: `/frontend/src/app/profile/page.tsx`

**Descripción**: Configuración del perfil de usuario.

#### **Secciones**:

##### **10.1 Información Personal**

**Campos**:
- Nombre
- Email (read-only)
- Empresa (opcional)
- Avatar (upload)

**API Call**:
```typescript
// PUT /api/users/profile
{
  name?: string,
  company?: string,
  image?: string
}
```

##### **10.2 Cambiar Contraseña**

**Campos**:
- Contraseña actual
- Nueva contraseña
- Confirmar nueva contraseña

**API Call**:
```typescript
// PUT /api/users/change-password
{
  currentPassword: string,
  newPassword: string
}
```

##### **10.3 Preferencias**

**Opciones**:
- Moneda por defecto (ARS/USD)
- Formato de fecha
- Idioma
- Tema (Claro/Oscuro)
- Notificaciones

##### **10.4 Sesiones Activas**

**Lista de dispositivos**:
- Dispositivo
- Ubicación
- Última actividad
- Cerrar sesión

**Mobile Considerations**:
- Scroll vertical
- Avatar con opción de cámara/galería
- Biometría para cambiar contraseña
- Push notifications settings

---

## 🎨 Componentes Reutilizables

### **Lista Completa de Componentes**:

1. **DashboardLayout** - Layout principal con sidebar y header
2. **IncomeTransactionDialog** - Modal de ingreso
3. **ExpenseTransactionDialog** - Modal de egreso
4. **RecurringTransactionFormDialog** - Modal de recurrente
5. **BudgetFormDialog** - Modal de presupuesto
6. **TransactionSearchFilter** - Filtros de búsqueda
7. **PeriodComparison** - Comparación de períodos
8. **ProjectionsChart** - Gráfico de proyecciones
9. **AttachmentUploader** - Subida de archivos
10. **DocumentViewer** - Visor de documentos
11. **TagInput** - Input de tags
12. **MetadataEditor** - Editor de metadatos
13. **EndRecurringDialog** - Finalizar recurrente
14. **NotificationProvider** - Proveedor de notificaciones
15. **ThemeProvider** - Proveedor de tema
16. **CategoriesTab** - Tab de categorías
17. **ClientsTab** - Tab de clientes
18. **CreditCardsTab** - Tab de tarjetas
19. **BankAccountsTab** - Tab de cuentas
20. **RecurringTransactionsModal** - Modal de recurrentes
21. **TransactionHistoryModal** - Modal de historial
22. **TransactionFormDialog** - Formulario genérico
23. **TransactionFormDialogEnhanced** - Formulario mejorado

---

## 📊 Resumen de Complejidad

### **Por Pantalla**:

| Pantalla | Complejidad | Componentes | APIs | Tiempo Est. |
|----------|-------------|-------------|------|-------------|
| Login | Baja | 1 | 1 | 4h |
| Register | Baja | 1 | 1 | 4h |
| Forgot Password | Baja | 1 | 1 | 2h |
| Reset Password | Baja | 1 | 1 | 2h |
| Verify Email | Baja | 1 | 1 | 2h |
| Dashboard | Alta | 8 | 5 | 40h |
| Monthly | Muy Alta | 12 | 8 | 56h |
| Analytics | Alta | 6 | 4 | 32h |
| Budgets | Media | 4 | 3 | 16h |
| Reports | Media | 5 | 2 | 16h |
| Settings | Media | 8 | 4 | 24h |
| Profile | Baja | 3 | 2 | 8h |
| Recurring Modal | Media | 3 | 3 | 12h |
| History Modal | Media | 4 | 1 | 12h |

**Total Estimado: 230 horas (29 días a 8h/día)**

---

## 🎯 Próximos Pasos

1. Leer el documento de [Arquitectura del Backend](./02_ARQUITECTURA_BACKEND.md)
2. Revisar el [Sistema de Cotizaciones](./04_SISTEMA_COTIZACIONES.md)
3. Comenzar con el [Setup del Proyecto Mobile](./03_SETUP_PROYECTO_MOBILE.md)

---

**Última actualización**: 1 de Diciembre, 2025  
**Versión**: 1.0.0
