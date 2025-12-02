# 📱 IMPLEMENTACIÓN: Modales de Transacciones para Mobile

## 🎯 **OBJETIVO**

Crear modales fullscreen para crear/editar transacciones de Ingresos y Egresos en mobile, adaptando la funcionalidad del frontend desktop.

---

## 📋 **REQUISITOS**

### **Características Principales:**
1. ✅ Modal fullscreen (ocupa toda la pantalla)
2. ✅ Botón "Confirmar" habilitado solo cuando todos los campos son válidos
3. ✅ Botón "Cancelar" para cerrar el modal
4. ✅ Validación de campos en tiempo real
5. ✅ Carga automática de cotización según fecha
6. ✅ Cálculo automático de USD

---

## 🔧 **ESTRUCTURA DE LOS MODALES**

### **IncomeTransactionModal (Ingresos)**

#### **Campos:**
1. **Fecha** - TextInput type="date"
2. **Categoría** - Select (solo categorías INCOME)
3. **Cliente** - Select (opcional)
4. **Descripción** - TextInput multiline
5. **Monto ARS** - TextInput numeric
6. **Cotización** - TextInput numeric (auto-cargada)
7. **Método de Pago** - Select (CASH, MERCADOPAGO, BANK_ACCOUNT, CRYPTO)
8. **Monto USD** - TextInput disabled (calculado)

#### **Validaciones:**
- Fecha: requerida
- Categoría: requerida
- Descripción: requerida
- Monto ARS: > 0
- Cotización: > 0

---

### **ExpenseTransactionModal (Egresos)**

#### **Campos:**
1. **Fecha** - TextInput type="date"
2. **Categoría** - Select (solo categorías EXPENSE)
3. **Descripción** - TextInput multiline
4. **Monto ARS** - TextInput numeric
5. **Cotización** - TextInput numeric (auto-cargada)
6. **Método de Pago** - Select (CASH, MERCADOPAGO, BANK_ACCOUNT, CRYPTO)
7. **Monto USD** - TextInput disabled (calculado)

#### **Validaciones:**
- Fecha: requerida
- Categoría: requerida
- Descripción: requerida
- Monto ARS: > 0
- Cotización: > 0

---

## 📊 **LÓGICA DE COTIZACIÓN**

### **Carga Automática:**

```typescript
const loadExchangeRate = async (selectedDate: string) => {
  const today = new Date()
  const [year, month, day] = selectedDate.split('-').map(Number)
  const transactionDateObj = new Date(year, month - 1, day)

  const isCurrentOrFutureMonth =
    transactionDateObj.getFullYear() > today.getFullYear() ||
    (transactionDateObj.getFullYear() === today.getFullYear() &&
      transactionDateObj.getMonth() >= today.getMonth())

  let rate: number

  if (isCurrentOrFutureMonth) {
    // Cotización actual
    rate = await exchangeApi.getDolarBlue()
  } else {
    // Cotización histórica
    const lastDayOfMonth = new Date(
      transactionDateObj.getFullYear(),
      transactionDateObj.getMonth() + 1,
      0
    )
    const dateStr = lastDayOfMonth.toISOString().split('T')[0]
    
    try {
      rate = await exchangeApi.getDolarBlueForDate(dateStr)
    } catch (err) {
      rate = await exchangeApi.getDolarBlue()
    }
  }

  setExchangeRate(String(rate))
}
```

---

## 🎨 **DISEÑO DEL MODAL**

### **Estructura:**

```
┌─────────────────────────────────────┐
│ 💰 Nuevo Ingreso                    │ ← Header fijo
├─────────────────────────────────────┤
│                                     │
│ [Fecha]                             │
│ [Categoría]                         │
│ [Cliente]                           │
│ [Descripción]                       │
│ [Monto ARS]                         │ ↕
│ [Cotización]                        │ │ Scroll
│ [Método de Pago]                    │ │
│ [Monto USD (calculado)]             │ ↕
│                                     │
├─────────────────────────────────────┤
│ [Cancelar]      [Crear Ingreso]    │ ← Footer fijo
└─────────────────────────────────────┘
```

---

## 🔧 **IMPLEMENTACIÓN SIMPLIFICADA**

### **Opción 1: Usar react-native-paper Dialog**

```typescript
<Portal>
  <Dialog
    visible={visible}
    onDismiss={onDismiss}
    style={{ height: '100%', margin: 0 }}
  >
    <Dialog.Title>💰 Nuevo Ingreso</Dialog.Title>
    <Dialog.ScrollArea>
      <ScrollView>
        {/* Campos del formulario */}
      </ScrollView>
    </Dialog.ScrollArea>
    <Dialog.Actions>
      <Button onPress={onDismiss}>Cancelar</Button>
      <Button 
        onPress={handleSubmit}
        disabled={!isFormValid}
      >
        Crear Ingreso
      </Button>
    </Dialog.Actions>
  </Dialog>
</Portal>
```

---

### **Opción 2: Usar Modal fullscreen**

```typescript
<Portal>
  <Modal
    visible={visible}
    onDismiss={onDismiss}
    contentContainerStyle={styles.modal}
  >
    <View style={styles.header}>
      <Text>💰 Nuevo Ingreso</Text>
    </View>
    
    <ScrollView style={styles.content}>
      {/* Campos del formulario */}
    </ScrollView>
    
    <View style={styles.actions}>
      <Button onPress={onDismiss}>Cancelar</Button>
      <Button onPress={handleSubmit} disabled={!isFormValid}>
        Crear Ingreso
      </Button>
    </View>
  </Modal>
</Portal>
```

---

## 📝 **CAMPOS DEL FORMULARIO**

### **TextInput Simple:**

```typescript
<TextInput
  mode="outlined"
  label="Descripción"
  value={description}
  onChangeText={setDescription}
  error={!!errors.description}
  style={styles.input}
  outlineColor={colors.border}
  activeOutlineColor={colors.primary}
  textColor={colors.text}
/>
{errors.description && (
  <HelperText type="error">{errors.description}</HelperText>
)}
```

---

### **Select con Menu:**

```typescript
const [categoryMenuVisible, setCategoryMenuVisible] = useState(false)

<Menu
  visible={categoryMenuVisible}
  onDismiss={() => setCategoryMenuVisible(false)}
  anchor={
    <TouchableOpacity onPress={() => setCategoryMenuVisible(true)}>
      <TextInput
        mode="outlined"
        label="Categoría"
        value={selectedCategory?.name || ''}
        editable={false}
        right={<TextInput.Icon icon="chevron-down" />}
      />
    </TouchableOpacity>
  }
>
  {categories.map((cat) => (
    <Menu.Item
      key={cat.id}
      onPress={() => {
        setCategoryId(cat.id)
        setSelectedCategory(cat)
        setCategoryMenuVisible(false)
      }}
      title={`${cat.icon} ${cat.name}`}
    />
  ))}
</Menu>
```

---

## 🔄 **INTEGRACIÓN CON MonthlyScreen**

### **Estados:**

```typescript
const [incomeModalVisible, setIncomeModalVisible] = useState(false)
const [expenseModalVisible, setExpenseModalVisible] = useState(false)
const [editingTransaction, setEditingTransaction] = useState<any>(null)
```

---

### **Funciones:**

```typescript
const handleCreateTransaction = (type: 'INCOME' | 'EXPENSE') => {
  setEditingTransaction(null)
  if (type === 'INCOME') {
    setIncomeModalVisible(true)
  } else {
    setExpenseModalVisible(true)
  }
}

const handleEditTransaction = (transaction: any) => {
  setEditingTransaction(transaction)
  if (transaction.type === 'INCOME') {
    setIncomeModalVisible(true)
  } else {
    setExpenseModalVisible(true)
  }
}

const handleTransactionSuccess = () => {
  loadMonthlyData()
  setIncomeModalVisible(false)
  setExpenseModalVisible(false)
  setEditingTransaction(null)
}
```

---

### **Renderizado:**

```typescript
<IncomeTransactionModal
  visible={incomeModalVisible}
  onDismiss={() => {
    setIncomeModalVisible(false)
    setEditingTransaction(null)
  }}
  onSuccess={handleTransactionSuccess}
  transaction={editingTransaction}
/>

<ExpenseTransactionModal
  visible={expenseModalVisible}
  onDismiss={() => {
    setExpenseModalVisible(false)
    setEditingTransaction(null)
  }}
  onSuccess={handleTransactionSuccess}
  transaction={editingTransaction}
/>
```

---

## 🎨 **ESTILOS**

```typescript
const styles = StyleSheet.create({
  modal: {
    backgroundColor: colors.background,
    margin: 0,
    height: '100%',
  },
  header: {
    backgroundColor: colors.surface,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surface,
  },
  actions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cancelButton: {
    flex: 1,
    borderColor: colors.border,
  },
  submitButton: {
    flex: 1,
  },
})
```

---

## ✅ **VALIDACIÓN DEL FORMULARIO**

```typescript
const validate = () => {
  const newErrors: any = {}

  if (!date) newErrors.date = 'Fecha requerida'
  if (!categoryId) newErrors.categoryId = 'Categoría requerida'
  if (!description) newErrors.description = 'Descripción requerida'
  if (!amountArs || parseFloat(amountArs) <= 0) {
    newErrors.amountArs = 'Monto debe ser positivo'
  }
  if (!exchangeRate || parseFloat(exchangeRate) <= 0) {
    newErrors.exchangeRate = 'Cotización debe ser positiva'
  }

  setErrors(newErrors)
  return Object.keys(newErrors).length === 0
}

const isFormValid = 
  date && 
  categoryId && 
  description && 
  amountArs && 
  exchangeRate && 
  parseFloat(amountArs) > 0 && 
  parseFloat(exchangeRate) > 0
```

---

## 🚀 **SUBMIT**

```typescript
const handleSubmit = async () => {
  if (!validate()) return

  try {
    setLoading(true)
    
    const payload = {
      date,
      type: 'INCOME' as const,
      categoryId,
      clientId: clientId || undefined,
      description,
      amountArs: parseFloat(amountArs),
      exchangeRate: parseFloat(exchangeRate),
      amountUsd: parseFloat(amountArs) / parseFloat(exchangeRate),
      paymentMethod,
    }

    if (transaction) {
      await transactionsApi.update(transaction.id, payload)
      Alert.alert('Éxito', 'Ingreso actualizado correctamente')
    } else {
      await transactionsApi.create(payload)
      Alert.alert('Éxito', 'Ingreso creado correctamente')
    }

    onSuccess()
    handleClose()
  } catch (err) {
    console.error('Error saving income:', err)
    Alert.alert('Error', 'No se pudo guardar el ingreso')
  } finally {
    setLoading(false)
  }
}
```

---

## 📋 **CHECKLIST DE IMPLEMENTACIÓN**

### **IncomeTransactionModal:**
- [ ] Crear componente con estructura fullscreen
- [ ] Implementar todos los campos del formulario
- [ ] Agregar validación en tiempo real
- [ ] Implementar carga automática de cotización
- [ ] Calcular USD automáticamente
- [ ] Habilitar botón solo cuando form es válido
- [ ] Integrar con API de transacciones
- [ ] Manejar modo creación y edición

### **ExpenseTransactionModal:**
- [ ] Crear componente con estructura fullscreen
- [ ] Implementar todos los campos del formulario
- [ ] Agregar validación en tiempo real
- [ ] Implementar carga automática de cotización
- [ ] Calcular USD automáticamente
- [ ] Habilitar botón solo cuando form es válido
- [ ] Integrar con API de transacciones
- [ ] Manejar modo creación y edición

### **Integración:**
- [ ] Actualizar MonthlyScreen con estados de modales
- [ ] Conectar Speed Dial con modales
- [ ] Conectar edición de transacciones con modales
- [ ] Recargar datos después de crear/editar

---

## 💡 **NOTAS IMPORTANTES**

1. **Cotización Automática:**
   - Se carga al abrir el modal
   - Se recarga al cambiar la fecha
   - Usa lógica de mes actual vs histórico

2. **Validación:**
   - En tiempo real al cambiar campos
   - Botón submit deshabilitado si hay errores
   - Mensajes de error debajo de cada campo

3. **UX:**
   - Modal fullscreen para mejor experiencia mobile
   - Scroll en contenido, header y footer fijos
   - Botones grandes y fáciles de tocar
   - Feedback visual claro

4. **Datos:**
   - Cargar categorías filtradas por tipo
   - Cargar clientes (solo para ingresos)
   - Calcular USD automáticamente
   - Validar antes de enviar

---

**Implementado por**: Cascade AI  
**Fecha**: Diciembre 2025  
**Versión**: 2.7.0 - Modales de Transacciones Mobile
