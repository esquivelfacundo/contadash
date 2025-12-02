import React, { useState, useEffect } from 'react'
import { View, StyleSheet, ScrollView, Alert } from 'react-native'
import { Text, Card, Button, Menu, TouchableRipple, ActivityIndicator, IconButton, ProgressBar } from 'react-native-paper'
import { AppHeader } from '../../components/AppHeader'
import { FloatingNavBar } from '../../components/FloatingNavBar'
import { BudgetFormModal } from '../../components/BudgetFormModal'
import { colors } from '../../theme/colors'
import { budgetsApi } from '../../services/api'

interface Budget {
  id: string
  categoryId: string
  category: {
    id: string
    name: string
    type: string
  }
  month: number
  year: number
  amount: number
  spent: number
  remaining: number
  percentage: number
  status: 'ok' | 'warning' | 'exceeded'
}

export const BudgetsScreen: React.FC = () => {
  const currentDate = new Date()
  const [loading, setLoading] = useState(true)
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
  const [monthMenuVisible, setMonthMenuVisible] = useState(false)
  const [yearMenuVisible, setYearMenuVisible] = useState(false)
  const [formModalVisible, setFormModalVisible] = useState(false)
  const [selectedBudget, setSelectedBudget] = useState<Budget | undefined>()
  const [copyDialogVisible, setCopyDialogVisible] = useState(false)

  useEffect(() => {
    loadBudgets()
  }, [selectedMonth, selectedYear])

  const loadBudgets = async () => {
    try {
      setLoading(true)
      const data = await budgetsApi.getSummary(selectedMonth, selectedYear)
      setBudgets(data.budgets || [])
      setSummary(data.summary || null)
    } catch (err: any) {
      console.error('Error loading budgets:', err)
      Alert.alert('Error', 'Error al cargar presupuestos')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setSelectedBudget(undefined)
    setFormModalVisible(true)
  }

  const handleEdit = (budget: Budget) => {
    setSelectedBudget(budget)
    setFormModalVisible(true)
  }

  const handleDelete = async (id: string) => {
    Alert.alert(
      'Confirmar',
      '¿Estás seguro de eliminar este presupuesto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await budgetsApi.delete(id)
              loadBudgets()
              Alert.alert('Éxito', 'Presupuesto eliminado')
            } catch (err: any) {
              Alert.alert('Error', 'Error al eliminar presupuesto')
            }
          },
        },
      ]
    )
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'ok':
        return colors.income
      case 'warning':
        return '#F59E0B'
      case 'exceeded':
        return colors.expense
      default:
        return colors.textSecondary
    }
  }

  const months = [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' },
  ]

  const years = Array.from({ length: 10 }, (_, i) => currentDate.getFullYear() - 2 + i)

  const getMonthLabel = (month: number) => {
    return months.find((m) => m.value === month)?.label || month.toString()
  }

  return (
    <View style={styles.container}>
      <AppHeader />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Presupuestos</Text>
            <Text style={styles.subtitle}>
              Gestiona tus presupuestos mensuales
            </Text>
          </View>
        </View>

        {/* Period Selector */}
        <View style={styles.periodSelector}>
          <Menu
            visible={monthMenuVisible}
            onDismiss={() => setMonthMenuVisible(false)}
            anchor={
              <TouchableRipple onPress={() => setMonthMenuVisible(true)} style={styles.selector}>
                <View style={styles.selectorContent}>
                  <Text style={styles.selectorLabel}>Mes</Text>
                  <Text style={styles.selectorValue}>{getMonthLabel(selectedMonth)}</Text>
                </View>
              </TouchableRipple>
            }
          >
            <ScrollView style={styles.menuScroll}>
              {months.map((month) => (
                <Menu.Item
                  key={month.value}
                  onPress={() => {
                    setSelectedMonth(month.value)
                    setMonthMenuVisible(false)
                  }}
                  title={month.label}
                />
              ))}
            </ScrollView>
          </Menu>

          <Menu
            visible={yearMenuVisible}
            onDismiss={() => setYearMenuVisible(false)}
            anchor={
              <TouchableRipple onPress={() => setYearMenuVisible(true)} style={styles.selector}>
                <View style={styles.selectorContent}>
                  <Text style={styles.selectorLabel}>Año</Text>
                  <Text style={styles.selectorValue}>{selectedYear}</Text>
                </View>
              </TouchableRipple>
            }
          >
            {years.map((year) => (
              <Menu.Item
                key={year}
                onPress={() => {
                  setSelectedYear(year)
                  setYearMenuVisible(false)
                }}
                title={year.toString()}
              />
            ))}
          </Menu>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            mode="contained"
            onPress={handleCreate}
            icon="plus"
            style={styles.createButton}
          >
            Nuevo Presupuesto
          </Button>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <>
            {/* Summary Cards */}
            {summary && (
              <View style={styles.summaryCards}>
                <Card style={[styles.summaryCard, styles.budgetedCard]}>
                  <Card.Content>
                    <Text style={styles.cardLabel}>Presupuestado</Text>
                    <Text style={styles.cardValue}>{formatCurrency(summary.totalBudgeted || 0)}</Text>
                  </Card.Content>
                </Card>

                <Card style={[styles.summaryCard, styles.spentCard]}>
                  <Card.Content>
                    <Text style={styles.cardLabel}>Gastado</Text>
                    <Text style={styles.cardValue}>{formatCurrency(summary.totalSpent || 0)}</Text>
                  </Card.Content>
                </Card>

                <Card style={[styles.summaryCard, styles.remainingCard]}>
                  <Card.Content>
                    <Text style={styles.cardLabel}>Disponible</Text>
                    <Text style={styles.cardValue}>{formatCurrency(summary.totalRemaining || 0)}</Text>
                  </Card.Content>
                </Card>
              </View>
            )}

            {/* Budgets List */}
            {budgets.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Card.Content>
                  <Text style={styles.emptyText}>
                    No hay presupuestos para {getMonthLabel(selectedMonth)} {selectedYear}
                  </Text>
                  <Text style={styles.emptySubtext}>
                    Crea tu primer presupuesto para comenzar
                  </Text>
                </Card.Content>
              </Card>
            ) : (
              budgets.map((budget) => (
                <Card key={budget.id} style={styles.budgetCard}>
                  <Card.Content>
                    <View style={styles.budgetHeader}>
                      <Text style={styles.budgetCategory}>{budget.category.name}</Text>
                      <View style={styles.budgetActions}>
                        <IconButton
                          icon="pencil"
                          size={20}
                          onPress={() => handleEdit(budget)}
                          iconColor={colors.textSecondary}
                        />
                        <IconButton
                          icon="delete"
                          size={20}
                          onPress={() => handleDelete(budget.id)}
                          iconColor={colors.expense}
                        />
                      </View>
                    </View>

                    <View style={styles.budgetProgress}>
                      <View style={styles.budgetAmounts}>
                        <Text style={styles.budgetSpent}>
                          {formatCurrency(budget.spent)}
                        </Text>
                        <Text style={styles.budgetTotal}>
                          / {formatCurrency(budget.amount)}
                        </Text>
                      </View>
                      <ProgressBar
                        progress={Math.min(budget.percentage / 100, 1)}
                        color={getStatusColor(budget.status)}
                        style={styles.progressBar}
                      />
                      <View style={styles.budgetStats}>
                        <Text style={[styles.budgetPercentage, { color: getStatusColor(budget.status) }]}>
                          {budget.percentage.toFixed(0)}%
                        </Text>
                        <Text style={styles.budgetRemaining}>
                          Disponible: {formatCurrency(budget.remaining)}
                        </Text>
                      </View>
                    </View>
                  </Card.Content>
                </Card>
              ))
            )}

            {/* Espaciado para el navbar */}
            <View style={{ height: 100 }} />
          </>
        )}
      </ScrollView>

      <FloatingNavBar />

      {/* Budget Form Modal */}
      <BudgetFormModal
        visible={formModalVisible}
        onDismiss={() => {
          setFormModalVisible(false)
          setSelectedBudget(undefined)
        }}
        onSuccess={() => {
          setFormModalVisible(false)
          setSelectedBudget(undefined)
          loadBudgets()
        }}
        budget={selectedBudget}
        month={selectedMonth}
        year={selectedYear}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  periodSelector: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  selector: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectorContent: {
    padding: 12,
  },
  selectorLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  selectorValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  menuScroll: {
    maxHeight: 300,
  },
  actions: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  createButton: {
    backgroundColor: colors.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  summaryCards: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 12,
  },
  budgetedCard: {
    backgroundColor: '#3B82F6',
  },
  spentCard: {
    backgroundColor: colors.expense,
  },
  remainingCard: {
    backgroundColor: colors.income,
  },
  cardLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  emptyCard: {
    marginHorizontal: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  budgetCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  budgetCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  budgetActions: {
    flexDirection: 'row',
    gap: -8,
  },
  budgetProgress: {
    gap: 8,
  },
  budgetAmounts: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  budgetSpent: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  budgetTotal: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  budgetStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  budgetPercentage: {
    fontSize: 14,
    fontWeight: '600',
  },
  budgetRemaining: {
    fontSize: 12,
    color: colors.textSecondary,
  },
})
