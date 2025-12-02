import React, { useState, useEffect } from 'react'
import { View, StyleSheet, ScrollView, Alert } from 'react-native'
import { Text, FAB, Card, IconButton, ActivityIndicator, Chip } from 'react-native-paper'
import { AppHeader } from '../../components/AppHeader'
import { FloatingNavBar } from '../../components/FloatingNavBar'
import { BankAccountFormModal } from '../../components/BankAccountFormModal'
import { colors } from '../../theme/colors'
import { bankAccountsApi } from '../../services/api'

export const BankAccountsSettingsScreen: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [bankAccounts, setBankAccounts] = useState<any[]>([])
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(undefined)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const response = await bankAccountsApi.getAll()
      const data = Array.isArray(response)
        ? response
        : (response.bankAccounts || response.data || [])
      setBankAccounts(data)
    } catch (err) {
      console.error('Error loading bank accounts:', err)
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
      '¿Estás seguro de eliminar esta cuenta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await bankAccountsApi.delete(id)
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
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Cuentas Bancarias</Text>
          <Text style={styles.subtitle}>
            Administra tus cuentas bancarias
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>🏦 Cuentas Bancarias ({bankAccounts.length})</Text>
            {bankAccounts.map((account) => (
              <Card key={account.id} style={styles.itemCard}>
                <Card.Content>
                  <View style={styles.itemRow}>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{account.name}</Text>
                      <Text style={styles.itemDescription}>
                        {account.bank} • *{account.accountNumber.slice(-4)}
                      </Text>
                      <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                        <Chip compact style={{ backgroundColor: colors.primary + '20' }}>
                          {account.currency}
                        </Chip>
                        <Chip compact style={{ backgroundColor: colors.surface }}>
                          {account.accountType}
                        </Chip>
                      </View>
                    </View>
                    <View style={styles.itemActions}>
                      <IconButton
                        icon="pencil"
                        size={20}
                        onPress={() => handleEdit(account)}
                        iconColor={colors.textSecondary}
                      />
                      <IconButton
                        icon="delete"
                        size={20}
                        onPress={() => handleDelete(account.id)}
                        iconColor={colors.expense}
                      />
                    </View>
                  </View>
                </Card.Content>
              </Card>
            ))}

            <View style={{ height: 100 }} />
          </>
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleCreate}
        color="white"
      />

      <FloatingNavBar />

      <BankAccountFormModal
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
        bankAccount={selectedItem}
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
