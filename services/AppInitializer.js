import AsyncStorage from '@react-native-async-storage/async-storage';
import NotificationService from './NotificationService';

class AppInitializer {
  async initialize() {
    try {
      // Request notification permissions
      await NotificationService.requestPermissions();
      
      // Schedule daily reminder
      await NotificationService.scheduleDailyReminder();
      
      // Schedule recurring reminders for pending tithes
      await NotificationService.scheduleRecurringReminders();
      
      console.log('App initialization completed');
    } catch (error) {
      console.log('Error during app initialization:', error);
    }
  }
  
  async handleAppForeground() {
    try {
      // When app comes to foreground, we might want to reschedule reminders
      // This ensures reminders are up to date
      await NotificationService.scheduleRecurringReminders();
      console.log('App foreground handling completed');
    } catch (error) {
      console.log('Error handling app foreground:', error);
    }
  }
  
  async handleAppBackground() {
    try {
      // Any cleanup needed when app goes to background
      console.log('App background handling completed');
    } catch (error) {
      console.log('Error handling app background:', error);
    }
  }
}

export default new AppInitializer();