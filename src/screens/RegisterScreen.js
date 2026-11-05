// AI-assisted: see docs/AI_LOG.md #7
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import PersonalDataTab from './PersonalDataTab';
import VehicleTab from './VehicleTab';
import { validatePersonalData, validateVehicleData } from '../utils/validators';

const RegisterScreen = () => {
  const [activeTab, setActiveTab] = useState(1);
  
  // Separamos el intento de envio por cada pestana independiente
  const [submittedTab1, setSubmittedTab1] = useState(false);
  const [submittedTab2, setSubmittedTab2] = useState(false);

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
    capacity: ''
  });

  const personalErrors = validatePersonalData(personalData);
  const vehicleErrors = validateVehicleData(vehicleData);

  const isPersonalValid = Object.keys(personalErrors).length === 0;
  const isVehicleValid = Object.keys(vehicleErrors).length === 0;

  // Bloqueo de navegacion manual por pestañas
  const handleTabPress = (tabIndex) => {
    if (tabIndex === 2 && !isPersonalValid) {
      setSubmittedTab1(true);
      return;
    }
    setActiveTab(tabIndex);
  };

  const handleNextOrSubmit = () => {
    if (activeTab === 1) {
      setSubmittedTab1(true);
      if (isPersonalValid) {
        setActiveTab(2);
      }
    } else if (activeTab === 2) {
      setSubmittedTab2(true);
      if (isPersonalValid && isVehicleValid) {
        const newDriver = {
          ...personalData,
          vehicle: vehicleData,
          status: 'Pendiente'
        };
        console.log('Registro enviado con éxito:', newDriver);
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Header de pestañas */}
      <View style={styles.tabHeader}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 1 && styles.activeTabButton]}
          onPress={() => handleTabPress(1)}
        >
          <Text style={[styles.tabText, activeTab === 1 && styles.activeTabText]}>1. Personales</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.tabButton, 
            activeTab === 2 && styles.activeTabButton,
            !isPersonalValid && styles.tabDisabled
          ]}
          onPress={() => handleTabPress(2)}
        >
          <Text style={[
            styles.tabText, 
            activeTab === 2 && styles.activeTabText,
            !isPersonalValid && styles.tabDisabledText
          ]}>
            2. Vehículo
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contenido de la pestaña activa */}
      <View style={styles.tabContent}>
        {activeTab === 1 && (
          <PersonalDataTab 
            formData={personalData} 
            setFormData={setPersonalData} 
            errors={personalErrors}
            touched={{
              fullName: submittedTab1 || personalData.fullName.length > 0,
              idNumber: submittedTab1 || personalData.idNumber.length > 0,
              phone: submittedTab1 || personalData.phone.length > 0,
              email: submittedTab1 || personalData.email.length > 0,
              birthDate: submittedTab1 || personalData.birthDate.length > 0,
              gender: submittedTab1 || personalData.gender.length > 0
            }}
          />
        )}
        {activeTab === 2 && (
          <VehicleTab 
            vehicleData={vehicleData} 
            setVehicleData={setVehicleData} 
            errors={vehicleErrors}
            touched={{
              plate: submittedTab2 || vehicleData.plate.length > 0,
              brand: submittedTab2 || vehicleData.brand.length > 0,
              model: submittedTab2 || vehicleData.model.length > 0,
              year: submittedTab2 || vehicleData.year.length > 0,
              capacity: submittedTab2 || vehicleData.capacity.length > 0
            }}
          />
        )}
      </View>

      {/* Botón dinámico */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.actionButton, 
            activeTab === 1 ? (!isPersonalValid && styles.disabledButton) : (!isVehicleValid && styles.disabledButton)
          ]}
          onPress={handleNextOrSubmit}
        >
          <Text style={styles.actionText}>
            {activeTab === 1 ? 'Continuar' : 'Enviar registro'}
          </Text>
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
  tabDisabled: {
    opacity: 0.4
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
  tabDisabledText: {
    color: '#999999'
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
  actionButton: {
    backgroundColor: '#1A1A1A',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center'
  },
  disabledButton: {
    backgroundColor: '#AAAAAA'
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold'
  }
});

export default RegisterScreen;