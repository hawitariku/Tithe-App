import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import NotificationService from '../services/NotificationService';

export default function Status({ navigation }) {
  const [incomes, setIncomes] = useState([]);
  const [filter, setFilter] = useState('all'); // all, pending, done

  useEffect(() => {
    load();
  }, [filter]);

  const load = async () => {
    let data = await AsyncStorage.getItem("incomes");
    let parsedData = data ? JSON.parse(data) : [];
    
    // Apply filter
    if (filter === 'pending') {
      parsedData = parsedData.filter(item => item.status === 'pending');
    } else if (filter === 'done') {
      parsedData = parsedData.filter(item => item.status === 'done');
    }
    
    // Sort by date (newest first)
    parsedData.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    setIncomes(parsedData);
  };

  const markDone = async (id) => {
    let updatedIncomes = incomes.map(item => {
      if (item.id === id) {
        return { ...item, status: "done" };
      }
      return item;
    });
    
    await AsyncStorage.setItem("incomes", JSON.stringify(updatedIncomes));
    
    // Cancel any scheduled notifications for this tithe
    await cancelTitheNotification(id);
    
    // Show confirmation notification
    const income = incomes.find(item => item.id === id);
    if (income) {
      await NotificationService.showActionConfirmation(
        "Tithe Marked as Done",
        `ETB ${(income.amount * 0.1).toFixed(2)} tithe marked as completed`
      );
    }
    
    load();
    
    Alert.alert("Success", "Tithe marked as done!");
  };

  const cancelTitheNotification = async (incomeId) => {
    try {
      // In a real implementation, you would store notification IDs with income records
      // and cancel specific notifications. For now, we'll cancel all and reschedule.
      await Notifications.cancelAllScheduledNotificationsAsync();
      
      // Reschedule reminders for remaining pending tithes
      const settingsStr = await AsyncStorage.getItem('reminderSettings');
      const settings = settingsStr ? JSON.parse(settingsStr) : {
        pushEnabled: false,
        recurring: true
      };
      
      if (settings.pushEnabled && settings.recurring) {
        // This would be implemented in a more robust way in a real app
        console.log('Would reschedule notifications for remaining pending tithes');
      }
    } catch (error) {
      console.log('Error canceling tithe notification:', error);
    }
  };

  const deleteIncome = async (id) => {
    Alert.alert(
      "Delete Income",
      "Are you sure you want to delete this income record?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            let updatedIncomes = incomes.filter(item => item.id !== id);
            await AsyncStorage.setItem("incomes", JSON.stringify(updatedIncomes));
            
            // Cancel any scheduled notifications for this tithe
            await cancelTitheNotification(id);
            
            // Show confirmation notification
            await NotificationService.showActionConfirmation(
              "Income Deleted",
              "Income record has been removed"
            );
            
            load();
            Alert.alert("Success", "Income record deleted!");
          }
        }
      ]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getFilteredIncomes = () => {
    if (filter === 'pending') {
      return incomes.filter(item => item.status === 'pending');
    } else if (filter === 'done') {
      return incomes.filter(item => item.status === 'done');
    }
    return incomes;
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Tithe Submission Status</Text>
      
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'all' && styles.activeFilter]} 
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'pending' && styles.activeFilter]} 
          onPress={() => setFilter('pending')}
        >
          <Text style={[styles.filterText, filter === 'pending' && styles.activeFilterText]}>Pending</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'done' && styles.activeFilter]} 
          onPress={() => setFilter('done')}
        >
          <Text style={[styles.filterText, filter === 'done' && styles.activeFilterText]}>Done</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.summaryText}>
        Showing {getFilteredIncomes().length} of {incomes.length} records
      </Text>

      {getFilteredIncomes().map((item) => (
        <View key={item.id} style={styles.itemContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.amount}>ETB {item.amount.toFixed(2)}</Text>
            <Text style={[styles.status, item.status === 'done' ? styles.done : styles.pending]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
          
          <Text style={styles.description}>{item.description}</Text>
          <Text style={styles.date}>Added: {formatDate(item.date)}</Text>
          
          <View style={styles.buttonRow}>
            {item.status === "pending" && (
              <Button 
                title="Mark as Done" 
                onPress={() => markDone(item.id)} 
                color="#6D8C73"
              />
            )}
            <Button 
              title="Delete" 
              onPress={() => deleteIncome(item.id)} 
              color="#A87A7A"
            />
          </View>
        </View>
      ))}
      
      {getFilteredIncomes().length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {filter === 'all' 
              ? "No income records found. Add your first income!" 
              : `No ${filter} records found.`}
          </Text>
        </View>
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
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 5,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeFilter: {
    backgroundColor: '#6D8C73',
  },
  filterText: {
    fontSize: 16,
    color: '#495057',
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  summaryText: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 15,
    textAlign: 'center',
  },
  itemContainer: {
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  amount: {
    fontSize: 20,
    fontWeight: '600',
    color: '#343A40',
  },
  status: {
    fontSize: 12,
    fontWeight: '600',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    overflow: 'hidden',
  },
  pending: {
    backgroundColor: '#FFF3CD',
    color: '#856404',
  },
  done: {
    backgroundColor: '#D4EDDA',
    color: '#155724',
  },
  description: {
    fontSize: 16,
    color: '#495057',
    marginBottom: 5,
  },
  date: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 15,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  emptyText: {
    fontSize: 16,
    color: '#6C757D',
    textAlign: 'center',
  },
});