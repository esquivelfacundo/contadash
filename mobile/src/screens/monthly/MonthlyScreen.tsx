import React, { useState, useEffect } from 'react'
import { View, StyleSheet, ScrollView, Dimensions, ActivityIndicator, RefreshControl, Alert, LayoutAnimation, Platform, UIManager, Text as RNText } from 'react-native'
import { Text, Card, Button, Chip, Dialog, Portal, Menu, FAB } from 'react-native-paper'
import { LinearGradient } from 'expo-linear-gradient'
import { colors } from '../../theme/colors'
import { AppHeader } from '../../components/AppHeader'
import { ScreenLayout } from '../../components/ScreenLayout'
import { TransactionCard } from '../../components/TransactionCard'
import { IncomeTransactionModal } from '../../components/IncomeTransactionModal'
import { transactionsApi, exchangeApi } from '../../services/api'

// Habilitar LayoutAnimation en Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

const { width } = Dimensions.get('window')
const CARD_WIDTH = width * 0.6

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

const MONTHS_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

export const MonthlyScreen = () => {
  const currentDate = new Date()
  const [year, setYear] = useState(currentDate.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth())
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [monthlyData, setMonthlyData] = useState<any[]>([])
  const [yearSummary, setYearSummary] = useState<any>(null)
  const [currentDolarRate, setCurrentDolarRate] = useState<number>(1000)
  const [currentApiDolarRate, setCurrentApiDolarRate] = useState<number>(1000)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [transactionToDelete, setTransactionToDelete] = useState<any>(null)
  const [incomeDialogOpen, setIncomeDialogOpen] = useState(false)
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<any>(null)
  const [monthMenuVisible, setMonthMenuVisible] = useState(false)
  const [yearMenuVisible, setYearMenuVisible] = useState(false)
  const [speedDialOpen, setSpeedDialOpen] = useState(false)

  useEffect(() => {
    loadMonthlyData()
    loadDolarRate()
  }, [year, selectedMonth])

  useEffect(() => {
    loadCurrentApiRate()
  }, [])

  const loadCurrentApiRate = async () => {
    try {
      console.log('[MonthlyScreen] Loading current API rate...')
      const rate = await Promise.race([
        exchangeApi.getDolarBlue(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 5000)
        )
      ])
      console.log('[MonthlyScreen] Current API rate loaded:', rate)
      setCurrentApiDolarRate(rate as number)
    } catch (error) {
      console.error('[MonthlyScreen] Error loading current API rate:', error)
      // Usar valor por defecto si falla
      setCurrentApiDolarRate(1200)
    }
  }

  const loadDolarRate = async () => {
    try {
      const today = new Date()
      const isCurrentOrFutureMonth = 
        year > today.getFullYear() || 
        (year === today.getFullYear() && selectedMonth >= today.getMonth())
      
      console.log('[MonthlyScreen] Loading dolar rate for:', { year, month: selectedMonth, isCurrentOrFutureMonth })
      
      if (isCurrentOrFutureMonth) {
        // Si es el mes actual o futuro, usar cotización de hoy
        console.log('[MonthlyScreen] Using current API rate...')
        const rate = await exchangeApi.getDolarBlue()
        console.log('[MonthlyScreen] Current rate loaded:', rate)
        setCurrentDolarRate(rate)
      } else {
        // Si es un mes pasado, usar cotización del último día de ese mes
        const lastDayOfMonth = new Date(year, selectedMonth + 1, 0)
        const dateStr = lastDayOfMonth.toISOString().split('T')[0]
        console.log('[MonthlyScreen] Using historical rate for date:', dateStr)
        const rate = await exchangeApi.getDolarBlueForDate(dateStr)
        console.log('[MonthlyScreen] Historical rate loaded:', rate)
        setCurrentDolarRate(rate)
      }
    } catch (err) {
      console.error('[MonthlyScreen] Error loading dolar rate:', err)
      // Fallback to current rate
      try {
        const rate = await exchangeApi.getDolarBlue()
        console.log('[MonthlyScreen] Fallback to current rate:', rate)
        setCurrentDolarRate(rate)
      } catch {
        console.log('[MonthlyScreen] All failed, using default 1000')
        setCurrentDolarRate(1000)
      }
    }
  }

  const loadMonthlyData = async () => {
    try {
      setLoading(true)
      const month = selectedMonth + 1

      console.log('[MonthlyScreen] Loading monthly data for:', { month, year })
      
      // Get transactions for the selected month
      const data = await transactionsApi.getMonthlyWithCreditCards(month, year)
      console.log('[MonthlyScreen] Transactions loaded:', data.transactions?.length || 0)
      setMonthlyData(data.transactions || [])

      // Calculate year summary
      const yearData = await transactionsApi.getStats(undefined, year)
      console.log('[MonthlyScreen] Year summary loaded:', yearData)
      setYearSummary(yearData)
    } catch (err: any) {
      console.error('[MonthlyScreen] Error loading monthly data:', err)
      setError(err.response?.data?.error || 'Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadMonthlyData()
    await loadDolarRate()
    setRefreshing(false)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatUSD = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const handleCreateTransaction = (type: 'INCOME' | 'EXPENSE') => {
    setEditingTransaction(null)
    if (type === 'INCOME') {
      setIncomeDialogOpen(true)
    } else {
      setExpenseDialogOpen(true)
    }
  }

  const handleEditTransaction = (transaction: any) => {
    // If it's a placeholder, convert it to a new transaction
    if (transaction.isPlaceholder) {
      setEditingTransaction({
        ...transaction,
        id: null, // Remove ID so it creates a new transaction
      })
    } else {
      setEditingTransaction(transaction)
    }
    
    // Abrir el modal correspondiente según el tipo de transacción
    if (transaction.type === 'INCOME') {
      setIncomeDialogOpen(true)
    } else {
      setExpenseDialogOpen(true)
    }
  }

  const handleDeleteClick = (transaction: any) => {
    // Don't allow deleting placeholders
    if (transaction.isPlaceholder) {
      return
    }
    setTransactionToDelete(transaction)
    setDeleteDialogOpen(true)
  }

  const handleTransactionSuccess = () => {
    loadMonthlyData()
    setIncomeDialogOpen(false)
    setExpenseDialogOpen(false)
    setEditingTransaction(null)
  }

  const handleDeleteConfirm = async () => {
    if (!transactionToDelete) return

    try {
      await transactionsApi.delete(transactionToDelete.id)
      Alert.alert('Éxito', 'Transacción eliminada exitosamente')
      loadMonthlyData()
      setDeleteDialogOpen(false)
      setTransactionToDelete(null)
    } catch (err) {
      Alert.alert('Error', 'Error al eliminar transacción')
    }
  }

  // Separate income and expense transactions
  const incomeTransactions = monthlyData.filter(t => t.type === 'INCOME')
  const expenseTransactions = monthlyData.filter(t => t.type === 'EXPENSE')

  // Calculate month totals
  const monthIncome = incomeTransactions.reduce((sum, t) => sum + Number(t.amountArs), 0)
  const monthExpense = expenseTransactions.reduce((sum, t) => sum + Number(t.amountArs), 0)
  const monthBalance = monthIncome - monthExpense

  // Calculate USD amounts using the correct exchange rate for the month
  // If exchangeRate is 1000 (default/incorrect), recalculate with currentDolarRate
  const monthIncomeUSD = incomeTransactions.reduce((sum, t) => {
    const exchangeRate = Number(t.exchangeRate)
    const amountArs = Number(t.amountArs)
    
    // If exchangeRate is 1000 (default), use currentDolarRate instead
    const correctRate = exchangeRate === 1000 ? currentDolarRate : exchangeRate
    const calculatedUsd = amountArs / correctRate
    
    console.log('[MonthlyScreen] Income transaction USD:', {
      description: t.description,
      amountArs: t.amountArs,
      exchangeRate: t.exchangeRate,
      currentDolarRate,
      correctRate,
      calculatedUsd: calculatedUsd.toFixed(2)
    })
    
    return sum + calculatedUsd
  }, 0)
  
  const monthExpenseUSD = expenseTransactions.reduce((sum, t) => {
    const exchangeRate = Number(t.exchangeRate)
    const amountArs = Number(t.amountArs)
    
    // If exchangeRate is 1000 (default), use currentDolarRate instead
    const correctRate = exchangeRate === 1000 ? currentDolarRate : exchangeRate
    const calculatedUsd = amountArs / correctRate
    
    console.log('[MonthlyScreen] Expense transaction USD:', {
      description: t.description,
      amountArs: t.amountArs,
      exchangeRate: t.exchangeRate,
      currentDolarRate,
      correctRate,
      calculatedUsd: calculatedUsd.toFixed(2)
    })
    
    return sum + calculatedUsd
  }, 0)
  
  const monthBalanceUSD = monthIncomeUSD - monthExpenseUSD
  
  console.log('[MonthlyScreen] Totals USD:', {
    monthIncomeUSD: monthIncomeUSD.toFixed(2),
    monthExpenseUSD: monthExpenseUSD.toFixed(2),
    monthBalanceUSD: monthBalanceUSD.toFixed(2),
    currentDolarRate
  })

  // Generate year options (current year and 5 years back)
  const yearOptions = Array.from({ length: 6 }, (_, i) => currentDate.getFullYear() - i)

  if (loading && !refreshing) {
    return (
      <ScreenLayout>
        <AppHeader />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando movimientos...</Text>
        </View>
      </ScreenLayout>
    )
  }

  return (
    <ScreenLayout>
      {/* Contenido con Scroll */}
      <ScrollView 
        style={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
        contentContainerStyle={styles.scrollContentContainer}
      >
        {/* Header */}
        <AppHeader />
        {/* Resumen Anual */}
        {yearSummary?.stats && (
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Resumen Anual {year}
            </Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.yearCardsContainer}
              style={styles.yearCardsScroll}
            >
              {/* Card Ingresos Anuales */}
              <LinearGradient
                colors={['#10B981', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.gradientCard, { width: CARD_WIDTH }]}
              >
                <View style={styles.cardContent}>
                  <Text style={styles.cardLabel}>Ingresos {year}</Text>
                  <Text style={styles.cardAmount}>
                    {formatCurrency(yearSummary.stats.income?.ars || 0)}
                  </Text>
                  <Text style={styles.cardSubAmount}>
                    {formatUSD((yearSummary.stats.income?.ars || 0) / currentApiDolarRate)}
                  </Text>
                </View>
              </LinearGradient>

              {/* Card Egresos Anuales */}
              <LinearGradient
                colors={['#8B5CF6', '#7C3AED']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.gradientCard, { width: CARD_WIDTH }]}
              >
                <View style={styles.cardContent}>
                  <Text style={styles.cardLabel}>Egresos {year}</Text>
                  <Text style={styles.cardAmount}>
                    {formatCurrency(yearSummary.stats.expense?.ars || 0)}
                  </Text>
                  <Text style={styles.cardSubAmount}>
                    {formatUSD((yearSummary.stats.expense?.ars || 0) / currentApiDolarRate)}
                  </Text>
                </View>
              </LinearGradient>

              {/* Card Balance Anual */}
              <LinearGradient
                colors={['#3B82F6', '#2563EB']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.gradientCard, { width: CARD_WIDTH }]}
              >
                <View style={styles.cardContent}>
                  <Text style={styles.cardLabel}>Balance {year}</Text>
                  <Text style={styles.cardAmount}>
                    {formatCurrency(yearSummary.stats.balance?.ars || 0)}
                  </Text>
                  <Text style={styles.cardSubAmount}>
                    {formatUSD((yearSummary.stats.balance?.ars || 0) / currentApiDolarRate)}
                  </Text>
                </View>
              </LinearGradient>
            </ScrollView>
          </View>
        )}

        {/* Título y Selectores */}
        <View style={styles.headerRow}>
          <Text variant="titleLarge" style={styles.pageTitle}>
            Movimientos
          </Text>
          
          <View style={styles.selectorsRow}>
            {/* Selector de Mes */}
            <Menu
              visible={monthMenuVisible}
              onDismiss={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
                setMonthMenuVisible(false)
              }}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
                    setMonthMenuVisible(true)
                  }}
                  style={styles.monthSelector}
                  contentStyle={styles.selectorContent}
                  labelStyle={styles.selectorText}
                  icon="chevron-down"
                  compact
                >
                  {MONTHS[selectedMonth]}
                </Button>
              }
            >
              {MONTHS.map((month, index) => (
                <Menu.Item
                  key={index}
                  onPress={() => {
                    setSelectedMonth(index)
                    setMonthMenuVisible(false)
                  }}
                  title={month}
                />
              ))}
            </Menu>

            {/* Selector de Año */}
            <Menu
              visible={yearMenuVisible}
              onDismiss={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
                setYearMenuVisible(false)
              }}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
                    setYearMenuVisible(true)
                  }}
                  style={styles.yearSelector}
                  contentStyle={styles.selectorContent}
                  labelStyle={styles.selectorText}
                  icon="chevron-down"
                  compact
                >
                  {year}
                </Button>
              }
            >
              {yearOptions.map((y) => (
                <Menu.Item
                  key={y}
                  onPress={() => {
                    setYear(y)
                    setYearMenuVisible(false)
                  }}
                  title={y.toString()}
                />
              ))}
            </Menu>
          </View>
        </View>

        {/* Card de Cotización */}
        <Card style={styles.rateCard}>
          <Card.Content>
            <View style={styles.rateContent}>
              <Text style={styles.rateIcon}>💵</Text>
              <View style={styles.rateInfo}>
                <Text variant="bodyMedium" style={styles.rateTitle}>
                  Cotización Dólar Blue: ${currentDolarRate.toFixed(2)}
                </Text>
                <Text variant="bodySmall" style={styles.rateSubtitle}>
                  {(() => {
                    const today = new Date()
                    const isCurrentOrFutureMonth = 
                      year > today.getFullYear() || 
                      (year === today.getFullYear() && selectedMonth >= today.getMonth())
                    
                    if (isCurrentOrFutureMonth) {
                      return `Última actualización: ${new Date().toLocaleDateString('es-AR')}`
                    } else {
                      const lastDayOfMonth = new Date(year, selectedMonth + 1, 0)
                      return `Cotización de cierre: ${lastDayOfMonth.toLocaleDateString('es-AR')}`
                    }
                  })()}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Resumen Mensual */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Resumen de {MONTHS[selectedMonth]}
          </Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.monthCardsContainer}
            style={styles.monthCardsScroll}
          >
            {/* Card Ingresos Mensuales */}
            <LinearGradient
              colors={['#10B981', '#059669']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.gradientCard, { width: CARD_WIDTH }]}
            >
              <View style={styles.cardContent}>
                <Text style={styles.cardLabel}>Ingresos - {MONTHS[selectedMonth]}</Text>
                <Text style={styles.cardAmount}>
                  {formatCurrency(monthIncome)}
                </Text>
                <Text style={styles.cardSubAmount}>
                  {formatUSD(monthIncome / currentDolarRate)}
                </Text>
              </View>
            </LinearGradient>

            {/* Card Egresos Mensuales */}
            <LinearGradient
              colors={['#8B5CF6', '#7C3AED']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.gradientCard, { width: CARD_WIDTH }]}
            >
              <View style={styles.cardContent}>
                <Text style={styles.cardLabel}>Egresos - {MONTHS[selectedMonth]}</Text>
                <Text style={styles.cardAmount}>
                  {formatCurrency(monthExpense)}
                </Text>
                <Text style={styles.cardSubAmount}>
                  {formatUSD(monthExpense / currentDolarRate)}
                </Text>
              </View>
            </LinearGradient>

            {/* Card Balance Mensual */}
            <LinearGradient
              colors={['#F59E0B', '#D97706']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.gradientCard, { width: CARD_WIDTH }]}
            >
              <View style={styles.cardContent}>
                <Text style={styles.cardLabel}>Balance - {MONTHS[selectedMonth]}</Text>
                <Text style={styles.cardAmount}>
                  {formatCurrency(monthBalance)}
                </Text>
                <Text style={styles.cardSubAmount}>
                  {formatUSD(monthBalance / currentDolarRate)}
                </Text>
              </View>
            </LinearGradient>

            {/* Card Transacciones */}
            <LinearGradient
              colors={['#EF4444', '#DC2626']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.gradientCard, { width: CARD_WIDTH }]}
            >
              <View style={styles.cardContent}>
                <Text style={styles.cardLabel}>Transacciones</Text>
                <Text style={styles.cardAmount}>
                  {monthlyData.length}
                </Text>
                <Text style={styles.cardSubAmount}>
                  {MONTHS[selectedMonth]} {year}
                </Text>
              </View>
            </LinearGradient>
          </ScrollView>
        </View>

        {/* Scroll Horizontal de Transacciones */}
        <ScrollView 
          horizontal 
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.transactionsScroll}
          contentContainerStyle={styles.transactionsScrollContent}
        >
          {/* Card de Ingresos */}
          <View style={styles.transactionCard}>
            <View style={styles.transactionCardContent}>
              {/* Header con Total Fijo */}
              <View style={styles.transactionCardHeader}>
                <View style={styles.transactionCardHeaderRow}>
                  <RNText style={styles.transactionCardTitle}>
                    Ingresos
                  </RNText>
                  <View style={styles.transactionCardTotal}>
                    <RNText style={[styles.totalAmount, { color: colors.income }]}>
                      {formatCurrency(monthIncome)}
                    </RNText>
                    <RNText style={styles.totalAmountUSD}>
                      {formatUSD(monthIncomeUSD)}
                    </RNText>
                  </View>
                </View>
              </View>

              {/* Lista con Scroll Interno */}
              <ScrollView 
                style={styles.transactionCardList}
                showsVerticalScrollIndicator={false}
              >
                {incomeTransactions.length === 0 ? (
                  <View style={styles.emptyState}>
                    <RNText style={styles.emptyText}>
                      No hay ingresos en {MONTHS[selectedMonth]} {year}
                    </RNText>
                  </View>
                ) : (
                  incomeTransactions.map((transaction) => (
                    <TransactionCard
                      key={transaction.id}
                      transaction={transaction}
                      onEdit={handleEditTransaction}
                      onDelete={handleDeleteClick}
                      formatCurrency={formatCurrency}
                      formatUSD={formatUSD}
                      currentDolarRate={currentDolarRate}
                    />
                  ))
                )}
              </ScrollView>
            </View>
          </View>

          {/* Card de Egresos */}
          <View style={styles.transactionCard}>
            <View style={styles.transactionCardContent}>
              {/* Header con Total Fijo */}
              <View style={styles.transactionCardHeader}>
                <View style={styles.transactionCardHeaderRow}>
                  <RNText style={styles.transactionCardTitle}>
                    Egresos
                  </RNText>
                  <View style={styles.transactionCardTotal}>
                    <RNText style={[styles.totalAmount, { color: colors.expense }]}>
                      {formatCurrency(monthExpense)}
                    </RNText>
                    <RNText style={styles.totalAmountUSD}>
                      {formatUSD(monthExpenseUSD)}
                    </RNText>
                  </View>
                </View>
              </View>

              {/* Lista con Scroll Interno */}
              <ScrollView 
                style={styles.transactionCardList}
                showsVerticalScrollIndicator={false}
              >
                {expenseTransactions.length === 0 ? (
                  <View style={styles.emptyState}>
                    <RNText style={styles.emptyText}>
                      No hay egresos en {MONTHS[selectedMonth]} {year}
                    </RNText>
                  </View>
                ) : (
                  expenseTransactions.map((transaction) => (
                    <TransactionCard
                      key={transaction.id}
                      transaction={transaction}
                      onEdit={handleEditTransaction}
                      onDelete={handleDeleteClick}
                      formatCurrency={formatCurrency}
                      formatUSD={formatUSD}
                      currentDolarRate={currentDolarRate}
                    />
                  ))
                )}
              </ScrollView>
            </View>
          </View>
        </ScrollView>

        {/* Espaciado final para el nav flotante */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Diálogo de Confirmación de Eliminación */}
      <Portal>
        <Dialog visible={deleteDialogOpen} onDismiss={() => setDeleteDialogOpen(false)}>
          <Dialog.Title>Confirmar Eliminación</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              ¿Estás seguro de que deseas eliminar esta transacción?
            </Text>
            {transactionToDelete && (
              <View style={styles.deleteDetails}>
                <Text variant="bodySmall" style={styles.deleteDetailText}>
                  <Text style={styles.deleteDetailLabel}>Descripción: </Text>
                  {transactionToDelete.description}
                </Text>
                <Text variant="bodySmall" style={styles.deleteDetailText}>
                  <Text style={styles.deleteDetailLabel}>Monto: </Text>
                  {formatCurrency(transactionToDelete.amountArs)}
                </Text>
              </View>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogOpen(false)}>Cancelar</Button>
            <Button onPress={handleDeleteConfirm} textColor={colors.error}>
              Eliminar
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Modal de Ingreso */}
      <IncomeTransactionModal
        visible={incomeDialogOpen}
        onDismiss={() => {
          setIncomeDialogOpen(false)
          setEditingTransaction(null)
        }}
        onSuccess={handleTransactionSuccess}
        transaction={editingTransaction}
      />
    </ScreenLayout>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    color: colors.text,
    marginTop: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 8,
  },
  pageTitle: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 20,
  },
  selectorsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  monthSelector: {
    borderColor: colors.border,
    borderRadius: 8,
    minWidth: 120,
  },
  yearSelector: {
    borderColor: colors.border,
    borderRadius: 8,
    minWidth: 90,
  },
  selectorContent: {
    height: 40,
  },
  selectorText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: colors.text,
    marginBottom: 12,
    marginHorizontal: 20,
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 0.3,
  },
  yearCardsScroll: {
    marginBottom: 8,
  },
  yearCardsContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  monthCardsScroll: {
    marginBottom: 8,
  },
  monthCardsContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  gradientCard: {
    borderRadius: 16,
    marginRight: 16,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 20,
  },
  cardLabel: {
    color: 'white',
    fontSize: 12,
    marginBottom: 6,
    opacity: 0.85,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  cardAmount: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  cardSubAmount: {
    color: 'white',
    fontSize: 14,
    opacity: 0.75,
    fontWeight: '400',
  },
  rateCard: {
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 12,
  },
  rateContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rateIcon: {
    fontSize: 24,
  },
  rateInfo: {
    flex: 1,
  },
  rateTitle: {
    color: colors.text,
    fontWeight: '600',
    marginBottom: 4,
  },
  rateSubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  transactionsCard: {
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    borderRadius: 12,
  },
  placeholderText: {
    color: colors.textSecondary,
    textAlign: 'center',
    padding: 20,
  },
  transactionsScroll: {
    height: Dimensions.get('window').height - 250,
    marginBottom: 20,
  },
  transactionsScrollContent: {
    paddingHorizontal: 16,
    gap: 16,
  },
  transactionCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    width: Dimensions.get('window').width - 32,
    height: Dimensions.get('window').height - 250,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  transactionCardContent: {
    flex: 1,
    padding: 16,
  },
  transactionCardHeader: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: 16,
    marginBottom: 12,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    marginTop: -16,
    marginLeft: -16,
    marginRight: -16,
  },
  transactionCardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionCardTitle: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 18,
  },
  transactionCardTotal: {
    alignItems: 'flex-end',
  },
  transactionCardList: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: colors.textSecondary,
    textAlign: 'center',
    fontSize: 14,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  totalAmountUSD: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  deleteDetails: {
    marginTop: 16,
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  deleteDetailText: {
    color: colors.text,
    marginBottom: 8,
  },
  deleteDetailLabel: {
    fontWeight: '600',
    color: colors.text,
  },
})
