// AI-assisted: see docs/AI_LOG.md #4
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Tarjeta Principal */}
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.iconBadge}>
            <Ionicons name="person" size={24} color="#0056D2" />
          </View>
          <Text style={styles.title}>Datos Personales</Text>
        </View>

        {/* Nombre */}
        <View style={styles.fieldGroup}>
          <View style={styles.labelRow}>
            <Ionicons name="person-outline" size={18} color="#0056D2" />
            <Text style={styles.label}>Nombre completo</Text>
          </View>
          <TextInput
            style={[styles.input, touched.fullName && errors.fullName && styles.inputError]}
            placeholder="Ej. Robert De Jesús Julio González"
            placeholderTextColor="#A0A0A0"
            value={formData.fullName}
            onChangeText={(val) => handleChange('fullName', val)}
            maxLength={50}
          />
          {touched.fullName && errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
        </View>

        {/* Documento */}
        <View style={styles.fieldGroup}>
          <View style={styles.labelRow}>
            <Ionicons name="card-outline" size={18} color="#0056D2" />
            <Text style={styles.label}>Documento de identidad</Text>
          </View>
          <TextInput
            style={[styles.input, touched.idNumber && errors.idNumber && styles.inputError]}
            placeholder="Ej. 1063189230"
            placeholderTextColor="#A0A0A0"
            keyboardType="numeric"
            value={formData.idNumber}
            onChangeText={(val) => handleChange('idNumber', val)}
            maxLength={10}
          />
          {touched.idNumber && errors.idNumber && <Text style={styles.errorText}>{errors.idNumber}</Text>}
        </View>

        {/* Celular */}
        <View style={styles.fieldGroup}>
          <View style={styles.labelRow}>
            <Ionicons name="call-outline" size={18} color="#0056D2" />
            <Text style={styles.label}>Número de celular</Text>
          </View>
          <TextInput
            style={[styles.input, touched.phone && errors.phone && styles.inputError]}
            placeholder="Ej. 3054551840"
            placeholderTextColor="#A0A0A0"
            keyboardType="phone-pad"
            value={formData.phone}
            onChangeText={(val) => handleChange('phone', val)}
            maxLength={10}
          />
          {touched.phone && errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
        </View>

        {/* Correo */}
        <View style={styles.fieldGroup}>
          <View style={styles.labelRow}>
            <Ionicons name="mail-outline" size={18} color="#0056D2" />
            <Text style={styles.label}>Correo electrónico</Text>
          </View>
          <TextInput
            style={[styles.input, touched.email && errors.email && styles.inputError]}
            placeholder="correo@ejemplo.com"
            placeholderTextColor="#A0A0A0"
            keyboardType="email-address"
            autoCapitalize="none"
            value={formData.email}
            onChangeText={(val) => handleChange('email', val)}
          />
          {touched.email && errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        </View>

        {/* Fecha de nacimiento */}
        <View style={styles.fieldGroup}>
          <View style={styles.labelRow}>
            <Ionicons name="calendar-outline" size={18} color="#0056D2" />
            <Text style={styles.label}>Fecha de nacimiento</Text>
          </View>
          <TouchableOpacity 
            onPress={() => setShowDatePicker(true)}
            style={[styles.input, styles.datePickerButton, touched.birthDate && errors.birthDate && styles.inputError]}
          >
            <Text style={{ color: formData.birthDate ? '#1A2B4C' : '#A0A0A0', fontSize: 15 }}>
              {formData.birthDate ? formData.birthDate : 'Ej. 2000-01-21'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#A0A0A0" />
          </TouchableOpacity>
          {touched.birthDate && errors.birthDate && <Text style={styles.errorText}>{errors.birthDate}</Text>}
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={formData.birthDate ? new Date(formData.birthDate) : new Date(2000, 0, 1)}
            mode="date"
            display="default"
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}

        {/* Género (Por defecto en Seleccionar género...) */}
        <View style={styles.fieldGroup}>
          <View style={styles.labelRow}>
            <Ionicons name="transgender-outline" size={18} color="#0056D2" />
            <Text style={styles.label}>Género</Text>
          </View>
          <View style={[styles.pickerContainer, touched.gender && errors.gender && styles.inputError]}>
            <Picker
              selectedValue={formData.gender}
              onValueChange={(itemValue) => handleChange('gender', itemValue)}
              dropdownIconColor="#0056D2"
            >
              <Picker.Item label="Seleccionar género..." value="" color="#A0A0A0" />
              <Picker.Item label="Masculino" value="Masculino" />
              <Picker.Item label="Femenino" value="Femenino" />
              <Picker.Item label="Otro" value="Otro" />
            </Picker>
          </View>
          {touched.gender && errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}
        </View>

        {/* Idioma */}
        <View style={styles.fieldGroup}>
          <View style={styles.labelRow}>
            <Ionicons name="globe-outline" size={18} color="#0056D2" />
            <Text style={styles.label}>Idioma de la App</Text>
          </View>
          <View style={[styles.pickerContainer, touched.language && errors.language && styles.inputError]}>
            <Picker
              selectedValue={formData.language}
              onValueChange={(itemValue) => handleChange('language', itemValue)}
              dropdownIconColor="#0056D2"
            >
              <Picker.Item label="Español" value="Español" />
              <Picker.Item label="Inglés" value="Inglés" />
            </Picker>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#EBF2FB',
    elevation: 3,
    shadowColor: '#0056D2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EBF3FF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0A2540'
  },
  fieldGroup: {
    marginBottom: 16
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0A2540'
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    backgroundColor: '#F8FAFC',
    color: '#0A2540'
  },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  pickerContainer: {
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
    justifyContent: 'center'
  },
  inputError: {
    borderColor: '#E53E3E',
    backgroundColor: '#FFF5F5'
  },
  errorText: {
    color: '#E53E3E',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500'
  }
});

export default PersonalDataTab;