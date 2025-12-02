import React, { useState } from 'react'
import { View, StyleSheet, TouchableOpacity, Platform, Animated, LayoutAnimation, UIManager } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Button } from 'react-native-paper'
import { colors } from '../theme/colors'
import { Ionicons } from '@expo/vector-icons'
import { useTransactionModal } from '../context/TransactionModalContext'

// Habilitar LayoutAnimation en Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

export const FloatingNavBar: React.FC = () => {
  const { openIncomeModal, openExpenseModal } = useTransactionModal()
  const navigation = useNavigation()
  const route = useRoute()
  const [isExpanded, setIsExpanded] = useState(false)
  const rotateAnim = useState(new Animated.Value(0))[0]

  const navItems = [
    { name: 'Dashboard', screen: 'Dashboard', icon: 'home' },
    { name: 'Movimientos', screen: 'Monthly', icon: 'swap-horizontal' },
    { name: 'Balance', screen: 'Balance', icon: 'wallet' },
    { name: 'Presupuestos', screen: 'Budgets', icon: 'pie-chart' },
  ]

  // Dividir items en dos grupos (2 a la izquierda, 2 a la derecha)
  const leftItems = navItems.slice(0, 2)
  const rightItems = navItems.slice(2)

  const handleToggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring)
    
    // Animar rotación del icono
    Animated.timing(rotateAnim, {
      toValue: isExpanded ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start()
    
    setIsExpanded(!isExpanded)
  }

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  })

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        {/* Items de la izquierda o Botón de Ingreso */}
        {!isExpanded ? (
          leftItems.map((item) => {
            const isActive = route.name === item.screen
            return (
              <TouchableOpacity
                key={item.screen}
                style={styles.navItem}
                onPress={() => navigation.navigate(item.screen as any)}
                activeOpacity={0.7}
              >
                <View style={[styles.iconContainer, isActive && styles.iconContainerActive]}>
                  <Ionicons
                    name={item.icon as any}
                    size={24}
                    color={isActive ? colors.primary : colors.textSecondary}
                  />
                </View>
              </TouchableOpacity>
            )
          })
        ) : (
          <Button
            mode="contained"
            icon="arrow-up"
            onPress={() => {
              openIncomeModal()
              handleToggle()
            }}
            style={[styles.actionButton, { backgroundColor: colors.income }]}
            labelStyle={styles.actionButtonLabel}
            contentStyle={styles.actionButtonContent}
            textColor="white"
          >
            Ingreso
          </Button>
        )}

        {/* Botón Central Elevado */}
        <TouchableOpacity
          style={styles.centerButtonContainer}
          onPress={handleToggle}
          activeOpacity={0.8}
        >
          <Animated.View style={[styles.centerButton, { transform: [{ rotate: rotation }] }]}>
            <Ionicons name="add" size={32} color="white" />
          </Animated.View>
        </TouchableOpacity>

        {/* Items de la derecha o Botón de Egreso */}
        {!isExpanded ? (
          rightItems.map((item) => {
            const isActive = route.name === item.screen
            return (
              <TouchableOpacity
                key={item.screen}
                style={styles.navItem}
                onPress={() => navigation.navigate(item.screen as any)}
                activeOpacity={0.7}
              >
                <View style={[styles.iconContainer, isActive && styles.iconContainerActive]}>
                  <Ionicons
                    name={item.icon as any}
                    size={24}
                    color={isActive ? colors.primary : colors.textSecondary}
                  />
                </View>
              </TouchableOpacity>
            )
          })
        ) : (
          <Button
            mode="contained"
            icon="arrow-down"
            onPress={() => {
              openExpenseModal()
              handleToggle()
            }}
            style={[styles.actionButton, { backgroundColor: colors.expense }]}
            labelStyle={styles.actionButtonLabel}
            contentStyle={styles.actionButtonContent}
            textColor="white"
          >
            Egreso
          </Button>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: 'transparent',
    pointerEvents: 'box-none',
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerActive: {
    backgroundColor: colors.primary + '20',
  },
  centerButtonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -30, // Elevar el botón por encima del navbar
  },
  centerButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderColor: '#0ba75956',
    borderWidth: 4,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    // Sombra intensa y cercana para profundidad
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 20,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
    height: 48,
  },
  actionButtonLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  actionButtonContent: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
