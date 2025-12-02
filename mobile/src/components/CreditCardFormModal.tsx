import React, { useState, useEffect } from 'react'
import { View, StyleSheet, ScrollView, Alert, Dimensions } from 'react-native'
import { Modal, Portal, Text, TextInput, Button, HelperText } from 'react-native-paper'
import { colors } from '../theme/colors'
import { creditCardsApi } from '../services/api'

interface CreditCardFormModalProps {
  visible: boolean
  onDismiss: () => void
  onSuccess: () => void
  creditCard?: any
}

export const CreditCardFormModal: React.FC<CreditCardFormModalProps> = ({
  visible,
  onDismiss,
  onSuccess,
  creditCard,
}) => {
  const [name, setName] = useState('')
  const [bank, setBank] = useState('')
  const [lastFourDigits, setLastFourDigits] = useState('')
  const [limit, setLimit] = useState('')
  const [closingDay, setClosingDay] = useState('')
  const [dueDay, setDueDay] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<any>({})

  useEffect(() => {
    if (visible) {
      if (creditCard) {
        setName(creditCard.name)
        setBank(creditCard.bank)
        setLastFourDigits(creditCard.lastFourDigits)
        setLimit(creditCard.limit ? String(creditCard.limit) : '')
        setClosingDay(creditCard.closingDay ? String(creditCard.closingDay) : '')
        setDueDay(creditCard.dueDay ? String(creditCard.dueDay) : '')
      } else {
        setName('')
        setBank('')
        setLastFourDigits('')
        setLimit('')
        setClosingDay('')
        setDueDay('')
      }
      setErrors({})
    }
  }, [visible, creditCard])

  const validate = () => {
    const newErrors: any = {}
    if (!name) newErrors.name = 'Nombre requerido'
    if (!bank) newErrors.bank = 'Banco requerido'
    if (!lastFourDigits) newErrors.lastFourDigits = 'Últimos 4 dígitos requeridos'
    if (lastFourDigits && lastFourDigits.length !== 4) {
      newErrors.lastFourDigits = 'Debe tener 4 dígitos'
    }
    if (closingDay && (parseInt(closingDay) < 1 || parseInt(closingDay) > 31)) {
      newErrors.closingDay = 'Día debe estar entre 1 y 31'
    }
    if (dueDay && (parseInt(dueDay) < 1 || parseInt(dueDay) > 31)) {
      newErrors.dueDay = 'Día debe estar entre 1 y 31'
    }
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
        lastFourDigits,
        limit: limit ? parseFloat(limit) : undefined,
        closingDay: closingDay ? parseInt(closingDay) : undefined,
        dueDay: dueDay ? parseInt(dueDay) : undefined,
      }

      if (creditCard) {
        await creditCardsApi.update(creditCard.id, payload)
        Alert.alert('Éxito', 'Tarjeta actualizada correctamente')
      } else {
        await creditCardsApi.create(payload)
        Alert.alert('Éxito', 'Tarjeta creada correctamente')
      }

      onSuccess()
    } catch (err: any) {
      console.error('Error saving credit card:', err)
      Alert.alert('Error', err.response?.data?.message || 'Error al guardar tarjeta')
    } finally {
      setLoading(false)
    }
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
            {creditCard ? 'Editar Tarjeta' : 'Nueva Tarjeta'}
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
              placeholder="Ej: Visa Platinum"
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

          {/* Últimos 4 dígitos */}
          <View style={styles.field}>
            <Text style={styles.label}>Últimos 4 dígitos *</Text>
            <TextInput
              mode="outlined"
              value={lastFourDigits}
              onChangeText={setLastFourDigits}
              placeholder="1234"
              keyboardType="numeric"
              maxLength={4}
              error={!!errors.lastFourDigits}
              style={styles.input}
              outlineColor={colors.border}
              activeOutlineColor={colors.primary}
              textColor={colors.text}
            />
            {errors.lastFourDigits && <HelperText type="error">{errors.lastFourDigits}</HelperText>}
          </View>

          {/* Límite */}
          <View style={styles.field}>
            <Text style={styles.label}>Límite (opcional)</Text>
            <TextInput
              mode="outlined"
              value={limit}
              onChangeText={setLimit}
              placeholder="0.00"
              keyboardType="numeric"
              style={styles.input}
              left={<TextInput.Affix text="$" />}
              outlineColor={colors.border}
              activeOutlineColor={colors.primary}
              textColor={colors.text}
            />
          </View>

          {/* Día de cierre */}
          <View style={styles.field}>
            <Text style={styles.label}>Día de cierre (opcional)</Text>
            <TextInput
              mode="outlined"
              value={closingDay}
              onChangeText={setClosingDay}
              placeholder="15"
              keyboardType="numeric"
              error={!!errors.closingDay}
              style={styles.input}
              outlineColor={colors.border}
              activeOutlineColor={colors.primary}
              textColor={colors.text}
            />
            {errors.closingDay && <HelperText type="error">{errors.closingDay}</HelperText>}
            <HelperText type="info">Día del mes en que cierra el resumen</HelperText>
          </View>

          {/* Día de vencimiento */}
          <View style={styles.field}>
            <Text style={styles.label}>Día de vencimiento (opcional)</Text>
            <TextInput
              mode="outlined"
              value={dueDay}
              onChangeText={setDueDay}
              placeholder="25"
              keyboardType="numeric"
              error={!!errors.dueDay}
              style={styles.input}
              outlineColor={colors.border}
              activeOutlineColor={colors.primary}
              textColor={colors.text}
            />
            {errors.dueDay && <HelperText type="error">{errors.dueDay}</HelperText>}
            <HelperText type="info">Día del mes en que vence el pago</HelperText>
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
            {creditCard ? 'Actualizar' : 'Guardar'}
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
