// AI-assisted: see docs/AI_LOG.md #5
import React from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView } from 'react-native';

const VehicleTab = ({ vehicleData, setVehicleData, errors }) => {
  const handleChange = (field, value) => {
    let val = value;
    if (field === 'plate') {
      val = value.toUpperCase();
    }
    setVehicleData(prev => ({ ...prev, [field]: val }));
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Datos del Vehiculo</Text>

      <Text style={styles.label}>Placa del vehículo</Text>
      <TextInput
        style={[styles.input, errors.plate && styles.inputError]}
        placeholder="Ej. ABC123"
        value={vehicleData.plate}
        onChangeText={(val) => handleChange('plate', val)}
        autoCapitalize="characters"
        maxLength={6}
      />
      {errors.plate && <Text style={styles.errorText}>{errors.plate}</Text>}

      <Text style={styles.label}>Marca</Text>
      <TextInput
        style={[styles.input, errors.brand && styles.inputError]}
        placeholder="Ej. Chevrolet"
        value={vehicleData.brand}
        onChangeText={(val) => handleChange('brand', val)}
        maxLength={30}
      />
      {errors.brand && <Text style={styles.errorText}>{errors.brand}</Text>}

      <Text style={styles.label}>Modelo</Text>
      <TextInput
        style={[styles.input, errors.model && styles.inputError]}
        placeholder="Ej. Onix"
        value={vehicleData.model}
        onChangeText={(val) => handleChange('model', val)}
        maxLength={30}
      />
      {errors.model && <Text style={styles.errorText}>{errors.model}</Text>}

      <Text style={styles.label}>Año</Text>
      <TextInput
        style={[styles.input, errors.year && styles.inputError]}
        placeholder="Ej. 2022"
        keyboardType="numeric"
        value={vehicleData.year}
        onChangeText={(val) => handleChange('year', val)}
        maxLength={4}
      />
      {errors.year && <Text style={styles.errorText}>{errors.year}</Text>}

      <Text style={styles.label}>Capacidad de pasajeros</Text>
      <TextInput
        style={[styles.input, errors.capacity && styles.inputError]}
        placeholder="Ej. 4 (Minimo 6 si es XL)"
        keyboardType="numeric"
        value={vehicleData.capacity}
        onChangeText={(val) => handleChange('capacity', val)}
      />
      {errors.capacity && <Text style={styles.errorText}>{errors.capacity}</Text>}
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