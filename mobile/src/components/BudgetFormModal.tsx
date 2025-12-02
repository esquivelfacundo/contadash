import React, { useState, useEffect } from 'react'
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, Dimensions } from 'react-native'
import { Modal, Portal, Text, TextInput, Button, HelperText, Menu } from 'react-native-paper'
import { colors } from '../theme/colors'
import { budgetsApi, categoriesApi } from '../services/api'

interface BudgetFormModalProps {
  visible: boolean
  onDismiss: () => void
  onSuccess: () => void
  budget?: any
  month: number
  year: number
}

export const BudgetFormModal: React.FC<BudgetFormModalProps> = ({
  visible,
  onDismiss,
  onSuccess,
  budget,
  month,
  year,
}) => {
  const [categoryId, setCategoryId] = useState('')
  const [amount, setAmount] = useState('')
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<any>({})
  const [categoryMenuVisible, setCategoryMenuVisible] = useState(false)

  useEffect(() => {
    if (visible) {
      loadCategories()
      if (budget) {
        // Modo edición
        setCategoryId(budget.categoryId)
        setAmount(String(budget.amount))
      } else {
        // Modo creación
        setCategoryId('')
        setAmount('')
      }
      setErrors({})
    }
  }, [visible, budget])

  const loadCategories = async () => {
    try {
      const response = await categoriesApi.getAll()
      
      // Manejar diferentes formatos de respuesta
      const categoriesData = Array.isArray(response)
        ? response
        : (response.categories || response.data || [])
      
      // Filtrar solo categorías de EXPENSE
      const expenseCategories = categoriesData.filter((c: any) => c.type === 'EXPENSE')
      setCategories(expenseCategories)
    } catch (err) {
      console.error('Error loading categories:', err)
      Alert.alert('Error', 'No se pudieron cargar las categorías')
    }
  }

  const validate = () => {
    const newErrors: any = {}

    if (!categoryId) newErrors.categoryId = 'Categoría requerida'
    if (!amount || parseFloat(amount) <= 0) newErrors.amount = 'Monto debe ser positivo'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    try {
      setLoading(true)
      
      const payload = {
        categoryId,
        month,
        year,
        amountArs: parseFloat(amount),
        amountUsd: 0, // Por ahora solo presupuestos en ARS
      }

      if (budget) {
        await budgetsApi.update(budget.id, payload)
        Alert.alert('Éxito', 'Presupuesto actualizado correctamente')
      } else {
        await budgetsApi.create(payload)
        Alert.alert('Éxito', 'Presupuesto creado correctamente')
      }

      onSuccess()
    } catch (err: any) {
      console.error('Error saving budget:', err)
      Alert.alert('Error', err.response?.data?.message || 'Error al guardar presupuesto')
    } finally {
      setLoading(false)
    }
  }

  const getCategoryName = (id: string) => {
    const category = categories.find((c) => c.id === id)
    return category?.name || 'Seleccionar categoría'
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
            {budget ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}
          </Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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

          {/* Monto */}
          <View style={styles.field}>
            <Text style={styles.label}>Monto Presupuestado (ARS) *</Text>
            <TextInput
              mode="outlined"
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              keyboardType="numeric"
              error={!!errors.amount}
              style={styles.input}
              left={<TextInput.Affix text="$" />}
              outlineColor={colors.border}
              activeOutlineColor={colors.primary}
              textColor={colors.text}
            />
            {errors.amount && <HelperText type="error">{errors.amount}</HelperText>}
          </View>

          {/* Info del período */}
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Este presupuesto se aplicará para el mes seleccionado
            </Text>
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
            {budget ? 'Actualizar' : 'Guardar'}
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
  menuScroll: {
    maxHeight: 300,
  },
  infoBox: {
    backgroundColor: colors.primary + '20',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  infoText: {
    fontSize: 12,
    color: colors.text,
    textAlign: 'center',
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
