import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Text } from 'react-native-paper'

interface CategoryItemProps {
  category: {
    id: string
    name: string
    total: number
    count: number
    color: string
  }
}

export const CategoryItem: React.FC<CategoryItemProps> = ({ category }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <View style={[styles.colorDot, { backgroundColor: category.color }]} />
        <Text variant="bodyMedium" style={styles.name}>
          {category.name}
        </Text>
      </View>
      <View style={styles.right}>
        <Text 
          variant="bodyLarge" 
          style={[
            styles.amount,
            { color: category.total > 0 ? category.color : '#6B7280' }
          ]}
        >
          {formatCurrency(category.total)}
        </Text>
        <Text variant="bodySmall" style={styles.count}>
          {category.count} trans.
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  name: {
    color: '#F1F5F9',
    fontWeight: '500',
  },
  right: {
    alignItems: 'flex-end',
  },
  amount: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  count: {
    color: '#94A3B8',
  },
})
