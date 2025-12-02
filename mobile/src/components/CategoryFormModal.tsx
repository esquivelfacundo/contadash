import React, { useState, useEffect } from 'react'
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, Dimensions } from 'react-native'
import { Modal, Portal, Text, TextInput, Button, HelperText, Menu } from 'react-native-paper'
import { colors } from '../theme/colors'
import { categoriesApi } from '../services/api'

interface CategoryFormModalProps {
  visible: boolean
  onDismiss: () => void
  onSuccess: () => void
  category?: any
}

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  visible,
  onDismiss,
  onSuccess,
  category,
}) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<any>({})
  const [typeMenuVisible, setTypeMenuVisible] = useState(false)

  useEffect(() => {
    if (visible) {
      if (category) {
        setName(category.name)
        setDescription(category.description || '')
        setType(category.type)
      } else {
        setName('')
        setDescription('')
        setType('EXPENSE')
      }
      setErrors({})
    }
  }, [visible, category])

  const validate = () => {
    const newErrors: any = {}
    if (!name) newErrors.name = 'Nombre requerido'
    if (!type) newErrors.type = 'Tipo requerido'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    try {
      setLoading(true)
      
      const payload = {
        name,
        description: description || undefined,
        type,
      }

      if (category) {
        await categoriesApi.update(category.id, payload)
        Alert.alert('Éxito', 'Categoría actualizada correctamente')
      } else {
        await categoriesApi.create(payload)
        Alert.alert('Éxito', 'Categoría creada correctamente')
      }

      onSuccess()
    } catch (err: any) {
      console.error('Error saving category:', err)
      Alert.alert('Error', err.response?.data?.message || 'Error al guardar categoría')
    } finally {
      setLoading(false)
    }
  }

  const typeOptions = [
    { value: 'INCOME', label: 'Ingreso' },
    { value: 'EXPENSE', label: 'Egreso' },
  ]

  const getTypeLabel = (value: string) => {
    return typeOptions.find(t => t.value === value)?.label || value
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
            {category ? 'Editar Categoría' : 'Nueva Categoría'}
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
              placeholder="Ej: Alimentación"
              error={!!errors.name}
              style={styles.input}
              outlineColor={colors.border}
              activeOutlineColor={colors.primary}
              textColor={colors.text}
            />
            {errors.name && <HelperText type="error">{errors.name}</HelperText>}
          </View>

          {/* Tipo */}
          <View style={styles.field}>
            <Text style={styles.label}>Tipo *</Text>
            <Menu
              visible={typeMenuVisible}
              onDismiss={() => setTypeMenuVisible(false)}
              anchor={
                <TouchableOpacity onPress={() => setTypeMenuVisible(true)}>
                  <TextInput
                    mode="outlined"
                    value={getTypeLabel(type)}
                    editable={false}
                    error={!!errors.type}
                    style={styles.input}
                    right={<TextInput.Icon icon="chevron-down" />}
                    outlineColor={colors.border}
                    activeOutlineColor={colors.primary}
                    textColor={colors.text}
                  />
                </TouchableOpacity>
              }
            >
              {typeOptions.map((option) => (
                <Menu.Item
                  key={option.value}
                  onPress={() => {
                    setType(option.value as any)
                    setTypeMenuVisible(false)
                  }}
                  title={option.label}
                />
              ))}
            </Menu>
            {errors.type && <HelperText type="error">{errors.type}</HelperText>}
          </View>

          {/* Descripción */}
          <View style={styles.field}>
            <Text style={styles.label}>Descripción (opcional)</Text>
            <TextInput
              mode="outlined"
              value={description}
              onChangeText={setDescription}
              placeholder="Descripción de la categoría"
              style={styles.input}
              outlineColor={colors.border}
              activeOutlineColor={colors.primary}
              textColor={colors.text}
              multiline
              numberOfLines={3}
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
            {category ? 'Actualizar' : 'Guardar'}
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
