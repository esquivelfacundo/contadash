import React, { useState, useEffect } from 'react'
import { View, StyleSheet, ScrollView, Alert, Dimensions } from 'react-native'
import { Modal, Portal, Text, TextInput, Button, HelperText } from 'react-native-paper'
import { colors } from '../theme/colors'
import { clientsApi } from '../services/api'

interface ClientFormModalProps {
  visible: boolean
  onDismiss: () => void
  onSuccess: () => void
  client?: any
}

export const ClientFormModal: React.FC<ClientFormModalProps> = ({
  visible,
  onDismiss,
  onSuccess,
  client,
}) => {
  const [company, setCompany] = useState('')
  const [responsible, setResponsible] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<any>({})

  useEffect(() => {
    if (visible) {
      if (client) {
        setCompany(client.company || '')
        setResponsible(client.responsible || '')
        setEmail(client.email || '')
        setPhone(client.phone || '')
      } else {
        setCompany('')
        setResponsible('')
        setEmail('')
        setPhone('')
      }
      setErrors({})
    }
  }, [visible, client])

  const validate = () => {
    const newErrors: any = {}
    if (!company) newErrors.company = 'Empresa requerida'
    if (email && !/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email inválido'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    try {
      setLoading(true)
      
      const payload = {
        company,
        responsible: responsible || undefined,
        email: email || undefined,
        phone: phone || undefined,
      }

      if (client) {
        await clientsApi.update(client.id, payload)
        Alert.alert('Éxito', 'Cliente actualizado correctamente')
      } else {
        await clientsApi.create(payload)
        Alert.alert('Éxito', 'Cliente creado correctamente')
      }

      onSuccess()
    } catch (err: any) {
      console.error('Error saving client:', err)
      Alert.alert('Error', err.response?.data?.message || 'Error al guardar cliente')
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
            {client ? 'Editar Cliente' : 'Nuevo Cliente'}
          </Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Empresa */}
          <View style={styles.field}>
            <Text style={styles.label}>Empresa *</Text>
            <TextInput
              mode="outlined"
              value={company}
              onChangeText={setCompany}
              placeholder="Ej: Acme Corp"
              error={!!errors.company}
              style={styles.input}
              outlineColor={colors.border}
              activeOutlineColor={colors.primary}
              textColor={colors.text}
            />
            {errors.company && <HelperText type="error">{errors.company}</HelperText>}
          </View>

          {/* Responsable */}
          <View style={styles.field}>
            <Text style={styles.label}>Responsable (opcional)</Text>
            <TextInput
              mode="outlined"
              value={responsible}
              onChangeText={setResponsible}
              placeholder="Ej: Juan Pérez"
              style={styles.input}
              outlineColor={colors.border}
              activeOutlineColor={colors.primary}
              textColor={colors.text}
            />
          </View>

          {/* Email */}
          <View style={styles.field}>
            <Text style={styles.label}>Email (opcional)</Text>
            <TextInput
              mode="outlined"
              value={email}
              onChangeText={setEmail}
              placeholder="cliente@ejemplo.com"
              keyboardType="email-address"
              autoCapitalize="none"
              error={!!errors.email}
              style={styles.input}
              outlineColor={colors.border}
              activeOutlineColor={colors.primary}
              textColor={colors.text}
            />
            {errors.email && <HelperText type="error">{errors.email}</HelperText>}
          </View>

          {/* Teléfono */}
          <View style={styles.field}>
            <Text style={styles.label}>Teléfono (opcional)</Text>
            <TextInput
              mode="outlined"
              value={phone}
              onChangeText={setPhone}
              placeholder="+54 11 1234-5678"
              keyboardType="phone-pad"
              style={styles.input}
              outlineColor={colors.border}
              activeOutlineColor={colors.primary}
              textColor={colors.text}
            />
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
            {client ? 'Actualizar' : 'Guardar'}
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
