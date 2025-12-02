import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Text } from 'react-native-paper'
import { LinearGradient } from 'expo-linear-gradient'

interface CreditCardItemProps {
  card: {
    id: string
    name: string
    bank: string
    lastFourDigits: string
    monthlyConsumption: number
  }
}

const getBankCardStyle = (bank: string) => {
  const styles: Record<string, { colors: string[], logo: string }> = {
    'banco-nacion': {
      colors: ['#1e3a8a', '#1e40af', '#2563eb'],
      logo: 'BNA'
    },
    'banco-provincia': {
      colors: ['#059669', '#10b981', '#34d399'],
      logo: 'BPBA'
    },
    'banco-ciudad': {
      colors: ['#dc2626', '#ef4444', '#f87171'],
      logo: 'CIUDAD'
    },
    'santander': {
      colors: ['#dc2626', '#b91c1c', '#991b1b'],
      logo: 'SANTANDER'
    },
    'bbva': {
      colors: ['#1e40af', '#3b82f6', '#60a5fa'],
      logo: 'BBVA'
    },
    'galicia': {
      colors: ['#f59e0b', '#d97706', '#b45309'],
      logo: 'GALICIA'
    },
    'macro': {
      colors: ['#7c3aed', '#8b5cf6', '#a78bfa'],
      logo: 'MACRO'
    },
    'american-express': {
      colors: ['#D4AF37', '#FFD700', '#FFA500'],
      logo: 'AMEX'
    },
    'supervielle': {
      colors: ['#0891b2', '#06b6d4', '#22d3ee'],
      logo: 'SUPERVIELLE'
    },
    'icbc': {
      colors: ['#991b1b', '#dc2626', '#ef4444'],
      logo: 'ICBC'
    },
    'hsbc': {
      colors: ['#dc2626', '#ffffff', '#dc2626'],
      logo: 'HSBC'
    },
    'credicoop': {
      colors: ['#16a34a', '#22c55e', '#4ade80'],
      logo: 'CREDICOOP'
    },
    'patagonia': {
      colors: ['#0f172a', '#1e293b', '#334155'],
      logo: 'PATAGONIA'
    },
    'frances': {
      colors: ['#1e40af', '#3b82f6', '#dbeafe'],
      logo: 'FRANCÉS'
    },
    'itau': {
      colors: ['#f97316', '#ea580c', '#c2410c'],
      logo: 'ITAÚ'
    }
  }
  
  return styles[bank] || {
    colors: ['#6b7280', '#4b5563', '#374151'],
    logo: 'BANCO'
  }
}

export const CreditCardItem: React.FC<CreditCardItemProps> = ({ card }) => {
  const bankStyle = getBankCardStyle(card.bank)
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <LinearGradient
      colors={bankStyle.colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={styles.bankLogo}>
            <Text style={styles.bankLogoText}>{bankStyle.logo}</Text>
          </View>
          <Text style={styles.consumptionAmount}>
            {formatCurrency(card.monthlyConsumption)}
          </Text>
        </View>
        
        <View style={styles.cardBody}>
          <Text style={styles.cardName}>{card.name}</Text>
          <Text style={styles.cardNumber}>
            •••• •••• •••• {card.lastFourDigits}
          </Text>
        </View>
      </View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginRight: 16,
    width: 280,
    height: 160,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 20,
    height: '100%',
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  bankLogo: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  bankLogoText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  consumptionAmount: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardBody: {
    gap: 8,
  },
  cardName: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    fontWeight: '600',
  },
  cardNumber: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
})
