// AI-assisted: see docs/AI_LOG.md #16
import React, { useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';

function Splash({ message, onLogout }) {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#0052CC" />
      <Text style={styles.msg}>{message}</Text>
      {onLogout && (
        <TouchableOpacity onPress={onLogout}>
          <Text style={styles.link}>Cerrar sesión</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function Root() {
  const { user, driver, loading, logout } = useAuth();
  const [screen, setScreen] = useState('login');

  if (loading) return <Splash message="Cargando..." />;

  if (user && driver) {
    // Temporal: el botón de menú cierra sesión. En el paso de navegación
    // pasará a abrir el Drawer.
    const confirmLogout = () =>
      Alert.alert('Cerrar sesión', '¿Quieres salir de tu cuenta?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Salir', style: 'destructive', onPress: logout },
      ]);

    return <HomeScreen driverStatus={driver.status} onOpenProfile={confirmLogout} />;
  }

  if (user && !driver) {
    return <Splash message="Preparando tu perfil..." onLogout={logout} />;
  }

  if (screen === 'register') {
    return <RegisterScreen onBack={() => setScreen('login')} />;
  }

  return <LoginScreen onNavigateRegister={() => setScreen('register')} />;
}

export default function App() {
  return (
    <AuthProvider>
      <Root />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', gap: 14 },
  msg: { fontSize: 15, color: '#475569' },
  link: { fontSize: 15, color: '#0052CC', fontWeight: '700', marginTop: 8 },
});