import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { initApiConfig } from './src/services/api';
import { COLORS } from './src/theme';
import { LanguageProvider } from './src/context/LanguageContext';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import ScanStockScreen from './src/screens/ScanStockScreen';
import VoiceAssistantScreen from './src/screens/VoiceAssistantScreen';
import BillingScreen from './src/screens/BillingScreen';
import KhataScreen from './src/screens/KhataScreen';
import ProductsScreen from './src/screens/ProductsScreen';
import AlertsScreen from './src/screens/AlertsScreen';
import LoginScreen from './src/screens/LoginScreen';
import PurchasesScreen from './src/screens/PurchasesScreen';
import SuppliersScreen from './src/screens/SuppliersScreen';
import ReportsScreen from './src/screens/ReportsScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  useEffect(() => {
    initApiConfig();
  }, []);

  return (
    <LanguageProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: COLORS.primaryDark,
            },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ScanStock"
            component={ScanStockScreen}
            options={{ title: '📷 AI Scan Stock' }}
          />
          <Stack.Screen
            name="VoiceAssistant"
            component={VoiceAssistantScreen}
            options={{ title: '🎤 Swaranidhi Voice AI' }}
          />
          <Stack.Screen
            name="Billing"
            component={BillingScreen}
            options={{ title: '🛒 POS Billing' }}
          />
          <Stack.Screen
            name="Khata"
            component={KhataScreen}
            options={{ title: '👤 Customer Khata Ledger' }}
          />
          <Stack.Screen
            name="Products"
            component={ProductsScreen}
            options={{ title: '📦 Products & Stock' }}
          />
          <Stack.Screen
            name="Alerts"
            component={AlertsScreen}
            options={{ title: '🔔 Smart Inventory Alerts' }}
          />
          <Stack.Screen
            name="Purchases"
            component={PurchasesScreen}
            options={{ title: '📥 Inward Stock & Purchases' }}
          />
          <Stack.Screen
            name="Suppliers"
            component={SuppliersScreen}
            options={{ title: '🏭 Wholesale Suppliers' }}
          />
          <Stack.Screen
            name="Reports"
            component={ReportsScreen}
            options={{ title: '📊 Business Reports' }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ title: '⚙️ Settings & 23 Languages' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </LanguageProvider>
  );
}
