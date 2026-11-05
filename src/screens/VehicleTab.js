// AI-assisted: see docs/AI_LOG.md #5
import React from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

const VehicleTab = ({ vehicleData, setVehicleData, errors, touched }) => {
  const handleChange = (field, value) => {
    let val = value;
    if (field === 'plate') {
      val = value.toUpperCase();
    }
    setVehicleData(prev => ({ ...prev, [field]: val }));
  };

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Se necesitan permisos de galería para seleccionar la foto del vehículo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      handleChange('vehiclePhoto', result.assets[0].uri);
    }
  };

  const takeWithCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Se necesitan permisos de cámara para tomar la foto del vehículo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      handleChange('vehiclePhoto', result.assets[0].uri);
    }
  };

  const handleSelectVehiclePhoto = () => {
    Alert.alert(
      'Foto del Vehículo',
      '¿De dónde deseas obtener la foto del carro?',
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
            <Ionicons name="car" size={24} color="#0056D2" />
          </View>
          <Text style={styles.title}>Datos del Vehículo</Text>
        </View>

        {/* Foto del Vehículo con selector */}
        <View style={styles.fieldGroup}>
          <View style={styles.labelRow}>
            <Ionicons name="image-outline" size={18} color="#0056D2" />
            <Text style={styles.label}>Foto del vehículo</Text>
          </View>
          <TouchableOpacity onPress={handleSelectVehiclePhoto} style={styles.vehiclePhotoCard}>
            {vehicleData.vehiclePhoto ? (
              <Image source={{ uri: vehicleData.vehiclePhoto }} style={styles.vehiclePhotoPreview} />
            ) : (
              <View style={styles.vehiclePhotoPlaceholder}>
                <Ionicons name="camera-outline" size={36} color="#0056D2" />
                <Text style={styles.uploadText}>Tomar o elegir foto del carro (Placa visible)</Text>
              </View>
            )}
          </TouchableOpacity>
          {touched.hasSubmitted && errors.vehiclePhoto && (
            <Text style={styles.errorText}>{errors.vehiclePhoto}</Text>
          )}
        </View>

        {/* Categoría */}
        <View style={styles.fieldGroup}>
          <View style={styles.labelRow}>
            <Ionicons name="pricetag-outline" size={18} color="#0056D2" />
            <Text style={styles.label}>Categoría del Vehículo</Text>
          </View>
          <View style={[styles.pickerContainer, touched.hasSubmitted && errors.category && styles.inputError]}>
            <Picker
              selectedValue={vehicleData.category}
              onValueChange={(itemValue) => handleChange('category', itemValue)}
              dropdownIconColor="#0056D2"
            >
              <Picker.Item label="Seleccionar categoría..." value="" color="#A0A0A0" />
              <Picker.Item label="Económico" value="economy" />
              <Picker.Item label="XL" value="xl" />
              <Picker.Item label="Premium" value="premium" />
            </Picker>
          </View>
          {touched.hasSubmitted && errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
        </View>

        {/* Placa */}
        <View style={styles.fieldGroup}>
          <View style={styles.labelRow}>
            <Ionicons name="barcode-outline" size={18} color="#0056D2" />
            <Text style={styles.label}>Placa del vehículo</Text>
          </View>
          <TextInput
            style={[styles.input, touched.hasSubmitted && errors.plate && styles.inputError]}
            placeholder="Ej. ABC123"
            placeholderTextColor="#A0A0A0"
            value={vehicleData.plate}
            onChangeText={(val) => handleChange('plate', val)}
            autoCapitalize="characters"
            maxLength={6}
          />
          {touched.hasSubmitted && errors.plate ? (
            <Text style={styles.errorText}>{errors.plate}</Text>
          ) : (
            <Text style={styles.hintText}>Placa colombiana de 3 letras y 3 números en mayúsculas.</Text>
          )}
        </View>

        {/* Marca */}
        <View style={styles.fieldGroup}>
          <View style={styles.labelRow}>
            <Ionicons name="car-sport-outline" size={18} color="#0056D2" />
            <Text style={styles.label}>Marca</Text>
          </View>
          <TextInput
            style={[styles.input, touched.hasSubmitted && errors.brand && styles.inputError]}
            placeholder="Ej. Chevrolet"
            placeholderTextColor="#A0A0A0"
            value={vehicleData.brand}
            onChangeText={(val) => handleChange('brand', val)}
            maxLength={30}
          />
          {touched.hasSubmitted && errors.brand && <Text style={styles.errorText}>{errors.brand}</Text>}
        </View>

        {/* Modelo */}
        <View style={styles.fieldGroup}>
          <View style={styles.labelRow}>
            <Ionicons name="settings-outline" size={18} color="#0056D2" />
            <Text style={styles.label}>Modelo</Text>
          </View>
          <TextInput
            style={[styles.input, touched.hasSubmitted && errors.model && styles.inputError]}
            placeholder="Ej. Onix"
            placeholderTextColor="#A0A0A0"
            value={vehicleData.model}
            onChangeText={(val) => handleChange('model', val)}
            maxLength={30}
          />
          {touched.hasSubmitted && errors.model && <Text style={styles.errorText}>{errors.model}</Text>}
        </View>

        {/* Año */}
        <View style={styles.fieldGroup}>
          <View style={styles.labelRow}>
            <Ionicons name="calendar-number-outline" size={18} color="#0056D2" />
            <Text style={styles.label}>Año</Text>
          </View>
          <TextInput
            style={[styles.input, touched.hasSubmitted && errors.year && styles.inputError]}
            placeholder="Ej. 2022"
            placeholderTextColor="#A0A0A0"
            keyboardType="numeric"
            value={vehicleData.year}
            onChangeText={(val) => handleChange('year', val)}
            maxLength={4}
          />
          {touched.hasSubmitted && errors.year ? (
            <Text style={styles.errorText}>{errors.year}</Text>
          ) : (
            <Text style={styles.hintText}>Año de fabricación de 4 dígitos (Ej. 2022).</Text>
          )}
        </View>

        {/* Capacidad */}
        <View style={styles.fieldGroup}>
          <View style={styles.labelRow}>
            <Ionicons name="people-outline" size={18} color="#0056D2" />
            <Text style={styles.label}>Capacidad de pasajeros</Text>
          </View>
          <TextInput
            style={[styles.input, touched.hasSubmitted && errors.capacity && styles.inputError]}
            placeholder="Ej. 4 (Mínimo 6 si es XL)"
            placeholderTextColor="#A0A0A0"
            keyboardType="numeric"
            value={vehicleData.capacity}
            onChangeText={(val) => handleChange('capacity', val)}
          />
          {touched.hasSubmitted && errors.capacity && <Text style={styles.errorText}>{errors.capacity}</Text>}
        </View>

        {/* Color */}
        <View style={styles.fieldGroup}>
          <View style={styles.labelRow}>
            <Ionicons name="color-palette-outline" size={18} color="#0056D2" />
            <Text style={styles.label}>Color</Text>
          </View>
          <View style={[styles.pickerContainer, touched.hasSubmitted && errors.color && styles.inputError]}>
            <Picker
              selectedValue={vehicleData.color}
              onValueChange={(itemValue) => handleChange('color', itemValue)}
              dropdownIconColor="#0056D2"
            >
              <Picker.Item label="Seleccionar color..." value="" color="#A0A0A0" />
              <Picker.Item label="Blanco" value="Blanco" />
              <Picker.Item label="Negro" value="Negro" />
              <Picker.Item label="Gris" value="Gris" />
              <Picker.Item label="Rojo" value="Rojo" />
              <Picker.Item label="Azul" value="Azul" />
              <Picker.Item label="Plata" value="Plata" />
            </Picker>
          </View>
          {touched.hasSubmitted && errors.color && <Text style={styles.errorText}>{errors.color}</Text>}
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
  vehiclePhotoCard: {
    height: 140,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center'
  },
  vehiclePhotoPreview: {
    width: '100%',
    height: '100%'
  },
  vehiclePhotoPlaceholder: {
    alignItems: 'center'
  },
  uploadText: {
    color: '#0056D2',
    fontSize: 13,
    fontWeight: '600',
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

export default VehicleTab;