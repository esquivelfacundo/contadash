import React, { useState, useEffect } from 'react'
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, Dimensions } from 'react-native'
import { Modal, Portal, Text, TextInput, Button, HelperText, Menu } from 'react-native-paper'
import { colors } from '../theme/colors'
import { bankAccountsApi } from '../services/api'

interface BankAccountFormModalProps {
  visible: boolean
  onDismiss: () => void
  onSuccess: () => void
  bankAccount?: any
}

export const BankAccountFormModal: React.FC<BankAccountFormModalProps> = ({
  visible,
  onDismiss,
  onSuccess,
  bankAccount,
}) => {
  const [name, setName] = useState('')
  const [bank, setBank] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountType, setAccountType] = useState<'SAVINGS' | 'CHECKING' | 'INVESTMENT'>('SAVINGS')
  const [currency, setCurrency] = useState<'ARS' | 'USD'>('ARS')
  const [balance, setBalance] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<any>({})
  const [accountTypeMenuVisible, setAccountTypeMenuVisible] = useState(false)
  const [currencyMenuVisible, setCurrencyMenuVisible] = useState(false)

  useEffect(() => {
    if (visible) {
      if (bankAccount) {
        setName(bankAccount.name)
        setBank(bankAccount.bank)
        setAccountNumber(bankAccount.accountNumber)
        setAccountType(bankAccount.accountType)
        setCurrency(bankAccount.currency)
        setBalance(bankAccount.balance ? String(bankAccount.balance) : '')
      } else {
        setName('')
        setBank('')
        setAccountNumber('')
        setAccountType('SAVINGS')
        setCurrency('ARS')
        setBalance('')
      }
      setErrors({})
    }
  }, [visible, bankAccount])

  const validate = () => {
    const newErrors: any = {}
    if (!name) newErrors.name = 'Nombre requerido'
    if (!bank) newErrors.bank = 'Banco requerido'
    if (!accountNumber) newErrors.accountNumber = 'Número de cuenta requerido'
    if (!accountType) newErrors.accountType = 'Tipo de cuenta requerido'
    if (!currency) newErrors.currency = 'Moneda requerida'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    try {
      setLoading(true)
      
      const payload = {
        name,
        bank,
        accountNumber,
        accountType,
        currency,
        balance: balance ? parseFloat(balance) : 0,
        isActive: true,
      }

      if (bankAccount) {
        await bankAccountsApi.update(bankAccount.id, payload)
        Alert.alert('Éxito', 'Cuenta actualizada correctamente')
      } else {
        await bankAccountsApi.create(payload)
        Alert.alert('Éxito', 'Cuenta creada correctamente')
      }

      onSuccess()
    } catch (err: any) {
      console.error('Error saving bank account:', err)
      Alert.alert('Error', err.response?.data?.message || 'Error al guardar cuenta')
    } finally {
      setLoading(false)
    }
  }

  const accountTypeOptions = [
    { value: 'SAVINGS', label: 'Caja de Ahorro' },
    { value: 'CHECKING', label: 'Cuenta Corriente' },
    { value: 'INVESTMENT', label: 'Inversión' },
  ]

  const currencyOptions = [
    { value: 'ARS', label: 'Pesos (ARS)' },
    { value: 'USD', label: 'Dólares (USD)' },
  ]

  const getAccountTypeLabel = (value: string) => {
    return accountTypeOptions.find(t => t.value === value)?.label || value
  }

  const getCurrencyLabel = (value: string) => {
    return currencyOptions.find(c => c.value === value)?.label || value
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
            {bankAccount ? 'Editar Cuenta' : 'Nueva Cuenta'}
          </Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Nombre */}
          <View style={styles.field}>
            <Text style={styles.label}>Nombre *</Text>
            <TextInput
              mode="outlined"
              value={name}
              onChangeText={setName}
              placeholder="Ej: Cuenta Principal"
              error={!!errors.name}
              style={styles.input}
              outlineColor={colors.border}
              activeOutlineColor={colors.primary}
              textColor={colors.text}
            />
            {errors.name && <HelperText type="error">{errors.name}</HelperText>}
          </View>

          {/* Banco */}
          <View style={styles.field}>
            <Text style={styles.label}>Banco *</Text>
            <TextInput
              mode="outlined"
              value={bank}
              onChangeText={setBank}
              placeholder="Ej: Banco Nación"
              error={!!errors.bank}
              style={styles.input}
              outlineColor={colors.border}
              activeOutlineColor={colors.primary}
              textColor={colors.text}
            />
            {errors.bank && <HelperText type="error">{errors.bank}</HelperText>}
          </View>

          {/* Número de cuenta */}
          <View style={styles.field}>
            <Text style={styles.label}>Número de Cuenta *</Text>
            <TextInput
              mode="outlined"
              value={accountNumber}
              onChangeText={setAccountNumber}
              placeholder="1234567890123456"
              keyboardType="numeric"
              error={!!errors.accountNumber}
              style={styles.input}
              outlineColor={colors.border}
              activeOutlineColor={colors.primary}
              textColor={colors.text}
            />
            {errors.accountNumber && <HelperText type="error">{errors.accountNumber}</HelperText>}
          </View>

          {/* Tipo de cuenta */}
          <View style={styles.field}>
            <Text style={styles.label}>Tipo de Cuenta *</Text>
            <Menu
              visible={accountTypeMenuVisible}
              onDismiss={() => setAccountTypeMenuVisible(false)}
              anchor={
                <TouchableOpacity onPress={() => setAccountTypeMenuVisible(true)}>
                  <TextInput
                    mode="outlined"
                    value={getAccountTypeLabel(accountType)}
                    editable={false}
                    error={!!errors.accountType}
                    style={styles.input}
                    right={<TextInput.Icon icon="chevron-down" />}
                    outlineColor={colors.border}
                    activeOutlineColor={colors.primary}
                    textColor={colors.text}
                  />
                </TouchableOpacity>
              }
            >
              {accountTypeOptions.map((option) => (
                <Menu.Item
                  key={option.value}
                  onPress={() => {
                    setAccountType(option.value as any)
                    setAccountTypeMenuVisible(false)
                  }}
                  title={option.label}
                />
              ))}
            </Menu>
            {errors.accountType && <HelperText type="error">{errors.accountType}</HelperText>}
          </View>

          {/* Moneda */}
          <View style={styles.field}>
            <Text style={styles.label}>Moneda *</Text>
            <Menu
              visible={currencyMenuVisible}
              onDismiss={() => setCurrencyMenuVisible(false)}
              anchor={
                <TouchableOpacity onPress={() => setCurrencyMenuVisible(true)}>
                  <TextInput
                    mode="outlined"
                    value={getCurrencyLabel(currency)}
                    editable={false}
                    error={!!errors.currency}
                    style={styles.input}
                    right={<TextInput.Icon icon="chevron-down" />}
                    outlineColor={colors.border}
                    activeOutlineColor={colors.primary}
                    textColor={colors.text}
                  />
                </TouchableOpacity>
              }
            >
              {currencyOptions.map((option) => (
                <Menu.Item
                  key={option.value}
                  onPress={() => {
                    setCurrency(option.value as any)
                    setCurrencyMenuVisible(false)
                  }}
                  title={option.label}
                />
              ))}
            </Menu>
            {errors.currency && <HelperText type="error">{errors.currency}</HelperText>}
          </View>

          {/* Saldo inicial */}
          <View style={styles.field}>
            <Text style={styles.label}>Saldo Inicial (opcional)</Text>
            <TextInput
              mode="outlined"
              value={balance}
              onChangeText={setBalance}
              placeholder="0.00"
              keyboardType="numeric"
              style={styles.input}
              left={<TextInput.Affix text={currency === 'USD' ? 'USD' : '$'} />}
              outlineColor={colors.border}
              activeOutlineColor={colors.primary}
              textColor={colors.text}
            />
            <HelperText type="info">Saldo actual de la cuenta</HelperText>
          </View>
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
            buttonColor={colors.primary}
          >
            {bankAccount ? 'Actualizar' : 'Guardar'}
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
    borderRadius: 0,
    height: Dimensions.get('window').height,
    width: Dimensions.get('window').width,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  content: {
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
  },
  submitButton: {
    flex: 1,
  },
})
