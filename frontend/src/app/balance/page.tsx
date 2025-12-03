'use client'

import { useEffect, useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Chip,
  TextField,
  MenuItem,
} from '@mui/material'
import { 
  AccountBalance,
  TrendingUp,
  TrendingDown,
  AttachMoney,
  Payment,
} from '@mui/icons-material'
import DashboardLayout from '@/components/DashboardLayout'
import { transactionsApi } from '@/lib/api/transactions'
import { bankAccountsApi } from '@/lib/api/bank-accounts'

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

export default function BalancePage() {
  const currentDate = new Date()
  const [year, setYear] = useState(currentDate.getFullYear())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [paymentMethodBalances, setPaymentMethodBalances] = useState<PaymentMethodBalance[]>([])
  const [bankAccounts, setBankAccounts] = useState<any[]>([])

  useEffect(() => {
    loadBalanceData()
  }, [year])

  const loadBalanceData = async () => {
    try {
      setLoading(true)
      
      // Cargar todas las transacciones del año mes por mes para evitar límites
      const allTransactions: any[] = []
      
      for (let month = 1; month <= 12; month++) {
        try {
          const monthTransactions = await transactionsApi.getAll({
            year: year.toString(),
            month: month.toString(),
            limit: '1000', // Límite por mes
          })
          allTransactions.push(...(monthTransactions.transactions || []))
        } catch (err) {
        }
      }
      

      // Cargar cuentas bancarias
      const accounts = await bankAccountsApi.getAll()
      setBankAccounts(accounts)

      // Procesar transacciones por método de pago
      const methodBalances = processTransactionsByPaymentMethod(allTransactions, accounts)
      setPaymentMethodBalances(methodBalances)

    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar datos de balance')
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
      const initialBalance = Number(account.balance) || 0
      methodMap.set(key, {
        method: 'BANK_ACCOUNT',
        label: `${account.name} (${account.currency})`,
        icon: '🏦',
        totalIncome: 0, // Se calculará con las transacciones
        totalExpense: 0,
        balance: initialBalance,
        transactionCount: 0,
        bankAccount: account,
      })
    })

    // Procesar transacciones
    let processedCount = 0
    let unassignedCount = 0
    
    transactions.forEach(transaction => {
      let key: string

      if (transaction.paymentMethod === 'BANK_ACCOUNT' && transaction.bankAccountId) {
        key = `BANK_ACCOUNT_${transaction.bankAccountId}`
      } else if (transaction.paymentMethod) {
        key = transaction.paymentMethod
      } else if (transaction.creditCard) {
        // Fallback para transacciones antiguas con tarjeta de crédito
        key = 'CREDIT_CARD'
        if (!methodMap.has(key)) {
          methodMap.set(key, {
            method: 'CREDIT_CARD',
            label: 'Tarjetas de Crédito',
            icon: '💳',
            totalIncome: 0,
            totalExpense: 0,
            balance: 0,
            transactionCount: 0,
          })
        }
      } else {
        key = 'UNASSIGNED'
        unassignedCount++
        if (!methodMap.has(key)) {
          methodMap.set(key, {
            method: 'UNASSIGNED',
            label: 'Sin asignar',
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
        processedCount++
        const amount = Number(transaction.amountArs) || 0
        
        if (transaction.type === 'INCOME') {
          methodBalance.totalIncome += amount
        } else {
          methodBalance.totalExpense += amount
        }
        
        methodBalance.transactionCount++
        
        // Para cuentas bancarias, calcular balance considerando el balance inicial
        if (methodBalance.method === 'BANK_ACCOUNT') {
          const initialBalance = Number(methodBalance.bankAccount?.balance) || 0
          const totalIncome = Number(methodBalance.totalIncome) || 0
          const totalExpense = Number(methodBalance.totalExpense) || 0
          methodBalance.balance = initialBalance + totalIncome - totalExpense
        } else {
          const totalIncome = Number(methodBalance.totalIncome) || 0
          const totalExpense = Number(methodBalance.totalExpense) || 0
          methodBalance.balance = totalIncome - totalExpense
        }
      }
    })

    
    const results = Array.from(methodMap.values()).filter(method => 
      method.transactionCount > 0 || method.method === 'BANK_ACCOUNT'
    )
    
    results.forEach(method => {
    })
    
    return results
  }

  const formatCurrency = (amount: number) => {
    const validAmount = Number(amount) || 0
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(validAmount)
  }

  const getTotalBalance = () => {
    return paymentMethodBalances.reduce((sum, method) => sum + (Number(method.balance) || 0), 0)
  }

  const getTotalIncome = () => {
    return paymentMethodBalances.reduce((sum, method) => sum + (Number(method.totalIncome) || 0), 0)
  }

  const getTotalExpense = () => {
    return paymentMethodBalances.reduce((sum, method) => sum + (Number(method.totalExpense) || 0), 0)
  }

  // Generate year options (current year and 5 years back)
  const yearOptions = Array.from({ length: 6 }, (_, i) => currentDate.getFullYear() - i)

  return (
    <DashboardLayout>
      <Box sx={{ minHeight: '100vh' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" fontWeight="bold" color="white">
              Balance por Método de Pago
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Resumen de ingresos, egresos y balance por cada método de pago
            </Typography>
          </Box>
          <TextField
            select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            size="small"
            sx={{ 
              minWidth: 100,
              '& .MuiOutlinedInput-root': {
                bgcolor: '#1E293B',
                color: 'white',
                '& fieldset': {
                  borderColor: '#334155',
                },
                '&:hover fieldset': {
                  borderColor: '#475569',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#10B981',
                },
              },
              '& .MuiSelect-icon': {
                color: 'white',
              },
            }}
          >
            {yearOptions.map((y) => (
              <MenuItem key={y} value={y}>
                {y}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Resumen General */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={3}>
                <Card 
                  sx={{ 
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    color: 'white',
                    border: 'none',
                  }}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2}>
                      <TrendingUp sx={{ fontSize: 40 }} />
                      <Box>
                        <Typography color="rgba(255,255,255,0.8)" variant="body2">
                          Total Ingresos {year}
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" color="white">
                          {formatCurrency(getTotalIncome())}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card 
                  sx={{ 
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                    color: 'white',
                    border: 'none',
                  }}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2}>
                      <TrendingDown sx={{ fontSize: 40 }} />
                      <Box>
                        <Typography color="rgba(255,255,255,0.8)" variant="body2">
                          Total Egresos {year}
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" color="white">
                          {formatCurrency(getTotalExpense())}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card 
                  sx={{ 
                    background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                    color: 'white',
                    border: 'none',
                  }}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2}>
                      <AccountBalance sx={{ fontSize: 40 }} />
                      <Box>
                        <Typography color="rgba(255,255,255,0.8)" variant="body2">
                          Balance Total {year}
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" color="white">
                          {formatCurrency(getTotalBalance())}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card 
                  sx={{ 
                    background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                    color: 'white',
                    border: 'none',
                  }}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Payment sx={{ fontSize: 40 }} />
                      <Box>
                        <Typography color="rgba(255,255,255,0.8)" variant="body2">
                          Métodos de Pago
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" color="white">
                          {paymentMethodBalances.length}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Tabla de Balance por Método de Pago */}
            <Card sx={{ bgcolor: '#1E293B', border: 'none' }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" color="white" mb={2}>
                  💰 Detalle por Método de Pago - {year}
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Método de Pago</TableCell>
                        <TableCell align="right">Ingresos</TableCell>
                        <TableCell align="right">Egresos</TableCell>
                        <TableCell align="right">Balance</TableCell>
                        <TableCell align="center">Transacciones</TableCell>
                        <TableCell align="center">Estado</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paymentMethodBalances.map((method, index) => (
                        <TableRow key={`${method.method}_${index}`}>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <span style={{ fontSize: '1.2em' }}>{method.icon}</span>
                              <Box>
                                <Typography variant="body2" fontWeight="medium" color="white">
                                  {method.label}
                                </Typography>
                                {method.bankAccount && (
                                  <Typography variant="caption" color="text.secondary">
                                    {method.bankAccount.bank} • *{method.bankAccount.accountNumber.slice(-4)}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <Typography fontWeight="bold" color="success.main">
                              {formatCurrency(method.totalIncome)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography fontWeight="bold" color="error.main">
                              {formatCurrency(method.totalExpense)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography 
                              fontWeight="bold" 
                              color={method.balance >= 0 ? 'success.main' : 'error.main'}
                            >
                              {formatCurrency(method.balance)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={method.transactionCount}
                              size="small"
                              color="primary"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={method.balance >= 0 ? 'Positivo' : 'Negativo'}
                              size="small"
                              color={method.balance >= 0 ? 'success' : 'error'}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                      {/* Totals Row */}
                      <TableRow sx={{ bgcolor: '#0F172A !important' }}>
                        <TableCell sx={{ color: 'white', borderBottom: 'none' }}>
                          <Typography fontWeight="bold" color="white">TOTALES</Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ borderBottom: 'none' }}>
                          <Typography fontWeight="bold" color="#10B981">
                            {formatCurrency(getTotalIncome())}
                          </Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ borderBottom: 'none' }}>
                          <Typography fontWeight="bold" color="#EF4444">
                            {formatCurrency(getTotalExpense())}
                          </Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ borderBottom: 'none' }}>
                          <Typography 
                            fontWeight="bold" 
                            color={getTotalBalance() >= 0 ? '#10B981' : '#EF4444'}
                          >
                            {formatCurrency(getTotalBalance())}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ borderBottom: 'none' }} />
                        <TableCell sx={{ borderBottom: 'none' }} />
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </>
        )}
      </Box>
    </DashboardLayout>
  )
}
