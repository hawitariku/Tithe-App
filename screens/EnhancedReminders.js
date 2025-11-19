import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NotificationService from '../services/NotificationService';

export default function EnhancedReminders() {
  const [reminders, setReminders] = useState({
    pushEnabled: false,
    daysBefore: 3,
    recurring: true,
    time: '09:00',
    soundEnabled: true
  });

  useEffect(() => {
    loadReminderSettings();
  }, []);

  const loadReminderSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('reminderSettings');
      if (savedSettings) {
        setReminders(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.log('Error loading reminder settings:', error);
    }
  };

  const saveReminderSettings = async () => {
    try {
      await AsyncStorage.setItem('reminderSettings', JSON.stringify(reminders));
      
      // Show confirmation notification
      await NotificationService.showActionConfirmation(
        "Settings Updated",
        "Reminder settings have been saved successfully"
      );
      
      Alert.alert('Success', 'Reminder settings saved successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save reminder settings: ' + error.message);
    }
  };

  const togglePushNotifications = () => {
    setReminders(prev => ({
      ...prev,
      pushEnabled: !prev.pushEnabled
    }));
  };

  const toggleRecurring = () => {
    setReminders(prev => ({
      ...prev,
      recurring: !prev.recurring
    }));
  };

  const toggleSound = () => {
    setReminders(prev => ({
      ...prev,
      soundEnabled: !prev.soundEnabled
    }));
  };

  const updateDaysBefore = (days) => {
    setReminders(prev => ({
      ...prev,
      daysBefore: days
    }));
  };

  const updateTime = (time) => {
    setReminders(prev => ({
      ...prev,
      time: time
    }));
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Enhanced Reminders</Text>
      
      <View style={styles.card}>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Push Notifications</Text>
          <Switch
            trackColor={{ false: "#767577", true: "#6D8C73" }}
            thumbColor={reminders.pushEnabled ? "#f4f3f4" : "#f4f3f4"}
            onValueChange={togglePushNotifications}
            value={reminders.pushEnabled}
          />
        </View>
        <Text style={styles.description}>
          Receive push notifications for upcoming tithe due dates
        </Text>
      </View>
      
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Reminder Timing</Text>
        <Text style={styles.description}>
          Set how many days before tithe submission you want to be reminded
        </Text>
        
        <View style={styles.optionContainer}>
          {[1, 2, 3, 5, 7].map((days) => (
            <TouchableOpacity
              key={days}
              style={[
                styles.optionButton,
                reminders.daysBefore === days && styles.selectedOption
              ]}
              onPress={() => updateDaysBefore(days)}
            >
              <Text style={[
                styles.optionText,
                reminders.daysBefore === days && styles.selectedOptionText
              ]}>
                {days} {days === 1 ? 'Day' : 'Days'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Daily Reminder Time</Text>
        <Text style={styles.description}>
          Set the time of day you want to receive reminders
        </Text>
        
        <View style={styles.optionContainer}>
          {['08:00', '09:00', '10:00', '12:00', '18:00', '20:00'].map((time) => (
            <TouchableOpacity
              key={time}
              style={[
                styles.optionButton,
                reminders.time === time && styles.selectedOption
              ]}
              onPress={() => updateTime(time)}
            >
              <Text style={[
                styles.optionText,
                reminders.time === time && styles.selectedOptionText
              ]}>
                {time}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <View style={styles.card}>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Recurring Reminders</Text>
          <Switch
            trackColor={{ false: "#767577", true: "#6D8C73" }}
            thumbColor={reminders.recurring ? "#f4f3f4" : "#f4f3f4"}
            onValueChange={toggleRecurring}
            value={reminders.recurring}
          />
        </View>
        <Text style={styles.description}>
          Automatically schedule reminders for future tithes
        </Text>
      </View>
      
      <View style={styles.card}>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Sound Alerts</Text>
          <Switch
            trackColor={{ false: "#767577", true: "#6D8C73" }}
            thumbColor={reminders.soundEnabled ? "#f4f3f4" : "#f4f3f4"}
            onValueChange={toggleSound}
            value={reminders.soundEnabled}
          />
        </View>
        <Text style={styles.description}>
          Play sound when reminders are triggered
        </Text>
      </View>
      
      <TouchableOpacity style={styles.saveButton} onPress={saveReminderSettings}>
        <Text style={styles.saveButtonText}>Save Reminder Settings</Text>
      </TouchableOpacity>
      
      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>How It Works</Text>
        <Text style={styles.infoText}>
          • Push notifications will remind you {reminders.daysBefore} days before tithe submission
        </Text>
        <Text style={styles.infoText}>
          • Daily reminders will be sent at {reminders.time}
        </Text>
        <Text style={styles.infoText}>
          • {reminders.recurring ? 'Recurring' : 'One-time'} reminders for pending tithes
        </Text>
        <Text style={styles.infoText}>
          • {reminders.soundEnabled ? 'Sound alerts' : 'No sound'} will play with notifications
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
  card: {
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
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  settingLabel: {
    fontSize: 18,
    fontWeight: '500',
    color: '#343A40',
  },
  description: {
    fontSize: 14,
    color: '#6C757D',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#343A40',
  },
  optionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },
  optionButton: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#CED4DA',
  },
  selectedOption: {
    backgroundColor: '#6D8C73',
    borderColor: '#6D8C73',
  },
  optionText: {
    fontSize: 16,
    color: '#495057',
  },
  selectedOptionText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#6D8C73',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
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
    marginBottom: 8,
    lineHeight: 20,
  },
});