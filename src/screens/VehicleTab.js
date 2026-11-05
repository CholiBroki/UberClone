// AI-assisted: see docs/AI_LOG.md #5
import React from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const VehicleTab = ({ vehicleData, setVehicleData, errors, touched }) => {
  const handleChange = (field, value) => {
    let val = value;
    if (field === 'plate') {
      val = value.toUpperCase();
    }
    setVehicleData(prev => ({ ...prev, [field]: val }));
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Datos del Vehículo</Text>

      {/* Lista Desplegable: Categoría */}
      <Text style={styles.label}>Categoría del Vehículo</Text>
      <View style={[styles.pickerContainer, touched.category && errors.category && styles.inputError]}>
        <Picker
          selectedValue={vehicleData.category}
          onValueChange={(itemValue) => handleChange('category', itemValue)}
        >
          <Picker.Item label="Económico" value="economy" />
          <Picker.Item label="XL" value="xl" />
          <Picker.Item label="Premium" value="premium" />
        </Picker>
      </View>

      <Text style={styles.label}>Placa del vehículo</Text>
      <TextInput
        style={[styles.input, touched.plate && errors.plate && styles.inputError]}
        placeholder="Ej. ABC123"
        value={vehicleData.plate}
        onChangeText={(val) => handleChange('plate', val)}
        autoCapitalize="characters"
        maxLength={6}
      />
      {touched.plate && errors.plate && <Text style={styles.errorText}>{errors.plate}</Text>}

      <Text style={styles.label}>Marca</Text>
      <TextInput
        style={[styles.input, touched.brand && errors.brand && styles.inputError]}
        placeholder="Ej. Chevrolet"
        value={vehicleData.brand}
        onChangeText={(val) => handleChange('brand', val)}
        maxLength={30}
      />
      {touched.brand && errors.brand && <Text style={styles.errorText}>{errors.brand}</Text>}

      <Text style={styles.label}>Modelo</Text>
      <TextInput
        style={[styles.input, touched.model && errors.model && styles.inputError]}
        placeholder="Ej. Onix"
        value={vehicleData.model}
        onChangeText={(val) => handleChange('model', val)}
        maxLength={30}
      />
      {touched.model && errors.model && <Text style={styles.errorText}>{errors.model}</Text>}

      <Text style={styles.label}>Año</Text>
      <TextInput
        style={[styles.input, touched.year && errors.year && styles.inputError]}
        placeholder="Ej. 2022"
        keyboardType="numeric"
        value={vehicleData.year}
        onChangeText={(val) => handleChange('year', val)}
        maxLength={4}
      />
      {touched.year && errors.year && <Text style={styles.errorText}>{errors.year}</Text>}

      <Text style={styles.label}>Capacidad de pasajeros</Text>
      <TextInput
        style={[styles.input, touched.capacity && errors.capacity && styles.inputError]}
        placeholder="Ej. 4 (Mínimo 6 si es XL)"
        keyboardType="numeric"
        value={vehicleData.capacity}
        onChangeText={(val) => handleChange('capacity', val)}
      />
      {touched.capacity && errors.capacity && <Text style={styles.errorText}>{errors.capacity}</Text>}

      {/* Lista Desplegable: Color */}
      <Text style={styles.label}>Color</Text>
      <View style={[styles.pickerContainer, touched.color && errors.color && styles.inputError]}>
        <Picker
          selectedValue={vehicleData.color}
          onValueChange={(itemValue) => handleChange('color', itemValue)}
        >
          <Picker.Item label="Blanco" value="Blanco" />
          <Picker.Item label="Negro" value="Negro" />
          <Picker.Item label="Gris" value="Gris" />
          <Picker.Item label="Rojo" value="Rojo" />
          <Picker.Item label="Azul" value="Azul" />
        </Picker>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FAF9F6'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1A1A1A'
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginTop: 10,
    marginBottom: 4
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    backgroundColor: '#FFFFFF'
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center'
  },
  inputError: {
    borderColor: '#D32F2F'
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 12,
    marginTop: 3
  }
});

export default VehicleTab;