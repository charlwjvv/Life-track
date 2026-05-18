import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { theme } from './src/theme';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import BudgetScreen from './src/screens/BudgetScreen';
import GoalsScreen from './src/screens/GoalsScreen';
import CaloriesScreen from './src/screens/CaloriesScreen';
import RunningScreen from './src/screens/RunningScreen';
import CoachScreen from './src/screens/CoachScreen';
import StravaConnectScreen from './src/screens/StravaConnectScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: theme.background, borderTopColor: theme.border, borderTopWidth: 1 },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ tabBarIcon: ({ color }) => <Ionicons name="grid-outline" size={22} color={color} /> }}
      />
      <Tab.Screen
        name="Budget"
        component={BudgetScreen}
        options={{ tabBarIcon: ({ color }) => <Ionicons name="wallet-outline" size={22} color={color} /> }}
      />
      <Tab.Screen
        name="Running"
        component={RunningScreen}
        options={{ tabBarIcon: ({ color }) => <Ionicons name="walk-outline" size={22} color={color} /> }}
      />
      <Tab.Screen
        name="Calories"
        component={CaloriesScreen}
        options={{ tabBarIcon: ({ color }) => <Ionicons name="flame-outline" size={22} color={color} /> }}
      />
      <Tab.Screen
        name="Coach"
        component={CoachScreen}
        options={{ tabBarIcon: ({ color }) => <Ionicons name="fitness-outline" size={22} color={color} /> }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer
      theme={{
        dark: true,
        colors: {
          primary: theme.primary,
          background: theme.background,
          card: theme.card,
          text: theme.text,
          border: theme.border,
          notification: theme.primary,
        },
        fonts: { regular: { fontFamily: 'System', fontWeight: '400' }, medium: { fontFamily: 'System', fontWeight: '500' }, bold: { fontFamily: 'System', fontWeight: '700' }, heavy: { fontFamily: 'System', fontWeight: '900' } },
      }}
    >
      <StatusBar style="light" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen name="Goals" component={GoalsScreen} />
        <Stack.Screen name="StravaConnect" component={StravaConnectScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
