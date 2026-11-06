// AI-assisted: see docs/AI_LOG.md #7
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, Platform, Alert } from 'react-native';
import PersonalDataTab from './PersonalDataTab';
import VehicleTab from './VehicleTab';
import DocumentsTab from './DocumentsTab';
import { validatePersonalData, validateVehicleData, validateDocumentsData } from '../utils/validators';
import { Ionicons } from '@expo/vector-icons';

const RegisterScreen = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [submittedTab1, setSubmittedTab1] = useState(false);
  const [submittedTab2, setSubmittedTab2] = useState(false);
  const [submittedTab3, setSubmittedTab3] = useState(false);

  const [personalData, setPersonalData] = useState({
    profilePhoto: null,
    fullName: '',
    idNumber: '',
    phone: '',
    email: '',
    birthDate: '',
    gender: '',
    language: 'Español'
  });

  const [vehicleData, setVehicleData] = useState({
    vehiclePhoto: null,
    category: '',
    plate: '',
    brand: '',
    model: '',
    year: '',
    color: '',
    capacity: ''
  });

  const [docsData, setDocsData] = useState({
    licenseFront: null,
    licenseBack: null,
    licenseNumber: '',
    licenseExpiry: '',
    soatFile: null,
    soatExpiry: '',
    technoFile: null,
    technoExpiry: '',
    mpEmail: '',
    acceptedTerms: false
  });

  const personalErrors = validatePersonalData(personalData);
  const vehicleErrors = validateVehicleData(vehicleData);
  const docsErrors = validateDocumentsData(docsData, vehicleData.year);

  const isPersonalValid = Object.keys(personalErrors).length === 0;
  const isVehicleValid = Object.keys(vehicleErrors).length === 0;
  const isDocsValid = Object.keys(docsErrors).length === 0;

  const handleTabPress = (tabIndex) => {
    if (tabIndex === 2 && !isPersonalValid) {
      setSubmittedTab1(true);
      return;
    }
    if (tabIndex === 3 && (!isPersonalValid || !isVehicleValid)) {
      if (!isPersonalValid) setSubmittedTab1(true);
      if (!isVehicleValid) setSubmittedTab2(true);
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
      if (isVehicleValid) {
        setActiveTab(3);
      }
    } else if (activeTab === 3) {
      setSubmittedTab3(true);
      if (isPersonalValid && isVehicleValid && isDocsValid) {
        const newDriver = {
          ...personalData,
          vehicle: vehicleData,
          documents: docsData,
          status: 'Pendiente',
          registeredAt: new Date().toISOString()
        };
        console.log('Solicitud enviada con éxito. Estado: Pendiente');
        Alert.alert(
          '¡Registro Completado!',
          'Tu solicitud ha sido enviada con éxito. Tu cuenta se encuentra en estado Pendiente de aprobación.',
          [{ text: 'Aceptar' }]
        );
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B2545" />

      {/* Header Superior Azul Curvo */}
      <View style={styles.topBanner}>
        <View style={styles.tabHeader}>
          {/* Pestaña 1 */}
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
              <Text style={[styles.tabText, activeTab === 1 && styles.activeTabText]}>Personales</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.stepDivider} />

          {/* Pestaña 2 */}
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
                Vehículo
              </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.stepDivider} />

          {/* Pestaña 3 */}
          <TouchableOpacity 
            style={[
              styles.tabButton, 
              activeTab === 3 && styles.activeTabButton,
              (!isPersonalValid || !isVehicleValid) && styles.tabDisabled
            ]}
            onPress={() => handleTabPress(3)}
          >
            <View style={styles.tabRow}>
              {isDocsValid ? (
                <Ionicons name="checkmark-circle" size={18} color="#4ADE80" />
              ) : (
                <View style={[styles.stepNumber, activeTab === 3 && styles.activeStepNumber]}>
                  <Text style={styles.stepText}>3</Text>
                </View>
              )}
              <Text style={[
                styles.tabText, 
                activeTab === 3 && styles.activeTabText,
                (!isPersonalValid || !isVehicleValid) && styles.tabDisabledText
              ]}>
                Documentos
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
            touched={{ hasSubmitted: submittedTab1 }}
          />
        )}
        {activeTab === 2 && (
          <VehicleTab 
            vehicleData={vehicleData} 
            setVehicleData={setVehicleData} 
            errors={vehicleErrors}
            touched={{ hasSubmitted: submittedTab2 }}
          />
        )}
        {activeTab === 3 && (
          <DocumentsTab 
            docsData={docsData} 
            setDocsData={setDocsData} 
            errors={docsErrors}
            touched={{ hasSubmitted: submittedTab3 }}
            vehicleYear={vehicleData.year}
          />
        )}
      </View>

      {/* Footer dinámico */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleNextOrSubmit}
        >
          <Text style={styles.actionText}>
            {activeTab === 3 ? 'Enviar registro' : 'Continuar'}
          </Text>
          <Ionicons 
            name={activeTab === 3 ? "checkmark-done" : "arrow-forward"} 
            size={18} 
            color="#FFFFFF" 
            style={{ marginLeft: 6 }} 
          />
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
    paddingHorizontal: 12,
    zIndex: 10,
    elevation: 5
  },
  tabHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  tabButton: {
    paddingVertical: 6,
    paddingHorizontal: 6,
    alignItems: 'center'
  },
  activeTabButton: {
    borderBottomWidth: 3,
    borderBottomColor: '#0066FF'
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  stepNumber: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#1E3A8A',
    alignItems: 'center',
    justifyContent: 'center'
  },
  activeStepNumber: {
    backgroundColor: '#0066FF'
  },
  stepText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold'
  },
  stepDivider: {
    width: 14,
    height: 2,
    backgroundColor: '#1E3A8A'
  },
  tabText: {
    fontSize: 12,
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
  actionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold'
  }
});

export default RegisterScreen;