import React, { useState, useEffect } from 'react'
import { View, StyleSheet, ScrollView, Dimensions, ActivityIndicator, RefreshControl, TouchableOpacity, Animated } from 'react-native'
import { Text, Card, Button, IconButton, Avatar, Chip, Divider, Menu } from 'react-native-paper'
import { LinearGradient } from 'expo-linear-gradient'
import { LineChart } from 'react-native-chart-kit'
import { colors } from '../../theme/colors'
import { useAuthStore } from '../../store/authStore'
import { CreditCardItem } from '../../components/CreditCardItem'
import { CategoryItem } from '../../components/CategoryItem'
import { AppHeader } from '../../components/AppHeader'
import { ScreenLayout } from '../../components/ScreenLayout'
import { 
  analyticsApi, 
  transactionsApi, 
  categoriesApi, 
  creditCardsApi, 
  clientsApi 
} from '../../services/api'

const { width } = Dimensions.get('window')
const CARD_WIDTH = width * 0.6

const MONTHS = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
]

const MONTHS_FULL = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

export const DashboardScreen = ({ navigation }: any) => {
  const logout = useAuthStore((state) => state.logout)
  const user = useAuthStore((state) => state.user)
  
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  
  // Estados
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [showUSD, setShowUSD] = useState(false)
  const [expandedMonth, setExpandedMonth] = useState<number | null>(null)
  const [categoryType, setCategoryType] = useState<'INCOME' | 'EXPENSE'>('INCOME')
  const [selectedCategoryMonth, setSelectedCategoryMonth] = useState(currentMonth + 1)
  const [typeMenuVisible, setTypeMenuVisible] = useState(false)
  const [monthMenuVisible, setMonthMenuVisible] = useState(false)
  
  // Animación del gradiente
  const gradientAnimation = React.useRef(new Animated.Value(0)).current
  
  // Datos del dashboard
  const [stats, setStats] = useState({
    incomeCategories: 0,
    expenseCategories: 0,
    clients: 0,
    creditCards: 0
  })

  const [currentMonthData, setCurrentMonthData] = useState({
    income: { ars: 0, usd: 0 },
    expense: { ars: 0, usd: 0 },
    balance: { ars: 0, usd: 0 },
    transactionCount: 0
  })

  const [previousMonthData, setPreviousMonthData] = useState({
    income: { ars: 0, usd: 0 },
    expense: { ars: 0, usd: 0 },
    balance: { ars: 0, usd: 0 },
    transactionCount: 0
  })

  const [percentageChanges, setPercentageChanges] = useState({
    income: 0,
    expense: 0,
    balance: 0,
    transactions: 0
  })

  const [chartData, setChartData] = useState({
    income: new Array(12).fill(0),
    expense: new Array(12).fill(0),
    balance: new Array(12).fill(0)
  })

  const [recentTransactions, setRecentTransactions] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [creditCards, setCreditCards] = useState<any[]>([])
  
  const [yearlyData, setYearlyData] = useState({
    totals: {
      income: { ars: 0, usd: 0 },
      expense: { ars: 0, usd: 0 },
      balance: { ars: 0, usd: 0 }
    },
    monthly: [] as any[]
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatUSD = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const getPercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
  }

  // Animación del gradiente
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(gradientAnimation, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: false,
        }),
        Animated.timing(gradientAnimation, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: false,
        }),
      ])
    ).start()
  }, [])

  // Cargar datos
  useEffect(() => {
    loadDashboardData()
  }, [])

  useEffect(() => {
    if (!loading) {
      loadYearlySummary()
    }
  }, [selectedYear])

  useEffect(() => {
    if (!loading) {
      loadCategories()
      loadCreditCards()
    }
  }, [categoryType, selectedCategoryMonth, selectedYear])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError('')
      
      console.log('🔄 Loading dashboard data...')

      const [dashboardData, categoriesResponse, creditCardsResponse, clientsResponse, yearlySummaryData] = await Promise.all([
        analyticsApi.getDashboard(),
        categoriesApi.getAll(),
        creditCardsApi.getAll(),
        clientsApi.getAll(),
        analyticsApi.getYearlySummary(selectedYear)
      ])
      
      console.log('📊 Dashboard data loaded:', {
        dashboard: !!dashboardData,
        categories: categoriesResponse,
        creditCards: !!creditCardsResponse,
        clients: !!clientsResponse,
        yearly: !!yearlySummaryData
      })
      
      console.log('📅 Yearly summary data:', yearlySummaryData)
      console.log('📋 Monthly breakdown:', yearlySummaryData?.months)
      console.log('📊 Totals:', yearlySummaryData?.totals)

      // Manejar diferentes formatos de respuesta de la API
      const categoriesData = Array.isArray(categoriesResponse) ? categoriesResponse : (categoriesResponse?.categories || [])
      const creditCardsData = Array.isArray(creditCardsResponse) ? creditCardsResponse : (creditCardsResponse?.creditCards || [])
      const clientsData = Array.isArray(clientsResponse) ? clientsResponse : (clientsResponse?.clients || [])

      const currentData = {
        income: dashboardData.currentMonth?.income || { ars: 0, usd: 0 },
        expense: dashboardData.currentMonth?.expense || { ars: 0, usd: 0 },
        balance: dashboardData.currentMonth?.balance || { ars: 0, usd: 0 },
        transactionCount: dashboardData.recentTransactions?.length || 0
      }

      const previousData = {
        income: dashboardData.previousMonth?.income || { ars: 0, usd: 0 },
        expense: dashboardData.previousMonth?.expense || { ars: 0, usd: 0 },
        balance: dashboardData.previousMonth?.balance || { ars: 0, usd: 0 },
        transactionCount: dashboardData.previousMonthTransactionCount || 0
      }

      setCurrentMonthData(currentData)
      setPreviousMonthData(previousData)

      // Calcular porcentajes de cambio
      setPercentageChanges({
        income: getPercentageChange(currentData.income.ars, previousData.income.ars),
        expense: getPercentageChange(currentData.expense.ars, previousData.expense.ars),
        balance: getPercentageChange(currentData.balance.ars, previousData.balance.ars),
        transactions: getPercentageChange(currentData.transactionCount, previousData.transactionCount)
      })

      setRecentTransactions(dashboardData.recentTransactions || [])

      const incomeCategories = categoriesData.filter((c: any) => c.type === 'INCOME').length
      const expenseCategories = categoriesData.filter((c: any) => c.type === 'EXPENSE').length
      const activeClients = clientsData.filter((c: any) => c.active).length
      const activeCards = creditCardsData.filter((c: any) => c.isActive).length

      setStats({ incomeCategories, expenseCategories, clients: activeClients, creditCards: activeCards })

      console.log('🔄 Processing chart data...')
      console.log('📊 Months data for chart:', yearlySummaryData.months)
      // La API devuelve 'months' en lugar de 'monthlyBreakdown'
      const processedData = {
        ...yearlySummaryData,
        monthlyBreakdown: yearlySummaryData.months || []
      }
      console.log('✅ Processed data for chart:', processedData.monthlyBreakdown)
      processChartData(processedData)

      console.log('💾 Setting yearly data with totals:', yearlySummaryData.totals)
      setYearlyData({
        totals: yearlySummaryData.totals || {
          income: { ars: 0, usd: 0 },
          expense: { ars: 0, usd: 0 },
          balance: { ars: 0, usd: 0 }
        },
        monthly: yearlySummaryData.months || []
      })

      await loadCategories()
      await loadCreditCards()
    } catch (err: any) {
      console.error('Error loading dashboard:', err)
      setError(err.response?.data?.error || 'Error al cargar el dashboard')
    } finally {
      setLoading(false)
    }
  }

  const processChartData = (yearlySummaryData: any) => {
    const monthlyBreakdown = yearlySummaryData.monthlyBreakdown || []
    const incomeData = []
    const expenseData = []
    const balanceData = []

    for (let month = 1; month <= 12; month++) {
      const monthData = monthlyBreakdown.find((m: any) => m.month === month) || { income: { ars: 0, usd: 0 }, expense: { ars: 0, usd: 0 } }
      // La estructura es: { income: { ars, usd }, expense: { ars, usd } }
      const income = showUSD ? (monthData.income?.usd || 0) : (monthData.income?.ars || 0)
      const expense = showUSD ? (monthData.expense?.usd || 0) : (monthData.expense?.ars || 0)
      const balance = income - expense
      incomeData.push(income / (showUSD ? 1 : 1000))
      expenseData.push(expense / (showUSD ? 1 : 1000))
      balanceData.push(balance / (showUSD ? 1 : 1000))
    }

    setChartData({ income: incomeData, expense: expenseData, balance: balanceData })
  }

  const loadYearlySummary = async () => {
    try {
      console.log('📅 Loading yearly summary for year:', selectedYear)
      const yearlySummaryData = await analyticsApi.getYearlySummary(selectedYear)
      console.log('📊 Yearly summary response:', yearlySummaryData)
      
      processChartData(yearlySummaryData)
      
      // Procesar monthly breakdown con cotizaciones históricas
      const monthlyBreakdown = yearlySummaryData.monthlyBreakdown || []
      console.log('📋 Monthly breakdown:', monthlyBreakdown)
      
      setYearlyData({
        totals: {
          income: yearlySummaryData.income || { ars: 0, usd: 0 },
          expense: yearlySummaryData.expense || { ars: 0, usd: 0 },
          balance: yearlySummaryData.balance || { ars: 0, usd: 0 }
        },
        monthly: monthlyBreakdown
      })
    } catch (err) {
      console.error('❌ Error loading yearly summary:', err)
    }
  }

  const loadCategories = async () => {
    try {
      console.log('🔍 Loading categories for type:', categoryType)
      const categoriesResponse = await categoriesApi.getAll(categoryType)
      console.log('📦 Raw categories response:', categoriesResponse)
      
      const allCategories = Array.isArray(categoriesResponse) ? categoriesResponse : (categoriesResponse?.categories || [])
      console.log('📋 Processed categories array:', allCategories)
      
      // Validar que allCategories sea un array
      if (!Array.isArray(allCategories)) {
        console.error('❌ Categories is not an array:', allCategories)
        setCategories([])
        return
      }
      
      const transactionsData = await transactionsApi.getAll(selectedCategoryMonth, selectedYear)
      const transactions = transactionsData.transactions || transactionsData || []
      const filteredTransactions = Array.isArray(transactions) ? transactions.filter((t: any) => t.type === categoryType) : []
      
      const categoryTotals: any = {}
      filteredTransactions.forEach((transaction: any) => {
        const categoryId = transaction.category?.id || 'no-category'
        if (!categoryTotals[categoryId]) {
          categoryTotals[categoryId] = { total: 0, count: 0 }
        }
        categoryTotals[categoryId].total += Number(transaction.amountArs) || 0
        categoryTotals[categoryId].count += 1
      })
      
      const categoryArray = allCategories
        .filter((category: any) => {
          const isValid = category && typeof category === 'object' && category.id
          if (!isValid) {
            console.warn('⚠️ Filtering out invalid category:', category)
          }
          return isValid
        })
        .map((category: any) => {
          const totals = categoryTotals[category.id] || { total: 0, count: 0 }
          const mapped = {
            id: String(category.id),
            name: String(category.name || 'Sin nombre'),
            total: totals.total,
            count: totals.count,
            color: category.color || (categoryType === 'INCOME' ? '#10B981' : '#EF4444')
            // NO incluir icon - solo los campos que CategoryItem necesita
          }
          console.log('✅ Mapped category:', mapped)
          return mapped
        })
      
      categoryArray.sort((a: any, b: any) => b.total !== a.total ? b.total - a.total : a.name.localeCompare(b.name))
      console.log('📊 Final categories array:', categoryArray)
      setCategories(categoryArray)
    } catch (err) {
      console.error('Error loading categories:', err)
      setCategories([]) // Asegurar que siempre sea un array
    }
  }

  const loadCreditCards = async () => {
    try {
      const cardsResponse = await creditCardsApi.getAll()
      const cardsData = Array.isArray(cardsResponse) ? cardsResponse : (cardsResponse?.creditCards || [])
      
      const cardsWithConsumption = await Promise.all(
        cardsData.map(async (card: any) => {
          try {
            const transactionsData = await transactionsApi.getAll(selectedCategoryMonth, selectedYear)
            const allTransactions = transactionsData.transactions || transactionsData || []
            const cardTransactions = allTransactions.filter((t: any) => t.creditCardId === card.id && t.type === 'EXPENSE')
            const monthlyConsumption = cardTransactions.reduce((sum: number, t: any) => sum + Math.abs(Number(t.amountArs) || 0), 0)
            return { ...card, monthlyConsumption, lastFourDigits: card.lastFourDigits || '0000' }
          } catch (err) {
            return { ...card, monthlyConsumption: 0, lastFourDigits: card.lastFourDigits || '0000' }
          }
        })
      )
      setCreditCards(cardsWithConsumption)
    } catch (err) {
      console.error('Error loading credit cards:', err)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadDashboardData()
    setRefreshing(false)
  }

  if (loading) {
    return (
      <ScreenLayout>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando dashboard...</Text>
        </View>
      </ScreenLayout>
    )
  }

  if (error) {
    return (
      <ScreenLayout>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button mode="contained" onPress={loadDashboardData} buttonColor={colors.primary}>
            Reintentar
          </Button>
        </View>
      </ScreenLayout>
    )
  }

  return (
    <ScreenLayout>
      {/* Contenido con Scroll */}
      <ScrollView 
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
        contentContainerStyle={styles.scrollContentContainer}
      >
      {/* Header Superior - No sticky, fluye con el scroll */}
      <AppHeader />

      {/* Mensaje de Bienvenida con Container */}
      <View style={styles.welcomeCard}>
        <Animated.View
          style={[
            styles.welcomeGradient,
            {
              opacity: gradientAnimation.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [1, 0.7, 1],
              }),
            },
          ]}
        >
          <LinearGradient
            colors={['rgba(16, 185, 129, 0.2)', 'rgba(139, 92, 246, 0.2)', 'rgba(245, 158, 11, 0.2)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientBackground}
          >
          <View style={styles.welcomeContent}>
            <Text variant="headlineSmall" style={styles.welcomeTitle}>
              <Text style={styles.welcomeHello}>Hola, </Text>
              {user?.name || 'Usuario Demo'}
            </Text>
            <Text variant="bodyMedium" style={styles.welcomeSubtitle}>
              Aquí tienes un resumen completo de tus finanzas. Revisa tus ingresos, egresos y el balance general de tu negocio.
            </Text>

          {/* Accesos Rápidos a Configuración */}
          <View style={styles.quickAccessGrid}>
            <TouchableOpacity 
              style={styles.quickAccessItem}
              onPress={() => navigation.navigate('CategoriesSettings')}
            >
              <View style={styles.quickAccessIconBox}>
                <IconButton
                  icon="folder-outline"
                  size={28}
                  iconColor="#FFFFFF"
                  style={styles.quickAccessIcon}
                />
              </View>
              <Text style={styles.quickAccessLabel}>Categorías</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickAccessItem}
              onPress={() => navigation.navigate('ClientsSettings')}
            >
              <View style={styles.quickAccessIconBox}>
                <IconButton
                  icon="account-multiple-outline"
                  size={28}
                  iconColor="#FFFFFF"
                  style={styles.quickAccessIcon}
                />
              </View>
              <Text style={styles.quickAccessLabel}>Clientes</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickAccessItem}
              onPress={() => navigation.navigate('CreditCardsSettings')}
            >
              <View style={styles.quickAccessIconBox}>
                <IconButton
                  icon="credit-card-outline"
                  size={28}
                  iconColor="#FFFFFF"
                  style={styles.quickAccessIcon}
                />
              </View>
              <Text style={styles.quickAccessLabel}>Tarjetas</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickAccessItem}
              onPress={() => navigation.navigate('BankAccountsSettings')}
            >
              <View style={styles.quickAccessIconBox}>
                <IconButton
                  icon="bank-outline"
                  size={28}
                  iconColor="#FFFFFF"
                  style={styles.quickAccessIcon}
                />
              </View>
              <Text style={styles.quickAccessLabel}>Bancos</Text>
            </TouchableOpacity>
          </View>
          </View>
          </LinearGradient>
        </Animated.View>
      </View>

      {/* Cards de Resumen con Grid */}
      <Text variant="titleMedium" style={[styles.sectionTitle, { marginTop: 24 }]}>
        Resumen de {MONTHS_FULL[currentMonth]}
      </Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.summaryCardsContainer}
        style={styles.summaryCardsScroll}
      >
        {/* Card de Ingresos */}
        <LinearGradient
          colors={['#10B981', '#059669']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradientCard, { width: CARD_WIDTH }]}
        >
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardLabel}>
                  Ingresos en {MONTHS_FULL[currentMonth]}
                </Text>
                <Text style={styles.cardAmount}>
                  {formatCurrency(currentMonthData.income.ars)}
                </Text>
                <Text style={styles.cardSubAmount}>
                  {formatUSD(currentMonthData.income.usd)}
                </Text>
              </View>
              <Avatar.Icon 
                size={48} 
                icon="trending-up" 
                style={styles.cardIcon}
                color="rgba(255,255,255,0.9)"
              />
            </View>
            <View style={styles.cardFooter}>
              <Text style={styles.cardPercentage}>
                {percentageChanges.income >= 0 ? '↑' : '↓'} {percentageChanges.income >= 0 ? '+' : ''}{percentageChanges.income.toFixed(1)}%
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Card de Egresos */}
        <LinearGradient
          colors={['#8B5CF6', '#7C3AED']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradientCard, { width: CARD_WIDTH }]}
        >
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardLabel}>
                  Egresos en {MONTHS_FULL[currentMonth]}
                </Text>
                <Text style={styles.cardAmount}>
                  {formatCurrency(currentMonthData.expense.ars)}
                </Text>
                <Text style={styles.cardSubAmount}>
                  {formatUSD(currentMonthData.expense.usd)}
                </Text>
              </View>
              <Avatar.Icon 
                size={48} 
                icon="credit-card" 
                style={styles.cardIcon}
                color="rgba(255,255,255,0.9)"
              />
            </View>
            <View style={styles.cardFooter}>
              <Text style={styles.cardPercentage}>
                {percentageChanges.expense >= 0 ? '↑' : '↓'} {percentageChanges.expense >= 0 ? '+' : ''}{percentageChanges.expense.toFixed(1)}%
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Card de Balance */}
        <LinearGradient
          colors={['#F59E0B', '#D97706']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradientCard, { width: CARD_WIDTH }]}
        >
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardLabel}>
                  Balance en {MONTHS_FULL[currentMonth]}
                </Text>
                <Text style={styles.cardAmount}>
                  {formatCurrency(currentMonthData.balance.ars)}
                </Text>
                <Text style={styles.cardSubAmount}>
                  {formatUSD(currentMonthData.balance.usd)}
                </Text>
              </View>
              <Avatar.Icon 
                size={48} 
                icon="chart-line" 
                style={styles.cardIcon}
                color="rgba(255,255,255,0.9)"
              />
            </View>
            <View style={styles.cardFooter}>
              <Text style={styles.cardPercentage}>
                {percentageChanges.balance >= 0 ? '↑' : '↓'} {percentageChanges.balance >= 0 ? '+' : ''}{percentageChanges.balance.toFixed(1)}%
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Card de Transacciones */}
        <LinearGradient
          colors={['#EF4444', '#DC2626']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradientCard, { width: CARD_WIDTH }]}
        >
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardLabel}>
                  Transacciones
                </Text>
                <Text style={styles.cardAmount}>
                  {currentMonthData.transactionCount}
                </Text>
                <Text style={styles.cardSubAmount}>
                  Este mes
                </Text>
              </View>
              <Avatar.Icon 
                size={48} 
                icon="receipt" 
                style={styles.cardIcon}
                color="rgba(255,255,255,0.9)"
              />
            </View>
            <View style={styles.cardFooter}>
              <Text style={styles.cardPercentage}>
                {percentageChanges.transactions >= 0 ? '↑' : '↓'} {percentageChanges.transactions >= 0 ? '+' : ''}{percentageChanges.transactions.toFixed(1)}%
              </Text>
            </View>
          </View>
        </LinearGradient>
      </ScrollView>

      {/* Sección de Categorías y Tarjetas */}
      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Resumen de movimientos
        </Text>
        
        {/* Categorías por Mes */}
        <Card style={styles.categoriesCard}>
          <View style={styles.cardSubHeader}>
            <Text variant="titleSmall" style={styles.cardSubTitle}>
              Transacciones por categoría
            </Text>
            <View style={styles.categoryFilters}>
              {/* Select de Tipo */}
              <Menu
                visible={typeMenuVisible}
                onDismiss={() => setTypeMenuVisible(false)}
                anchor={
                  <Button
                    mode="outlined"
                    onPress={() => setTypeMenuVisible(true)}
                    style={styles.selectButton}
                    contentStyle={styles.selectButtonContent}
                    labelStyle={styles.selectButtonLabel}
                    textColor={colors.text}
                    compact={true}
                  >
                    {categoryType === 'INCOME' ? 'Ingresos' : 'Egresos'}
                  </Button>
                }
                contentStyle={styles.menuContent}
              >
                <Menu.Item
                  onPress={() => {
                    setCategoryType('INCOME')
                    setTypeMenuVisible(false)
                  }}
                  title="Ingresos"
                  titleStyle={styles.menuItemTitle}
                  leadingIcon="trending-up"
                />
                <Menu.Item
                  onPress={() => {
                    setCategoryType('EXPENSE')
                    setTypeMenuVisible(false)
                  }}
                  title="Egresos"
                  titleStyle={styles.menuItemTitle}
                  leadingIcon="trending-down"
                />
              </Menu>
            </View>
          </View>
          <Card.Content>
            
            {categories.length > 0 ? (
              categories.map((category) => {
                // Validar que category sea un objeto válido
                if (!category || typeof category !== 'object') {
                  console.error('Invalid category:', category)
                  return null
                }
                
                // Validar que tenga los campos requeridos
                if (!category.id || !category.name) {
                  console.error('Category missing required fields:', category)
                  return null
                }
                
                return <CategoryItem key={category.id} category={category} />
              })
            ) : (
              <Text style={styles.emptyText}>No hay categorías para mostrar</Text>
            )}
          </Card.Content>
        </Card>

        {/* Tarjetas de Crédito */}
        <Text variant="titleSmall" style={[styles.sectionTitle, { marginTop: 16 }]}>
          Tarjetas de Crédito
        </Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardsContainer}
          style={styles.cardsScroll}
        >
          {creditCards.map((card) => (
            <CreditCardItem key={card.id} card={card} />
          ))}
        </ScrollView>
      </View>

      {/* Transacciones Recientes */}
      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Transacciones Recientes
        </Text>
        <Card style={styles.transactionsCard}>
          <Card.Content>
            {recentTransactions.map((transaction, index) => (
              <View 
                key={transaction.id}
                style={[
                  styles.transactionItem,
                  index < recentTransactions.length - 1 && styles.transactionBorder
                ]}
              >
                <View style={styles.transactionLeft}>
                  <Avatar.Icon
                    size={40}
                    icon={transaction.type === 'INCOME' ? 'trending-up' : 'trending-down'}
                    style={{
                      backgroundColor: transaction.type === 'INCOME' ? colors.income : colors.expense
                    }}
                    color="white"
                  />
                  <View style={styles.transactionInfo}>
                    <Text variant="bodyMedium" style={styles.transactionDescription}>
                      {transaction.description}
                    </Text>
                    <Text variant="bodySmall" style={styles.transactionCategory}>
                      {transaction.category?.name || 'Sin categoría'} • {new Date(transaction.date).toLocaleDateString('es-AR')}
                    </Text>
                  </View>
                </View>
                <Text 
                  variant="bodyLarge" 
                  style={[
                    styles.transactionAmount,
                    { color: transaction.type === 'INCOME' ? colors.income : colors.expense }
                  ]}
                >
                  {transaction.type === 'INCOME' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amountArs))}
                </Text>
              </View>
            ))}
            
            <Button 
              mode="text" 
              onPress={() => alert('Próximamente: Ver todas')}
              style={styles.viewAllButton}
              textColor={colors.primary}
            >
              Ver todas las transacciones →
            </Button>
          </Card.Content>
        </Card>
      </View>

      {/* Resumen Anual */}
      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Resumen Anual {selectedYear}
        </Text>
        
        {/* Gráfico de Evolución Mensual */}
        <Card style={styles.chartCard}>
          <Card.Content>
            <View style={styles.chartHeader}>
              <Text variant="titleSmall" style={styles.chartTitle}>
                Evolución Mensual {selectedYear}
              </Text>
              <View style={styles.chartButtons}>
                <Button 
                  mode={showUSD ? 'outlined' : 'contained'}
                  onPress={() => setShowUSD(false)}
                  compact
                  style={styles.chartButton}
                >
                  ARS
                </Button>
                <Button 
                  mode={showUSD ? 'contained' : 'outlined'}
                  onPress={() => setShowUSD(true)}
                  compact
                  style={styles.chartButton}
                >
                  USD
                </Button>
              </View>
            </View>
            <LineChart
              data={{
                labels: MONTHS,
                datasets: [
                  {
                    data: chartData.income,
                    color: () => colors.income,
                    strokeWidth: 3
                  },
                  { 
                    data: chartData.expense, 
                    color: () => colors.expense,
                    strokeWidth: 3
                  },
                  { 
                    data: chartData.balance, 
                    color: () => colors.secondary,
                    strokeWidth: 3
                  }
                ],
                legend: ['Ingresos', 'Egresos', 'Balance']
              }}
              width={width - 64}
              height={240}
              chartConfig={{
                backgroundColor: colors.surface,
                backgroundGradientFrom: colors.surface,
                backgroundGradientTo: colors.surface,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity * 0.7})`,
                style: { borderRadius: 16 },
                propsForDots: {
                  r: '6',
                  strokeWidth: '3',
                  stroke: colors.surface
                },
                propsForBackgroundLines: {
                  strokeDasharray: '',
                  stroke: 'rgba(255, 255, 255, 0.1)',
                  strokeWidth: 1
                }
              }}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 16
              }}
              withInnerLines={true}
              withOuterLines={false}
              withVerticalLines={false}
              withHorizontalLines={true}
            />
          </Card.Content>
        </Card>

        {/* Cards de totales */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.summaryCardsContainer}
          style={styles.summaryCardsScroll}
        >
          <LinearGradient
            colors={['#10B981', '#059669']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.gradientCard, { width: CARD_WIDTH }]}
          >
            <View style={styles.cardContent}>
              <Text style={styles.cardLabel}>Ingresos Totales</Text>
              <Text style={styles.cardAmount}>
                {formatCurrency(yearlyData.totals.income.ars)}
              </Text>
              <Text style={styles.cardSubAmount}>
                {formatUSD(yearlyData.totals.income.usd)}
              </Text>
            </View>
          </LinearGradient>

          <LinearGradient
            colors={['#8B5CF6', '#7C3AED']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.gradientCard, { width: CARD_WIDTH }]}
          >
            <View style={styles.cardContent}>
              <Text style={styles.cardLabel}>Egresos Totales</Text>
              <Text style={styles.cardAmount}>
                {formatCurrency(yearlyData.totals.expense.ars)}
              </Text>
              <Text style={styles.cardSubAmount}>
                {formatUSD(yearlyData.totals.expense.usd)}
              </Text>
            </View>
          </LinearGradient>

          <LinearGradient
            colors={['#F59E0B', '#D97706']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.gradientCard, { width: CARD_WIDTH }]}
          >
            <View style={styles.cardContent}>
              <Text style={styles.cardLabel}>Balance Total</Text>
              <Text style={styles.cardAmount}>
                {formatCurrency(yearlyData.totals.balance.ars)}
              </Text>
              <Text style={styles.cardSubAmount}>
                {formatUSD(yearlyData.totals.balance.usd)}
              </Text>
            </View>
          </LinearGradient>
        </ScrollView>

        {/* Breakdown Mensual con Acordeones */}
        <Text variant="titleSmall" style={[styles.sectionTitle, { marginTop: 16 }]}>
          Breakdown Mensual
        </Text>
        
        {MONTHS_FULL.map((month, index) => {
          const monthData = yearlyData.monthly[index] || {
            exchangeRate: 0,
            income: { ars: 0, usd: 0 },
            expense: { ars: 0, usd: 0 },
            balance: { ars: 0, usd: 0 }
          }
          
          const cotizacion = monthData.exchangeRate || 
            (monthData.income?.usd > 0 ? monthData.income?.ars / monthData.income?.usd : 0) ||
            850
          
          const incomeArs = monthData.income?.ars || 0
          const incomeUsd = monthData.income?.usd || 0
          const expenseArs = monthData.expense?.ars || 0
          const expenseUsd = monthData.expense?.usd || 0
          const balanceArs = monthData.balance?.ars || 0
          const balanceUsd = monthData.balance?.usd || 0
          
          const percentage = incomeArs > 0 
            ? ((balanceArs / incomeArs) * 100).toFixed(1)
            : '0.0'
          
          const isExpanded = expandedMonth === index
          const hasData = incomeArs > 0 || expenseArs > 0

          return (
            <TouchableOpacity
              key={index}
              onPress={() => setExpandedMonth(isExpanded ? null : index)}
              activeOpacity={0.7}
            >
              <Card style={[styles.accordionCard, !hasData && styles.accordionCardEmpty]}>
                <Card.Content>
                  {/* Header Minimalista */}
                  <View style={styles.accordionHeader}>
                    {/* Mes */}
                    <Text variant="titleMedium" style={styles.accordionMonth}>
                      {month}
                    </Text>

                    {/* Balance y PNL (siempre visible) */}
                    <View style={styles.accordionBalanceSection}>
                      <View style={styles.accordionBalanceRow}>
                        <Text variant="bodySmall" style={styles.accordionBalanceLabel}>Balance</Text>
                        <Text variant="titleSmall" style={[styles.accordionBalanceValue, styles.balanceText]}>
                          {formatCurrency(balanceArs)}
                        </Text>
                      </View>
                      {hasData && (
                        <View style={[
                          styles.accordionMiniChip, 
                          { backgroundColor: balanceArs >= 0 ? colors.income + '20' : colors.expense + '20' }
                        ]}>
                          <Text style={[
                            styles.accordionMiniChipText,
                            { color: balanceArs >= 0 ? colors.income : colors.expense }
                          ]}>
                            {percentage}%
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Icono Expandir */}
                    <IconButton
                      icon={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      iconColor={colors.textSecondary}
                      style={styles.accordionChevron}
                    />
                  </View>

                  {/* Detalles Completos al Expandir */}
                  {isExpanded && (
                    <>
                      <Divider style={styles.accordionDivider} />
                      
                      {/* Cotización como Card */}
                      <View style={styles.accordionExchangeCard}>
                        <Text variant="bodySmall" style={styles.accordionExchangeLabel}>Cotización USD</Text>
                        <Text variant="titleLarge" style={styles.accordionExchangeValue}>
                          ${cotizacion.toFixed(2)}
                        </Text>
                      </View>

                      {/* Resumen Completo ARS */}
                      <View style={styles.accordionExpandedSummary}>
                        <View style={styles.accordionExpandedItem}>
                          <Text variant="bodySmall" style={styles.accordionExpandedLabel}>Ingresos ARS</Text>
                          <Text variant="titleSmall" style={[styles.accordionExpandedValue, styles.incomeText]}>
                            {formatCurrency(incomeArs)}
                          </Text>
                        </View>
                        <View style={styles.accordionExpandedItem}>
                          <Text variant="bodySmall" style={styles.accordionExpandedLabel}>Egresos ARS</Text>
                          <Text variant="titleSmall" style={[styles.accordionExpandedValue, styles.expenseText]}>
                            {formatCurrency(expenseArs)}
                          </Text>
                        </View>
                        <View style={styles.accordionExpandedItem}>
                          <Text variant="bodySmall" style={styles.accordionExpandedLabel}>Balance ARS</Text>
                          <Text variant="titleSmall" style={[styles.accordionExpandedValue, styles.balanceText]}>
                            {formatCurrency(balanceArs)}
                          </Text>
                        </View>
                      </View>

                      {/* Resumen Completo USD */}
                      <View style={styles.accordionExpandedSummary}>
                        <View style={styles.accordionExpandedItem}>
                          <Text variant="bodySmall" style={styles.accordionExpandedLabel}>Ingresos USD</Text>
                          <Text variant="titleSmall" style={[styles.accordionExpandedValue, styles.incomeText]}>
                            {formatUSD(incomeUsd)}
                          </Text>
                        </View>
                        <View style={styles.accordionExpandedItem}>
                          <Text variant="bodySmall" style={styles.accordionExpandedLabel}>Egresos USD</Text>
                          <Text variant="titleSmall" style={[styles.accordionExpandedValue, styles.expenseText]}>
                            {formatUSD(expenseUsd)}
                          </Text>
                        </View>
                        <View style={styles.accordionExpandedItem}>
                          <Text variant="bodySmall" style={styles.accordionExpandedLabel}>Balance USD</Text>
                          <Text variant="titleSmall" style={[styles.accordionExpandedValue, styles.balanceText]}>
                            {formatUSD(balanceUsd)}
                          </Text>
                        </View>
                      </View>
                    </>
                  )}

                </Card.Content>
              </Card>
            </TouchableOpacity>
          )
        })}
      </View>

      {/* Espaciado final para el nav flotante */}
      <View style={{ height: 100 }} />
      </ScrollView>
    </ScreenLayout>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 20,
  },
  fixedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
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
  welcomeCard: {
    backgroundColor: 'transparent',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 0,
    shadowOpacity: 0,
  },
  welcomeGradient: {
    width: '100%',
    borderRadius: 20,
  },
  gradientBackground: {
    width: '100%',
    borderRadius: 20,
    padding: 20,
  },
  welcomeContent: {
  },
  welcomeTitle: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 8,
    fontSize: 20,
  },
  welcomeHello: {
    color: '#FFFFFF',
    fontWeight: '400',
    fontSize: 20,
  },
  welcomeSubtitle: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
    opacity: 0.9,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: colors.textSecondary,
    textAlign: 'center',
    fontSize: 11,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
  },
  secondaryButton: {
    flex: 1,
    borderColor: colors.border,
  },
  quickAccessGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    gap: 8,
  },
  quickAccessItem: {
    alignItems: 'center',
    flex: 1,
  },
  quickAccessIconBox: {
    width: 64,
    height: 64,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickAccessIcon: {
    margin: 0,
  },
  quickAccessLabel: {
    fontSize: 11,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 14,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 24,
  },
  errorText: {
    color: colors.error,
    marginBottom: 16,
    textAlign: 'center',
  },
  headerCard: {
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
    borderRadius: 12,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  welcomeText: {
    color: colors.text,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerSubtitle: {
    color: colors.textSecondary,
    maxWidth: '90%',
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: colors.text,
    marginBottom: 12,
    marginHorizontal: 20,
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 0.3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  sectionActions: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    height: 28,
  },
  smallChip: {
    height: 24,
  },
  summaryCardsScroll: {
    marginBottom: 8,
  },
  summaryCardsContainer: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  cardIcon: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  cardFooter: {
    marginTop: 12,
  },
  cardPercentage: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  chartCard: {
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 12,
  },
  chartPlaceholder: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: colors.text,
    fontSize: 18,
    marginBottom: 8,
  },
  placeholderSubtext: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  categoriesCard: {
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  cardSubHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  cardSubTitle: {
    color: colors.text,
    fontWeight: 'bold',
    fontSize: 16,
  },
  categoryFilters: {
    flexDirection: 'row',
    gap: 8,
  },
  selectButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    minWidth: 100,
    borderWidth: 1,
  },
  selectButtonContent: {
    height: 36,
    paddingHorizontal: 16,
  },
  selectButtonLabel: {
    fontSize: 13,
    marginHorizontal: 0,
    color: colors.text,
  },
  menuContent: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginTop: 8,
  },
  menuItemTitle: {
    fontSize: 13,
    color: colors.text,
  },
  cardsScroll: {
    marginBottom: 8,
  },
  cardsContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  transactionsCard: {
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    borderRadius: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  transactionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    color: colors.text,
    fontWeight: '600',
    marginBottom: 2,
  },
  transactionCategory: {
    color: colors.textSecondary,
  },
  transactionAmount: {
    fontWeight: 'bold',
  },
  viewAllButton: {
    marginTop: 8,
  },
  // Estilos de tabla
  tableCard: {
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  table: {
    minWidth: 1200,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundLight,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
    paddingVertical: 12,
  },
  tableHeaderCell: {
    color: colors.text,
    fontWeight: 'bold',
    fontSize: 12,
    paddingHorizontal: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 10,
  },
  tableRowEven: {
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  tableFooter: {
    backgroundColor: colors.backgroundLight,
    borderTopWidth: 2,
    borderTopColor: colors.border,
  },
  tableCell: {
    color: colors.textSecondary,
    fontSize: 11,
    paddingHorizontal: 8,
  },
  tableTotalText: {
    fontWeight: 'bold',
    color: colors.text,
  },
  monthColumn: {
    width: 100,
  },
  numberColumn: {
    width: 120,
    textAlign: 'right',
  },
  percentColumn: {
    width: 80,
    textAlign: 'right',
  },
  incomeText: {
    color: colors.income,
  },
  expenseText: {
    color: colors.expense,
  },
  balanceText: {
    color: colors.secondary,
  },
  emptyText: {
    color: colors.textSecondary,
    textAlign: 'center',
    padding: 20,
    fontStyle: 'italic',
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  chartTitle: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 15,
    letterSpacing: 0.3,
  },
  chartButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  chartButton: {
    minWidth: 60,
  },
  // Estilos del Acordeón
  accordionCard: {
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    elevation: 2,
  },
  accordionCardEmpty: {
    opacity: 0.5,
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accordionMonth: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 15,
    letterSpacing: 0.3,
  },
  accordionBalanceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    justifyContent: 'flex-end',
    marginRight: 8,
  },
  accordionBalanceRow: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  accordionBalanceLabel: {
    color: colors.textSecondary,
    fontSize: 10,
    marginBottom: 2,
  },
  accordionBalanceValue: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 14,
  },
  accordionChip: {
    height: 24,
  },
  accordionMiniChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 24,
  },
  accordionMiniChipText: {
    fontSize: 11,
    fontWeight: 'bold',
    lineHeight: 16,
  },
  accordionExchangeCard: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    marginBottom: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  accordionExchangeLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    marginBottom: 4,
  },
  accordionExchangeValue: {
    color: colors.secondary,
    fontWeight: 'bold',
  },
  accordionExpandedSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 12,
  },
  accordionExpandedItem: {
    flex: 1,
    alignItems: 'center',
  },
  accordionExpandedLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    marginBottom: 4,
  },
  accordionExpandedValue: {
    color: colors.text,
    fontWeight: '600',
  },
  // Estilos viejos (eliminar)
  accordionMonthSection: {
    flexDirection: 'column',
    gap: 4,
    minWidth: 90,
  },
  accordionSummaryCompact: {
    flexDirection: 'row',
    gap: 12,
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  accordionCompactItem: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  accordionCompactLabel: {
    color: colors.textSecondary,
    fontSize: 9,
    marginBottom: 2,
  },
  accordionCompactValue: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 11,
  },
  accordionChevron: {
    margin: 0,
    marginLeft: -8,
  },
  // Estilos viejos (mantener por compatibilidad)
  accordionSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  accordionSummaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  accordionLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    marginBottom: 4,
  },
  accordionValue: {
    color: colors.text,
    fontWeight: '600',
  },
  accordionDetails: {
    marginTop: 12,
  },
  accordionDivider: {
    backgroundColor: colors.border,
    marginBottom: 12,
  },
  accordionDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  accordionDetailLabel: {
    color: colors.textSecondary,
    flex: 1,
  },
  accordionDetailValue: {
    color: colors.text,
    fontWeight: '500',
  },
})
