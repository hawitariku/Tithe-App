import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

export default function FutureIncomeReminders({ navigation }) {
  const [futureIncomes, setFutureIncomes] = useState([]);

  useEffect(() => {
    loadFutureIncomes();
  }, []);

  const loadFutureIncomes = async () => {
    try {
      let incomes = await AsyncStorage.getItem("incomes");
      incomes = incomes ? JSON.parse(incomes) : [];
      
      // Filter for future incomes (dates after today)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const futureIncomesList = incomes.filter(income => {
        const incomeDate = new Date(income.date);
        incomeDate.setHours(0, 0, 0, 0);
        return incomeDate >= today;
      });
      
      // Sort by date (soonest first)
      futureIncomesList.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      setFutureIncomes(futureIncomesList);
    } catch (error) {
      console.log('Error loading future incomes:', error);
      Alert.alert('Error', 'Failed to load future incomes');
    }
  };

  const deleteFutureIncome = async (id) => {
    Alert.alert(
      'Delete Future Income',
      'Are you sure you want to delete this future income entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              let incomes = await AsyncStorage.getItem("incomes");
              incomes = incomes ? JSON.parse(incomes) : [];
              
              // Remove the income entry
              const updatedIncomes = incomes.filter(income => income.id !== id);
              await AsyncStorage.setItem("incomes", JSON.stringify(updatedIncomes));
              
              // Cancel any scheduled notifications for this income
              await cancelIncomeNotification(id);
              
              // Refresh the list
              loadFutureIncomes();
              
              Alert.alert('Success', 'Future income entry deleted');
            } catch (error) {
              console.log('Error deleting future income:', error);
              Alert.alert('Error', 'Failed to delete future income');
            }
          }
        }
      ]
    );
  };

  const cancelIncomeNotification = async (incomeId) => {
    try {
      // In a real implementation, you would store notification IDs with income records
      // and cancel specific notifications. For now, we'll cancel all and reschedule.
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('Cancelled notifications for income:', incomeId);
    } catch (error) {
      console.log('Error cancelling income notification:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Future Income Reminders</Text>
      
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>About Future Income Reminders</Text>
        <Text style={styles.infoText}>
          This feature helps you remember to log income you expect to receive in the future. 
          Set a date when you expect to receive income, and the app will remind you to add it.
        </Text>
      </View>
      
      {futureIncomes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No future incomes scheduled</Text>
          <Text style={styles.emptySubtext}>Add future income using the "Add Income" screen</Text>
        </View>
      ) : (
        futureIncomes.map((income) => (
          <View key={income.id} style={styles.incomeCard}>
            <View style={styles.incomeHeader}>
              <Text style={styles.incomeAmount}>ETB {income.amount.toFixed(2)}</Text>
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => deleteFutureIncome(income.id)}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.incomeDescription}>{income.description || 'No description'}</Text>
            
            <View style={styles.dateContainer}>
              <Text style={styles.dateLabel}>Scheduled for:</Text>
              <Text style={styles.dateValue}>{formatDate(income.date)}</Text>
            </View>
            
            <View style={styles.dateContainer}>
              <Text style={styles.dateLabel}>Added on:</Text>
              <Text style={styles.dateValue}>{formatDate(income.date)} at {formatTime(income.date)}</Text>
            </View>
          </View>
        ))
      )}
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
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#343A40',
  },
  infoText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#495057',
  },
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
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
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#6C757D',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#6C757D',
  },
  incomeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
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
  incomeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  incomeAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#343A40',
  },
  deleteButton: {
    backgroundColor: '#A87A7A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 14,
  },
  incomeDescription: {
    fontSize: 16,
    color: '#495057',
    marginBottom: 15,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  dateLabel: {
    fontSize: 14,
    color: '#6C757D',
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#343A40',
  },
});