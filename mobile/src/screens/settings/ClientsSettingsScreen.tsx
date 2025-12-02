import React, { useState, useEffect } from 'react'
import { View, StyleSheet, ScrollView, Alert } from 'react-native'
import { Text, FAB, Card, IconButton, ActivityIndicator } from 'react-native-paper'
import { useNavigation } from '@react-navigation/native'
import { AppHeader } from '../../components/AppHeader'
import { FloatingNavBar } from '../../components/FloatingNavBar'
import { ClientFormModal } from '../../components/ClientFormModal'
import { colors } from '../../theme/colors'
import { clientsApi } from '../../services/api'

export const ClientsSettingsScreen: React.FC = () => {
  const navigation = useNavigation()
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState<any[]>([])
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(undefined)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const response = await clientsApi.getAll()
      const data = Array.isArray(response)
        ? response
        : (response.clients || response.data || [])
      setClients(data)
    } catch (err) {
      console.error('Error loading clients:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setSelectedItem(undefined)
    setModalVisible(true)
  }

  const handleEdit = (item: any) => {
    setSelectedItem(item)
    setModalVisible(true)
  }

  const handleDelete = async (id: string) => {
    Alert.alert(
      'Confirmar',
      '¿Estás seguro de eliminar este cliente?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await clientsApi.delete(id)
              loadData()
            } catch (err) {
              console.error('Error deleting:', err)
            }
          },
        },
      ]
    )
  }

  return (
    <View style={styles.container}>
      <AppHeader />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <IconButton
              icon="arrow-left"
              size={24}
              onPress={() => navigation.goBack()}
              iconColor={colors.text}
            />
            <View style={styles.headerTextContainer}>
              <Text style={styles.title}>Mis Clientes</Text>
              <Text style={styles.subtitle}>
                Administra tu lista de clientes
              </Text>
            </View>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionTitle}>👥 Clientes ({clients.length})</Text>
            {clients.map((client) => (
              <Card key={client.id} style={styles.itemCard}>
                <Card.Content>
                  <View style={styles.itemRow}>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{client.company}</Text>
                      {client.responsible && (
                        <Text style={styles.itemDescription}>👤 {client.responsible}</Text>
                      )}
                      {client.email && (
                        <Text style={styles.itemDescription}>📧 {client.email}</Text>
                      )}
                      {client.phone && (
                        <Text style={styles.itemDescription}>📱 {client.phone}</Text>
                      )}
                    </View>
                    <View style={styles.itemActions}>
                      <IconButton
                        icon="pencil"
                        size={20}
                        onPress={() => handleEdit(client)}
                        iconColor={colors.textSecondary}
                      />
                      <IconButton
                        icon="delete"
                        size={20}
                        onPress={() => handleDelete(client.id)}
                        iconColor={colors.expense}
                      />
                    </View>
                  </View>
                </Card.Content>
              </Card>
            ))}

            <View style={{ height: 100 }} />
          </ScrollView>
        )}
      </View>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleCreate}
        color="white"
      />

      <FloatingNavBar />

      <ClientFormModal
        visible={modalVisible}
        onDismiss={() => {
          setModalVisible(false)
          setSelectedItem(undefined)
        }}
        onSuccess={() => {
          setModalVisible(false)
          setSelectedItem(undefined)
          loadData()
        }}
        client={selectedItem}
      />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
  },
  itemCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  itemDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  itemActions: {
    flexDirection: 'row',
    gap: -8,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 90,
    backgroundColor: colors.primary,
  },
})
