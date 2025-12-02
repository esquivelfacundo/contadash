# 📱 Pantallas Detalladas - Especificaciones Técnicas

## 🎯 Objetivo

Especificaciones técnicas detalladas para implementar cada pantalla en React Native.

---

## 🔐 1. Login Screen

### **Componentes UI**

```typescript
import React, { useState } from 'react'
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native'
import { TextInput, Button, Text, HelperText } from 'react-native-paper'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres')
})

export const LoginScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false)
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      // API call
      navigation.replace('Main')
    } catch (error) {
      // Handle error
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Text variant="headlineLarge" style={styles.title}>
        ContaDash
      </Text>
      
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <>
            <TextInput
              label="Email"
              value={value}
              onChangeText={onChange}
              autoCapitalize="none"
              keyboardType="email-address"
              error={!!errors.email}
            />
            {errors.email && (
              <HelperText type="error">{errors.email.message}</HelperText>
            )}
          </>
        )}
      />
      
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <>
            <TextInput
              label="Contraseña"
              value={value}
              onChangeText={onChange}
              secureTextEntry
              error={!!errors.password}
            />
            {errors.password && (
              <HelperText type="error">{errors.password.message}</HelperText>
            )}
          </>
        )}
      />
      
      <Button 
        mode="contained" 
        onPress={handleSubmit(onSubmit)}
        loading={loading}
        style={styles.button}
      >
        Iniciar Sesión
      </Button>
    </KeyboardAvoidingView>
  )
}
```

---

## 📊 2. Dashboard Screen

### **Layout**

```typescript
import React, { useState, useEffect } from 'react'
import { ScrollView, RefreshControl, View } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { analyticsApi } from '@services/api/analytics'

export const DashboardScreen = () => {
  const [refreshing, setRefreshing] = useState(false)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: analyticsApi.getDashboard
  })

  const onRefresh = async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header con filtros */}
      <View style={styles.header}>
        <MonthPicker value={selectedMonth} onChange={setSelectedMonth} />
        <YearPicker value={selectedYear} onChange={setSelectedYear} />
      </View>

      {/* Cards de resumen */}
      <View style={styles.summaryCards}>
        <SummaryCard
          title="Ingresos"
          amount={data?.currentMonth.income.ars}
          amountUsd={data?.currentMonth.income.usd}
          change={data?.percentageChange.income}
          color="#10B981"
        />
        <SummaryCard
          title="Egresos"
          amount={data?.currentMonth.expense.ars}
          amountUsd={data?.currentMonth.expense.usd}
          change={data?.percentageChange.expense}
          color="#EF4444"
        />
      </View>

      {/* Gráfico */}
      <ChartCard year={selectedYear} />

      {/* Categorías y Tarjetas */}
      <CategoriesSection month={selectedMonth} year={selectedYear} />
      <CreditCardsSection />

      {/* Últimas transacciones */}
      <RecentTransactions month={selectedMonth} year={selectedYear} />
    </ScrollView>
  )
}
```

---

## 📅 3. Monthly Screen

### **Estructura Completa**

```typescript
import React, { useState } from 'react'
import { View, ScrollView, StyleSheet } from 'react-native'
import { FAB, Portal } from 'react-native-paper'
import { useQuery } from '@tanstack/react-query'
import { transactionsApi } from '@services/api/transactions'
import { useExchangeRate } from '@hooks/useExchangeRate'

export const MonthlyScreen = () => {
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [fabOpen, setFabOpen] = useState(false)
  const [incomeModalVisible, setIncomeModalVisible] = useState(false)
  const [expenseModalVisible, setExpenseModalVisible] = useState(false)

  // Cotización del mes
  const { rate, isHistorical } = useExchangeRate(year, month)

  // Estadísticas del año
  const { data: yearStats } = useQuery({
    queryKey: ['year-stats', year],
    queryFn: () => transactionsApi.getStats(undefined, year)
  })

  // Transacciones del mes
  const { data: monthData } = useQuery({
    queryKey: ['monthly-transactions', month, year],
    queryFn: () => transactionsApi.getMonthlyWithCreditCards(month, year)
  })

  return (
    <View style={styles.container}>
      {/* Header con año */}
      <YearSelector value={year} onChange={setYear} />

      <ScrollView>
        {/* Cards de resumen anual */}
        <View style={styles.yearSummary}>
          <SummaryCard
            title={`Ingresos ${year}`}
            amount={yearStats?.income.ars}
            amountUsd={yearStats?.income.usd}
            color="#10B981"
          />
          <SummaryCard
            title={`Egresos ${year}`}
            amount={yearStats?.expense.ars}
            amountUsd={yearStats?.expense.usd}
            color="#8B5CF6"
          />
          <SummaryCard
            title={`Balance ${year}`}
            amount={yearStats?.balance.ars}
            amountUsd={yearStats?.balance.usd}
            color="#3B82F6"
          />
        </View>

        {/* Tabs de meses */}
        <MonthTabs selectedMonth={month} onSelectMonth={setMonth} />

        {/* Cartelito de cotización */}
        <ExchangeRateCard rate={rate} isHistorical={isHistorical} />

        {/* Tabs: Ingresos / Egresos */}
        <TransactionTabs
          incomeTransactions={monthData?.transactions.filter(t => t.type === 'INCOME')}
          expenseTransactions={monthData?.transactions.filter(t => t.type === 'EXPENSE')}
          currentRate={rate}
        />

        {/* Cards de resumen mensual */}
        <View style={styles.monthSummary}>
          <MonthSummaryCards
            income={calculateMonthIncome(monthData?.transactions)}
            expense={calculateMonthExpense(monthData?.transactions)}
            rate={rate}
          />
        </View>
      </ScrollView>

      {/* FAB para agregar transacción */}
      <Portal>
        <FAB.Group
          open={fabOpen}
          icon={fabOpen ? 'close' : 'plus'}
          actions={[
            {
              icon: 'arrow-up',
              label: 'Ingreso',
              onPress: () => setIncomeModalVisible(true),
              color: '#10B981'
            },
            {
              icon: 'arrow-down',
              label: 'Egreso',
              onPress: () => setExpenseModalVisible(true),
              color: '#EF4444'
            }
          ]}
          onStateChange={({ open }) => setFabOpen(open)}
        />
      </Portal>

      {/* Modales */}
      <IncomeTransactionModal
        visible={incomeModalVisible}
        onDismiss={() => setIncomeModalVisible(false)}
        defaultDate={new Date(year, month - 1, 1)}
      />
      <ExpenseTransactionModal
        visible={expenseModalVisible}
        onDismiss={() => setExpenseModalVisible(false)}
        defaultDate={new Date(year, month - 1, 1)}
      />
    </View>
  )
}
```

### **Componente de Tabs de Transacciones**

```typescript
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'

const Tab = createMaterialTopTabNavigator()

const TransactionTabs = ({ incomeTransactions, expenseTransactions, currentRate }) => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: { backgroundColor: '#1E293B' },
        tabBarActiveTintColor: '#10B981',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarIndicatorStyle: { backgroundColor: '#10B981' }
      }}
    >
      <Tab.Screen name="Ingresos">
        {() => (
          <TransactionList
            transactions={incomeTransactions}
            type="INCOME"
            currentRate={currentRate}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Egresos">
        {() => (
          <TransactionList
            transactions={expenseTransactions}
            type="EXPENSE"
            currentRate={currentRate}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  )
}
```

### **Lista de Transacciones**

```typescript
import { FlatList, View } from 'react-native'
import { Swipeable } from 'react-native-gesture-handler'

const TransactionList = ({ transactions, type, currentRate }) => {
  const renderRightActions = (transaction) => (
    <View style={styles.swipeActions}>
      <TouchableOpacity onPress={() => handleEdit(transaction)}>
        <Icon name="pencil" size={24} color="#3B82F6" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleDelete(transaction)}>
        <Icon name="delete" size={24} color="#EF4444" />
      </TouchableOpacity>
    </View>
  )

  return (
    <FlatList
      data={transactions}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <Swipeable renderRightActions={() => renderRightActions(item)}>
          <TransactionCard
            transaction={item}
            currentRate={currentRate}
            type={type}
          />
        </Swipeable>
      )}
      ListFooterComponent={
        <TotalRow
          transactions={transactions}
          type={type}
        />
      }
    />
  )
}
```

---

## 📈 4. Analytics Screen

### **Tabs de Análisis**

```typescript
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import { VictoryChart, VictoryLine, VictoryBar } from 'victory-native'

const Tab = createMaterialTopTabNavigator()

export const AnalyticsScreen = () => {
  const [period, setPeriod] = useState(12)
  const [year, setYear] = useState(new Date().getFullYear())

  return (
    <View style={styles.container}>
      {/* Filtros */}
      <View style={styles.filters}>
        <PeriodPicker value={period} onChange={setPeriod} />
        <YearPicker value={year} onChange={setYear} />
      </View>

      <Tab.Navigator>
        <Tab.Screen name="Categorías" component={CategoryEvolutionTab} />
        <Tab.Screen name="Clientes" component={ClientIncomeTab} />
        <Tab.Screen name="Tarjetas" component={CardSpendingTab} />
        <Tab.Screen name="Comparativo" component={YearComparisonTab} />
        <Tab.Screen name="Alertas" component={AnomaliesTab} />
      </Tab.Navigator>
    </View>
  )
}

const CategoryEvolutionTab = () => {
  const { data } = useQuery({
    queryKey: ['category-evolution'],
    queryFn: analyticsApi.getCategoryEvolution
  })

  return (
    <ScrollView>
      <VictoryChart>
        {data?.datasets.map((dataset, index) => (
          <VictoryLine
            key={index}
            data={dataset.data.map((value, i) => ({ x: i, y: value }))}
            style={{
              data: { stroke: dataset.borderColor }
            }}
          />
        ))}
      </VictoryChart>
    </ScrollView>
  )
}
```

---

## 💰 5. Budgets Screen

### **Grid de Presupuestos**

```typescript
export const BudgetsScreen = () => {
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [modalVisible, setModalVisible] = useState(false)

  const { data: budgets } = useQuery({
    queryKey: ['budgets', month, year],
    queryFn: () => budgetsApi.getAll(month, year)
  })

  return (
    <View style={styles.container}>
      {/* Filtros */}
      <View style={styles.filters}>
        <MonthPicker value={month} onChange={setMonth} />
        <YearPicker value={year} onChange={setYear} />
      </View>

      {/* Grid de presupuestos */}
      <FlatList
        data={budgets}
        numColumns={1}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <BudgetCard budget={item} />
        )}
      />

      {/* FAB */}
      <FAB
        icon="plus"
        onPress={() => setModalVisible(true)}
        style={styles.fab}
      />

      {/* Modal */}
      <BudgetModal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        month={month}
        year={year}
      />
    </View>
  )
}

const BudgetCard = ({ budget }) => {
  const percentage = (budget.spent / budget.amountArs) * 100
  const color = percentage < 70 ? '#10B981' : percentage < 90 ? '#F59E0B' : '#EF4444'

  return (
    <Card style={styles.budgetCard}>
      <Card.Content>
        <View style={styles.header}>
          <Text>{budget.category.icon} {budget.category.name}</Text>
          <Chip>{budget.month}/{budget.year}</Chip>
        </View>

        <View style={styles.amounts}>
          <Text>Presupuesto: {formatCurrency(budget.amountArs)}</Text>
          <Text>Gastado: {formatCurrency(budget.spent)}</Text>
          <Text>Restante: {formatCurrency(budget.remaining)}</Text>
        </View>

        <ProgressBar
          progress={percentage / 100}
          color={color}
        />
        <Text style={{ color }}>{percentage.toFixed(0)}%</Text>
      </Card.Content>
    </Card>
  )
}
```

---

## ⚙️ 6. Settings Screen

### **Tabs de Configuración**

```typescript
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'

const Tab = createMaterialTopTabNavigator()

export const SettingsScreen = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Categorías" component={CategoriesTab} />
      <Tab.Screen name="Clientes" component={ClientsTab} />
      <Tab.Screen name="Tarjetas" component={CreditCardsTab} />
      <Tab.Screen name="Cuentas" component={BankAccountsTab} />
    </Tab.Navigator>
  )
}

const CategoriesTab = () => {
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('INCOME')
  const [modalVisible, setModalVisible] = useState(false)

  const { data: categories } = useQuery({
    queryKey: ['categories', type],
    queryFn: () => categoriesApi.getAll({ type })
  })

  return (
    <View style={styles.container}>
      {/* Filtro de tipo */}
      <SegmentedButtons
        value={type}
        onValueChange={setType}
        buttons={[
          { value: 'INCOME', label: 'Ingresos' },
          { value: 'EXPENSE', label: 'Egresos' }
        ]}
      />

      {/* Lista */}
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Swipeable
            renderRightActions={() => (
              <View style={styles.actions}>
                <IconButton icon="pencil" onPress={() => handleEdit(item)} />
                <IconButton icon="delete" onPress={() => handleDelete(item)} />
              </View>
            )}
          >
            <List.Item
              title={item.name}
              left={() => <Text style={{ fontSize: 24 }}>{item.icon}</Text>}
              right={() => (
                <View style={[styles.colorDot, { backgroundColor: item.color }]} />
              )}
            />
          </Swipeable>
        )}
      />

      {/* FAB */}
      <FAB icon="plus" onPress={() => setModalVisible(true)} />

      {/* Modal */}
      <CategoryModal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        type={type}
      />
    </View>
  )
}
```

---

## 🎯 Componentes Comunes

### **SummaryCard**

```typescript
export const SummaryCard = ({ title, amount, amountUsd, change, color }) => {
  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="labelMedium" style={styles.title}>{title}</Text>
        <Text variant="headlineMedium" style={[styles.amount, { color }]}>
          {formatCurrency(amount)}
        </Text>
        <Text variant="bodySmall" style={styles.amountUsd}>
          {formatCurrency(amountUsd, 'USD')}
        </Text>
        {change !== undefined && (
          <Chip
            icon={change >= 0 ? 'arrow-up' : 'arrow-down'}
            style={[styles.chip, { backgroundColor: change >= 0 ? '#10B981' : '#EF4444' }]}
          >
            {formatPercentage(change)}
          </Chip>
        )}
      </Card.Content>
    </Card>
  )
}
```

### **TransactionCard**

```typescript
export const TransactionCard = ({ transaction, currentRate, type }) => {
  const usdAmount = transaction.amountArs / currentRate

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.row}>
          <View style={styles.left}>
            <Text style={styles.date}>
              {formatDate(transaction.date)}
            </Text>
            <Text style={styles.category}>
              {transaction.category.icon} {transaction.category.name}
            </Text>
            <Text style={styles.description}>
              {transaction.description}
            </Text>
          </View>
          <View style={styles.right}>
            <Text style={[styles.amount, { color: type === 'INCOME' ? '#10B981' : '#EF4444' }]}>
              {formatCurrency(transaction.amountArs)}
            </Text>
            <Text style={styles.amountUsd}>
              {formatCurrency(usdAmount, 'USD')}
            </Text>
            <Text style={styles.rate}>
              ${transaction.exchangeRate.toFixed(2)}
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  )
}
```

---

**Última actualización**: 1 de Diciembre, 2025  
**Versión**: 1.0.0
