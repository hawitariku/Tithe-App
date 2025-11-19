import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NotificationService from '../services/NotificationService';

export default function Goals() {
  const [monthlyGoal, setMonthlyGoal] = useState('');
  const [savedGoal, setSavedGoal] = useState(0);
  const [currentMonthIncome, setCurrentMonthIncome] = useState(0);
  const [progressPercentage, setProgressPercentage] = useState(0);

  useEffect(() => {
    loadGoalData();
  }, []);

  const loadGoalData = async () => {
    // Load saved goal
    const goal = await AsyncStorage.getItem('monthlyGoal');
    if (goal) {
      setSavedGoal(parseFloat(goal));
      setMonthlyGoal(goal);
    }
    
    // Calculate current month income
    let incomes = await AsyncStorage.getItem("incomes");
    incomes = incomes ? JSON.parse(incomes) : [];
    
    // Filter for current month
    const now = new Date();
    const currentMonthIncomes = incomes.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate.getMonth() === now.getMonth() && 
             itemDate.getFullYear() === now.getFullYear();
    });
    
    const monthTotal = currentMonthIncomes.reduce((sum, item) => sum + item.amount, 0);
    setCurrentMonthIncome(monthTotal);
    
    // Calculate progress
    if (goal) {
      const percentage = (monthTotal / parseFloat(goal)) * 100;
      setProgressPercentage(Math.min(percentage, 100));
    }
  };

  const saveGoal = async () => {
    if (!monthlyGoal || isNaN(monthlyGoal) || parseFloat(monthlyGoal) <= 0) {
      Alert.alert("Error", "Please enter a valid positive amount for your goal");
      return;
    }
    
    try {
      await AsyncStorage.setItem('monthlyGoal', monthlyGoal);
      setSavedGoal(parseFloat(monthlyGoal));
      
      // Show confirmation notification
      await NotificationService.showActionConfirmation(
        "Goal Updated",
        `Monthly goal set to ETB ${parseFloat(monthlyGoal).toFixed(2)}`
      );
      
      Alert.alert("Success", "Monthly goal saved successfully!");
      loadGoalData(); // Refresh data
    } catch (error) {
      Alert.alert("Error", "Failed to save goal: " + error.message);
    }
  };

  const clearGoal = async () => {
    Alert.alert(
      "Clear Goal",
      "Are you sure you want to clear your monthly goal?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('monthlyGoal');
              setMonthlyGoal('');
              setSavedGoal(0);
              setProgressPercentage(0);
              
              // Show confirmation notification
              await NotificationService.showActionConfirmation(
                "Goal Cleared",
                "Monthly goal has been removed"
              );
              
              Alert.alert("Success", "Monthly goal cleared!");
            } catch (error) {
              Alert.alert("Error", "Failed to clear goal: " + error.message);
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Monthly Giving Goals</Text>
      
      <View style={styles.goalContainer}>
        <Text style={styles.sectionTitle}>Set Your Monthly Goal</Text>
        <Text style={styles.description}>
          Set a monthly income goal to help you stay on track with your giving.
        </Text>
        
        <TextInput
          placeholder="Enter monthly income goal (ETB)"
          style={styles.input}
          keyboardType="numeric"
          value={monthlyGoal}
          onChangeText={setMonthlyGoal}
        />
        
        <View style={styles.buttonRow}>
          <Button 
            title="Save Goal" 
            onPress={saveGoal} 
            color="#6D8C73"
          />
          {savedGoal > 0 && (
            <Button 
              title="Clear Goal" 
              onPress={clearGoal} 
              color="#A87A7A"
            />
          )}
        </View>
      </View>
      
      {savedGoal > 0 && (
        <View style={styles.progressContainer}>
          <Text style={styles.sectionTitle}>Progress This Month</Text>
          
          <View style={styles.progressInfo}>
            <Text style={styles.progressText}>
              Current: ETB {currentMonthIncome.toFixed(2)}
            </Text>
            <Text style={styles.progressText}>
              Goal: ETB {savedGoal.toFixed(2)}
            </Text>
          </View>
          
          <View style={styles.progressBarBackground}>
            <View 
              style={[
                styles.progressBar, 
                { width: `${progressPercentage}%` }
              ]} 
            />
          </View>
          
          <Text style={styles.percentageText}>
            {progressPercentage.toFixed(1)}% of goal achieved
          </Text>
          
          {progressPercentage >= 100 && (
            <Text style={styles.achievementText}>
              🎉 Congratulations! You've reached your monthly goal!
            </Text>
          )}
        </View>
      )}
      
      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>About Goal Setting</Text>
        <Text style={styles.infoText}>
          Setting a monthly income goal can help you plan your finances and ensure 
          you're consistently setting aside funds for tithing. The app will track 
          your progress throughout the month.
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
  goalContainer: {
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
    marginBottom: 10,
    color: '#343A40',
  },
  description: {
    fontSize: 14,
    color: '#6C757D',
    lineHeight: 20,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CED4DA',
    padding: 14,
    marginBottom: 20,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    fontSize: 16,
    color: '#343A40',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressContainer: {
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
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  progressText: {
    fontSize: 16,
    color: '#495057',
    fontWeight: '500',
  },
  progressBarBackground: {
    height: 12,
    backgroundColor: '#E9ECEF',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#6D8C73',
    borderRadius: 6,
  },
  percentageText: {
    fontSize: 16,
    color: '#495057',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
  },
  achievementText: {
    fontSize: 16,
    color: '#6D8C73',
    fontWeight: '600',
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: '#F1F5F2',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#D9E2DC',
  },
  infoText: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
  },
});