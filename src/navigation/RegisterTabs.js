// AI-assisted: see docs/AI_LOG.md #18
import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, StatusBar, Platform, ActivityIndicator,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import PersonalDataTab from '../screens/PersonalDataTab';
import VehicleTab from '../screens/VehicleTab';
import DocumentsTab from '../screens/DocumentsTab';
import { useRegistration } from '../context/RegistrationContext';

const Tab = createBottomTabNavigator();

const STEPS = [
  { name: 'Personales', label: 'Personales' },
  { name: 'Vehiculo', label: 'Vehículo' },
  { name: 'Documentos', label: 'Documentos' },
];

/* ---------- Barra superior (reemplaza la barra por defecto) ---------- */
function RegisterTabBar({ state, navigation, onBack }) {
  const { validity, markSubmitted } = useRegistration();

  const done = [validity.personal, validity.vehicle, validity.docs];
  const allowed = [true, validity.personal, validity.personal && validity.vehicle];

  const handlePress = (index) => {
    if (!allowed[index]) {
      // Mostrar los errores de las pestañas que faltan por completar
      if (index >= 1 && !validity.personal) markSubmitted(1);
      if (index === 2 && !validity.vehicle) markSubmitted(2);
      return;
    }
    navigation.navigate(STEPS[index].name);
  };

  return (
    <View style={styles.topBanner}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      <View style={styles.tabHeader}>
        {STEPS.map((step, index) => {
          const active = state.index === index;
          return (
            <React.Fragment key={step.name}>
              {index > 0 && <View style={styles.stepDivider} />}
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  active && styles.activeTabButton,
                  !allowed[index] && styles.tabDisabled,
                ]}
                onPress={() => handlePress(index)}
              >
                <View style={styles.tabRow}>
                  {done[index] ? (
                    <Ionicons name="checkmark-circle" size={18} color="#4ADE80" />
                  ) : (
                    <View style={[styles.stepNumber, active && styles.activeStepNumber]}>
                      <Text style={styles.stepText}>{index + 1}</Text>
                    </View>
                  )}
                  <Text
                    style={[
                      styles.tabText,
                      active && styles.activeTabText,
                      !allowed[index] && styles.tabDisabledText,
                    ]}
                  >
                    {step.label}
                  </Text>
                </View>
              </TouchableOpacity>
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
}

/* ---------- Pie con el botón Continuar / Enviar registro ---------- */
function RegistrationFooter({ step, navigation }) {
  const { validity, markSubmitted, submit, loading } = useRegistration();

  const handlePress = () => {
    markSubmitted(step);

    if (step === 1 && validity.personal) {
      navigation.navigate('Vehiculo');
    } else if (step === 2 && validity.vehicle) {
      navigation.navigate('Documentos');
    } else if (step === 3) {
      if (!validity.personal) {
        markSubmitted(1);
        navigation.navigate('Personales');
      } else if (!validity.vehicle) {
        markSubmitted(2);
        navigation.navigate('Vehiculo');
      } else if (validity.docs) {
        submit();
      }
    }
  };

  return (
    <View style={styles.footer}>
      <TouchableOpacity
        style={[styles.actionButton, loading && { opacity: 0.7 }]}
        onPress={handlePress}
        disabled={loading}
        activeOpacity={0.85}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <>
            <Text style={styles.actionText}>{step === 3 ? 'Enviar registro' : 'Continuar'}</Text>
            <Ionicons
              name={step === 3 ? 'checkmark-done' : 'arrow-forward'}
              size={18}
              color="#FFFFFF"
              style={{ marginLeft: 6 }}
            />
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

function ScreenFrame({ children, footer }) {
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.tabContent}>{children}</View>
      {footer}
    </View>
  );
}

/* ---------- Pantallas de cada pestaña ---------- */
function PersonalRoute({ navigation }) {
  const { personalData, setPersonalData, errors, submitted } = useRegistration();
  return (
    <ScreenFrame footer={<RegistrationFooter step={1} navigation={navigation} />}>
      <PersonalDataTab
        formData={personalData}
        setFormData={setPersonalData}
        errors={errors.personal}
        touched={{ hasSubmitted: submitted[1] }}
      />
    </ScreenFrame>
  );
}

function VehicleRoute({ navigation }) {
  const { vehicleData, setVehicleData, errors, submitted } = useRegistration();
  return (
    <ScreenFrame footer={<RegistrationFooter step={2} navigation={navigation} />}>
      <VehicleTab
        vehicleData={vehicleData}
        setVehicleData={setVehicleData}
        errors={errors.vehicle}
        touched={{ hasSubmitted: submitted[2] }}
      />
    </ScreenFrame>
  );
}

function DocumentsRoute({ navigation }) {
  const { docsData, setDocsData, vehicleData, errors, submitted } = useRegistration();
  return (
    <ScreenFrame footer={<RegistrationFooter step={3} navigation={navigation} />}>
      <DocumentsTab
        docsData={docsData}
        setDocsData={setDocsData}
        errors={errors.docs}
        touched={{ hasSubmitted: submitted[3] }}
        vehicleYear={vehicleData.year}
      />
    </ScreenFrame>
  );
}

export default function RegisterTabs({ onBack }) {
  return (
    <Tab.Navigator
      backBehavior="history" // el botón atrás de Android vuelve a la pestaña anterior
      tabBar={(props) => <RegisterTabBar {...props} onBack={onBack} />}
      screenOptions={{ headerShown: false, tabBarPosition: 'top' }}
    >
      <Tab.Screen name="Personales" component={PersonalRoute} />
      <Tab.Screen name="Vehiculo" component={VehicleRoute} />
      <Tab.Screen name="Documentos" component={DocumentsRoute} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  topBanner: {
    backgroundColor: '#0B2545',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 12 : 16,
    paddingBottom: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingHorizontal: 12,
    zIndex: 10,
    elevation: 5,
  },
  backButton: { padding: 8, alignSelf: 'flex-start' },
  tabHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tabButton: { paddingVertical: 6, paddingHorizontal: 6, alignItems: 'center' },
  activeTabButton: { borderBottomWidth: 3, borderBottomColor: '#0066FF' },
  tabRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stepNumber: {
    width: 18, height: 18, borderRadius: 9, backgroundColor: '#1E3A8A',
    alignItems: 'center', justifyContent: 'center',
  },
  activeStepNumber: { backgroundColor: '#0066FF' },
  stepText: { color: '#FFFFFF', fontSize: 10, fontWeight: 'bold' },
  stepDivider: { width: 14, height: 2, backgroundColor: '#1E3A8A' },
  tabText: { fontSize: 12, color: '#94A3B8', fontWeight: '600' },
  activeTabText: { color: '#FFFFFF', fontWeight: 'bold' },
  tabDisabled: { opacity: 0.5 },
  tabDisabledText: { color: '#64748B' },
  tabContent: { flex: 1, paddingTop: 12 },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
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
    shadowRadius: 8,
  },
  actionText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});