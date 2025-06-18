// context/TransactionContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db, auth } from '../App';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';

const TransactionContext = createContext();

export const TransactionProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [selectedDateRange, setSelectedDateRange] = useState('Month');

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.transactions) {
          setTransactions(userData.transactions);
        }
      } else {
        // Kullanıcı dokümanı yoksa oluştur
        await setDoc(doc(db, 'users', userId), {
          transactions: [],
          budgets: {},
          settings: {}
        });
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const saveTransactionsToFirebase = async (updatedTransactions) => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        transactions: updatedTransactions
      });
    } catch (error) {
      console.error('Error saving transactions:', error);
    }
  };

  const addTransaction = async (transaction) => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const newTransaction = {
        ...transaction,
        id: Date.now().toString(),
        date: new Date().toISOString(),
        userId: userId
      };

      const updatedTransactions = [...transactions, newTransaction];
      setTransactions(updatedTransactions);
      await saveTransactionsToFirebase(updatedTransactions);
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  const updateTransaction = async (updatedTransaction) => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const updatedTransactions = transactions.map(t =>
        t.id === updatedTransaction.id ? { ...updatedTransaction, userId } : t
      );
      setTransactions(updatedTransactions);
      await saveTransactionsToFirebase(updatedTransactions);
    } catch (error) {
      console.error('Error updating transaction:', error);
    }
  };

  const deleteTransaction = async (transactionId) => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const updatedTransactions = transactions.filter(t => t.id !== transactionId);
      setTransactions(updatedTransactions);
      await saveTransactionsToFirebase(updatedTransactions);
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const getTransactionsByDateRange = (range) => {
    const now = new Date();
    let startDate;

    switch (range) {
      case 'Week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'Month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'Year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 1));
    }

    return transactions.filter(t => new Date(t.date) >= startDate);
  };

  const getTransactionsByCategory = (category) => {
    return transactions.filter(t => t.category === category);
  };

  const getTotalIncome = () => {
    return transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  };

  const getTotalExpense = () => {
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0);
  };

  const getBalance = () => {
    return getTotalIncome() - getTotalExpense();
  };

  const getRecentTransactions = (limit = 5) => {
    return [...transactions]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit);
  };

  const getMonthlyExpenses = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return transactions
      .filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= startOfMonth && 
               transactionDate <= endOfMonth && 
               t.type === 'expense';
      })
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  };

  const getMonthlyIncome = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return transactions
      .filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= startOfMonth && 
               transactionDate <= endOfMonth && 
               t.type === 'income';
      })
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  };

  return (
    <TransactionContext.Provider value={{
      transactions,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      selectedDateRange,
      setSelectedDateRange,
      getTransactionsByDateRange,
      getTransactionsByCategory,
      getTotalIncome,
      getTotalExpense,
      getBalance,
      getRecentTransactions,
      getMonthlyExpenses,
      getMonthlyIncome
    }}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransaction = () => useContext(TransactionContext);
