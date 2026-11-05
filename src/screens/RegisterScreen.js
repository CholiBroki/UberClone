// AI-assisted: see docs/AI_LOG.md #7
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, Platform } from 'react-native';
import PersonalDataTab from './PersonalDataTab';
import VehicleTab from './VehicleTab';
import { validatePersonalData, validateVehicleData } from '../utils/validators';
import { Ionicons } from '@expo/vector-icons';

const RegisterScreen = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [submittedTab1, setSubmittedTab1] = useState(false);
  const [submittedTab2, setSubmittedTab2] = useState(false);

  const [personalData, setPersonalData] = useState({
    fullName: '',
    idNumber: '',
    phone: '',
    email: '',
    birthDate: '',
    gender: '',
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
        // En el futuro, esto avanzará a la Pestaña 3 (Documentos)
        console.log('Pestaña 2 validada correctamente');
      }
    }
  };

  const isCurrentTabValid = activeTab === 1 ? isPersonalValid : (isPersonalValid && isVehicleValid);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B2545" />

      {/* Header Superior Azul Curvo con respeto al Notch */}
      <View style={styles.topBanner}>
        <View style={styles.tabHeader}>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 1 && styles.activeTabButton]}
            onPress={() => handleTabPress(1)}
          >
            <View style={styles.tabRow}>
              {isPersonalValid ? (
                <Ionicons name="checkmark-circle" size={18} color="#4ADE80" />
              ) : (
                <View style={[styles.stepNumber, activeTab === 1 && styles.activeStepNumber]}>
                  <Text style={styles.stepText}>1</Text>
                </View>
              )}
              <Text style={[styles.tabText, activeTab === 1 && styles.activeTabText]}>1. Personales</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.stepDivider} />

          <TouchableOpacity 
            style={[
              styles.tabButton, 
              activeTab === 2 && styles.activeTabButton,
              !isPersonalValid && styles.tabDisabled
            ]}
            onPress={() => handleTabPress(2)}
          >
            <View style={styles.tabRow}>
              {isVehicleValid ? (
                <Ionicons name="checkmark-circle" size={18} color="#4ADE80" />
              ) : (
                <View style={[styles.stepNumber, activeTab === 2 && styles.activeStepNumber]}>
                  <Text style={styles.stepText}>2</Text>
                </View>
              )}
              <Text style={[
                styles.tabText, 
                activeTab === 2 && styles.activeTabText,
                !isPersonalValid && styles.tabDisabledText
              ]}>
                2. Vehículo
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Contenido dinámico */}
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

      {/* Footer con Botón Continuar */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.actionButton, !isCurrentTabValid && styles.disabledButton]}
          onPress={handleNextOrSubmit}
        >
          <Text style={styles.actionText}>Continuar</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF4FB'
  },
  topBanner: {
    backgroundColor: '#0B2545',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 12 : 16,
    paddingBottom: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingHorizontal: 16,
    zIndex: 10,
    elevation: 5
  },
  tabHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center'
  },
  activeTabButton: {
    borderBottomWidth: 3,
    borderBottomColor: '#0066FF'
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  stepNumber: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#1E3A8A',
    alignItems: 'center',
    justifyContent: 'center'
  },
  activeStepNumber: {
    backgroundColor: '#0066FF'
  },
  stepText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold'
  },
  stepDivider: {
    width: 30,
    height: 2,
    backgroundColor: '#1E3A8A',
    marginHorizontal: 8
  },
  tabText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '600'
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: 'bold'
  },
  tabDisabled: {
    opacity: 0.5
  },
  tabDisabledText: {
    color: '#64748B'
  },
  tabContent: {
    flex: 1,
    paddingTop: 12
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0'
  },
  actionButton: {
    backgroundColor: '#0056D2',
    paddingVertical: 16,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#0056D2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8
  },
  disabledButton: {
    backgroundColor: '#94A3B8',
    elevation: 0,
    shadowOpacity: 0
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold'
  }
});

export default RegisterScreen;