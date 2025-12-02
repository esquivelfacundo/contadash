import React, { useState, useEffect } from 'react'
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, Dimensions } from 'react-native'
import { Modal, Portal, Text, TextInput, Button, HelperText, Menu, Divider } from 'react-native-paper'
import { colors } from '../theme/colors'
import { transactionsApi, categoriesApi, clientsApi, bankAccountsApi, exchangeApi } from '../services/api'

interface Props {
  visible: boolean
  onDismiss: () => void
  onSuccess: () => void
  transaction?: any
}

export const IncomeTransactionModal: React.FC<Props> = ({
  visible,
  onDismiss,
  onSuccess,
  transaction,
}) => {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [bankAccounts, setBankAccounts] = useState<any[]>([])

  // Form fields
  const [date, setDate] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [clientId, setClientId] = useState('')
  const [description, setDescription] = useState('')
  const [amountArs, setAmountArs] = useState('')
  const [exchangeRate, setExchangeRate] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('CASH')
  const [bankAccountId, setBankAccountId] = useState('')

  // Menu visibility
  const [categoryMenuVisible, setCategoryMenuVisible] = useState(false)
  const [clientMenuVisible, setClientMenuVisible] = useState(false)
  const [paymentMenuVisible, setPaymentMenuVisible] = useState(false)
  const [bankAccountMenuVisible, setBankAccountMenuVisible] = useState(false)

  // Errors
  const [errors, setErrors] = useState<any>({})

  // Selected items for display
  const selectedCategory = categories.find(c => c.id === categoryId)
  const selectedClient = clients.find(c => c.id === clientId)
  const selectedBankAccount = bankAccounts.find(b => b.id === bankAccountId)

  const paymentMethodOptions = [
    { value: 'CASH', label: '💵 Efectivo' },
    { value: 'MERCADOPAGO', label: '💳 MercadoPago' },
    { value: 'BANK_ACCOUNT', label: '🏦 Cuenta Bancaria' },
    { value: 'CRYPTO', label: '₿ Criptomoneda' },
  ]

  const selectedPaymentMethod = paymentMethodOptions.find(p => p.value === paymentMethod)

  useEffect(() => {
    if (visible) {
      loadData()
      if (transaction) {
        // Edit mode
        setDate(new Date(transaction.date).toISOString().split('T')[0])
        setCategoryId(transaction.categoryId)
        setClientId(transaction.client?.id || transaction.clientId || '')
        setDescription(transaction.description)
        setAmountArs(String(transaction.amountArs))
        setExchangeRate(String(transaction.exchangeRate))
        setPaymentMethod(transaction.paymentMethod || 'CASH')
        setBankAccountId(transaction.bankAccountId || '')
      } else {
        // Create mode
        resetForm()
        const today = new Date().toISOString().split('T')[0]
        setDate(today)
        loadExchangeRate(today)
      }
    }
  }, [visible, transaction])

  useEffect(() => {
    if (visible && date && !transaction) {
      loadExchangeRate(date)
    }
  }, [date, visible])

  const loadData = async () => {
    try {
      console.log('[IncomeModal] Loading data...')
      
      const [categoriesResponse, clientsResponse, bankAccountsResponse] = await Promise.all([
        categoriesApi.getAll(),
        clientsApi.getAll(),
        bankAccountsApi.getAll(),
      ])
      
      console.log('[IncomeModal] Categories response:', categoriesResponse)
      console.log('[IncomeModal] Clients response:', clientsResponse)
      console.log('[IncomeModal] Bank accounts response:', bankAccountsResponse)
      
      // Manejar diferentes formatos de respuesta del backend
      const categoriesData = Array.isArray(categoriesResponse) 
        ? categoriesResponse 
        : (categoriesResponse.categories || categoriesResponse.data || [])
        
      const clientsData = Array.isArray(clientsResponse) 
        ? clientsResponse 
        : (clientsResponse.clients || clientsResponse.data || [])
        
      const bankAccountsData = Array.isArray(bankAccountsResponse) 
        ? bankAccountsResponse 
        : (bankAccountsResponse.bankAccounts || bankAccountsResponse.data || [])
      
      const incomeCategories = categoriesData.filter((c: any) => c.type === 'INCOME')
      const activeBankAccounts = bankAccountsData.filter((b: any) => b.isActive)
      
      console.log('[IncomeModal] Income categories filtered:', incomeCategories.length, incomeCategories)
      console.log('[IncomeModal] Clients:', clientsData.length, clientsData)
      console.log('[IncomeModal] Active bank accounts:', activeBankAccounts.length, activeBankAccounts)
      
      setCategories(incomeCategories)
      setClients(clientsData)
      setBankAccounts(activeBankAccounts)
    } catch (err) {
      console.error('[IncomeModal] Error loading data:', err)
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
        type: 'INCOME' as const,
        categoryId,
        clientId: clientId || undefined,
        description,
        amountArs: parseFloat(amountArs),
        exchangeRate: parseFloat(exchangeRate),
        amountUsd: parseFloat(amountArs) / parseFloat(exchangeRate),
        paymentMethod,
        bankAccountId: paymentMethod === 'BANK_ACCOUNT' ? bankAccountId : undefined,
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

  const resetForm = () => {
    setDate('')
    setCategoryId('')
    setClientId('')
    setDescription('')
    setAmountArs('')
    setExchangeRate('')
    setPaymentMethod('CASH')
    setBankAccountId('')
    setErrors({})
  }

  const handleClose = () => {
    resetForm()
    onDismiss()
  }

  const amountUsd = amountArs && exchangeRate ? (parseFloat(amountArs) / parseFloat(exchangeRate)).toFixed(2) : '0.00'
  const currency = exchangeRate === '1' ? 'USD' : 'ARS'
  const filteredBankAccounts = bankAccounts.filter(account => account.currency === currency)

  const isFormValid = 
    date && 
    categoryId && 
    description && 
    amountArs && 
    exchangeRate && 
    parseFloat(amountArs) > 0 && 
    parseFloat(exchangeRate) > 0 &&
    (paymentMethod !== 'BANK_ACCOUNT' || bankAccountId)

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={handleClose}
        contentContainerStyle={styles.modal}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            💰 {transaction ? 'Editar Ingreso' : 'Nuevo Ingreso'}
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
            <Text style={styles.label}>Categoría de Ingreso *</Text>
            <Menu
              visible={categoryMenuVisible}
              onDismiss={() => setCategoryMenuVisible(false)}
              anchor={
                <TouchableOpacity onPress={() => setCategoryMenuVisible(true)}>
                  <TextInput
                    mode="outlined"
                    value={selectedCategory ? `${selectedCategory.icon} ${selectedCategory.name}` : ''}
                    placeholder="Seleccionar categoría"
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
              <ScrollView style={{ maxHeight: 300 }}>
                {categories.map((cat) => (
                  <Menu.Item
                    key={cat.id}
                    onPress={() => {
                      setCategoryId(cat.id)
                      setCategoryMenuVisible(false)
                    }}
                    title={`${cat.icon} ${cat.name}`}
                  />
                ))}
              </ScrollView>
            </Menu>
            {errors.categoryId && <HelperText type="error">{errors.categoryId}</HelperText>}
          </View>

          {/* Cliente */}
          <View style={styles.field}>
            <Text style={styles.label}>Cliente (opcional)</Text>
            <Menu
              visible={clientMenuVisible}
              onDismiss={() => setClientMenuVisible(false)}
              anchor={
                <TouchableOpacity onPress={() => setClientMenuVisible(true)}>
                  <TextInput
                    mode="outlined"
                    value={selectedClient ? selectedClient.company : ''}
                    placeholder="Ninguno"
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
              <ScrollView style={{ maxHeight: 300 }}>
                <Menu.Item
                  onPress={() => {
                    setClientId('')
                    setClientMenuVisible(false)
                  }}
                  title="Ninguno"
                />
                <Divider />
                {clients.map((client) => (
                  <Menu.Item
                    key={client.id}
                    onPress={() => {
                      setClientId(client.id)
                      setClientMenuVisible(false)
                    }}
                    title={client.company}
                  />
                ))}
              </ScrollView>
            </Menu>
          </View>

          {/* Descripción */}
          <View style={styles.field}>
            <Text style={styles.label}>Descripción *</Text>
            <TextInput
              mode="outlined"
              value={description}
              onChangeText={setDescription}
              placeholder="Descripción del ingreso"
              multiline
              numberOfLines={3}
              error={!!errors.description}
              style={styles.input}
              outlineColor={colors.border}
              activeOutlineColor={colors.primary}
              textColor={colors.text}
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
              outlineColor={colors.border}
              activeOutlineColor={colors.primary}
              textColor={colors.text}
            />
            {errors.amountArs && <HelperText type="error">{errors.amountArs}</HelperText>}
          </View>

          {/* Cotización */}
          <View style={styles.field}>
            <Text style={styles.label}>Cotización *</Text>
            <TextInput
              mode="outlined"
              value={exchangeRate}
              onChangeText={setExchangeRate}
              placeholder="0.00"
              keyboardType="numeric"
              error={!!errors.exchangeRate}
              style={styles.input}
              outlineColor={colors.border}
              activeOutlineColor={colors.primary}
              textColor={colors.text}
            />
            <HelperText type="info">💹 Cotización del dólar blue</HelperText>
            {errors.exchangeRate && <HelperText type="error">{errors.exchangeRate}</HelperText>}
          </View>

          {/* Método de Pago */}
          <View style={styles.field}>
            <Text style={styles.label}>Método de Pago *</Text>
            <Menu
              visible={paymentMenuVisible}
              onDismiss={() => setPaymentMenuVisible(false)}
              anchor={
                <TouchableOpacity onPress={() => setPaymentMenuVisible(true)}>
                  <TextInput
                    mode="outlined"
                    value={selectedPaymentMethod?.label || ''}
                    placeholder="Seleccionar método"
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
              {paymentMethodOptions.map((option) => (
                <Menu.Item
                  key={option.value}
                  onPress={() => {
                    setPaymentMethod(option.value)
                    setPaymentMenuVisible(false)
                    if (option.value !== 'BANK_ACCOUNT') {
                      setBankAccountId('')
                    }
                  }}
                  title={option.label}
                />
              ))}
            </Menu>
          </View>

          {/* Cuenta Bancaria (solo si método es BANK_ACCOUNT) */}
          {paymentMethod === 'BANK_ACCOUNT' && (
            <View style={styles.field}>
              <Text style={styles.label}>Cuenta Bancaria ({currency}) *</Text>
              <Menu
                visible={bankAccountMenuVisible}
                onDismiss={() => setBankAccountMenuVisible(false)}
                anchor={
                  <TouchableOpacity onPress={() => setBankAccountMenuVisible(true)}>
                    <TextInput
                      mode="outlined"
                      value={selectedBankAccount ? `${selectedBankAccount.name} - ${selectedBankAccount.bank}` : ''}
                      placeholder="Seleccionar cuenta"
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
                <ScrollView style={{ maxHeight: 300 }}>
                  {filteredBankAccounts.length === 0 ? (
                    <Menu.Item title={`No hay cuentas en ${currency}`} disabled />
                  ) : (
                    filteredBankAccounts.map((account) => (
                      <Menu.Item
                        key={account.id}
                        onPress={() => {
                          setBankAccountId(account.id)
                          setBankAccountMenuVisible(false)
                        }}
                        title={`${account.name} - ${account.bank} (*${account.accountNumber.slice(-4)})`}
                      />
                    ))
                  )}
                </ScrollView>
              </Menu>
              <HelperText type="info">Mostrando cuentas en {currency}</HelperText>
              {errors.bankAccountId && <HelperText type="error">{errors.bankAccountId}</HelperText>}
            </View>
          )}

          {/* Monto USD (calculado) */}
          <View style={styles.field}>
            <Text style={styles.label}>Monto (USD)</Text>
            <TextInput
              mode="outlined"
              value={amountUsd}
              editable={false}
              style={styles.input}
              outlineColor={colors.border}
              textColor={colors.textSecondary}
            />
            <HelperText type="info">Calculado automáticamente</HelperText>
          </View>
        </ScrollView>

        <View style={styles.actions}>
          <Button
            mode="outlined"
            onPress={handleClose}
            style={styles.cancelButton}
            textColor={colors.text}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading || !isFormValid}
            style={[styles.submitButton, { backgroundColor: colors.income }]}
            textColor="white"
          >
            {transaction ? 'Actualizar' : 'Crear Ingreso'}
          </Button>
        </View>
      </Modal>
    </Portal>
  )
}

const styles = StyleSheet.create({
  modal: {
    backgroundColor: colors.background,
    margin: 0,
    height: Dimensions.get('window').height,
    width: Dimensions.get('window').width,
  },
  header: {
    backgroundColor: colors.surface,
    padding: 20,
    paddingTop: 40,
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
    paddingBottom: 30,
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
