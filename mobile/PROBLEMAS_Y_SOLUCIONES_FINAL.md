# 🔧 Problemas y Soluciones - Dashboard Mobile

## ❌ **ERRORES REALES (Requieren Atención):**

### **1. Error de Autenticación (401 Unauthorized)** 🔴
```
POST http://192.168.0.81:3000/api/auth/login 401 (Unauthorized)
```

**Causa**: El backend no está respondiendo correctamente o las credenciales son incorrectas

**Soluciones**:

#### **A. Verificar que el backend esté corriendo:**
```bash
# En la terminal del backend
cd /home/lidius/Documents/contadash
npm run dev

# Debería mostrar:
# Server running on http://localhost:3000
```

#### **B. Verificar la URL del backend:**
```typescript
// mobile/src/constants/api.ts
export const API_BASE_URL = 'http://192.168.0.81:3000/api'

// Verificar que la IP sea correcta
// Puedes probar con:
export const API_BASE_URL = 'http://localhost:3000/api'
```

#### **C. Crear un usuario de prueba:**
```bash
# En el backend, usar Prisma Studio o crear directamente
npx prisma studio

# O crear vía API con Postman/curl
```

---

### **2. Error de Renderizado de Objeto** 🔴
```
Objects are not valid as a React child (found: object with keys {name, color, icon})
```

**Causa**: La API está devolviendo categorías con un formato que incluye `icon`, pero el componente no lo espera, o hay un error al mapear los datos.

**Solución**:

#### **Opción 1: Agregar validación en loadCategories**
```typescript
const loadCategories = async () => {
  try {
    const categoriesResponse = await categoriesApi.getAll(categoryType)
    const allCategories = Array.isArray(categoriesResponse) 
      ? categoriesResponse 
      : (categoriesResponse?.categories || [])
    
    // Validar que allCategories sea un array
    if (!Array.isArray(allCategories)) {
      console.error('Categories is not an array:', allCategories)
      setCategories([])
      return
    }
    
    const transactionsData = await transactionsApi.getAll(selectedCategoryMonth, selectedYear)
    const transactions = transactionsData.transactions || transactionsData || []
    const filteredTransactions = Array.isArray(transactions) 
      ? transactions.filter((t: any) => t.type === categoryType) 
      : []
    
    const categoryTotals: any = {}
    filteredTransactions.forEach((transaction: any) => {
      const categoryId = transaction.category?.id || 'no-category'
      if (!categoryTotals[categoryId]) {
        categoryTotals[categoryId] = { total: 0, count: 0 }
      }
      categoryTotals[categoryId].total += Number(transaction.amountArs) || 0
      categoryTotals[categoryId].count += 1
    })
    
    const categoryArray = allCategories.map((category: any) => {
      const totals = categoryTotals[category.id] || { total: 0, count: 0 }
      return {
        id: category.id || 'unknown',
        name: category.name || 'Sin nombre',
        total: totals.total,
        count: totals.count,
        color: category.color || (categoryType === 'INCOME' ? '#10B981' : '#EF4444')
        // NO incluir icon aquí
      }
    })
    
    categoryArray.sort((a: any, b: any) => 
      b.total !== a.total ? b.total - a.total : a.name.localeCompare(b.name)
    )
    
    setCategories(categoryArray)
  } catch (err) {
    console.error('Error loading categories:', err)
    setCategories([]) // Asegurar que siempre sea un array
  }
}
```

#### **Opción 2: Agregar manejo de error en el render**
```typescript
{/* Categorías por Mes */}
{categories.length > 0 ? (
  categories.map((category) => (
    <CategoryItem key={category.id} category={category} />
  ))
) : (
  <Text style={styles.emptyText}>No hay categorías para mostrar</Text>
)}
```

---

## ⚠️ **WARNINGS (Pueden Ignorarse):**

Todos estos son normales en React Native Web y NO afectan funcionalidad:

1. ✅ `onResponderTerminate` - Evento táctil móvil
2. ✅ `onResponderTerminationRequest` - Evento táctil móvil
3. ✅ `onResponderGrant` - Evento táctil móvil
4. ✅ `onResponderMove` - Evento táctil móvil
5. ✅ `onResponderRelease` - Evento táctil móvil
6. ✅ `onStartShouldSetResponder` - Evento táctil móvil
7. ✅ `props.pointerEvents is deprecated` - Deprecación de React Native Web
8. ✅ `"shadow*" style props are deprecated` - Deprecación de estilos
9. ✅ `useNativeDriver is not supported` - Normal en web
10. ✅ `TouchableMixin is deprecated` - Deprecación de componente

---

## 🎯 **PLAN DE ACCIÓN:**

### **Paso 1: Verificar Backend** ✅
```bash
cd /home/lidius/Documents/contadash
npm run dev
```

### **Paso 2: Verificar Credenciales** ✅
- Email: usuario@ejemplo.com
- Password: (la que uses en tu backend)

### **Paso 3: Aplicar Fix de Categorías** ✅
- Agregar validación en `loadCategories`
- Agregar manejo de array vacío

### **Paso 4: Recargar App** ✅
```bash
# En la terminal de Expo
# Presionar 'r' para reload
```

---

## 📝 **RESUMEN:**

| Problema | Tipo | Prioridad | Estado |
|----------|------|-----------|--------|
| Login 401 | ❌ Error | Alta | Pendiente |
| Objeto renderizado | ❌ Error | Alta | Pendiente |
| Warnings de eventos | ⚠️ Warning | Baja | Ignorar |
| Warnings de estilos | ⚠️ Warning | Baja | Ignorar |

---

## 🚀 **PRÓXIMOS PASOS:**

1. ✅ Iniciar backend
2. ✅ Verificar credenciales
3. ✅ Aplicar fix de categorías
4. ✅ Probar login
5. ✅ Verificar dashboard carga correctamente

---

**Estado**: 2 errores críticos por resolver  
**Tiempo estimado**: 5-10 minutos  
**Complejidad**: Baja (son problemas de configuración)
