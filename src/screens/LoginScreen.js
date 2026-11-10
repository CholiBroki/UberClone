// AI-assisted: see docs/AI_LOG.md #16
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, KeyboardAvoidingView, ScrollView, ActivityIndicator, Platform,} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

const authErrorMessage = (code) => {
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Correo o contraseña incorrectos.';
    case 'auth/invalid-email':
      return 'El correo no tiene un formato válido.';
    case 'auth/too-many-requests':
      return 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.';
    case 'auth/network-request-failed':
      return 'Sin conexión. Revisa tu internet.';
    default:
      return 'No se pudo iniciar sesión. Inténtalo de nuevo.';
  }
};

export default function LoginScreen({ onNavigateRegister }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);

  const emailError = submitted && !EMAIL_REGEX.test(email.trim()) ? 'Ingresa un correo válido.' : '';
  const passwordError = submitted && !password ? 'Ingresa tu contraseña.' : '';

  const handleLogin = async () => {
    setSubmitted(true);
    setAuthError('');
    if (!EMAIL_REGEX.test(email.trim()) || !password) return;

    try {
      setLoading(true);
      await login(email, password);
      // Al iniciar sesión, App.js cambia de pantalla solo (onAuthStateChanged)
    } catch (error) {
      setAuthError(authErrorMessage(error.code));
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons name="car" size={44} color="#FFFFFF" />
            </View>
            <Text style={styles.brand}>UberClone</Text>
          </View>

          <Text style={styles.label}>Correo electrónico</Text>
          <TextInput
            style={[styles.input, emailError && styles.inputError]}
            placeholder="correo@ejemplo.com"
            placeholderTextColor="#A0A0A0"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
          />
          {!!emailError && <Text style={styles.error}>{emailError}</Text>}

          <Text style={styles.label}>Contraseña</Text>
          <View style={[styles.input, styles.passwordRow, passwordError && styles.inputError]}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Tu contraseña"
              placeholderTextColor="#A0A0A0"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color="#64748B" />
            </TouchableOpacity>
          </View>
          {!!passwordError && <Text style={styles.error}>{passwordError}</Text>}

          {!!authError && <Text style={[styles.error, styles.authError]}>{authError}</Text>}

          <TouchableOpacity style={styles.primaryButton} onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryText}>Iniciar sesión</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={onNavigateRegister} disabled={loading} activeOpacity={0.85}>
            <Text style={styles.secondaryText}>Registrarse como conductor</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scroll: { flexGrow: 1, paddingHorizontal: 28, paddingTop: 60, paddingBottom: 36 },
  header: { alignItems: 'center', marginBottom: 32 },
  iconCircle: {
    width: 88, height: 88, borderRadius: 44, backgroundColor: '#0052CC',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16, elevation: 8,
  },
  brand: { fontSize: 32, fontWeight: '800', color: '#0052CC', letterSpacing: -0.5 },
  sub: { fontSize: 15, color: '#64748B', marginTop: 6 },
  label: { fontSize: 13, fontWeight: '700', color: '#0A2540', marginTop: 14, marginBottom: 6 },
  input: {
    borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#0A2540', backgroundColor: '#F8FAFC',
  },
  inputError: { borderColor: '#EF4444' },
  passwordRow: { flexDirection: 'row', alignItems: 'center' },
  passwordInput: { flex: 1, fontSize: 15, color: '#0A2540', padding: 0 },
  error: { color: '#EF4444', fontSize: 12, marginTop: 4 },
  authError: { textAlign: 'center', marginTop: 14, fontSize: 13 },
  primaryButton: {
    backgroundColor: '#0052CC', borderRadius: 24, paddingVertical: 15,
    alignItems: 'center', marginTop: 24, elevation: 4,
  },
  primaryText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
  secondaryButton: {
    borderWidth: 1.5, borderColor: '#0052CC', borderRadius: 24,
    paddingVertical: 14, alignItems: 'center', marginTop: 12,
  },
  secondaryText: { color: '#0052CC', fontWeight: '700', fontSize: 15 },
});