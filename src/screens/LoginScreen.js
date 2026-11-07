// AI-assisted: see docs/AI_LOG.md #13
import React from 'react';
import {View,Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, Alert,} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen({ onLogin, onNavigateRegister }) {
  // Manejador temporal para Iniciar Sesion (no navega a ninguna pantalla por ahora)
  const handleLoginPress = () => {
    if (onLogin) {
      onLogin();
    } else {
      Alert.alert(
        'Próximamente',
        'El inicio de sesión se habilitará en la siguiente fase.',
        [{ text: 'Entendido' }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Sección Superior: Icono con Carrito y Tipografía Stylized */}
      <View style={styles.headerContainer}>
        <View style={styles.iconCircle}>
          <Ionicons name="car" size={48} color="#FFFFFF" />
        </View>

        <Text style={styles.brandTitle}>UberClone</Text>

        <Text style={styles.mainHeading}>
          Conduce, genera ingresos{"\n"}y llega <Text style={styles.blueAccent}>más lejos</Text>
        </Text>

        <Text style={styles.subHeading}>
          Únete a nuestra plataforma y sé parte de una comunidad de conductores.
        </Text>
      </View>

      {/* Sección Inferior: Botones de Acción */}
      <View style={styles.buttonContainer}>
        {/* Botón Iniciar sesión (sin navegación por ahora) */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleLoginPress}
          activeOpacity={0.85}
        >
          <View style={styles.leftBtnGroup}>
            <Ionicons name="person" size={20} color="#FFFFFF" />
            <View style={styles.verticalDividerPrimary} />
            <Text style={styles.primaryButtonText}>Iniciar sesión</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Botón Registrarse (Redirige a las pestañas de registro) */}
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={onNavigateRegister}
          activeOpacity={0.85}
        >
          <View style={styles.leftBtnGroup}>
            <Ionicons name="person-add" size={20} color="#0052CC" />
            <View style={styles.verticalDividerSecondary} />
            <Text style={styles.secondaryButtonText}>Registrarse</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#0052CC" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingTop: 50,
    paddingBottom: 36,
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 30,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#0052CC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#0052CC',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  brandTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: '#0052CC',
    marginBottom: 24,
    letterSpacing: -0.5,
  },
  mainHeading: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    color: '#091E42',
    lineHeight: 36,
    marginBottom: 14,
    letterSpacing: -0.3,
  },
  blueAccent: {
    color: '#0052CC',
    fontWeight: '800',
  },
  subHeading: {
    fontSize: 15,
    fontWeight: '400',
    color: '#6B778C',
    textAlign: 'center',
    paddingHorizontal: 10,
    lineHeight: 23,
    letterSpacing: 0.1,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
    marginBottom: 10,
  },
  primaryButton: {
    backgroundColor: '#0052CC',
    borderRadius: 30,
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    shadowColor: '#0052CC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.8,
    borderColor: '#0052CC',
    borderRadius: 30,
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
  },
  leftBtnGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verticalDividerPrimary: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginHorizontal: 14,
  },
  verticalDividerSecondary: {
    width: 1,
    height: 20,
    backgroundColor: '#DFE1E6',
    marginHorizontal: 14,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  secondaryButtonText: {
    color: '#0052CC',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});