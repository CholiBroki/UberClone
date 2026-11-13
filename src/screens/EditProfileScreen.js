// AI-assisted: see docs/AI_LOG.md #24
import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import ProfilePersonalSection from './ProfilePersonalSection';
import VehicleTab from './VehicleTab';
import DocumentsTab from './DocumentsTab';
import {
  validatePersonalData, validateVehicleData, validateDocumentsData,
} from '../utils/validators';
import { toFormState } from '../utils/profileForm';
import { saveProfile } from '../service/profileService';

const SECTIONS = [
  { key: 'personal', label: 'personalData' },
  { key: 'vehicle', label: 'vehicle' },
  { key: 'docs', label: 'documents' },
];

export default function EditProfileScreen({ navigation }) {
  const { driver } = useAuth();
  const { t } = usePreferences();

  const [initial] = useState(() => toFormState(driver || {}));
  const initialJson = useMemo(() => JSON.stringify(initial), [initial]);

  const [personalData, setPersonalData] = useState(initial.personalData);
  const [vehicleData, setVehicleData] = useState(initial.vehicleData);
  const [docsData, setDocsData] = useState(initial.docsData);

  const [section, setSection] = useState('personal');
  const [submitted, setSubmitted] = useState({ personal: false, vehicle: false, docs: false });
  const [banner, setBanner] = useState('');
  const [saving, setSaving] = useState(false);
  const leavingRef = useRef(false); // evita pedir confirmación después de guardar

  const errors = useMemo(
    () => ({
      personal: validatePersonalData(personalData, { requirePassword: false }),
      vehicle: validateVehicleData(vehicleData),
      docs: validateDocumentsData(docsData, vehicleData.year),
    }),
    [personalData, vehicleData, docsData]
  );

  const hasChanges = useMemo(
    () => JSON.stringify({ personalData, vehicleData, docsData }) !== initialJson,
    [personalData, vehicleData, docsData, initialJson]
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (event) => {
      if (!hasChanges || saving || leavingRef.current) return;
      event.preventDefault();
      Alert.alert(t('discardTitle'), t('discardMessage'), [
        { text: t('keepEditing'), style: 'cancel' },
        {
          text: t('discard'),
          style: 'destructive',
          onPress: () => navigation.dispatch(event.data.action),
        },
      ]);
    });
    return unsubscribe;
  }, [navigation, hasChanges, saving, t]);

  const handleSave = async () => {
    setSubmitted({ personal: true, vehicle: true, docs: true });

    const firstInvalid = SECTIONS.find((s) => Object.keys(errors[s.key]).length > 0);
    if (firstInvalid) {
      setSection(firstInvalid.key);
      setBanner(t('fixFields', { section: t(firstInvalid.label) }));
      return;
    }
    setBanner('');

    try {
      setSaving(true);
      await saveProfile(driver, { personalData, vehicleData, docsData });
      leavingRef.current = true;
      Alert.alert(t('profileSaved'), '', [{ text: 'OK', onPress: () => navigation.goBack() }], {
        cancelable: false,
      });
    } catch (error) {
      console.log('EditProfileScreen: error guardando el perfil', error);
      Alert.alert(
        'Error',
        error.code === 'FILE_NOT_FOUND' ? error.message : t('profileSaveError')
      );
    } finally {
      setSaving(false);
    }
  };

  const hasErrors = (key) => submitted[key] && Object.keys(errors[key]).length > 0;

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      {/* Selector de sección */}
      <View style={styles.segment}>
        {SECTIONS.map((s) => {
          const active = section === s.key;
          return (
            <TouchableOpacity
              key={s.key}
              style={[styles.segmentButton, active && styles.segmentButtonActive]}
              onPress={() => setSection(s.key)}
              activeOpacity={0.8}
            >
              <Text style={[styles.segmentText, active && styles.segmentTextActive]} numberOfLines={1}>
                {t(s.label)}
              </Text>
              {hasErrors(s.key) && <Ionicons name="alert-circle" size={14} color="#EF4444" />}
            </TouchableOpacity>
          );
        })}
      </View>

      {!!banner && (
        <View style={styles.banner}>
          <Ionicons name="alert-circle" size={18} color="#B91C1C" />
          <Text style={styles.bannerText}>{banner}</Text>
        </View>
      )}

      {/* Contenido de la sección activa (los datos viven aquí, no se pierden al cambiar) */}
      <View style={styles.content}>
        {section === 'personal' && (
          <ProfilePersonalSection
            data={personalData}
            setData={setPersonalData}
            errors={errors.personal}
            submitted={submitted.personal}
          />
        )}
        {section === 'vehicle' && (
          <VehicleTab
            vehicleData={vehicleData}
            setVehicleData={setVehicleData}
            errors={errors.vehicle}
            touched={{ hasSubmitted: submitted.vehicle }}
          />
        )}
        {section === 'docs' && (
          <DocumentsTab
            docsData={docsData}
            setDocsData={setDocsData}
            errors={errors.docs}
            touched={{ hasSubmitted: submitted.docs }}
            vehicleYear={vehicleData.year}
          />
        )}
      </View>

      {/* Guardar */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, (!hasChanges || saving) && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!hasChanges || saving}
          activeOpacity={0.85}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveText}>{t('saveChanges')}</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EEF4FB' },
  segment: {
    flexDirection: 'row', backgroundColor: '#E2E8F0', borderRadius: 14, padding: 4,
    margin: 14, marginBottom: 6,
  },
  segmentButton: {
    flex: 1, flexDirection: 'row', gap: 4, paddingVertical: 10,
    alignItems: 'center', justifyContent: 'center', borderRadius: 11,
  },
  segmentButtonActive: { backgroundColor: '#FFFFFF', elevation: 2 },
  segmentText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  segmentTextActive: { color: '#0056D2', fontWeight: '800' },
  banner: {
    flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FEE2E2',
    marginHorizontal: 14, marginTop: 6, padding: 10, borderRadius: 12,
  },
  bannerText: { color: '#B91C1C', fontSize: 13, fontWeight: '600', flex: 1 },
  content: { flex: 1, paddingTop: 6 },
  footer: { padding: 16, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  saveButton: { backgroundColor: '#0056D2', paddingVertical: 16, borderRadius: 30, alignItems: 'center', elevation: 4 },
  saveButtonDisabled: { backgroundColor: '#94A3B8', elevation: 0 },
  saveText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});