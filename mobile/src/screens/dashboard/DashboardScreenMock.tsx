import React, { useState } from 'react'
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native'
import { Text, Card, Button, IconButton, Avatar, Chip } from 'react-native-paper'
import { LinearGradient } from 'expo-linear-gradient'
// TODO: Agregar gráficos con Victory Native en próxima iteración
import { colors } from '../../theme/colors'
import { useAuthStore } from '../../store/authStore'
import { CreditCardItem } from '../../components/CreditCardItem'
import { CategoryItem } from '../../components/CategoryItem'

const { width } = Dimensions.get('window')
const CARD_WIDTH = width - 64

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
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [showUSD, setShowUSD] = useState(false)
  const [categoryType, setCategoryType] = useState<'INCOME' | 'EXPENSE'>('INCOME')
  const [selectedCategoryMonth, setSelectedCategoryMonth] = useState(currentMonth + 1)
  
  // Mock data - TODO: Conectar con API real
  const [stats] = useState({
    incomeCategories: 8,
    expenseCategories: 12,
    clients: 15,
    creditCards: 4
  })

  const [currentMonthData] = useState({
    income: { ars: 637791, usd: 443.19 },
    expense: { ars: 351033, usd: 243.76 },
    balance: { ars: 286668, usd: 199.13 },
    transactionCount: 45
  })

  // Datos del gráfico de evolución mensual
  const [chartData] = useState({
    income: [850, 950, 1000, 1100, 1150, 1200, 1050, 1100, 1250, 1300, 1200, 637],
    expense: [650, 700, 750, 800, 850, 900, 750, 800, 950, 1000, 900, 351],
    balance: [200, 250, 250, 300, 300, 300, 300, 300, 300, 300, 300, 286]
  })

  const [recentTransactions] = useState([
    {
      id: '1',
      type: 'INCOME',
      description: 'Compra supermercado',
      category: 'Alimentación',
      date: '2025-12-01',
      amountArs: 11887
    },
    {
      id: '2',
      type: 'EXPENSE',
      description: 'Compra supermercado',
      category: 'Alimentación',
      date: '2025-12-01',
      amountArs: 11887
    },
    {
      id: '3',
      type: 'EXPENSE',
      description: 'Uber',
      category: 'Transporte',
      date: '2025-12-01',
      amountArs: 1883
    },
    {
      id: '4',
      type: 'EXPENSE',
      description: 'Cine',
      category: 'Entretenimiento',
      date: '2025-12-01',
      amountArs: 9273
    }
  ])

  // Categorías mock
  const [categories] = useState([
    { id: '1', name: 'Freelance', total: 191344, count: 1, color: '#10B981' },
    { id: '2', name: 'Salario', total: 214307, count: 3, color: '#34D399' },
    { id: '3', name: 'Inversiones', total: 0, count: 0, color: '#059669' }
  ])

  // Tarjetas de crédito mock
  const [creditCards] = useState([
    {
      id: '1',
      name: 'Visa Gold',
      bank: 'santander',
      lastFourDigits: '4132',
      monthlyConsumption: 0
    },
    {
      id: '2',
      name: 'Visa Gold',
      bank: 'banco-nacion',
      lastFourDigits: '4132',
      monthlyConsumption: 0
    }
  ])

  // Resumen anual mock
  const [yearlyData] = useState({
    totals: {
      income: { ars: 7067134, usd: 4908 },
      expense: { ars: 4328305, usd: 3006 },
      balance: { ars: 2738829, usd: 1902 }
    },
    monthly: [
      { month: 'Enero', cotizacion: 850, income: { ars: 850000, usd: 1000 }, expense: { ars: 650000, usd: 764 }, balance: { ars: 200000, usd: 235 } },
      { month: 'Febrero', cotizacion: 850, income: { ars: 950000, usd: 1117 }, expense: { ars: 700000, usd: 823 }, balance: { ars: 250000, usd: 294 } },
      // ... más meses
    ]
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

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header con saludo y estadísticas */}
      <Card style={styles.headerCard}>
        <Card.Content>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <Text variant="headlineMedium" style={styles.welcomeText}>
                {user?.name || 'Usuario Demo'}
              </Text>
              <Text variant="bodyMedium" style={styles.headerSubtitle}>
                Aquí tienes un resumen completo de tus finanzas. Revisa tus ingresos, egresos y el balance general.
              </Text>
            </View>
            <IconButton
              icon="logout"
              iconColor={colors.error}
              size={24}
              onPress={logout}
            />
          </View>

          {/* Métricas rápidas */}
          <View style={styles.quickStats}>
            <View style={styles.statItem}>
              <Text variant="titleLarge" style={[styles.statValue, { color: colors.income }]}>
                {stats.incomeCategories}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Cat. Ingresos
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="titleLarge" style={[styles.statValue, { color: colors.expense }]}>
                {stats.expenseCategories}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Cat. Egresos
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="titleLarge" style={[styles.statValue, { color: colors.secondary }]}>
                {stats.clients}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Clientes
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="titleLarge" style={[styles.statValue, { color: '#F59E0B' }]}>
                {stats.creditCards}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Tarjetas
              </Text>
            </View>
          </View>

          {/* Botones de acción */}
          <View style={styles.actionButtons}>
            <Button 
              mode="contained" 
              style={styles.primaryButton}
              buttonColor={colors.primary}
              onPress={() => alert('Próximamente: Vista Mensual')}
            >
              Ver Movimientos
            </Button>
            <Button 
              mode="outlined" 
              style={styles.secondaryButton}
              textColor={colors.text}
              onPress={() => alert('Próximamente: Analytics')}
            >
              Ver Analytics
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Cards de Resumen con Scroll Horizontal */}
      <Text variant="titleMedium" style={styles.sectionTitle}>
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
              <Text style={styles.cardPercentage}>↑ +12.5%</Text>
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
              <Text style={styles.cardPercentage}>↑ +8.3%</Text>
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
              <Text style={styles.cardPercentage}>↑ +30.0%</Text>
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
              <Text style={styles.cardPercentage}>↑ +0.8%</Text>
            </View>
          </View>
        </LinearGradient>
      </ScrollView>

      {/* TODO: Gráfico de Evolución Mensual - Próxima iteración con Victory Native */}
      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Evolución Mensual {selectedYear}
        </Text>
        <Card style={styles.chartCard}>
          <Card.Content>
            <View style={styles.chartPlaceholder}>
              <Text style={styles.placeholderText}>
                📊 Gráfico de evolución mensual
              </Text>
              <Text style={styles.placeholderSubtext}>
                Próximamente con datos reales
              </Text>
            </View>
          </Card.Content>
        </Card>
      </View>

      {/* Sección de Categorías y Tarjetas */}
      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Categorías y Tarjetas de Crédito
        </Text>
        
        {/* Categorías por Mes */}
        <Card style={styles.categoriesCard}>
          <Card.Content>
            <View style={styles.cardSubHeader}>
              <Text variant="titleSmall" style={styles.cardSubTitle}>
                Categorías por Mes
              </Text>
              <View style={styles.categoryFilters}>
                <Chip 
                  selected={categoryType === 'INCOME'}
                  onPress={() => setCategoryType('INCOME')}
                  style={styles.smallChip}
                  textStyle={{ fontSize: 11 }}
                >
                  Ingresos
                </Chip>
                <Chip 
                  selected={categoryType === 'EXPENSE'}
                  onPress={() => setCategoryType('EXPENSE')}
                  style={styles.smallChip}
                  textStyle={{ fontSize: 11 }}
                >
                  Egresos
                </Chip>
              </View>
            </View>
            
            {categories.map((category) => (
              <CategoryItem key={category.id} category={category} />
            ))}
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
                      {transaction.category} • {new Date(transaction.date).toLocaleDateString('es-AR')}
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

        {/* Tabla de Breakdown Mensual */}
        <Text variant="titleSmall" style={[styles.sectionTitle, { marginTop: 16 }]}>
          Breakdown Mensual
        </Text>
        <Card style={styles.tableCard}>
          <ScrollView horizontal showsHorizontalScrollIndicator={true}>
            <View style={styles.table}>
              {/* Header */}
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, styles.monthColumn]}>Mes</Text>
                <Text style={[styles.tableHeaderCell, styles.numberColumn]}>Cotización</Text>
                <Text style={[styles.tableHeaderCell, styles.numberColumn]}>Ingresos (ARS)</Text>
                <Text style={[styles.tableHeaderCell, styles.numberColumn]}>Ingresos (USD)</Text>
                <Text style={[styles.tableHeaderCell, styles.numberColumn]}>Egresos (ARS)</Text>
                <Text style={[styles.tableHeaderCell, styles.numberColumn]}>Egresos (USD)</Text>
                <Text style={[styles.tableHeaderCell, styles.numberColumn]}>Balance (ARS)</Text>
                <Text style={[styles.tableHeaderCell, styles.numberColumn]}>Balance (USD)</Text>
                <Text style={[styles.tableHeaderCell, styles.percentColumn]}>Pct. (%)</Text>
              </View>

              {/* Rows */}
              {MONTHS_FULL.map((month, index) => {
                const monthData = yearlyData.monthly[index] || {
                  cotizacion: 850,
                  income: { ars: 0, usd: 0 },
                  expense: { ars: 0, usd: 0 },
                  balance: { ars: 0, usd: 0 }
                }
                const percentage = monthData.income.ars > 0 
                  ? ((monthData.balance.ars / monthData.income.ars) * 100).toFixed(1)
                  : '0.0'

                return (
                  <View 
                    key={index} 
                    style={[
                      styles.tableRow,
                      index % 2 === 0 && styles.tableRowEven
                    ]}
                  >
                    <Text style={[styles.tableCell, styles.monthColumn]}>{month}</Text>
                    <Text style={[styles.tableCell, styles.numberColumn]}>
                      ${monthData.cotizacion.toFixed(2)}
                    </Text>
                    <Text style={[styles.tableCell, styles.numberColumn, styles.incomeText]}>
                      {formatCurrency(monthData.income.ars)}
                    </Text>
                    <Text style={[styles.tableCell, styles.numberColumn, styles.incomeText]}>
                      {formatUSD(monthData.income.usd)}
                    </Text>
                    <Text style={[styles.tableCell, styles.numberColumn, styles.expenseText]}>
                      {formatCurrency(monthData.expense.ars)}
                    </Text>
                    <Text style={[styles.tableCell, styles.numberColumn, styles.expenseText]}>
                      {formatUSD(monthData.expense.usd)}
                    </Text>
                    <Text style={[styles.tableCell, styles.numberColumn, styles.balanceText]}>
                      {formatCurrency(monthData.balance.ars)}
                    </Text>
                    <Text style={[styles.tableCell, styles.numberColumn, styles.balanceText]}>
                      {formatUSD(monthData.balance.usd)}
                    </Text>
                    <Text style={[styles.tableCell, styles.percentColumn]}>
                      {percentage}%
                    </Text>
                  </View>
                )
              })}

              {/* Footer con totales */}
              <View style={[styles.tableRow, styles.tableFooter]}>
                <Text style={[styles.tableCell, styles.monthColumn, styles.tableTotalText]}>
                  TOTALES
                </Text>
                <Text style={[styles.tableCell, styles.numberColumn, styles.tableTotalText]}>
                  ${(yearlyData.totals.income.ars / yearlyData.totals.income.usd).toFixed(2)}
                </Text>
                <Text style={[styles.tableCell, styles.numberColumn, styles.incomeText, styles.tableTotalText]}>
                  {formatCurrency(yearlyData.totals.income.ars)}
                </Text>
                <Text style={[styles.tableCell, styles.numberColumn, styles.incomeText, styles.tableTotalText]}>
                  {formatUSD(yearlyData.totals.income.usd)}
                </Text>
                <Text style={[styles.tableCell, styles.numberColumn, styles.expenseText, styles.tableTotalText]}>
                  {formatCurrency(yearlyData.totals.expense.ars)}
                </Text>
                <Text style={[styles.tableCell, styles.numberColumn, styles.expenseText, styles.tableTotalText]}>
                  {formatUSD(yearlyData.totals.expense.usd)}
                </Text>
                <Text style={[styles.tableCell, styles.numberColumn, styles.balanceText, styles.tableTotalText]}>
                  {formatCurrency(yearlyData.totals.balance.ars)}
                </Text>
                <Text style={[styles.tableCell, styles.numberColumn, styles.balanceText, styles.tableTotalText]}>
                  {formatUSD(yearlyData.totals.balance.usd)}
                </Text>
                <Text style={[styles.tableCell, styles.percentColumn, styles.tableTotalText]}>
                  {((yearlyData.totals.balance.ars / yearlyData.totals.income.ars) * 100).toFixed(1)}%
                </Text>
              </View>
            </View>
          </ScrollView>
        </Card>
      </View>

      {/* Espaciado final */}
      <View style={{ height: 32 }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontWeight: 'bold',
    color: colors.primary,
  },
  statLabel: {
    color: colors.textSecondary,
    marginTop: 4,
    fontSize: 11,
    textAlign: 'center',
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: colors.text,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginBottom: 12,
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
    gap: 16,
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
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    marginBottom: 8,
  },
  cardAmount: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardSubAmount: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
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
    marginBottom: 16,
  },
  cardSubTitle: {
    color: colors.text,
    fontWeight: 'bold',
  },
  categoryFilters: {
    flexDirection: 'row',
    gap: 8,
  },
  cardsScroll: {
    marginBottom: 8,
  },
  cardsContainer: {
    paddingHorizontal: 16,
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
})
