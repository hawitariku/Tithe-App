import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Alert, Share } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NotificationService from '../services/NotificationService';

export default function Dashboard({ navigation }) {
  const [totalIncome, setTotalIncome] = useState(0);
  const [tithePending, setTithePending] = useState(0);
  const [totalTithesPaid, setTotalTithesPaid] = useState(0);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Refresh data whenever the screen comes into focus
      loadData();
    });

    // Load initial data
    loadData();

    // Clean up listener on unmount
    return unsubscribe;
  }, [navigation]);

  const loadData = async () => {
    let income = await AsyncStorage.getItem("incomes");
    income = income ? JSON.parse(income) : [];

    let total = income.reduce((sum, x) => sum + x.amount, 0);
    let tithe = total * 0.1;
    
    // Count paid tithes
    let paidTithes = income.filter(item => item.status === 'done').length;

    setTotalIncome(total);
    setTithePending(tithe);
    setTotalTithesPaid(paidTithes);
  };

  const clearAllData = async () => {
    Alert.alert(
      "Clear All Data",
      "Are you sure you want to clear all income records? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.removeItem("incomes");
            
            // Show confirmation notification
            await NotificationService.showActionConfirmation(
              "Data Cleared",
              "All income records have been removed"
            );
            
            loadData();
            Alert.alert("Success", "All data has been cleared!");
          }
        }
      ]
    );
  };

  const exportData = async () => {
    try {
      let incomes = await AsyncStorage.getItem("incomes");
      incomes = incomes ? JSON.parse(incomes) : [];
      
      const exportText = `
Tithe Tracker Data Export
=========================

Total Records: ${incomes.length}
Total Income: ETB ${incomes.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
Total Tithe: ETB ${(incomes.reduce((sum, item) => sum + item.amount, 0) * 0.1).toFixed(2)}
Tithes Paid: ${incomes.filter(item => item.status === 'done').length}
Tithes Pending: ${incomes.filter(item => item.status === 'pending').length}

Detailed Records:
${incomes.map(item => 
  `- ${new Date(item.date).toLocaleDateString()}: ETB ${item.amount.toFixed(2)} (${item.status}) - ${item.description || 'No description'}`
).join('\n')}

Exported on: ${new Date().toLocaleString()}
      `.trim();

      await Share.share({
        message: exportText,
        title: 'Tithe Tracker Data Export'
      });
      
      // Show confirmation notification
      await NotificationService.showActionConfirmation(
        "Data Exported",
        "Your data has been exported successfully"
      );
    } catch (error) {
      Alert.alert("Error", "Failed to export data: " + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tithe Tracker</Text>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>ETB {totalIncome.toFixed(2)}</Text>
          <Text style={styles.statLabel}>Total Income</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statValue}>ETB {tithePending.toFixed(2)}</Text>
          <Text style={styles.statLabel}>Tithe (10%)</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{totalTithesPaid}</Text>
          <Text style={styles.statLabel}>Tithes Paid</Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <Button 
          title="Add Income" 
          onPress={() => navigation.navigate('AddIncome')} 
          color="#6D8C73"
        />
        <Button 
          title="Future Incomes" 
          onPress={() => navigation.navigate('FutureIncomeReminders')} 
          color="#7A9CB0"
        />
        <Button 
          title="Financial Analytics" 
          onPress={() => navigation.navigate('Analytics')} 
          color="#7A9CB0"
        />
        <Button 
          title="Giving Goals" 
          onPress={() => navigation.navigate('Goals')} 
          color="#7A9CB0"
        />
        <Button 
          title="Enhanced Reminders" 
          onPress={() => navigation.navigate('EnhancedReminders')} 
          color="#7A9CB0"
        />
        <Button 
          title="Tithe Status" 
          onPress={() => navigation.navigate('Status')} 
          color="#B09A7A"
        />
        <Button 
          title="Export Data" 
          onPress={exportData} 
          color="#6D8C73"
        />
        <Button 
          title="Clear All Data" 
          onPress={clearAllData} 
          color="#A87A7A"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F8F9FA',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'center',
    marginVertical: 20,
    color: '#343A40',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    margin: 5,
    minWidth: 100,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#343A40',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#6C757D',
    textAlign: 'center',
  },
  buttonContainer: {
    gap: 12,
  },
});