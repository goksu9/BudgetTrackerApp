// screens/StatisticsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTransaction } from '../context/TransactionContext';
import { useTheme } from '../context/ThemeContext';
import { CATEGORIES, CATEGORY_COLORS, CATEGORY_ICONS } from '../constants/categories';
import { PieChart } from 'react-native-chart-kit';
import { useCurrency } from '../context/CurrencyContext';
import { useLanguage } from '../context/LanguageContext';
import { translate } from '../utils/translate';

export default function StatisticsScreen() {
  const { transactions, getMonthlyExpenses, getMonthlyIncome } = useTransaction();
  const { currentTheme, isDarkMode } = useTheme();
  const { currency } = useCurrency();
  const { language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(0);

  useEffect(() => {
    const expenses = getMonthlyExpenses();
    const income = getMonthlyIncome();
    setMonthlyExpenses(expenses);
    setMonthlyIncome(income);
  }, [transactions]);

  const getCategoryExpenses = (category) => {
    return transactions
      .filter(t => t.category === category && t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  };

  const getCategoryPercentage = (category) => {
    if (monthlyExpenses === 0) return 0;
    return (getCategoryExpenses(category) / monthlyExpenses) * 100;
  };

  const getChartData = () => {
    return CATEGORIES.map(category => {
      const expenses = getCategoryExpenses(category);
      if (expenses === 0) return null;
      return {
        name: category,
        amount: expenses,
        color: CATEGORY_COLORS[category],
        legendFontColor: isDarkMode ? '#fff' : '#000',
      };
    }).filter(Boolean);
  };

  const renderCategoryItem = (category) => {
    const expenses = getCategoryExpenses(category);
    const percentage = getCategoryPercentage(category);
    const isSelected = selectedCategory === category;

    return (
      <TouchableOpacity
        key={category}
        style={[
          styles.categoryItem,
          isSelected && styles.selectedCategory,
          { backgroundColor: isDarkMode ? '#1F2937' : '#fff' }
        ]}
        onPress={() => setSelectedCategory(category)}
      >
        <View style={[styles.categoryIcon, { backgroundColor: CATEGORY_COLORS[category] }]}>
          <MaterialCommunityIcons 
            name={CATEGORY_ICONS[category]} 
            size={24} 
            color="#fff"
          />
        </View>
        <View style={styles.categoryInfo}>
          <Text style={[styles.categoryName, { color: isDarkMode ? '#fff' : '#000' }]}>
            {translate(category, language)}
          </Text>
          <Text style={[styles.categoryAmount, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
            {expenses.toFixed(2)} {currency}
          </Text>
        </View>
        <View style={styles.percentageContainer}>
          <View style={[styles.percentageBar, { 
            width: `${percentage}%`,
            backgroundColor: CATEGORY_COLORS[category]
          }]} />
          <Text style={[styles.percentageText, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
            {percentage.toFixed(1)}%
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDarkMode ? '#111827' : '#f5f5f5' }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDarkMode ? '#fff' : '#2c3e50' }]}>
          {translate('Statistics', language)}
        </Text>
      </View>

      <View style={[styles.summaryCard, { backgroundColor: isDarkMode ? '#1F2937' : '#fff' }]}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
              {translate('Monthly Income', language)}
            </Text>
            <Text style={[styles.summaryValue, { color: isDarkMode ? '#fff' : '#000' }]}>
              {monthlyIncome.toFixed(2)} {currency}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
              {translate('Monthly Expenses', language)}
            </Text>
            <Text style={[styles.summaryValue, { color: isDarkMode ? '#fff' : '#000' }]}>
              {monthlyExpenses.toFixed(2)} {currency}
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.chartCard, { backgroundColor: isDarkMode ? '#1F2937' : '#fff' }]}>
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#2c3e50' }]}>
          {translate('Expense Distribution', language)}
        </Text>
        <PieChart
          data={getChartData()}
          width={Dimensions.get('window').width - 40}
          height={220}
          chartConfig={{
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          }}
          accessor="amount"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      </View>

      <View style={styles.categoriesContainer}>
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#2c3e50' }]}>
          {translate('Category Breakdown', language)}
        </Text>
        {CATEGORIES.map(renderCategoryItem)}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  summaryCard: {
    margin: 20,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 14,
    marginBottom: 5,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  chartCard: {
    margin: 20,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoriesContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedCategory: {
    backgroundColor: '#DBEAFE',
    borderWidth: 1,
    borderColor: '#60A5FA',
  },
  categoryIcon: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  categoryAmount: {
    fontSize: 14,
  },
  percentageContainer: {
    width: 100,
    height: 20,
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
    overflow: 'hidden',
    marginLeft: 10,
  },
  percentageBar: {
    height: '100%',
  },
  percentageText: {
    position: 'absolute',
    right: 5,
    top: 2,
    fontSize: 12,
  },
});
