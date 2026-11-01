// AI-assisted: see docs/AI_LOG.md #4
import React from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView } from 'react-native';

const PersonalDataTab = ({ formData, setFormData, errors }) => {
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Datos Personales</Text>

      <Text style={styles.label}>Nombre completo</Text>
      <TextInput
        style={[styles.input, errors.fullName && styles.inputError]}
        placeholder="Ej. Robert De Jesús Julio González"
        value={formData.fullName}
        onChangeText={(val) => handleChange('fullName', val)}
        maxLength={50}
      />
      {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}

      <Text style={styles.label}>Documento de identidad</Text>
      <TextInput
        style={[styles.input, errors.idNumber && styles.inputError]}
        placeholder="Ej. 1063189230"
        keyboardType="numeric"
        value={formData.idNumber}
        onChangeText={(val) => handleChange('idNumber', val)}
        maxLength={10}
      />
      {errors.idNumber && <Text style={styles.errorText}>{errors.idNumber}</Text>}

      <Text style={styles.label}>Número de celular</Text>
      <TextInput
        style={[styles.input, errors.phone && styles.inputError]}
        placeholder="Ej. 3054551420"
        keyboardType="phone-pad"
        value={formData.phone}
        onChangeText={(val) => handleChange('phone', val)}
        maxLength={10}
      />
      {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

      <Text style={styles.label}>Correo electrónico</Text>
      <TextInput
        style={[styles.input, errors.email && styles.inputError]}
        placeholder="correo@ejemplo.com"
        keyboardType="email-address"
        autoCapitalize="none"
        value={formData.email}
        onChangeText={(val) => handleChange('email', val)}
      />
      {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FAF9F6'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1A1A1A'
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginTop: 10,
    marginBottom: 4
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    backgroundColor: '#FFFFFF'
  },
  inputError: {
    borderColor: '#D32F2F'
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 12,
    marginTop: 3
  }
});

export default PersonalDataTab;