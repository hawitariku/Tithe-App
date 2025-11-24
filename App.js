import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AppInitializer from './services/AppInitializer';

import Dashboard from './screens/Dashboard';
import AddIncome from './screens/AddIncome';
import Status from './screens/Status';
import Analytics from './screens/Analytics';
import Goals from './screens/Goals';
import EnhancedReminders from './screens/EnhancedReminders';
import FutureIncomeReminders from './screens/FutureIncomeReminders';

const Stack = createNativeStackNavigator();

export default function App() {
  useEffect(() => {
    // Initialize the app when it starts
    AppInitializer.initialize();
  }, []);

  // Trigger build comment added on 2025-11-24
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Dashboard"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#6D8C73',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      >
        <Stack.Screen 
          name="Dashboard" 
          component={Dashboard} 
          options={{ 
            title: 'Tithe Tracker',
            headerTitleAlign: 'center',
          }} 
        />
        <Stack.Screen 
          name="AddIncome" 
          component={AddIncome} 
          options={{ 
            title: 'Add Income',
            headerTitleAlign: 'center',
          }} 
        />
        <Stack.Screen 
          name="EnhancedReminders" 
          component={EnhancedReminders} 
          options={{ 
            title: 'Enhanced Reminders',
            headerTitleAlign: 'center',
          }} 
        />
        <Stack.Screen 
          name="FutureIncomeReminders" 
          component={FutureIncomeReminders} 
          options={{ 
            title: 'Future Incomes',
            headerTitleAlign: 'center',
          }} 
        />
        <Stack.Screen 
          name="Status" 
          component={Status} 
          options={{ 
            title: 'Tithe Status',
            headerTitleAlign: 'center',
          }} 
        />
        <Stack.Screen 
          name="Analytics" 
          component={Analytics} 
          options={{ 
            title: 'Analytics',
            headerTitleAlign: 'center',
          }} 
        />
        <Stack.Screen 
          name="Goals" 
          component={Goals} 
          options={{ 
            title: 'Giving Goals',
            headerTitleAlign: 'center',
          }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}