// screens/TransactionsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTransaction } from '../context/TransactionContext';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { format } from 'date-fns';
import { CATEGORIES, CATEGORY_COLORS, CATEGORY_ICONS } from '../constants/categories';
import { useCurrency } from '../context/CurrencyContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { translate } from '../utils/translate';

export default function TransactionsScreen() {
  const navigation = useNavigation();
  const { transactions, deleteTransaction, updateTransaction } = useTransaction();
  const { currentTheme } = useTheme();
  const { currency } = useCurrency();
  const { language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [editAmount, setEditAmount] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);

  useEffect(() => {
    const loadCurrency = async () => {
      const settings = await AsyncStorage.getItem('userSettings');
      if (settings) {
        const parsed = JSON.parse(settings);
        setCurrency(parsed.currency || 'USD');
      }
    };
    loadCurrency();
  }, []);

  const categories = [
    translate('All', language),
    translate('Housing', language),
    translate('Food', language),
    translate('Transport', language),
    translate('Bills', language),
    translate('Entertainment', language),
    translate('Health', language),
    translate('Shopping', language),
    translate('Other', language)
  ];

  const filteredTransactions =
    selectedCategory === 'All'
      ? transactions
      : transactions.filter((t) => t.category === selectedCategory);

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setEditAmount(Math.abs(transaction.amount).toString());
    setEditDescription(transaction.description);
    setEditCategory(transaction.category);
    setIsEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    try {
      if (!editAmount || !editDescription || !editCategory) {
        Alert.alert('Error', 'Please fill in all fields');
        return;
      }

      const amount = parseFloat(editAmount);
      if (isNaN(amount) || amount <= 0) {
        Alert.alert('Error', 'Please enter a valid amount');
        return;
      }

      const finalAmount = editingTransaction.type === 'expense' ? -amount : amount;

      await updateTransaction(editingTransaction.id, {
        amount: finalAmount,
        description: editDescription,
        category: editCategory,
      });

      setIsEditModalVisible(false);
      setEditingTransaction(null);
      Alert.alert('Success', 'Transaction updated successfully');
    } catch (error) {
      console.error('Error updating transaction:', error);
      Alert.alert('Error', 'Failed to update transaction');
    }
  };

  const handleDeleteTransaction = async (transactionId) => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTransaction(transactionId);
              Alert.alert('Success', 'Transaction deleted successfully');
            } catch (error) {
              console.error('Error deleting transaction:', error);
              Alert.alert('Error', 'Failed to delete transaction');
            }
          },
        },
      ]
    );
  };

  const handleTransactionPress = (transaction) => {
    setSelectedTransaction(transaction);
    setShowActionModal(true);
  };

  const renderTransactionItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.transactionItem, { backgroundColor: currentTheme.cardBackground }]}
      onPress={() => handleTransactionPress(item)}
    >
      <View style={[styles.transactionIcon, { backgroundColor: CATEGORY_COLORS[item.category] }]}>
        <MaterialCommunityIcons name={CATEGORY_ICONS[item.category]} size={24} color="#fff" />
      </View>
      <View style={styles.transactionInfo}>
        <Text style={[styles.transactionTitle, { color: currentTheme.text }]}>{item.title}</Text>
        <Text style={[styles.transactionDate, { color: currentTheme.textSecondary }]}>
          {new Date(item.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
        </Text>
      </View>
      <Text style={[
        styles.transactionAmount,
        { color: item.amount > 0 ? '#10B981' : '#EF4444' }
      ]}>
        {item.amount > 0 ? '+' : ''}
        {Math.abs(item.amount).toFixed(2)} {currency === 'TL' ? '₺' : currency}
      </Text>
    </TouchableOpacity>
  );

  const renderTransaction = ({ item }) => (
    <View style={[styles.transactionCard, { backgroundColor: currentTheme.cardBackground }]}>
      <View style={styles.transactionHeader}>
        <Text style={[styles.transactionCategory, { color: currentTheme.text }]}>{item.category}</Text>
        <View style={styles.transactionActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditTransaction(item)}
          >
            <Ionicons name="pencil" size={20} color={currentTheme.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteTransaction(item.id)}
          >
            <Ionicons name="trash" size={20} color={currentTheme.danger} />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={[
        styles.transactionAmount,
        { color: item.amount < 0 ? currentTheme.danger : currentTheme.success }
      ]}>
        {item.amount < 0 ? '-' : '+'}{Math.abs(item.amount).toLocaleString()} {currency}
      </Text>
      <Text style={[styles.transactionDescription, { color: currentTheme.textSecondary }]}>
        {item.installment ? item.installmentDescription : item.description}
      </Text>
      <Text style={[styles.transactionDate, { color: currentTheme.textSecondary }]}>
        {format(new Date(item.date), 'MMM dd, yyyy')}
      </Text>

      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={[styles.modalContainer, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: currentTheme.cardBackground }]}>
            <Text style={[styles.modalTitle, { color: currentTheme.text }]}>Edit Transaction</Text>
            
            <Text style={[styles.modalLabel, { color: currentTheme.text }]}>Amount</Text>
            <TextInput
              style={[styles.modalInput, { color: currentTheme.text, borderColor: currentTheme.border }]}
              value={editAmount}
              onChangeText={setEditAmount}
              keyboardType="numeric"
              placeholder="Enter amount"
              placeholderTextColor={currentTheme.textSecondary}
            />

            <Text style={[styles.modalLabel, { color: currentTheme.text }]}>Description</Text>
            <TextInput
              style={[styles.modalInput, { color: currentTheme.text, borderColor: currentTheme.border }]}
              value={editDescription}
              onChangeText={setEditDescription}
              placeholder="Enter description"
              placeholderTextColor={currentTheme.textSecondary}
            />

            <Text style={[styles.modalLabel, { color: currentTheme.text }]}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categorySelector}>
              {CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryChip,
                    { backgroundColor: editCategory === category ? currentTheme.primary : currentTheme.cardBackground }
                  ]}
                  onPress={() => setEditCategory(category)}
                >
                  <Text style={[
                    styles.categoryChipText,
                    { color: editCategory === category ? '#fff' : currentTheme.text }
                  ]}>{category}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: currentTheme.danger }]}
                onPress={() => setIsEditModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: currentTheme.primary }]}
                onPress={handleSaveEdit}
              >
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: currentTheme.text }]}>
          {translate('Transactions', language)}
        </Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.selectedCategory,
              { backgroundColor: currentTheme.cardBackground }
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[
              styles.categoryText,
              { color: selectedCategory === category ? '#fff' : currentTheme.text }
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filteredTransactions}
        renderItem={renderTransactionItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.transactionsList}
      />

      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: currentTheme.primary }]}
        onPress={() => navigation.navigate('AddTransaction')}
      >
        <Text style={styles.addButtonText}>+ Add Transaction</Text>
      </TouchableOpacity>

      <Modal
        visible={showActionModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowActionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.actionModal, { backgroundColor: currentTheme.cardBackground }]}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                setShowActionModal(false);
                handleDeleteTransaction(selectedTransaction.id);
              }}
            >
              <Ionicons name="trash" size={24} color={currentTheme.danger} />
              <Text style={[styles.actionButtonText, { color: currentTheme.danger }]}>Sil</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { borderTopWidth: 1, borderTopColor: currentTheme.border }]}
              onPress={() => setShowActionModal(false)}
            >
              <Text style={[styles.actionButtonText, { color: currentTheme.text }]}>İptal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filterScrollContent: {
    paddingRight: 20,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  transactionsList: {
    paddingBottom: 20,
  },
  transactionCard: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  transactionActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 5,
    marginLeft: 10,
  },
  transactionCategory: {
    fontSize: 16,
    fontWeight: '500',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  transactionDescription: {
    fontSize: 14,
    marginBottom: 5,
  },
  transactionDate: {
    fontSize: 12,
  },
  addButton: {
    backgroundColor: '#6366F1',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 16,
    marginBottom: 5,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  categorySelector: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  categoryChip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  categoryChipText: {
    fontSize: 14,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  selectedCategory: {
    backgroundColor: '#6366F1',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionModal: {
    width: '80%',
    borderRadius: 10,
    overflow: 'hidden',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    gap: 10,
  },
  actionButtonText: {
    fontSize: 16,
    marginLeft: 10,
  },
});
