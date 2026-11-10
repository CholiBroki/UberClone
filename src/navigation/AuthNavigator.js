// AI-assisted: see docs/AI_LOG.md #17
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

const Stack = createNativeStackNavigator();

function LoginRoute({ navigation }) {
  return <LoginScreen onNavigateRegister={() => navigation.navigate('Register')} />;
}

function RegisterRoute({ navigation }) {
  return <RegisterScreen onBack={() => navigation.goBack()} />;
}

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginRoute} />
      <Stack.Screen name="Register" component={RegisterRoute} />
    </Stack.Navigator>
  );
}