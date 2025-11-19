import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Analytics() {
  const [analytics, setAnalytics] = useState({
    totalIncome: 0,
    totalTithe: 0,
    paidTithes: 0,
    pendingTithes: 0,
    incomeSources: [],
    monthlyData: []
  });

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    let incomes = await AsyncStorage.getItem("incomes");
    incomes = incomes ? JSON.parse(incomes) : [];

    // Calculate totals
    const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);
    const totalTithe = totalIncome * 0.1;
    
    // Count paid vs pending
    const paidTithes = incomes.filter(item => item.status === 'done').length;
    const pendingTithes = incomes.filter(item => item.status === 'pending').length;
    
    // Group by description (income sources)
    const sourceMap = {};
    incomes.forEach(item => {
      const source = item.description || 'No description';
      if (!sourceMap[source]) {
        sourceMap[source] = 0;
      }
      sourceMap[source] += item.amount;
    });
    
    const incomeSources = Object.keys(sourceMap).map((source, index) => ({
      name: source,
      amount: sourceMap[source],
      color: `hsl(${index * 60}, 70%, 50%)`,
      legendFontColor: '#343A40',
      legendFontSize: 12
    }));
    
    // Group by month
    const monthMap = {};
    incomes.forEach(item => {
      const date = new Date(item.date);
      const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      if (!monthMap[monthYear]) {
        monthMap[monthYear] = 0;
      }
      monthMap[monthYear] += item.amount;
    });
    
    const monthlyData = Object.keys(monthMap).map(month => ({
      month,
      amount: monthMap[month]
    }));

    setAnalytics({
      totalIncome,
      totalTithe,
      paidTithes,
      pendingTithes,
      incomeSources: incomeSources.slice(0, 5), // Top 5 sources
      monthlyData
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Financial Analytics</Text>
      
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>ETB {analytics.totalIncome.toFixed(2)}</Text>
          <Text style={styles.summaryLabel}>Total Income</Text>
        </View>
        
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>ETB {analytics.totalTithe.toFixed(2)}</Text>
          <Text style={styles.summaryLabel}>Total Tithe (10%)</Text>
        </View>
        
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{analytics.paidTithes}</Text>
          <Text style={styles.summaryLabel}>Tithes Paid</Text>
        </View>
        
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{analytics.pendingTithes}</Text>
          <Text style={styles.summaryLabel}>Tithes Pending</Text>
        </View>
      </View>
      
      {analytics.incomeSources.length > 0 && (
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Top Income Sources</Text>
          {analytics.incomeSources.map((source, index) => (
            <View key={index} style={styles.sourceRow}>
              <Text style={styles.sourceName}>{source.name}</Text>
              <Text style={styles.sourceAmount}>ETB {source.amount.toFixed(2)}</Text>
            </View>
          ))}
        </View>
      )}
      
      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>About Analytics</Text>
        <Text style={styles.infoText}>
          This screen provides insights into your giving patterns and financial habits. 
          Tracking your income sources and monthly trends can help you better plan your tithing.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F8F9FA',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
    color: '#343A40',
    textAlign: 'center',
  },
  summaryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    width: '48%',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#343A40',
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6C757D',
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#343A40',
  },
  sourceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  sourceName: {
    fontSize: 16,
    color: '#495057',
  },
  sourceAmount: {
    fontSize: 16,
    fontWeight: '500',
    color: '#343A40',
  },
  infoText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#495057',
  },
});