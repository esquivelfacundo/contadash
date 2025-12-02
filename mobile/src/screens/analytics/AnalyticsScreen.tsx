import React, { useState, useEffect } from 'react'
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native'
import { Text, Card, Menu, TouchableRipple, ActivityIndicator, Chip } from 'react-native-paper'
import { AppHeader } from '../../components/AppHeader'
import { FloatingNavBar } from '../../components/FloatingNavBar'
import { colors } from '../../theme/colors'
import { transactionsApi, categoriesApi, clientsApi } from '../../services/api'

interface TopItem {
  id: string
  name: string
  total: number
  count: number
  percentage: number
}

export const AnalyticsScreen: React.FC = () => {
  const currentDate = new Date()
  const [loading, setLoading] = useState(true)
  const [periodMonths, setPeriodMonths] = useState(6)
  const [periodMenuVisible, setPeriodMenuVisible] = useState(false)
  
  // Estadísticas
  const [topExpenseCategories, setTopExpenseCategories] = useState<TopItem[]>([])
  const [topIncomeCategories, setTopIncomeCategories] = useState<TopItem[]>([])
  const [topClients, setTopClients] = useState<TopItem[]>([])
  const [monthlyComparison, setMonthlyComparison] = useState<any>(null)
  
  // Datos maestros
  const [categories, setCategories] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])

  useEffect(() => {
    loadMasterData()
  }, [])

  useEffect(() => {
    if (categories.length > 0 && clients.length > 0) {
      loadAnalyticsData()
    }
  }, [periodMonths, categories, clients])

  const loadMasterData = async () => {
    try {
      const [categoriesResponse, clientsResponse] = await Promise.all([
        categoriesApi.getAll(),
        clientsApi.getAll(),
      ])
      
      const categoriesData = Array.isArray(categoriesResponse)
        ? categoriesResponse
        : (categoriesResponse.categories || categoriesResponse.data || [])
      
      const clientsData = Array.isArray(clientsResponse)
        ? clientsResponse
        : (clientsResponse.clients || clientsResponse.data || [])
      
      setCategories(categoriesData)
      setClients(clientsData)
    } catch (err) {
      console.error('Error loading master data:', err)
    }
  }

  const loadAnalyticsData = async () => {
    try {
      setLoading(true)
      
      const endDate = new Date()
      const startDate = new Date()
      startDate.setMonth(startDate.getMonth() - periodMonths)
      
      // Cargar transacciones del período
      const allTransactions: any[] = []
      const currentDate = new Date(startDate)
      
      while (currentDate <= endDate) {
        const month = currentDate.getMonth() + 1
        const year = currentDate.getFullYear()
        
        try {
          const response = await transactionsApi.getAll(month, year)
          const transactions = Array.isArray(response)
            ? response
            : (response.transactions || response.data || [])
          allTransactions.push(...transactions)
        } catch (err) {
          console.error(`Error loading transactions for ${month}/${year}:`, err)
        }
        
        currentDate.setMonth(currentDate.getMonth() + 1)
      }
      
      // Procesar datos
      processTopCategories(allTransactions)
      processTopClients(allTransactions)
      processMonthlyComparison()
      
    } catch (err) {
      console.error('Error loading analytics:', err)
    } finally {
      setLoading(false)
    }
  }

  const processTopCategories = (transactions: any[]) => {
    const expenseMap = new Map<string, { total: number; count: number }>()
    const incomeMap = new Map<string, { total: number; count: number }>()
    
    let totalExpense = 0
    let totalIncome = 0
    
    transactions.forEach(transaction => {
      const amount = Number(transaction.amountArs)
      const categoryId = transaction.categoryId
      
      if (transaction.type === 'EXPENSE') {
        totalExpense += amount
        const current = expenseMap.get(categoryId) || { total: 0, count: 0 }
        expenseMap.set(categoryId, {
          total: current.total + amount,
          count: current.count + 1,
        })
      } else {
        totalIncome += amount
        const current = incomeMap.get(categoryId) || { total: 0, count: 0 }
        incomeMap.set(categoryId, {
          total: current.total + amount,
          count: current.count + 1,
        })
      }
    })
    
    // Top 5 categorías de egreso
    const topExpense = Array.from(expenseMap.entries())
      .map(([id, data]) => {
        const category = categories.find(c => c.id === id)
        return {
          id,
          name: category?.name || 'Sin categoría',
          total: data.total,
          count: data.count,
          percentage: totalExpense > 0 ? (data.total / totalExpense) * 100 : 0,
        }
      })
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
    
    // Top 5 categorías de ingreso
    const topIncome = Array.from(incomeMap.entries())
      .map(([id, data]) => {
        const category = categories.find(c => c.id === id)
        return {
          id,
          name: category?.name || 'Sin categoría',
          total: data.total,
          count: data.count,
          percentage: totalIncome > 0 ? (data.total / totalIncome) * 100 : 0,
        }
      })
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
    
    setTopExpenseCategories(topExpense)
    setTopIncomeCategories(topIncome)
  }

  const processTopClients = (transactions: any[]) => {
    const clientMap = new Map<string, { total: number; count: number }>()
    let totalIncome = 0
    
    transactions
      .filter(t => t.type === 'INCOME' && t.clientId)
      .forEach(transaction => {
        const amount = Number(transaction.amountArs)
        totalIncome += amount
        const current = clientMap.get(transaction.clientId) || { total: 0, count: 0 }
        clientMap.set(transaction.clientId, {
          total: current.total + amount,
          count: current.count + 1,
        })
      })
    
    const topClientsList = Array.from(clientMap.entries())
      .map(([id, data]) => {
        const client = clients.find(c => c.id === id)
        return {
          id,
          name: client?.name || 'Sin nombre',
          total: data.total,
          count: data.count,
          percentage: totalIncome > 0 ? (data.total / totalIncome) * 100 : 0,
        }
      })
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
    
    setTopClients(topClientsList)
  }

  const processMonthlyComparison = async () => {
    try {
      const currentMonth = currentDate.getMonth() + 1
      const currentYear = currentDate.getFullYear()
      
      const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1
      const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear
      
      const [currentResponse, previousResponse] = await Promise.all([
        transactionsApi.getAll(currentMonth, currentYear),
        transactionsApi.getAll(previousMonth, previousYear),
      ])
      
      const currentTransactions = Array.isArray(currentResponse)
        ? currentResponse
        : (currentResponse.transactions || currentResponse.data || [])
      
      const previousTransactions = Array.isArray(previousResponse)
        ? previousResponse
        : (previousResponse.transactions || previousResponse.data || [])
      
      const currentIncome = currentTransactions
        .filter((t: any) => t.type === 'INCOME')
        .reduce((sum: number, t: any) => sum + Number(t.amountArs), 0)
      
      const currentExpense = currentTransactions
        .filter((t: any) => t.type === 'EXPENSE')
        .reduce((sum: number, t: any) => sum + Number(t.amountArs), 0)
      
      const previousIncome = previousTransactions
        .filter((t: any) => t.type === 'INCOME')
        .reduce((sum: number, t: any) => sum + Number(t.amountArs), 0)
      
      const previousExpense = previousTransactions
        .filter((t: any) => t.type === 'EXPENSE')
        .reduce((sum: number, t: any) => sum + Number(t.amountArs), 0)
      
      setMonthlyComparison({
        current: {
          income: currentIncome,
          expense: currentExpense,
          balance: currentIncome - currentExpense,
        },
        previous: {
          income: previousIncome,
          expense: previousExpense,
          balance: previousIncome - previousExpense,
        },
        changes: {
          income: previousIncome > 0 ? ((currentIncome - previousIncome) / previousIncome) * 100 : 0,
          expense: previousExpense > 0 ? ((currentExpense - previousExpense) / previousExpense) * 100 : 0,
          balance: previousIncome - previousExpense !== 0 
            ? (((currentIncome - currentExpense) - (previousIncome - previousExpense)) / Math.abs(previousIncome - previousExpense)) * 100 
            : 0,
        },
      })
    } catch (err) {
      console.error('Error processing monthly comparison:', err)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const periodOptions = [
    { value: 3, label: 'Últimos 3 meses' },
    { value: 6, label: 'Últimos 6 meses' },
    { value: 12, label: 'Último año' },
  ]

  const getPeriodLabel = (months: number) => {
    return periodOptions.find(p => p.value === months)?.label || `${months} meses`
  }

  return (
    <View style={styles.container}>
      <AppHeader />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Analytics</Text>
            <Text style={styles.subtitle}>
              Análisis y estadísticas de tus finanzas
            </Text>
          </View>
          
          <Menu
            visible={periodMenuVisible}
            onDismiss={() => setPeriodMenuVisible(false)}
            anchor={
              <TouchableRipple onPress={() => setPeriodMenuVisible(true)} style={styles.periodSelector}>
                <View style={styles.periodSelectorContent}>
                  <Text style={styles.periodText}>{getPeriodLabel(periodMonths)}</Text>
                  <Text style={styles.periodIcon}>▼</Text>
                </View>
              </TouchableRipple>
            }
          >
            {periodOptions.map((option) => (
              <Menu.Item
                key={option.value}
                onPress={() => {
                  setPeriodMonths(option.value)
                  setPeriodMenuVisible(false)
                }}
                title={option.label}
              />
            ))}
          </Menu>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <>
            {/* Comparación Mensual */}
            {monthlyComparison && (
              <>
                <Text style={styles.sectionTitle}>📊 Comparación Mensual</Text>
                <Card style={styles.comparisonCard}>
                  <Card.Content>
                    <View style={styles.comparisonRow}>
                      <View style={styles.comparisonItem}>
                        <Text style={styles.comparisonLabel}>Ingresos</Text>
                        <Text style={[styles.comparisonValue, styles.incomeText]}>
                          {formatCurrency(monthlyComparison.current.income)}
                        </Text>
                        <Chip
                          style={[
                            styles.changeChip,
                            monthlyComparison.changes.income >= 0 ? styles.positiveChip : styles.negativeChip
                          ]}
                          textStyle={styles.changeChipText}
                        >
                          {monthlyComparison.changes.income >= 0 ? '↑' : '↓'} {Math.abs(monthlyComparison.changes.income).toFixed(1)}%
                        </Chip>
                      </View>
                      
                      <View style={styles.comparisonItem}>
                        <Text style={styles.comparisonLabel}>Egresos</Text>
                        <Text style={[styles.comparisonValue, styles.expenseText]}>
                          {formatCurrency(monthlyComparison.current.expense)}
                        </Text>
                        <Chip
                          style={[
                            styles.changeChip,
                            monthlyComparison.changes.expense <= 0 ? styles.positiveChip : styles.negativeChip
                          ]}
                          textStyle={styles.changeChipText}
                        >
                          {monthlyComparison.changes.expense >= 0 ? '↑' : '↓'} {Math.abs(monthlyComparison.changes.expense).toFixed(1)}%
                        </Chip>
                      </View>
                    </View>
                  </Card.Content>
                </Card>
              </>
            )}

            {/* Top Categorías de Egreso */}
            <Text style={styles.sectionTitle}>💸 Top Categorías de Egreso</Text>
            {topExpenseCategories.map((item, index) => (
              <Card key={item.id} style={styles.topItemCard}>
                <Card.Content>
                  <View style={styles.topItemHeader}>
                    <View style={styles.topItemRank}>
                      <Text style={styles.rankNumber}>#{index + 1}</Text>
                    </View>
                    <View style={styles.topItemInfo}>
                      <Text style={styles.topItemName}>{item.name}</Text>
                      <Text style={styles.topItemCount}>{item.count} transacciones</Text>
                    </View>
                    <View style={styles.topItemAmount}>
                      <Text style={[styles.topItemValue, styles.expenseText]}>
                        {formatCurrency(item.total)}
                      </Text>
                      <Text style={styles.topItemPercentage}>
                        {item.percentage.toFixed(1)}%
                      </Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            ))}

            {/* Top Categorías de Ingreso */}
            <Text style={styles.sectionTitle}>💰 Top Categorías de Ingreso</Text>
            {topIncomeCategories.map((item, index) => (
              <Card key={item.id} style={styles.topItemCard}>
                <Card.Content>
                  <View style={styles.topItemHeader}>
                    <View style={styles.topItemRank}>
                      <Text style={styles.rankNumber}>#{index + 1}</Text>
                    </View>
                    <View style={styles.topItemInfo}>
                      <Text style={styles.topItemName}>{item.name}</Text>
                      <Text style={styles.topItemCount}>{item.count} transacciones</Text>
                    </View>
                    <View style={styles.topItemAmount}>
                      <Text style={[styles.topItemValue, styles.incomeText]}>
                        {formatCurrency(item.total)}
                      </Text>
                      <Text style={styles.topItemPercentage}>
                        {item.percentage.toFixed(1)}%
                      </Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            ))}

            {/* Top Clientes */}
            {topClients.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>👥 Top Clientes</Text>
                {topClients.map((item, index) => (
                  <Card key={item.id} style={styles.topItemCard}>
                    <Card.Content>
                      <View style={styles.topItemHeader}>
                        <View style={styles.topItemRank}>
                          <Text style={styles.rankNumber}>#{index + 1}</Text>
                        </View>
                        <View style={styles.topItemInfo}>
                          <Text style={styles.topItemName}>{item.name}</Text>
                          <Text style={styles.topItemCount}>{item.count} transacciones</Text>
                        </View>
                        <View style={styles.topItemAmount}>
                          <Text style={[styles.topItemValue, styles.incomeText]}>
                            {formatCurrency(item.total)}
                          </Text>
                          <Text style={styles.topItemPercentage}>
                            {item.percentage.toFixed(1)}%
                          </Text>
                        </View>
                      </View>
                    </Card.Content>
                  </Card>
                ))}
              </>
            )}

            {/* Espaciado para el navbar */}
            <View style={{ height: 100 }} />
          </>
        )}
      </ScrollView>

      <FloatingNavBar />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  periodSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  periodText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  periodIcon: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
  },
  comparisonCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  comparisonRow: {
    flexDirection: 'row',
    gap: 16,
  },
  comparisonItem: {
    flex: 1,
    alignItems: 'center',
  },
  comparisonLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  comparisonValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  changeChip: {
    height: 24,
  },
  changeChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  positiveChip: {
    backgroundColor: colors.income + '30',
  },
  negativeChip: {
    backgroundColor: colors.expense + '30',
  },
  topItemCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  topItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  topItemRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
  },
  topItemInfo: {
    flex: 1,
  },
  topItemName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  topItemCount: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  topItemAmount: {
    alignItems: 'flex-end',
  },
  topItemValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  topItemPercentage: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  incomeText: {
    color: colors.income,
  },
  expenseText: {
    color: colors.expense,
  },
})
