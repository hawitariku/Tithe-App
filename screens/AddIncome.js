import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NotificationService from '../services/NotificationService';
import { Calendar } from 'react-native-calendars';

export default function AddIncome({ navigation }) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // Today's date by default
  const [showCalendar, setShowCalendar] = useState(false);

  const saveIncome = async () => {
    // Validate input
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      Alert.alert("Error", "Please enter a valid positive amount");
      return;
    }

    let incomes = await AsyncStorage.getItem("incomes");
    incomes = incomes ? JSON.parse(incomes) : [];

    // Add new income record
    const newIncome = {
      id: Date.now(), // Unique ID for each record
      amount: parseFloat(amount),
      description: description || "No description",
      date: new Date(selectedDate).toISOString(), // Use selected date
      status: "pending",
    };

    incomes.push(newIncome);
    await AsyncStorage.setItem("incomes", JSON.stringify(incomes));
    
    // Show immediate confirmation notification
    const titheAmount = (parseFloat(amount) * 0.1).toFixed(2);
    await NotificationService.showActionConfirmation(
      "Income Added",
      `ETB ${parseFloat(amount).toFixed(2)} added for ${formatDate(selectedDate)}. Tithe: ETB ${titheAmount}`
    );
    
    // Schedule reminder for this future income if it's in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const incomeDate = new Date(selectedDate);
    incomeDate.setHours(0, 0, 0, 0);
    
    if (incomeDate > today) {
      await scheduleFutureIncomeReminder(newIncome);
    }
    
    // Show success message and reset form
    Alert.alert(
      "Success", 
      `Income of ETB ${parseFloat(amount).toFixed(2)} scheduled for ${formatDate(selectedDate)}!`,
      [
        {
          text: "Add Another",
          onPress: () => {
            setAmount("");
            setDescription("");
            setSelectedDate(new Date().toISOString().split('T')[0]);
          }
        },
        {
          text: "View Dashboard",
          onPress: () => navigation.navigate('Dashboard')
        }
      ]
    );
  };

  const scheduleFutureIncomeReminder = async (income) => {
    try {
      // Get reminder settings
      const settingsStr = await AsyncStorage.getItem('reminderSettings');
      const settings = settingsStr ? JSON.parse(settingsStr) : {
        pushEnabled: false,
        recurring: true,
        daysBefore: 1 // Default to 1 day before
      };

      // Check if we should schedule a reminder
      if (settings.pushEnabled && settings.recurring) {
        const incomeDate = new Date(income.date);
        const reminderDate = new Date(incomeDate);
        reminderDate.setDate(reminderDate.getDate() - settings.daysBefore);
        
        // Set the time of day for the reminder
        const [hours, minutes] = settings.time ? settings.time.split(':').map(Number) : [9, 0];
        reminderDate.setHours(hours, minutes, 0, 0);

        // Only schedule if the reminder date is in the future
        if (reminderDate > new Date()) {
          const title = 'Future Income Reminder';
          const body = `Don't forget to add your income of ETB ${income.amount} scheduled for today: ${income.description || 'No description'}`;
          
          await NotificationService.scheduleReminderNotification(title, body, reminderDate);
          
          // Show confirmation that reminder was scheduled
          await NotificationService.showActionConfirmation(
            "Reminder Scheduled",
            `Reminder set for ${incomeDate.toLocaleDateString()} income`
          );
        }
      }
    } catch (error) {
      console.log('Error scheduling future income reminder:', error);
    }
  };

  const calculateTithe = () => {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      return "0.00";
    }
    return (parseFloat(amount) * 0.1).toFixed(2);
  };

  const onDayPress = (day) => {
    setSelectedDate(day.dateString);
    setShowCalendar(false);
  };

  const toggleCalendar = () => {
    setShowCalendar(!showCalendar);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Add Income</Text>
      
      <View style={styles.formContainer}>
        <Text style={styles.label}>Income Amount (ETB)</Text>
        <TextInput
          placeholder="Enter amount"
          style={styles.input}
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
        
        <Text style={styles.label}>Description (Optional)</Text>
        <TextInput
          placeholder="e.g., Salary, Business, Gift"
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
        />
        
        <Text style={styles.label}>Income Date</Text>
        <TouchableOpacity style={styles.dateButton} onPress={toggleCalendar}>
          <Text style={styles.dateButtonText}>{formatDate(selectedDate)}</Text>
        </TouchableOpacity>
        
        {showCalendar && (
          <View style={styles.calendarContainer}>
            <Calendar
              onDayPress={onDayPress}
              markedDates={{
                [selectedDate]: {
                  selected: true,
                  selectedColor: '#6D8C73',
                }
              }}
              theme={{
                selectedDayBackgroundColor: '#6D8C73',
                todayTextColor: '#6D8C73',
                arrowColor: '#6D8C73',
              }}
            />
          </View>
        )}
        
        <View style={styles.titheContainer}>
          <Text style={styles.titheText}>Tithe (10%):</Text>
          <Text style={styles.titheAmount}>ETB {calculateTithe()}</Text>
        </View>
        
        <Button 
          title="Save Income" 
          onPress={saveIncome} 
          color="#6D8C73"
        />
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
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
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
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
    color: '#495057',
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#CED4DA',
    padding: 14,
    marginBottom: 20,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#343A40',
  },
  calendarContainer: {
    marginBottom: 20,
    borderRadius: 8,
    overflow: 'hidden',
  },
  titheContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F1F5F2',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#D9E2DC',
  },
  titheText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#343A40',
  },
  titheAmount: {
    fontSize: 20,
    fontWeight: '600',
    color: '#343A40',
  },
});