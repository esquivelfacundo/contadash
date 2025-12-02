import React, { useState, useEffect } from 'react'
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, Dimensions } from 'react-native'
import { Modal, Portal, Text, TextInput, Button, HelperText, Menu, Divider } from 'react-native-paper'
import { colors } from '../theme/colors'
import { transactionsApi, categoriesApi, bankAccountsApi, exchangeApi } from '../services/api'

interface ExpenseTransactionModalProps {
  visible: boolean
  onDismiss: () => void
  onSuccess: () => void
  transaction?: any
}

export const ExpenseTransactionModal: React.FC<ExpenseTransactionModalProps> = ({
  visible,
  onDismiss,
  onSuccess,
  transaction,
}) => {
  // Estados del formulario
  const [date, setDate] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')
  const [amountArs, setAmountArs] = useState('')
  const [exchangeRate, setExchangeRate] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'MERCADOPAGO' | 'BANK_ACCOUNT' | 'CRYPTO'>('CASH')
  const [bankAccountId, setBankAccountId] = useState('')

  // Estados de datos
  const [categories, setCategories] = useState<any[]>([])
  const [bankAccounts, setBankAccounts] = useState<any[]>([])

  // Estados de UI
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<any>({})
  const [categoryMenuVisible, setCategoryMenuVisible] = useState(false)
  const [paymentMethodMenuVisible, setPaymentMethodMenuVisible] = useState(false)
  const [bankAccountMenuVisible, setBankAccountMenuVisible] = useState(false)

  useEffect(() => {
    if (visible) {
      loadData()
      if (transaction) {
        // Modo edición
        setDate(new Date(transaction.date).toISOString().split('T')[0])
        setCategoryId(transaction.categoryId)
        setDescription(transaction.description)
        setAmountArs(String(transaction.amountArs))
        setExchangeRate(String(transaction.exchangeRate))
        setPaymentMethod(transaction.paymentMethod || 'CASH')
        setBankAccountId(transaction.bankAccountId || '')
      } else {
        // Modo creación
        const today = new Date().toISOString().split('T')[0]
        setDate(today)
        setCategoryId('')
        setDescription('')
        setAmountArs('')
        setExchangeRate('1000')
        setPaymentMethod('CASH')
        setBankAccountId('')
        loadExchangeRate(today)
      }
      setErrors({})
    }
  }, [visible, transaction])

  useEffect(() => {
    if (date && !transaction) {
      loadExchangeRate(date)
    }
  }, [date])

  const loadData = async () => {
    try {
      console.log('[ExpenseModal] Loading data...')
      
      const [categoriesResponse, bankAccountsResponse] = await Promise.all([
        categoriesApi.getAll(),
        bankAccountsApi.getAll(),
      ])
      
      console.log('[ExpenseModal] Categories response:', categoriesResponse)
      console.log('[ExpenseModal] Bank accounts response:', bankAccountsResponse)
      
      // Manejar diferentes formatos de respuesta del backend
      const categoriesData = Array.isArray(categoriesResponse) 
        ? categoriesResponse 
        : (categoriesResponse.categories || categoriesResponse.data || [])
        
      const bankAccountsData = Array.isArray(bankAccountsResponse) 
        ? bankAccountsResponse 
        : (bankAccountsResponse.bankAccounts || bankAccountsResponse.data || [])
      
      const expenseCategories = categoriesData.filter((c: any) => c.type === 'EXPENSE')
      const activeBankAccounts = bankAccountsData.filter((b: any) => b.isActive)
      
      console.log('[ExpenseModal] Expense categories filtered:', expenseCategories.length, expenseCategories)
      console.log('[ExpenseModal] Active bank accounts:', activeBankAccounts.length, activeBankAccounts)
      
      setCategories(expenseCategories)
      setBankAccounts(activeBankAccounts)
    } catch (err) {
      console.error('[ExpenseModal] Error loading data:', err)
      Alert.alert('Error', 'No se pudieron cargar los datos. Verifica tu conexión.')
    }
  }

  const loadExchangeRate = async (selectedDate: string) => {
    try {
      const today = new Date()
      const [year, month, day] = selectedDate.split('-').map(Number)
      const transactionDateObj = new Date(year, month - 1, day)

      const isCurrentOrFutureMonth =
        transactionDateObj.getFullYear() > today.getFullYear() ||
        (transactionDateObj.getFullYear() === today.getFullYear() &&
          transactionDateObj.getMonth() >= today.getMonth())

      let rate: number

      if (isCurrentOrFutureMonth) {
        rate = await exchangeApi.getDolarBlue()
      } else {
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
    } catch (err) {
      console.error('Error loading exchange rate:', err)
      setExchangeRate('1000')
    }
  }

  const validate = () => {
    const newErrors: any = {}

    if (!date) newErrors.date = 'Fecha requerida'
    if (!categoryId) newErrors.categoryId = 'Categoría requerida'
    if (!description) newErrors.description = 'Descripción requerida'
    if (!amountArs || parseFloat(amountArs) <= 0) newErrors.amountArs = 'Monto debe ser positivo'
    if (!exchangeRate || parseFloat(exchangeRate) <= 0) newErrors.exchangeRate = 'Cotización debe ser positiva'
    if (paymentMethod === 'BANK_ACCOUNT' && !bankAccountId) {
      newErrors.bankAccountId = 'Debe seleccionar una cuenta bancaria'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    try {
      setLoading(true)
      
      // Convertir fecha YYYY-MM-DD a ISO datetime
      const dateObj = new Date(date + 'T12:00:00.000Z')
      
      const payload = {
        date: dateObj.toISOString(),
        type: 'EXPENSE' as const,
        categoryId,
        description,
        amountArs: parseFloat(amountArs),
        exchangeRate: parseFloat(exchangeRate),
        amountUsd: parseFloat(amountArs) / parseFloat(exchangeRate),
        paymentMethod,
        bankAccountId: paymentMethod === 'BANK_ACCOUNT' ? bankAccountId : undefined,
      }

      if (transaction) {
        await transactionsApi.update(transaction.id, payload)
        Alert.alert('Éxito', 'Egreso actualizado correctamente')
      } else {
        await transactionsApi.create(payload)
        Alert.alert('Éxito', 'Egreso creado correctamente')
      }

      onSuccess()
      onDismiss()
    } catch (err: any) {
      console.error('Error saving expense:', err)
      Alert.alert('Error', err.response?.data?.message || 'Error al guardar egreso')
    } finally {
      setLoading(false)
    }
  }

  const getCategoryName = (id: string) => {
    const category = categories.find((c) => c.id === id)
    return category?.name || 'Seleccionar categoría'
  }

  const getBankAccountName = (id: string) => {
    const account = bankAccounts.find((b) => b.id === id)
    return account?.name || 'Seleccionar cuenta'
  }

  const paymentMethods = [
    { value: 'CASH', label: 'Efectivo' },
    { value: 'MERCADOPAGO', label: 'MercadoPago' },
    { value: 'BANK_ACCOUNT', label: 'Cuenta Bancaria' },
    { value: 'CRYPTO', label: 'Criptomoneda' },
  ]

  const getPaymentMethodLabel = (value: string) => {
    return paymentMethods.find((pm) => pm.value === value)?.label || value
  }

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modal}
      >
        <View style={styles.header}>
          <Text style={styles.title}>
            {transaction ? 'Editar Egreso' : 'Nuevo Egreso'}
          </Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Fecha */}
          <View style={styles.field}>
            <Text style={styles.label}>Fecha *</Text>
            <TextInput
              mode="outlined"
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              error={!!errors.date}
              style={styles.input}
              right={<TextInput.Icon icon="calendar" />}
              outlineColor={colors.border}
              activeOutlineColor={colors.primary}
              textColor={colors.text}
            />
            {!errors.date && <HelperText type="info">Formato: YYYY-MM-DD (ej: 2025-12-01)</HelperText>}
            {errors.date && <HelperText type="error">{errors.date}</HelperText>}
          </View>

          {/* Categoría */}
          <View style={styles.field}>
            <Text style={styles.label}>Categoría *</Text>
            <Menu
              visible={categoryMenuVisible}
              onDismiss={() => setCategoryMenuVisible(false)}
              anchor={
                <TouchableOpacity onPress={() => setCategoryMenuVisible(true)}>
                  <TextInput
                    mode="outlined"
                    value={getCategoryName(categoryId)}
                    editable={false}
                    error={!!errors.categoryId}
                    style={styles.input}
                    right={<TextInput.Icon icon="chevron-down" />}
                    outlineColor={colors.border}
                    activeOutlineColor={colors.primary}
                    textColor={colors.text}
                  />
                </TouchableOpacity>
              }
            >
              <ScrollView style={styles.menuScroll}>
                {categories.map((category) => (
                  <Menu.Item
                    key={category.id}
                    onPress={() => {
                      setCategoryId(category.id)
                      setCategoryMenuVisible(false)
                    }}
                    title={category.name}
                  />
                ))}
              </ScrollView>
            </Menu>
            {errors.categoryId && <HelperText type="error">{errors.categoryId}</HelperText>}
          </View>

          {/* Descripción */}
          <View style={styles.field}>
            <Text style={styles.label}>Descripción *</Text>
            <TextInput
              mode="outlined"
              value={description}
              onChangeText={setDescription}
              placeholder="Descripción del egreso"
              error={!!errors.description}
              style={styles.input}
              outlineColor={colors.border}
              activeOutlineColor={colors.primary}
              textColor={colors.text}
              multiline
              numberOfLines={3}
            />
            {errors.description && <HelperText type="error">{errors.description}</HelperText>}
          </View>

          {/* Monto ARS */}
          <View style={styles.field}>
            <Text style={styles.label}>Monto (ARS) *</Text>
            <TextInput
              mode="outlined"
              value={amountArs}
              onChangeText={setAmountArs}
              placeholder="0.00"
              keyboardType="numeric"
              error={!!errors.amountArs}
              style={styles.input}
              left={<TextInput.Affix text="$" />}
              outlineColor={colors.border}
              activeOutlineColor={colors.primary}
              textColor={colors.text}
            />
            {errors.amountArs && <HelperText type="error">{errors.amountArs}</HelperText>}
          </View>

          {/* Cotización */}
          <View style={styles.field}>
            <Text style={styles.label}>Cotización Dólar *</Text>
            <TextInput
              mode="outlined"
              value={exchangeRate}
              onChangeText={setExchangeRate}
              placeholder="0.00"
              keyboardType="numeric"
              error={!!errors.exchangeRate}
              style={styles.input}
              left={<TextInput.Affix text="$" />}
              outlineColor={colors.border}
              activeOutlineColor={colors.primary}
              textColor={colors.text}
            />
            {errors.exchangeRate && <HelperText type="error">{errors.exchangeRate}</HelperText>}
          </View>

          {/* Monto USD (calculado) */}
          {amountArs && exchangeRate && parseFloat(amountArs) > 0 && parseFloat(exchangeRate) > 0 && (
            <View style={styles.field}>
              <Text style={styles.label}>Monto USD (calculado)</Text>
              <Text style={styles.calculatedUsd}>
                USD ${(parseFloat(amountArs) / parseFloat(exchangeRate)).toFixed(2)}
              </Text>
            </View>
          )}

          {/* Método de Pago */}
          <View style={styles.field}>
            <Text style={styles.label}>Método de Pago *</Text>
            <Menu
              visible={paymentMethodMenuVisible}
              onDismiss={() => setPaymentMethodMenuVisible(false)}
              anchor={
                <TouchableOpacity onPress={() => setPaymentMethodMenuVisible(true)}>
                  <TextInput
                    mode="outlined"
                    value={getPaymentMethodLabel(paymentMethod)}
                    editable={false}
                    style={styles.input}
                    right={<TextInput.Icon icon="chevron-down" />}
                    outlineColor={colors.border}
                    activeOutlineColor={colors.primary}
                    textColor={colors.text}
                  />
                </TouchableOpacity>
              }
            >
              {paymentMethods.map((pm) => (
                <Menu.Item
                  key={pm.value}
                  onPress={() => {
                    setPaymentMethod(pm.value as any)
                    setPaymentMethodMenuVisible(false)
                    if (pm.value !== 'BANK_ACCOUNT') {
                      setBankAccountId('')
                    }
                  }}
                  title={pm.label}
                />
              ))}
            </Menu>
          </View>

          {/* Cuenta Bancaria (condicional) */}
          {paymentMethod === 'BANK_ACCOUNT' && (
            <View style={styles.field}>
              <Text style={styles.label}>Cuenta Bancaria *</Text>
              <Menu
                visible={bankAccountMenuVisible}
                onDismiss={() => setBankAccountMenuVisible(false)}
                anchor={
                  <TouchableOpacity onPress={() => setBankAccountMenuVisible(true)}>
                    <TextInput
                      mode="outlined"
                      value={getBankAccountName(bankAccountId)}
                      editable={false}
                      error={!!errors.bankAccountId}
                      style={styles.input}
                      right={<TextInput.Icon icon="chevron-down" />}
                      outlineColor={colors.border}
                      activeOutlineColor={colors.primary}
                      textColor={colors.text}
                    />
                  </TouchableOpacity>
                }
              >
                <ScrollView style={styles.menuScroll}>
                  {bankAccounts
                    .filter((account) => {
                      const currency = parseFloat(exchangeRate) === 1 ? 'USD' : 'ARS'
                      return account.currency === currency
                    })
                    .map((account) => (
                      <Menu.Item
                        key={account.id}
                        onPress={() => {
                          setBankAccountId(account.id)
                          setBankAccountMenuVisible(false)
                        }}
                        title={`${account.name} (${account.currency})`}
                      />
                    ))}
                </ScrollView>
              </Menu>
              {errors.bankAccountId && <HelperText type="error">{errors.bankAccountId}</HelperText>}
            </View>
          )}
        </ScrollView>

        <View style={styles.actions}>
          <Button
            mode="outlined"
            onPress={onDismiss}
            style={styles.cancelButton}
            textColor={colors.text}
          >
            Cancelar
          </Button>
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            style={styles.submitButton}
            buttonColor={colors.expense}
          >
            {transaction ? 'Actualizar' : 'Guardar'}
          </Button>
        </View>
      </Modal>
    </Portal>
  )
}

const styles = StyleSheet.create({
  modal: {
    backgroundColor: colors.surface,
    margin: 0,
    height: Dimensions.get('window').height,
    width: Dimensions.get('window').width,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
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
  calculatedUsd: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 4,
  },
  menuScroll: {
    maxHeight: 300,
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
  },
  submitButton: {
    flex: 1,
  },
})
