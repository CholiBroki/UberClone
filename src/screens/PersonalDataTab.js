// AI-assisted: see docs/AI_LOG.md #4
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
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

  // 1. Abrir Galería
  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Se necesitan permisos de galería para seleccionar la foto.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      handleChange('profilePhoto', result.assets[0].uri);
    }
  };

  // 2. Tomar Foto con la Cámara
  const takeWithCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Se necesitan permisos de cámara para tomar la foto de perfil.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      cameraType: ImagePicker.CameraType.front, // Abre cámara frontal por defecto para selfie
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      handleChange('profilePhoto', result.assets[0].uri);
    }
  };

  // Menu desplegable de seleccion
  const handleSelectPhotoOptions = () => {
    Alert.alert(
      'Foto de Perfil',
      '¿De dónde deseas obtener tu foto?',
      [
        { text: 'Tomar foto (Cámara)', onPress: takeWithCamera },
        { text: 'Elegir de la Galería', onPress: pickFromGallery },
        { text: 'Cancelar', style: 'cancel' }
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.iconBadge}>
            <Ionicons name="person" size={24} color="#0056D2" />
          </View>
          <Text style={styles.title}>Datos Personales</Text>
        </View>

        {/* Foto de Perfil con menú de cámara/galería */}
        <View style={styles.photoContainer}>
          <TouchableOpacity onPress={handleSelectPhotoOptions} style={styles.avatarButton}>
            {formData.profilePhoto ? (
              <Image source={{ uri: formData.profilePhoto }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="camera-outline" size={32} color="#0056D2" />
                <Text style={styles.avatarText}>Subir foto</Text>
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.photoHint}>Foto de perfil (Rostro visible)</Text>
          {touched.hasSubmitted && errors.profilePhoto && (
            <Text style={styles.errorText}>{errors.profilePhoto}</Text>
          )}
        </View>

        {/* Nombre completo */}
        <View style={styles.fieldGroup}>
          <View style={styles.labelRow}>
            <Ionicons name="person-outline" size={18} color="#0056D2" />
            <Text style={styles.label}>Nombre completo</Text>
          </View>
          <TextInput
            style={[styles.input, touched.hasSubmitted && errors.fullName && styles.inputError]}
            placeholder="Ej. Robert De Jesús Julio González"
            placeholderTextColor="#A0A0A0"
            value={formData.fullName}
            onChangeText={(val) => handleChange('fullName', val)}
            maxLength={50}
          />
          {touched.hasSubmitted && errors.fullName ? (
            <Text style={styles.errorText}>{errors.fullName}</Text>
          ) : (
            <Text style={styles.hintText}>Ingrese su nombre completo tal como figura en su documento.</Text>
          )}
        </View>

        {/* Documento de identidad */}
        <View style={styles.fieldGroup}>
          <View style={styles.labelRow}>
            <Ionicons name="id-card-outline" size={18} color="#0056D2" />
            <Text style={styles.label}>Documento de identidad</Text>
          </View>
          <TextInput
            style={[styles.input, touched.hasSubmitted && errors.idNumber && styles.inputError]}
            placeholder="Ej. 1063189230"
            placeholderTextColor="#A0A0A0"
            keyboardType="numeric"
            value={formData.idNumber}
            onChangeText={(val) => handleChange('idNumber', val)}
            maxLength={10}
          />
          {touched.hasSubmitted && errors.idNumber ? (
            <Text style={styles.errorText}>{errors.idNumber}</Text>
          ) : (
            <Text style={styles.hintText}>Debe tener entre 6 y 10 dígitos numéricos sin puntos ni comas.</Text>
          )}
        </View>

        {/* Número de celular */}
        <View style={styles.fieldGroup}>
          <View style={styles.labelRow}>
            <Ionicons name="call-outline" size={18} color="#0056D2" />
            <Text style={styles.label}>Número de celular</Text>
          </View>
          <TextInput
            style={[styles.input, touched.hasSubmitted && errors.phone && styles.inputError]}
            placeholder="Ej. 3054551840"
            placeholderTextColor="#A0A0A0"
            keyboardType="phone-pad"
            value={formData.phone}
            onChangeText={(val) => handleChange('phone', val)}
            maxLength={10}
          />
          {touched.hasSubmitted && errors.phone ? (
            <Text style={styles.errorText}>{errors.phone}</Text>
          ) : (
            <Text style={styles.hintText}>Debe contener exactamente 10 dígitos numéricos.</Text>
          )}
        </View>

        {/* Correo electrónico */}
        <View style={styles.fieldGroup}>
          <View style={styles.labelRow}>
            <Ionicons name="mail-outline" size={18} color="#0056D2" />
            <Text style={styles.label}>Correo electrónico</Text>
          </View>
          <TextInput
            style={[styles.input, touched.hasSubmitted && errors.email && styles.inputError]}
            placeholder="correo@ejemplo.com"
            placeholderTextColor="#A0A0A0"
            keyboardType="email-address"
            autoCapitalize="none"
            value={formData.email}
            onChangeText={(val) => handleChange('email', val)}
          />
          {touched.hasSubmitted && errors.email ? (
            <Text style={styles.errorText}>{errors.email}</Text>
          ) : (
            <Text style={styles.hintText}>Formato válido de correo electrónico (ej. nombre@dominio.com).</Text>
          )}
        </View>

        {/* Fecha de nacimiento */}
        <View style={styles.fieldGroup}>
          <View style={styles.labelRow}>
            <Ionicons name="calendar-outline" size={18} color="#0056D2" />
            <Text style={styles.label}>Fecha de nacimiento</Text>
          </View>
          <TouchableOpacity 
            onPress={() => setShowDatePicker(true)}
            style={[styles.input, styles.datePickerButton, touched.hasSubmitted && errors.birthDate && styles.inputError]}
          >
            <Text style={{ color: formData.birthDate ? '#0A2540' : '#A0A0A0', fontSize: 15 }}>
              {formData.birthDate ? formData.birthDate : 'Seleccionar fecha de nacimiento...'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#A0A0A0" />
          </TouchableOpacity>
          {touched.hasSubmitted && errors.birthDate && <Text style={styles.errorText}>{errors.birthDate}</Text>}
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={formData.birthDate ? new Date(formData.birthDate) : new Date(2005, 0, 1)}
            mode="date"
            display="default"
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}

        {/* Género */}
        <View style={styles.fieldGroup}>
          <View style={styles.labelRow}>
            <Ionicons name="transgender-outline" size={18} color="#0056D2" />
            <Text style={styles.label}>Género</Text>
          </View>
          <View style={[styles.pickerContainer, touched.hasSubmitted && errors.gender && styles.inputError]}>
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
          {touched.hasSubmitted && errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}
        </View>

        {/* Idioma */}
        <View style={styles.fieldGroup}>
          <View style={styles.labelRow}>
            <Ionicons name="globe-outline" size={18} color="#0056D2" />
            <Text style={styles.label}>Idioma de la App</Text>
          </View>
          <View style={styles.pickerContainer}>
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
    marginBottom: 16,
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
  photoContainer: {
    alignItems: 'center',
    marginBottom: 20
  },
  avatarButton: {
    width: 96,
    height: 96,
    borderRadius: 48,
    overflow: 'hidden',
    backgroundColor: '#F0F4F8',
    borderWidth: 2,
    borderColor: '#0056D2',
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarImage: {
    width: '100%',
    height: '100%'
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarText: {
    fontSize: 11,
    color: '#0056D2',
    fontWeight: '600',
    marginTop: 2
  },
  photoHint: {
    fontSize: 12,
    color: '#4A5568',
    marginTop: 6
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
    fontWeight: '600'
  },
  hintText: {
    color: '#4A5568',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '400'
  }
});

export default PersonalDataTab;