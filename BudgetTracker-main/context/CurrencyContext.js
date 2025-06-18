import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CurrencyContext = createContext();

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState('USD');

  useEffect(() => {
    loadCurrency();
  }, []);

  const loadCurrency = async () => {
    try {
      const settings = await AsyncStorage.getItem('userSettings');
      if (settings) {
        const parsed = JSON.parse(settings);
        setCurrency(parsed.currency || 'USD');
      }
    } catch (error) {
      console.error('Error loading currency:', error);
    }
  };

  const updateCurrency = async (newCurrency) => {
    try {
      const settings = await AsyncStorage.getItem('userSettings');
      const parsed = settings ? JSON.parse(settings) : {};
      
      await AsyncStorage.setItem('userSettings', JSON.stringify({
        ...parsed,
        currency: newCurrency
      }));
      
      setCurrency(newCurrency);
    } catch (error) {
      console.error('Error saving currency:', error);
    }
  };

  return (
    <CurrencyContext.Provider value={{ currency, updateCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
} 