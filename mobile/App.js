import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { Platform, Text, View } from 'react-native';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import PartnerScreen from './src/screens/PartnerScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import PrivacyScreen from './src/screens/PrivacyScreen';
import CapsuleScreen from './src/screens/CapsuleScreen';

// Context
import { AuthContext } from './src/context/AuthContext';
import { registerForPushNotificationsAsync } from './src/services/notifications';

// Register background task globally (Native only)
if (Platform.OS !== 'web') {
  try {
    require('./src/services/LocationTask');
  } catch (e) {
    console.error('Failed to load LocationTask:', e);
  }
}

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Main App Tabs
function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#8B5CF6',
        tabBarInactiveTintColor: '#9CA3AF',
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24, color }}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="Partner"
        component={PartnerScreen}
        options={{
          tabBarLabel: 'Partner',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24, color }}>💑</Text>,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24, color }}>⚙️</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    checkAuth();
  }, []);

  useEffect(() => {
    if (userToken) {
      registerForPushNotificationsAsync().catch(err => console.log('Push register failed', err));
    }
  }, [userToken]);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      setUserToken(token);
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const authContext = React.useMemo(
    () => ({
      signIn: async (token, user) => {
        try {
          await AsyncStorage.setItem('userToken', token);
          await AsyncStorage.setItem('user', JSON.stringify(user));
          setUserToken(token);
        } catch (error) {
          console.error('Sign in error:', error);
        }
      },
      signOut: async () => {
        try {
          await AsyncStorage.removeItem('userToken');
          await AsyncStorage.removeItem('user');
          setUserToken(null);
        } catch (error) {
          console.error('Sign out error:', error);
        }
      },
      signUp: async (token, user) => {
        try {
          await AsyncStorage.setItem('userToken', token);
          await AsyncStorage.setItem('user', JSON.stringify(user));
          setUserToken(token);
        } catch (error) {
          console.error('Sign up error:', error);
        }
      },
    }),
    []
  );

  if (isLoading) {
    // Return a simple loading screen instead of null to prevent white flash
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading Bubbles...</Text>
      </View>
    );
  }

  return (
    <AuthContext.Provider value={authContext}>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {userToken == null ? (
            // Auth Stack
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
            </>
          ) : (
            // App Stack
            <>
              <Stack.Screen name="App" component={AppTabs} />
              <Stack.Screen name="Privacy" component={PrivacyScreen} />
              <Stack.Screen name="Capsule" component={CapsuleScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
}
