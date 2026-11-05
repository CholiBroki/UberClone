// AI-assisted: see docs/AI_LOG.md #7
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import PersonalDataTab from './PersonalDataTab';
import VehicleTab from './VehicleTab';
import { validatePersonalData, validateVehicleData } from '../utils/validators';

const RegisterScreen = () => {
  const [activeTab, setActiveTab] = useState(1);

  const [personalData, setPersonalData] = useState({
    fullName: '',
    idNumber: '',
    phone: '',
    email: '',
    birthDate: '',
    gender: 'Masculino',
    language: 'Español'
  });

  const [vehicleData, setVehicleData] = useState({
    category: 'economy',
    plate: '',
    brand: '',
    model: '',
    year: '',
    color: 'Blanco',
    capacity: '4'
  });

  const personalErrors = validatePersonalData(personalData);
  const vehicleErrors = validateVehicleData(vehicleData);

  const isPersonalValid = Object.keys(personalErrors).length === 0;
  const isVehicleValid = Object.keys(vehicleErrors).length === 0;

  
  const isFormValid = isPersonalValid && isVehicleValid;

  const handleSubmit = () => {
    if (!isFormValid) return;
    const newDriver = {
      ...personalData,
      vehicle: vehicleData,
      status: 'Pendiente'
    };
    console.log('Registro enviado con exito:', newDriver);
  };

  return (
    <View style={styles.container}>
      {/* Selector de Pestañas */}
      <View style={styles.tabHeader}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 1 && styles.activeTabButton]}
          onPress={() => setActiveTab(1)}
        >
          <Text style={[styles.tabText, activeTab === 1 && styles.activeTabText]}>1. Personales</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 2 && styles.activeTabButton]}
          onPress={() => setActiveTab(2)}
        >
          <Text style={[styles.tabText, activeTab === 2 && styles.activeTabText]}>2. Vehículo</Text>
        </TouchableOpacity>
      </View>

      {/* Contenido de la pestaña activa */}
      <View style={styles.tabContent}>
        {activeTab === 1 && (
          <PersonalDataTab 
            formData={personalData} 
            setFormData={setPersonalData} 
            errors={personalErrors} 
          />
        )}
        {activeTab === 2 && (
          <VehicleTab 
            vehicleData={vehicleData} 
            setVehicleData={setVehicleData} 
            errors={vehicleErrors} 
          />
        )}
      </View>

      {/* Boton de Enviar Registro */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, !isFormValid && styles.disabledButton]}
          disabled={!isFormValid}
          onPress={handleSubmit}
        >
          <Text style={styles.submitText}>Enviar registro</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
    paddingTop: 40
  },
  tabHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FFFFFF'
  },
  tabButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center'
  },
  activeTabButton: {
    borderBottomWidth: 3,
    borderBottomColor: '#1A1A1A'
  },
  tabText: {
    fontSize: 14,
    color: '#777777',
    fontWeight: '500'
  },
  activeTabText: {
    color: '#1A1A1A',
    fontWeight: 'bold'
  },
  tabContent: {
    flex: 1
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0'
  },
  submitButton: {
    backgroundColor: '#1A1A1A',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center'
  },
  disabledButton: {
    backgroundColor: '#AAAAAA'
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold'
  }
});

export default RegisterScreen;