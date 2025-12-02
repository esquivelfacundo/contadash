import React from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import { Text, Card, Avatar, List, Divider, IconButton } from 'react-native-paper'
import { useNavigation } from '@react-navigation/native'
import { AppHeader } from '../../components/AppHeader'
import { FloatingNavBar } from '../../components/FloatingNavBar'
import { colors } from '../../theme/colors'
import { useAuthStore } from '../../store/authStore'

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation()
  const user = useAuthStore((state) => state.user)

  return (
    <View style={styles.container}>
      <AppHeader />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <IconButton
              icon="arrow-left"
              size={24}
              onPress={() => navigation.goBack()}
              iconColor={colors.text}
            />
            <View style={styles.headerTextContainer}>
              <Text style={styles.title}>Mi Perfil</Text>
              <Text style={styles.subtitle}>
                Información de tu cuenta
              </Text>
            </View>
          </View>
        </View>

        {/* Card de Usuario */}
        <Card style={styles.profileCard}>
          <Card.Content style={styles.profileContent}>
            <Avatar.Text 
              size={80} 
              label={user?.name?.substring(0, 2).toUpperCase() || 'UD'}
              style={styles.avatar}
            />
            <Text style={styles.userName}>{user?.name || 'Usuario Demo'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'demo@contadash.com'}</Text>
          </Card.Content>
        </Card>

        {/* Información de la Cuenta */}
        <Card style={styles.infoCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Información de la Cuenta</Text>
            
            <List.Item
              title="Nombre completo"
              description={user?.name || 'Usuario Demo'}
              left={props => <List.Icon {...props} icon="account" />}
              style={styles.listItem}
            />
            <Divider />
            
            <List.Item
              title="Correo electrónico"
              description={user?.email || 'demo@contadash.com'}
              left={props => <List.Icon {...props} icon="email" />}
              style={styles.listItem}
            />
            <Divider />
            
            <List.Item
              title="Rol"
              description="Administrador"
              left={props => <List.Icon {...props} icon="shield-account" />}
              style={styles.listItem}
            />
          </Card.Content>
        </Card>

        {/* Preferencias */}
        <Card style={styles.infoCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Preferencias</Text>
            
            <List.Item
              title="Idioma"
              description="Español"
              left={props => <List.Icon {...props} icon="translate" />}
              style={styles.listItem}
            />
            <Divider />
            
            <List.Item
              title="Moneda principal"
              description="ARS (Peso Argentino)"
              left={props => <List.Icon {...props} icon="currency-usd" />}
              style={styles.listItem}
            />
            <Divider />
            
            <List.Item
              title="Tema"
              description="Oscuro"
              left={props => <List.Icon {...props} icon="theme-light-dark" />}
              style={styles.listItem}
            />
          </Card.Content>
        </Card>

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
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  profileCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  profileContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatar: {
    backgroundColor: colors.primary,
    marginBottom: 16,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  infoCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  listItem: {
    paddingHorizontal: 0,
  },
})
