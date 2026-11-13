// AI-assisted: see docs/AI_LOG.md #24
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, Image, Alert, StyleSheet,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { usePreferences } from '../context/PreferencesContext';
import { formatLocalDate, parseLocalDate } from '../utils/dateUtils';

export default function ProfilePersonalSection({ data, setData, errors, submitted }) {
  const { t } = usePreferences();
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleChange = (field, value) => setData((prev) => ({ ...prev, [field]: value }));
  const showError = (field) => (submitted && errors[field] ? errors[field] : null);

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Se necesitan permisos de galería.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.length > 0) {
      handleChange('profilePhoto', result.assets[0].uri);
    }
  };

  const takeWithCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Se necesitan permisos de cámara.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      cameraType: ImagePicker.CameraType.front,
    });
    if (!result.canceled && result.assets?.length > 0) {
      handleChange('profilePhoto', result.assets[0].uri);
    }
  };

  const handlePhotoOptions = () => {
    Alert.alert(
      'Foto de perfil',
      '¿Qué deseas hacer con tu foto?',
      [
        { text: 'Tomar foto (Cámara)', onPress: takeWithCamera },
        { text: 'Elegir de Galería', onPress: pickFromGallery },
        { text: 'Cancelar', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (event?.type === 'dismissed' || !selectedDate) return;
    handleChange('birthDate', formatLocalDate(selectedDate));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.card}>
        {/* Foto */}
        <View style={styles.photoBox}>
          <TouchableOpacity onPress={handlePhotoOptions} style={styles.avatarButton}>
            {data.profilePhoto ? (
              <Image source={{ uri: data.profilePhoto }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarEmpty]}>
                <Ionicons name="camera-outline" size={32} color="#0056D2" />
              </View>
            )}
            <View style={styles.cameraBadge}>
              <Ionicons name="camera" size={14} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
          {showError('profilePhoto') && <Text style={styles.error}>{errors.profilePhoto}</Text>}
        </View>

        {/* Nombre */}
        <Text style={styles.label}>Nombre completo</Text>
        <TextInput
          style={[styles.input, showError('fullName') && styles.inputError]}
          value={data.fullName}
          onChangeText={(v) => handleChange('fullName', v)}
          maxLength={50}
          placeholder="Nombre y apellidos"
          placeholderTextColor="#A0A0A0"
        />
        {showError('fullName') && <Text style={styles.error}>{errors.fullName}</Text>}

        {/* Celular */}
        <Text style={styles.label}>Número de celular</Text>
        <TextInput
          style={[styles.input, showError('phone') && styles.inputError]}
          value={data.phone}
          onChangeText={(v) => handleChange('phone', v.replace(/[^0-9]/g, ''))}
          keyboardType="number-pad"
          maxLength={10}
          placeholder="3001234567"
          placeholderTextColor="#A0A0A0"
        />
        {showError('phone') && <Text style={styles.error}>{errors.phone}</Text>}

        {/* Fecha de nacimiento */}
        <Text style={styles.label}>Fecha de nacimiento</Text>
        <TouchableOpacity
          style={[styles.input, styles.dateInput, showError('birthDate') && styles.inputError]}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={{ color: data.birthDate ? '#0A2540' : '#A0A0A0', fontSize: 15 }}>
            {data.birthDate || 'Seleccionar fecha...'}
          </Text>
          <Ionicons name="calendar-outline" size={20} color="#0056D2" />
        </TouchableOpacity>
        {showError('birthDate') && <Text style={styles.error}>{errors.birthDate}</Text>}
        {showDatePicker && (
          <DateTimePicker
            value={data.birthDate ? parseLocalDate(data.birthDate) : new Date(2000, 0, 1)}
            mode="date"
            display="default"
            maximumDate={new Date()}
            onChange={handleDateChange}
          />
        )}

        {/* Género */}
        <Text style={styles.label}>Género</Text>
        <View style={[styles.pickerBox, showError('gender') && styles.inputError]}>
          <Picker
            selectedValue={data.gender}
            onValueChange={(v) => handleChange('gender', v)}
            dropdownIconColor="#0056D2"
          >
            <Picker.Item label="Seleccionar género..." value="" color="#A0A0A0" />
            <Picker.Item label="Masculino" value="Masculino" />
            <Picker.Item label="Femenino" value="Femenino" />
            <Picker.Item label="Otro" value="Otro" />
          </Picker>
        </View>
        {showError('gender') && <Text style={styles.error}>{errors.gender}</Text>}

        {/* Campos bloqueados */}
        <Text style={styles.label}>Correo electrónico</Text>
        <View style={[styles.input, styles.locked]}>
          <Text style={styles.lockedText} numberOfLines={1}>{data.email}</Text>
          <Ionicons name="lock-closed" size={16} color="#94A3B8" />
        </View>

        <Text style={styles.label}>Documento de identidad</Text>
        <View style={[styles.input, styles.locked]}>
          <Text style={styles.lockedText}>{data.idNumber}</Text>
          <Ionicons name="lock-closed" size={16} color="#94A3B8" />
        </View>
        <Text style={styles.hint}>{t('lockedField')}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 14, paddingBottom: 20 },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20,
    borderWidth: 1, borderColor: '#EBF2FB', elevation: 2,
  },
  photoBox: { alignItems: 'center', marginBottom: 6 },
  avatarButton: { position: 'relative' },
  avatar: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#E2E8F0' },
  avatarEmpty: { alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#0056D2', borderStyle: 'dashed' },
  cameraBadge: {
    position: 'absolute', right: 0, bottom: 0, width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#0056D2', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#FFFFFF',
  },
  label: { fontSize: 13, fontWeight: '700', color: '#0A2540', marginTop: 14, marginBottom: 6 },
  input: {
    borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 14, paddingHorizontal: 14,
    paddingVertical: 12, fontSize: 15, color: '#0A2540', backgroundColor: '#F8FAFC',
  },
  inputError: { borderColor: '#EF4444' },
  dateInput: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pickerBox: { borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 14, backgroundColor: '#F8FAFC' },
  locked: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F1F5F9' },
  lockedText: { fontSize: 15, color: '#64748B', flex: 1, paddingRight: 8 },
  hint: { fontSize: 12, color: '#94A3B8', marginTop: 6 },
  error: { color: '#EF4444', fontSize: 12, marginTop: 4 },
});