import React, { useState, useEffect } from 'react'
import { View, StyleSheet, ScrollView, Alert } from 'react-native'
import { Text, SegmentedButtons, FAB, Card, IconButton, ActivityIndicator } from 'react-native-paper'
import { useNavigation } from '@react-navigation/native'
import { AppHeader } from '../../components/AppHeader'
import { FloatingNavBar } from '../../components/FloatingNavBar'
import { CategoryFormModal } from '../../components/CategoryFormModal'
import { colors } from '../../theme/colors'
import { categoriesApi } from '../../services/api'

export const CategoriesSettingsScreen: React.FC = () => {
  const navigation = useNavigation()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(undefined)
  const [activeTab, setActiveTab] = useState<'INCOME' | 'EXPENSE'>('INCOME')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const response = await categoriesApi.getAll()
      const data = Array.isArray(response)
        ? response
        : (response.categories || response.data || [])
      setCategories(data)
    } catch (err) {
      console.error('Error loading categories:', err)
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
      '¿Estás seguro de eliminar esta categoría?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await categoriesApi.delete(id)
              loadData()
            } catch (err) {
              console.error('Error deleting:', err)
            }
          },
        },
      ]
    )
  }

  const incomeCategories = categories.filter(c => c.type === 'INCOME')
  const expenseCategories = categories.filter(c => c.type === 'EXPENSE')
  const filteredCategories = activeTab === 'INCOME' ? incomeCategories : expenseCategories

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
              <Text style={styles.title}>Categorías de Transacciones</Text>
              <Text style={styles.subtitle}>
                Gestiona las categorías de ingresos y egresos
              </Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <SegmentedButtons
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as 'INCOME' | 'EXPENSE')}
            buttons={[
              {
                value: 'INCOME',
                label: `Ingresos (${incomeCategories.length})`,
                icon: 'cash-plus',
              },
              {
                value: 'EXPENSE',
                label: `Egresos (${expenseCategories.length})`,
                icon: 'cash-minus',
              },
            ]}
            style={styles.segmentedButtons}
          />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {filteredCategories.map((category) => (
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
        )}
      </View>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleCreate}
        color="white"
      />

      <FloatingNavBar />

      <CategoryFormModal
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
        category={selectedItem}
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
