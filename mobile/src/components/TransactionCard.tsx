import React, { useState } from 'react'
import { View, StyleSheet, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native'
import { Text, IconButton, Divider } from 'react-native-paper'
import { colors } from '../theme/colors'

// Habilitar LayoutAnimation en Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

interface TransactionCardProps {
  transaction: any
  onEdit: (transaction: any) => void
  onDelete: (transaction: any) => void
  onViewDocument?: (url: string) => void
  formatCurrency: (amount: number) => string
  formatUSD: (amount: number) => string
  currentDolarRate: number
}

export const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  onEdit,
  onDelete,
  onViewDocument,
  formatCurrency,
  formatUSD,
  currentDolarRate,
}) => {
  const [expanded, setExpanded] = useState(false)
  const isIncome = transaction.type === 'INCOME'
  const accentColor = isIncome ? colors.income : colors.expense

  const getPaymentMethodLabel = (paymentMethod: string, bankAccount?: any, creditCard?: any) => {
    switch (paymentMethod) {
      case 'CASH':
        return '💵 Efectivo'
      case 'MERCADOPAGO':
        return '💳 MercadoPago'
      case 'BANK_ACCOUNT':
        return bankAccount ? `🏦 ${bankAccount.name}` : '🏦 Cuenta Bancaria'
      case 'CRYPTO':
        return '₿ Criptomoneda'
      default:
        return creditCard ? `💳 ${creditCard.name}` : '-'
    }
  }

  return (
    <View style={styles.card}>
      {/* Minimized View - Resumen Bancario */}
      <TouchableOpacity 
        style={styles.header}
        onPress={() => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
          setExpanded(!expanded)
        }}
        activeOpacity={0.7}
      >
        <View style={styles.mainInfo}>
          <Text style={styles.description} numberOfLines={1}>
            {transaction.description}
          </Text>
          <Text style={styles.date}>
            {new Date(transaction.date).toLocaleDateString('es-AR', { 
              day: '2-digit', 
              month: '2-digit',
              year: 'numeric'
            })}
          </Text>
        </View>
        
        <View style={styles.amounts}>
          <Text style={[styles.amountArs, { color: accentColor }]}>
            {formatCurrency(transaction.amountArs)}
          </Text>
          <Text style={styles.amountUsd}>
            {formatUSD(Number(transaction.amountArs) / currentDolarRate)}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Expanded View - Detalles */}
      {expanded && (
        <>
          <Divider style={styles.divider} />
          <View style={styles.details}>
            {/* Categoría */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Categoría:</Text>
              <View style={styles.detailValue}>
                <Text style={styles.categoryIcon}>{transaction.category.icon}</Text>
                <Text style={styles.detailText}>{transaction.category.name}</Text>
              </View>
            </View>

            {/* Cliente/Empresa */}
            {transaction.client && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Empresa:</Text>
                <Text style={styles.detailText}>{transaction.client.company}</Text>
              </View>
            )}

            {/* Método de Pago */}
            {transaction.paymentMethod && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Método:</Text>
                <Text style={styles.detailText}>
                  {getPaymentMethodLabel(transaction.paymentMethod, transaction.bankAccount, transaction.creditCard)}
                </Text>
              </View>
            )}

            {/* Cotización */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Cotización:</Text>
              <Text style={styles.detailText}>${currentDolarRate.toFixed(2)}</Text>
            </View>

            {/* Acciones */}
            <View style={styles.actions}>
              {transaction.attachmentUrl && onViewDocument && (
                <IconButton
                  icon="eye"
                  size={20}
                  iconColor={colors.secondary}
                  onPress={() => onViewDocument(transaction.attachmentUrl)}
                  style={styles.actionButton}
                />
              )}
              <IconButton
                icon="pencil"
                size={20}
                iconColor={colors.primary}
                onPress={() => onEdit(transaction)}
                style={styles.actionButton}
              />
              {!transaction.isPlaceholder && (
                <IconButton
                  icon="delete"
                  size={20}
                  iconColor={colors.error}
                  onPress={() => onDelete(transaction)}
                  style={styles.actionButton}
                />
              )}
            </View>
          </View>
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginBottom: 8,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  mainInfo: {
    flex: 1,
    marginRight: 12,
  },
  description: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  date: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  amounts: {
    alignItems: 'flex-end',
  },
  amountArs: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  amountUsd: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  divider: {
    backgroundColor: colors.border,
  },
  details: {
    padding: 12,
    paddingTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  detailValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    color: colors.text,
    fontSize: 13,
  },
  categoryIcon: {
    fontSize: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  actionButton: {
    margin: 0,
  },
})
