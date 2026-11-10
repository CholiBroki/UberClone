// AI-assisted: see docs/AI_LOG.md #17
import React from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { PreferencesProvider, usePreferences } from './src/context/PreferencesContext';
import AuthNavigator from './src/navigation/AuthNavigator';
import AppDrawer from './src/navigation/AppDrawer';

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
  const { loaded } = usePreferences();

  // Esperar sesión y preferencias antes de decidir qué navegador mostrar
  if (loading || !loaded) return <Splash message="Cargando..." />;

  return (
    <NavigationContainer>
      {user && driver ? (
        <AppDrawer />
      ) : user && !driver ? (
        <Splash message="Preparando tu perfil..." onLogout={logout} />
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PreferencesProvider>
        <AuthProvider>
          <Root />
        </AuthProvider>
      </PreferencesProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', gap: 14 },
  msg: { fontSize: 15, color: '#475569' },
  link: { fontSize: 15, color: '#0052CC', fontWeight: '700', marginTop: 8 },
});