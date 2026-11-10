// AI-assisted: see docs/AI_LOG.md #13 #15 #16 #18
import React from 'react';
import { StyleSheet, SafeAreaView, StatusBar, KeyboardAvoidingView, Platform } from 'react-native';
import { RegistrationProvider } from '../context/RegistrationContext';
import RegisterTabs from '../navigation/RegisterTabs';

const RegisterScreen = ({ onBack }) => {
  return (
    <RegistrationProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0B2545" />
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        >
          <RegisterTabs onBack={onBack} />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </RegistrationProvider>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EEF4FB' },
});

export default RegisterScreen;