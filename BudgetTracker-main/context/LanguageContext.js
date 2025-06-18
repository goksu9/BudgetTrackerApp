import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('TR');

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const settings = await AsyncStorage.getItem('userSettings');
      if (settings) {
        const parsed = JSON.parse(settings);
        setLanguage(parsed.language || 'TR');
      }
    } catch (error) {
      console.error('Error loading language:', error);
    }
  };

  const updateLanguage = async (newLanguage) => {
    try {
      const settings = await AsyncStorage.getItem('userSettings');
      const parsed = settings ? JSON.parse(settings) : {};
      
      await AsyncStorage.setItem('userSettings', JSON.stringify({
        ...parsed,
        language: newLanguage
      }));
      
      setLanguage(newLanguage);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, updateLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
} 