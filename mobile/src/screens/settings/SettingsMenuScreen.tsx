import React from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import { Text, Card, TouchableRipple } from 'react-native-paper'
import { useNavigation } from '@react-navigation/native'
import { AppHeader } from '../../components/AppHeader'
import { FloatingNavBar } from '../../components/FloatingNavBar'
import { colors } from '../../theme/colors'

export const SettingsMenuScreen: React.FC = () => {
  const navigation = useNavigation()

  const settingsOptions = [
    {
      id: 'categories',
      title: 'Categorías de Transacciones',
      description: 'Gestiona las categorías de ingresos y egresos',
      icon: '📁',
      route: 'CategoriesSettings',
    },
    {
      id: 'clients',
      title: 'Mis Clientes',
      description: 'Administra tu lista de clientes',
      icon: '👥',
      route: 'ClientsSettings',
    },
    {
      id: 'cards',
      title: 'Tarjetas de Crédito',
      description: 'Gestiona tus tarjetas de crédito',
      icon: '💳',
      route: 'CreditCardsSettings',
    },
    {
      id: 'accounts',
      title: 'Cuentas Bancarias',
      description: 'Administra tus cuentas bancarias',
      icon: '🏦',
      route: 'BankAccountsSettings',
    },
  ]

  const handleNavigate = (route: string) => {
    navigation.navigate(route as never)
  }

  return (
    <View style={styles.container}>
      <AppHeader />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Configuración</Text>
          <Text style={styles.subtitle}>
            Gestiona tus datos maestros y preferencias
          </Text>
        </View>

        {/* Settings Cards */}
        <View style={styles.cardsContainer}>
          {settingsOptions.map((option) => (
            <TouchableRipple
              key={option.id}
              onPress={() => handleNavigate(option.route)}
              style={styles.cardTouchable}
            >
              <Card style={styles.card}>
                <Card.Content style={styles.cardContent}>
                  <View style={styles.iconContainer}>
                    <Text style={styles.icon}>{option.icon}</Text>
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={styles.cardTitle}>{option.title}</Text>
                    <Text style={styles.cardDescription}>{option.description}</Text>
                  </View>
                  <View style={styles.arrowContainer}>
                    <Text style={styles.arrow}>›</Text>
                  </View>
                </Card.Content>
              </Card>
            </TouchableRipple>
          ))}
        </View>

        {/* Espaciado para el navbar */}
        <View style={{ height: 100 }} />
      </ScrollView>

      <FloatingNavBar />
    </View>
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
  cardsContainer: {
    padding: 16,
    gap: 12,
  },
  cardTouchable: {
    borderRadius: 12,
    marginBottom: 12,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  icon: {
    fontSize: 28,
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  arrowContainer: {
    marginLeft: 8,
  },
  arrow: {
    fontSize: 24,
    color: colors.textSecondary,
    fontWeight: '300',
  },
})
