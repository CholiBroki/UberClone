// AI-assisted: see docs/AI_LOG.md #4
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

const PersonalDataTab = ({ formData, setFormData, errors, touched }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      handleChange('birthDate', formattedDate);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Datos Personales</Text>

      <Text style={styles.label}>Nombre completo</Text>
      <TextInput
        style={[styles.input, touched.fullName && errors.fullName && styles.inputError]}
        placeholder="Ej. Robert De Jesús Julio González"
        value={formData.fullName}
        onChangeText={(val) => handleChange('fullName', val)}
        maxLength={50}
      />
      {touched.fullName && errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}

      <Text style={styles.label}>Documento de identidad</Text>
      <TextInput
        style={[styles.input, touched.idNumber && errors.idNumber && styles.inputError]}
        placeholder="Ej. 1063189230"
        keyboardType="numeric"
        value={formData.idNumber}
        onChangeText={(val) => handleChange('idNumber', val)}
        maxLength={10}
      />
      {touched.idNumber && errors.idNumber && <Text style={styles.errorText}>{errors.idNumber}</Text>}

      <Text style={styles.label}>Número de celular</Text>
      <TextInput
        style={[styles.input, touched.phone && errors.phone && styles.inputError]}
        placeholder="Ej. 3054551420"
        keyboardType="phone-pad"
        value={formData.phone}
        onChangeText={(val) => handleChange('phone', val)}
        maxLength={10}
      />
      {touched.phone && errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

      <Text style={styles.label}>Correo electrónico</Text>
      <TextInput
        style={[styles.input, touched.email && errors.email && styles.inputError]}
        placeholder="correo@ejemplo.com"
        keyboardType="email-address"
        autoCapitalize="none"
        value={formData.email}
        onChangeText={(val) => handleChange('email', val)}
      />
      {touched.email && errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

      {/* Selector de Fecha Nativo */}
      <Text style={styles.label}>Fecha de nacimiento</Text>
      <TouchableOpacity 
        onPress={() => setShowDatePicker(true)}
        style={[styles.input, touched.birthDate && errors.birthDate && styles.inputError]}
      >
        <Text style={{ color: formData.birthDate ? '#1A1A1A' : '#A0A0A0' }}>
          {formData.birthDate ? formData.birthDate : 'Seleccionar fecha...'}
        </Text>
      </TouchableOpacity>
      {touched.birthDate && errors.birthDate && <Text style={styles.errorText}>{errors.birthDate}</Text>}

      {showDatePicker && (
        <DateTimePicker
          value={formData.birthDate ? new Date(formData.birthDate) : new Date(2000, 0, 1)}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}

      {/* Lista Desplegable: Género */}
      <Text style={styles.label}>Género</Text>
      <View style={[styles.pickerContainer, touched.gender && errors.gender && styles.inputError]}>
        <Picker
          selectedValue={formData.gender}
          onValueChange={(itemValue) => handleChange('gender', itemValue)}
        >
          <Picker.Item label="Seleccionar género..." value="" />
          <Picker.Item label="Masculino" value="Masculino" />
          <Picker.Item label="Femenino" value="Femenino" />
          <Picker.Item label="Otro" value="Otro" />
        </Picker>
      </View>
      {touched.gender && errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}

      {/* Lista Desplegable: Idioma */}
      <Text style={styles.label}>Idioma de la App</Text>
      <View style={[styles.pickerContainer, touched.language && errors.language && styles.inputError]}>
        <Picker
          selectedValue={formData.language}
          onValueChange={(itemValue) => handleChange('language', itemValue)}
        >
          <Picker.Item label="Español" value="Español" />
          <Picker.Item label="Inglés" value="Inglés" />
        </Picker>
      </View>
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
    backgroundColor: '#FFFFFF',
    justifyContent: 'center'
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center'
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