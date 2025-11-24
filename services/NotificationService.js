import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

class NotificationService {
  async requestPermissions() {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  }

  async showImmediateNotification(title, body, playSound = true) {
    try {
      // Get reminder settings
      const settingsStr = await AsyncStorage.getItem('reminderSettings');
      const settings = settingsStr ? JSON.parse(settingsStr) : {
        pushEnabled: true,
        soundEnabled: true
      };

      // Don't show if push notifications are disabled
      if (!settings.pushEnabled) {
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: title,
          body: body,
          sound: playSound && settings.soundEnabled ? 'default' : null,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null, // Immediate notification
      });

      return notificationId;
    } catch (error) {
      console.log('Error showing immediate notification:', error);
      return null;
    }
  }

  async showActionConfirmation(title, body, playSound = true) {
    // For action confirmations, we'll always show them regardless of settings
    try {
      const settingsStr = await AsyncStorage.getItem('reminderSettings');
      const settings = settingsStr ? JSON.parse(settingsStr) : {
        soundEnabled: true
      };

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: title,
          body: body,
          sound: playSound && settings.soundEnabled ? 'default' : null,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null, // Immediate notification
      });

      return notificationId;
    } catch (error) {
      console.log('Error showing action confirmation:', error);
      return null;
    }
  }

  async scheduleReminderNotification(title, body, triggerDate) {
    try {
      // Get reminder settings
      const settingsStr = await AsyncStorage.getItem('reminderSettings');
      const settings = settingsStr ? JSON.parse(settingsStr) : {
        pushEnabled: false,
        soundEnabled: true
      };

      // Don't schedule if push notifications are disabled
      if (!settings.pushEnabled) {
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: title,
          body: body,
          sound: settings.soundEnabled ? 'default' : null,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: triggerDate, // This should be a Date object or seconds from now
      });

      return notificationId;
    } catch (error) {
      console.log('Error scheduling notification:', error);
      return null;
    }
  }

  async cancelNotification(notificationId) {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      return true;
    } catch (error) {
      console.log('Error canceling notification:', error);
      return false;
    }
  }

  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      return true;
    } catch (error) {
      console.log('Error canceling all notifications:', error);
      return false;
    }
  }

  async scheduleRecurringReminders() {
    try {
      // Get reminder settings
      const settingsStr = await AsyncStorage.getItem('reminderSettings');
      const settings = settingsStr ? JSON.parse(settingsStr) : {
        recurring: true,
        daysBefore: 3,
        time: '09:00'
      };

      // Don't schedule if recurring is disabled
      if (!settings.recurring) {
        return;
      }

      // Get pending tithes
      const incomesStr = await AsyncStorage.getItem('incomes');
      const incomes = incomesStr ? JSON.parse(incomesStr) : [];
      const pendingTithes = incomes.filter(income => income.status === 'pending');

      // Schedule reminders for each pending tithe
      for (const tithe of pendingTithes) {
        const titheDate = new Date(tithe.date);
        const reminderDate = new Date(titheDate);
        reminderDate.setDate(reminderDate.getDate() - settings.daysBefore);
        
        // Set the time of day for the reminder
        const [hours, minutes] = settings.time.split(':').map(Number);
        reminderDate.setHours(hours, minutes, 0, 0);

        // Only schedule if the reminder date is in the future
        if (reminderDate > new Date()) {
          const title = 'Tithe Reminder';
          const body = `Don't forget to submit your tithe of ETB ${tithe.amount * 0.1} for income received on ${titheDate.toLocaleDateString()}`;
          
          await this.scheduleReminderNotification(title, body, reminderDate);
        }
      }
    } catch (error) {
      console.log('Error scheduling recurring reminders:', error);
    }
  }

  async scheduleDailyReminder() {
    try {
      // Get reminder settings
      const settingsStr = await AsyncStorage.getItem('reminderSettings');
      const settings = settingsStr ? JSON.parse(settingsStr) : {
        pushEnabled: false,
        time: '09:00'
      };

      // Don't schedule if push notifications are disabled
      if (!settings.pushEnabled) {
        return;
      }

      // Schedule daily reminder for tomorrow at the specified time
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const [hours, minutes] = settings.time.split(':').map(Number);
      tomorrow.setHours(hours, minutes, 0, 0);

      const title = 'Daily Tithe Check';
      const body = 'Check your tithe status and add any new income received today';

      await this.scheduleReminderNotification(title, body, tomorrow);
    } catch (error) {
      console.log('Error scheduling daily reminder:', error);
    }
  }
}

export default new NotificationService();