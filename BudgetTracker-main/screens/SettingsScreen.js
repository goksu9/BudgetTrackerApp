// screens/SettingsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  Alert,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
  TextInput
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTransaction } from '../context/TransactionContext';
import { useTheme } from '../context/ThemeContext';
import { exportTransactionsAsCSV } from '../utils/exportTransactions';
import { useCurrency } from '../context/CurrencyContext';
import { useLanguage } from '../context/LanguageContext';
import { auth, db } from '../App';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

export default function SettingsScreen({ navigation }) {
  const { transactions } = useTransaction();
  const { theme, setTheme: setThemeContext, currentTheme } = useTheme();
  const { currency, updateCurrency } = useCurrency();
  const { language, updateLanguage } = useLanguage();
  const [budgetAlerts, setBudgetAlerts] = useState(true);
  const [billReminders, setBillReminders] = useState(true);
  const [monthlyReports, setMonthlyReports] = useState(false);
  const [syncData, setSyncData] = useState(true);
  const [isCurrencyModalVisible, setIsCurrencyModalVisible] = useState(false);
  const [isThemeModalVisible, setIsThemeModalVisible] = useState(false);
  const [isLanguageModalVisible, setIsLanguageModalVisible] = useState(false);
  const [userName, setUserName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempUserName, setTempUserName] = useState('');

  const currencies = ['USD', 'EUR', 'TL'];
  const languages = ['TR', 'ENG'];

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (userId) {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserName(userData.name || '');
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleNameSave = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (userId) {
        await updateDoc(doc(db, 'users', userId), {
          name: tempUserName
        });
        setUserName(tempUserName);
        setIsEditingName(false);
      }
    } catch (error) {
      console.error('Error updating name:', error);
      Alert.alert('Hata', 'İsim güncellenirken bir hata oluştu.');
    }
  };

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const stored = await AsyncStorage.getItem('userSettings');
        if (stored) {
          const settings = JSON.parse(stored);
          setBudgetAlerts(settings.budgetAlerts);
          setBillReminders(settings.billReminders);
          setMonthlyReports(settings.monthlyReports);
          setSyncData(settings.syncData);
          setThemeContext(settings.theme || 'light');
          setIsLanguageModalVisible(settings.language === 'tr');
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };
    loadSettings();
  }, []);

  useEffect(() => {
    const saveSettings = async () => {
      try {
        const settings = {
          budgetAlerts,
          billReminders,
          monthlyReports,
          syncData,
          theme,
          language: isLanguageModalVisible ? 'tr' : 'en',
        };
        await AsyncStorage.setItem('userSettings', JSON.stringify(settings));
      } catch (error) {
        console.error('Failed to save settings:', error);
      }
    };
    saveSettings();
  }, [budgetAlerts, billReminders, monthlyReports, syncData, theme, isLanguageModalVisible]);

  const handleClearData = () => {
    Alert.alert('Clear Data', 'This will delete all your data!', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => Alert.alert('Data cleared!') },
    ]);
  };

  const handleThemeChange = (newTheme) => {
    setThemeContext(newTheme);
    setIsThemeModalVisible(false);
  };

  const handleCurrencyChange = async (newCurrency) => {
    await updateCurrency(newCurrency);
    setIsCurrencyModalVisible(false);
  };

  const handleLanguageChange = async (newLanguage) => {
    await updateLanguage(newLanguage);
    setIsLanguageModalVisible(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.replace('Login');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Hata', 'Çıkış yapılırken bir hata oluştu.');
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: currentTheme.text }]}>Settings</Text>
      </View>

      <View style={[styles.section, { backgroundColor: currentTheme.cardBackground }]}>
        <TouchableOpacity 
          style={styles.userInfoContainer}
          onPress={() => {
            setTempUserName(userName);
            setIsEditingName(true);
          }}
        >
          {isEditingName ? (
            <View style={styles.nameEditContainer}>
              <TextInput
                style={[styles.nameInput, { 
                  color: currentTheme.text,
                  borderColor: currentTheme.border,
                  backgroundColor: currentTheme.background
                }]}
                value={tempUserName}
                onChangeText={setTempUserName}
                placeholder="İsim Soyisim"
                placeholderTextColor={currentTheme.textSecondary}
              />
              <View style={styles.nameEditButtons}>
                <TouchableOpacity 
                  style={[styles.nameEditButton, { backgroundColor: currentTheme.primary }]}
                  onPress={handleNameSave}
                >
                  <Text style={styles.nameEditButtonText}>Kaydet</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.nameEditButton, { backgroundColor: currentTheme.danger }]}
                  onPress={() => setIsEditingName(false)}
                >
                  <Text style={styles.nameEditButtonText}>İptal</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <Text style={[styles.userName, { color: currentTheme.text }]}>
                {userName || 'İsim Soyisim'}
              </Text>
              <Text style={[styles.userEmail, { color: currentTheme.textSecondary }]}>
                {auth.currentUser?.email}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Preferences</Text>
        <TouchableOpacity onPress={() => setIsCurrencyModalVisible(true)}>
          <View style={[styles.row, { borderBottomColor: currentTheme.border }]}>
            <Text style={[styles.label, { color: currentTheme.text }]}>Currency</Text>
            <Text style={[styles.value, { color: currentTheme.textSecondary }]}>{currency}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setIsThemeModalVisible(true)}>
          <View style={[styles.row, { borderBottomColor: currentTheme.border }]}>
            <Text style={[styles.label, { color: currentTheme.text }]}>Theme</Text>
            <Text style={[styles.value, { color: currentTheme.textSecondary }]}>{theme}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setIsLanguageModalVisible(true)}>
          <View style={[styles.row, { borderBottomColor: currentTheme.border }]}>
            <Text style={[styles.label, { color: currentTheme.text }]}>Language</Text>
            <Text style={[styles.value, { color: currentTheme.textSecondary }]}>{language}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Notifications</Text>
        <View style={[styles.row, { borderBottomColor: currentTheme.border }]}>
          <Text style={[styles.label, { color: currentTheme.text }]}>Budget Alerts</Text>
          <Switch value={budgetAlerts} onValueChange={setBudgetAlerts} />
        </View>
        <View style={[styles.row, { borderBottomColor: currentTheme.border }]}>
          <Text style={[styles.label, { color: currentTheme.text }]}>Bill Reminders</Text>
          <Switch value={billReminders} onValueChange={setBillReminders} />
        </View>
        <View style={[styles.row, { borderBottomColor: currentTheme.border }]}>
          <Text style={[styles.label, { color: currentTheme.text }]}>Monthly Reports</Text>
          <Switch value={monthlyReports} onValueChange={setMonthlyReports} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Data Management</Text>
        <View style={[styles.row, { borderBottomColor: currentTheme.border }]}>
          <Text style={[styles.label, { color: currentTheme.text }]}>Sync Data</Text>
          <Switch value={syncData} onValueChange={setSyncData} />
        </View>
        <TouchableOpacity onPress={() => exportTransactionsAsCSV(transactions)}>
          <View style={[styles.row, { borderBottomColor: currentTheme.border }]}>
            <Text style={[styles.label, { color: currentTheme.text }]}>Export Data</Text>
            <Text style={[styles.value, { color: currentTheme.textSecondary }]}>CSV / PDF</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleClearData}>
          <View style={[styles.row, { borderBottomColor: currentTheme.border }]}>
            <Text style={[styles.label, { color: currentTheme.text }]}>Clear All Data</Text>
            <Text style={[styles.value, { color: currentTheme.danger }]}>Delete</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={[styles.section, { backgroundColor: currentTheme.cardBackground }]}>
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: currentTheme.danger }]}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={isCurrencyModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsCurrencyModalVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: currentTheme.cardBackground }]}>
            <Text style={[styles.modalTitle, { color: currentTheme.text }]}>Select Currency</Text>
            {currencies.map((curr) => (
              <TouchableOpacity
                key={curr}
                style={[
                  styles.modalOption,
                  { backgroundColor: currency === curr ? currentTheme.primary : currentTheme.background }
                ]}
                onPress={() => handleCurrencyChange(curr)}
              >
                <Text style={[
                  styles.modalOptionText,
                  { color: currency === curr ? '#fff' : currentTheme.text }
                ]}>{curr}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: currentTheme.border }]}
              onPress={() => setIsCurrencyModalVisible(false)}
            >
              <Text style={[styles.modalButtonText, { color: currentTheme.text }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={isThemeModalVisible} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setIsThemeModalVisible(false)}>
          <View style={[styles.modalContent, { backgroundColor: currentTheme.cardBackground }]}>
            {['Light', 'Dark'].map((option) => (
              <TouchableOpacity 
                key={option} 
                onPress={() => handleThemeChange(option)}
                style={[
                  styles.modalOption,
                  option === theme && { backgroundColor: currentTheme.primary + '20' }
                ]}
              >
                <Text style={[styles.modalOptionText, { color: currentTheme.text }]}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      <Modal
        visible={isLanguageModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsLanguageModalVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: currentTheme.cardBackground }]}>
            <Text style={[styles.modalTitle, { color: currentTheme.text }]}>Select Language</Text>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang}
                style={[
                  styles.modalOption,
                  { backgroundColor: language === lang ? currentTheme.primary : currentTheme.background }
                ]}
                onPress={() => handleLanguageChange(lang)}
              >
                <Text style={[
                  styles.modalOptionText,
                  { color: language === lang ? '#fff' : currentTheme.text }
                ]}>{lang}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: currentTheme.border }]}
              onPress={() => setIsLanguageModalVisible(false)}
            >
              <Text style={[styles.modalButtonText, { color: currentTheme.text }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  label: {
    fontSize: 14,
  },
  value: {
    fontSize: 14,
  },
  userInfoContainer: {
    padding: 15,
    borderRadius: 10,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
  },
  nameEditContainer: {
    width: '100%',
  },
  nameInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 10,
  },
  nameEditButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  nameEditButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  nameEditButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    padding: 20,
    borderRadius: 10,
    width: '70%',
  },
  modalOption: {
    paddingVertical: 10,
    borderRadius: 5,
    marginBottom: 5,
  },
  modalOptionText: {
    fontSize: 16,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});