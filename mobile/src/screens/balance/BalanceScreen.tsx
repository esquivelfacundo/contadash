import React, { useState, useEffect } from 'react'
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native'
import { Text, Card, Menu, TouchableRipple, ActivityIndicator } from 'react-native-paper'
import { AppHeader } from '../../components/AppHeader'
import { ScreenLayout } from '../../components/ScreenLayout'
import { colors } from '../../theme/colors'
import { transactionsApi, bankAccountsApi } from '../../services/api'

interface PaymentMethodBalance {
  method: string
  label: string
  icon: string
  totalIncome: number
  totalExpense: number
  balance: number
  transactionCount: number
  bankAccount?: any
}

export const BalanceScreen: React.FC = () => {
  const currentDate = new Date()
  const [year, setYear] = useState(currentDate.getFullYear())
  const [loading, setLoading] = useState(true)
  const [paymentMethodBalances, setPaymentMethodBalances] = useState<PaymentMethodBalance[]>([])
  const [yearMenuVisible, setYearMenuVisible] = useState(false)

  useEffect(() => {
    loadBalanceData()
  }, [year])

  const loadBalanceData = async () => {
    try {
      setLoading(true)
      
      // Cargar todas las transacciones del año (sin filtro de mes para obtener todo el año)
      const transactionsResponse = await transactionsApi.getAll(undefined, year)

      // Cargar cuentas bancarias
      const accountsResponse = await bankAccountsApi.getAll()
      
      // Manejar diferentes formatos de respuesta
      const transactions = Array.isArray(transactionsResponse)
        ? transactionsResponse
        : (transactionsResponse.transactions || transactionsResponse.data || [])
      
      const accounts = Array.isArray(accountsResponse)
        ? accountsResponse
        : (accountsResponse.bankAccounts || accountsResponse.data || [])

      console.log('[BalanceScreen] Loaded transactions:', transactions.length)
      if (transactions.length > 0) {
        console.log('[BalanceScreen] Sample transaction:', transactions[0])
      }

      // Procesar transacciones por método de pago
      const methodBalances = processTransactionsByPaymentMethod(transactions, accounts)
      setPaymentMethodBalances(methodBalances)

      console.log('[BalanceScreen] Method balances:', methodBalances)
      const totalBalance = methodBalances.reduce((sum, method) => sum + (method.balance || 0), 0)
      console.log('[BalanceScreen] Total balance:', totalBalance)

    } catch (err: any) {
      console.error('Error loading balance data:', err)
    } finally {
      setLoading(false)
    }
  }

  const processTransactionsByPaymentMethod = (transactions: any[], accounts: any[]): PaymentMethodBalance[] => {
    const methodMap = new Map<string, PaymentMethodBalance>()

    // Inicializar métodos de pago básicos
    const basicMethods = [
      { method: 'CASH', label: 'Efectivo', icon: '💵' },
      { method: 'MERCADOPAGO', label: 'MercadoPago', icon: '💳' },
      { method: 'CRYPTO', label: 'Criptomoneda', icon: '₿' },
    ]

    basicMethods.forEach(({ method, label, icon }) => {
      methodMap.set(method, {
        method,
        label,
        icon,
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        transactionCount: 0,
      })
    })

    // Inicializar cuentas bancarias
    accounts.forEach(account => {
      const key = `BANK_ACCOUNT_${account.id}`
      methodMap.set(key, {
        method: 'BANK_ACCOUNT',
        label: `${account.name} (${account.currency})`,
        icon: '🏦',
        totalIncome: 0,
        totalExpense: 0,
        balance: account.balance || 0,
        transactionCount: 0,
        bankAccount: account,
      })
    })

    // Procesar transacciones
    transactions.forEach(transaction => {
      let key: string

      if (transaction.paymentMethod === 'BANK_ACCOUNT' && transaction.bankAccountId) {
        key = `BANK_ACCOUNT_${transaction.bankAccountId}`
      } else if (transaction.paymentMethod) {
        key = transaction.paymentMethod
      } else {
        key = 'UNKNOWN'
        if (!methodMap.has(key)) {
          methodMap.set(key, {
            method: 'UNKNOWN',
            label: 'Sin especificar',
            icon: '❓',
            totalIncome: 0,
            totalExpense: 0,
            balance: 0,
            transactionCount: 0,
          })
        }
      }

      const methodBalance = methodMap.get(key)
      if (methodBalance) {
        const amount = Number(transaction.amountArs || transaction.amount || 0)
        
        // Validar que amount sea un número válido
        if (isNaN(amount)) {
          console.warn('Invalid amount for transaction:', transaction.id, transaction)
          return
        }
        
        if (transaction.type === 'INCOME') {
          methodBalance.totalIncome += amount
        } else {
          methodBalance.totalExpense += amount
        }
        
        methodBalance.transactionCount++
        
        // Para cuentas bancarias, calcular balance considerando el balance inicial
        if (methodBalance.method === 'BANK_ACCOUNT') {
          methodBalance.balance = (methodBalance.bankAccount?.balance || 0) + methodBalance.totalIncome - methodBalance.totalExpense
        } else {
          methodBalance.balance = methodBalance.totalIncome - methodBalance.totalExpense
        }
      }
    })

    return Array.from(methodMap.values()).filter(method => 
      method.transactionCount > 0 || method.method === 'BANK_ACCOUNT'
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getTotalBalance = () => {
    const total = paymentMethodBalances.reduce((sum, method) => {
      const balance = Number(method.balance) || 0
      return sum + balance
    }, 0)
    return isNaN(total) ? 0 : total
  }

  const getTotalIncome = () => {
    const total = paymentMethodBalances.reduce((sum, method) => {
      const income = Number(method.totalIncome) || 0
      return sum + income
    }, 0)
    return isNaN(total) ? 0 : total
  }

  const getTotalExpense = () => {
    const total = paymentMethodBalances.reduce((sum, method) => {
      const expense = Number(method.totalExpense) || 0
      return sum + expense
    }, 0)
    return isNaN(total) ? 0 : total
  }

  const yearOptions = Array.from({ length: 6 }, (_, i) => currentDate.getFullYear() - i)

  return (
    <ScreenLayout>
      <AppHeader />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header con selector de año */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Balance por Método de Pago</Text>
            <Text style={styles.subtitle}>
              Resumen de ingresos, egresos y balance
            </Text>
          </View>
          
          <Menu
            visible={yearMenuVisible}
            onDismiss={() => setYearMenuVisible(false)}
            anchor={
              <TouchableRipple onPress={() => setYearMenuVisible(true)} style={styles.yearSelector}>
                <View style={styles.yearSelectorContent}>
                  <Text style={styles.yearText}>{year}</Text>
                  <Text style={styles.yearIcon}>▼</Text>
                </View>
              </TouchableRipple>
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

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <>
            {/* Cards de Resumen */}
            <View style={styles.summaryCards}>
              <View style={styles.cardRow}>
                <Card style={[styles.summaryCard, styles.incomeCard]}>
                  <Card.Content>
                    <Text style={styles.cardLabel}>Total Ingresos {year}</Text>
                    <Text style={styles.cardValue}>{formatCurrency(getTotalIncome())}</Text>
                  </Card.Content>
                </Card>
                
                <Card style={[styles.summaryCard, styles.expenseCard]}>
                  <Card.Content>
                    <Text style={styles.cardLabel}>Total Egresos {year}</Text>
                    <Text style={styles.cardValue}>{formatCurrency(getTotalExpense())}</Text>
                  </Card.Content>
                </Card>
              </View>

              <View style={styles.cardRow}>
                <Card style={[styles.summaryCard, styles.balanceCard]}>
                  <Card.Content>
                    <Text style={styles.cardLabel}>Balance Total {year}</Text>
                    <Text style={styles.cardValue}>{formatCurrency(getTotalBalance())}</Text>
                  </Card.Content>
                </Card>
                
                <Card style={[styles.summaryCard, styles.methodsCard]}>
                  <Card.Content>
                    <Text style={styles.cardLabel}>Métodos de Pago</Text>
                    <Text style={styles.cardValue}>{paymentMethodBalances.length}</Text>
                  </Card.Content>
                </Card>
              </View>
            </View>

            {/* Lista de Métodos de Pago */}
            <Text style={styles.sectionTitle}>💰 Detalle por Método de Pago - {year}</Text>
            
            {paymentMethodBalances.map((method, index) => (
              <Card key={`${method.method}_${index}`} style={styles.methodCard}>
                <Card.Content>
                  <View style={styles.methodHeader}>
                    <Text style={styles.methodIcon}>{method.icon}</Text>
                    <View style={styles.methodInfo}>
                      <Text style={styles.methodLabel}>{method.label}</Text>
                      {method.bankAccount && (
                        <Text style={styles.methodSubLabel}>
                          {method.bankAccount.bank} • *{method.bankAccount.accountNumber.slice(-4)}
                        </Text>
                      )}
                    </View>
                  </View>

                  <View style={styles.methodStats}>
                    <View style={styles.statRow}>
                      <Text style={styles.statLabel}>Ingresos:</Text>
                      <Text style={[styles.statValue, styles.incomeText]}>
                        {formatCurrency(method.totalIncome)}
                      </Text>
                    </View>
                    
                    <View style={styles.statRow}>
                      <Text style={styles.statLabel}>Egresos:</Text>
                      <Text style={[styles.statValue, styles.expenseText]}>
                        {formatCurrency(method.totalExpense)}
                      </Text>
                    </View>
                    
                    <View style={[styles.statRow, styles.balanceRow]}>
                      <Text style={styles.statLabel}>Balance:</Text>
                      <Text 
                        style={[
                          styles.statValue, 
                          styles.balanceValue,
                          method.balance >= 0 ? styles.incomeText : styles.expenseText
                        ]}
                      >
                        {formatCurrency(method.balance)}
                      </Text>
                    </View>

                    <View style={styles.statRow}>
                      <Text style={styles.statLabel}>Transacciones:</Text>
                      <Text style={styles.statValue}>{method.transactionCount}</Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            ))}

            {/* Espaciado para el navbar */}
            <View style={{ height: 100 }} />
          </>
        )}
      </ScrollView>
    </ScreenLayout>
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
  yearSelector: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  yearSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  yearText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
  },
  yearIcon: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  summaryCards: {
    padding: 16,
    gap: 12,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 12,
  },
  incomeCard: {
    backgroundColor: colors.income,
  },
  expenseCard: {
    backgroundColor: colors.expense,
  },
  balanceCard: {
    backgroundColor: '#3B82F6',
  },
  methodsCard: {
    backgroundColor: '#8B5CF6',
  },
  cardLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  methodCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  methodIcon: {
    fontSize: 32,
  },
  methodInfo: {
    flex: 1,
  },
  methodLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  methodSubLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  methodStats: {
    gap: 8,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  balanceValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  incomeText: {
    color: colors.income,
  },
  expenseText: {
    color: colors.expense,
  },
})
