import React, { useState, useEffect } from 'react'
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native'
import { Text, SegmentedButtons, FAB, Card, IconButton, Chip, ActivityIndicator } from 'react-native-paper'
import { AppHeader } from '../../components/AppHeader'
import { FloatingNavBar } from '../../components/FloatingNavBar'
import { CategoryFormModal } from '../../components/CategoryFormModal'
import { ClientFormModal } from '../../components/ClientFormModal'
import { CreditCardFormModal } from '../../components/CreditCardFormModal'
import { BankAccountFormModal } from '../../components/BankAccountFormModal'
import { colors } from '../../theme/colors'
import { categoriesApi, clientsApi, creditCardsApi, bankAccountsApi } from '../../services/api'

export const SettingsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('categories')
  const [loading, setLoading] = useState(false)
  
  // Datos
  const [categories, setCategories] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [creditCards, setCreditCards] = useState<any[]>([])
  const [bankAccounts, setBankAccounts] = useState<any[]>([])
  
  // Modales
  const [categoryModalVisible, setCategoryModalVisible] = useState(false)
  const [clientModalVisible, setClientModalVisible] = useState(false)
  const [creditCardModalVisible, setCreditCardModalVisible] = useState(false)
  const [bankAccountModalVisible, setBankAccountModalVisible] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(undefined)

  useEffect(() => {
    loadData()
  }, [activeTab])

  const loadData = async () => {
    try {
      setLoading(true)
      
      if (activeTab === 'categories') {
        const response = await categoriesApi.getAll()
        const data = Array.isArray(response)
          ? response
          : (response.categories || response.data || [])
        setCategories(data)
      } else if (activeTab === 'clients') {
        const response = await clientsApi.getAll()
        const data = Array.isArray(response)
          ? response
          : (response.clients || response.data || [])
        setClients(data)
      } else if (activeTab === 'cards') {
        const response = await creditCardsApi.getAll()
        const data = Array.isArray(response)
          ? response
          : (response.creditCards || response.data || [])
        setCreditCards(data)
      } else if (activeTab === 'accounts') {
        const response = await bankAccountsApi.getAll()
        const data = Array.isArray(response)
          ? response
          : (response.bankAccounts || response.data || [])
        setBankAccounts(data)
      }
    } catch (err) {
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setSelectedItem(undefined)
    if (activeTab === 'categories') {
      setCategoryModalVisible(true)
    } else if (activeTab === 'clients') {
      setClientModalVisible(true)
    } else if (activeTab === 'cards') {
      setCreditCardModalVisible(true)
    } else if (activeTab === 'accounts') {
      setBankAccountModalVisible(true)
    }
  }

  const handleEdit = (item: any) => {
    setSelectedItem(item)
    if (activeTab === 'categories') {
      setCategoryModalVisible(true)
    } else if (activeTab === 'clients') {
      setClientModalVisible(true)
    } else if (activeTab === 'cards') {
      setCreditCardModalVisible(true)
    } else if (activeTab === 'accounts') {
      setBankAccountModalVisible(true)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      if (activeTab === 'categories') {
        await categoriesApi.delete(id)
      } else if (activeTab === 'clients') {
        await clientsApi.delete(id)
      } else if (activeTab === 'cards') {
        await creditCardsApi.delete(id)
      } else if (activeTab === 'accounts') {
        await bankAccountsApi.delete(id)
      }
      loadData()
    } catch (err) {
      console.error('Error deleting:', err)
    }
  }

  const renderCategories = () => {
    const incomeCategories = categories.filter(c => c.type === 'INCOME')
    const expenseCategories = categories.filter(c => c.type === 'EXPENSE')

    return (
      <ScrollView>
        <Text style={styles.sectionTitle}>💰 Categorías de Ingreso ({incomeCategories.length})</Text>
        {incomeCategories.map((category) => (
          <Card key={category.id} style={styles.itemCard}>
            <Card.Content>
              <View style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{category.name}</Text>
                  {category.description && (
                    <Text style={styles.itemDescription}>{category.description}</Text>
                  )}
                </View>
                <View style={styles.itemActions}>
                  <IconButton
                    icon="pencil"
                    size={20}
                    onPress={() => handleEdit(category)}
                    iconColor={colors.textSecondary}
                  />
                  <IconButton
                    icon="delete"
                    size={20}
                    onPress={() => handleDelete(category.id)}
                    iconColor={colors.expense}
                  />
                </View>
              </View>
            </Card.Content>
          </Card>
        ))}

        <Text style={styles.sectionTitle}>💸 Categorías de Egreso ({expenseCategories.length})</Text>
        {expenseCategories.map((category) => (
          <Card key={category.id} style={styles.itemCard}>
            <Card.Content>
              <View style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{category.name}</Text>
                  {category.description && (
                    <Text style={styles.itemDescription}>{category.description}</Text>
                  )}
                </View>
                <View style={styles.itemActions}>
                  <IconButton
                    icon="pencil"
                    size={20}
                    onPress={() => handleEdit(category)}
                    iconColor={colors.textSecondary}
                  />
                  <IconButton
                    icon="delete"
                    size={20}
                    onPress={() => handleDelete(category.id)}
                    iconColor={colors.expense}
                  />
                </View>
              </View>
            </Card.Content>
          </Card>
        ))}
        
        <View style={{ height: 100 }} />
      </ScrollView>
    )
  }

  const renderClients = () => {
    return (
      <ScrollView>
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
    )
  }

  const renderCreditCards = () => {
    return (
      <ScrollView>
        <Text style={styles.sectionTitle}>💳 Tarjetas de Crédito ({creditCards.length})</Text>
        {creditCards.map((card) => (
          <Card key={card.id} style={styles.itemCard}>
            <Card.Content>
              <View style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{card.name}</Text>
                  <Text style={styles.itemDescription}>
                    {card.bank} • *{card.lastFourDigits}
                  </Text>
                  {card.limit && (
                    <Text style={styles.itemDescription}>
                      Límite: ${Number(card.limit).toLocaleString()}
                    </Text>
                  )}
                </View>
                <View style={styles.itemActions}>
                  <IconButton
                    icon="pencil"
                    size={20}
                    onPress={() => handleEdit(card)}
                    iconColor={colors.textSecondary}
                  />
                  <IconButton
                    icon="delete"
                    size={20}
                    onPress={() => handleDelete(card.id)}
                    iconColor={colors.expense}
                  />
                </View>
              </View>
            </Card.Content>
          </Card>
        ))}
        
        <View style={{ height: 100 }} />
      </ScrollView>
    )
  }

  const renderBankAccounts = () => {
    return (
      <ScrollView>
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
      </ScrollView>
    )
  }

  return (
    <View style={styles.container}>
      <AppHeader />
      
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Configuración</Text>
          <Text style={styles.subtitle}>
            Gestiona tus datos maestros
          </Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <SegmentedButtons
              value={activeTab}
              onValueChange={setActiveTab}
              buttons={[
                {
                  value: 'categories',
                  label: 'Categorías',
                  icon: 'shape',
                },
                {
                  value: 'clients',
                  label: 'Clientes',
                  icon: 'account-group',
                },
                {
                  value: 'cards',
                  label: 'Tarjetas',
                  icon: 'credit-card',
                },
                {
                  value: 'accounts',
                  label: 'Cuentas',
                  icon: 'bank',
                },
              ]}
              style={styles.segmentedButtons}
            />
          </ScrollView>
        </View>

        {/* Content */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <>
            {activeTab === 'categories' && renderCategories()}
            {activeTab === 'clients' && renderClients()}
            {activeTab === 'cards' && renderCreditCards()}
            {activeTab === 'accounts' && renderBankAccounts()}
          </>
        )}
      </View>

      {/* FAB */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleCreate}
        color="white"
      />

      <FloatingNavBar />

      {/* Modales */}
      <CategoryFormModal
        visible={categoryModalVisible}
        onDismiss={() => {
          setCategoryModalVisible(false)
          setSelectedItem(undefined)
        }}
        onSuccess={() => {
          setCategoryModalVisible(false)
          setSelectedItem(undefined)
          loadData()
        }}
        category={selectedItem}
      />

      <ClientFormModal
        visible={clientModalVisible}
        onDismiss={() => {
          setClientModalVisible(false)
          setSelectedItem(undefined)
        }}
        onSuccess={() => {
          setClientModalVisible(false)
          setSelectedItem(undefined)
          loadData()
        }}
        client={selectedItem}
      />

      <CreditCardFormModal
        visible={creditCardModalVisible}
        onDismiss={() => {
          setCreditCardModalVisible(false)
          setSelectedItem(undefined)
        }}
        onSuccess={() => {
          setCreditCardModalVisible(false)
          setSelectedItem(undefined)
          loadData()
        }}
        creditCard={selectedItem}
      />

      <BankAccountFormModal
        visible={bankAccountModalVisible}
        onDismiss={() => {
          setBankAccountModalVisible(false)
          setSelectedItem(undefined)
        }}
        onSuccess={() => {
          setBankAccountModalVisible(false)
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
  tabsContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  segmentedButtons: {
    backgroundColor: colors.surface,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
