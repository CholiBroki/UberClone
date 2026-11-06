// AI-assisted: see docs/AI_LOG.md #9
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';

const DocumentsTab = ({ docsData, setDocsData, errors, touched, vehicleYear }) => {
  const [activeDatePicker, setActiveDatePicker] = useState(null);

  const currentYear = new Date().getFullYear();
  const vYear = parseInt(vehicleYear) || currentYear;
  const isTechnoExempt = (currentYear - vYear) <= 5;

  const handleChange = (field, value) => {
    setDocsData(prev => ({ ...prev, [field]: value }));
  };

  const handleDateSelect = (event, selectedDate) => {
    const fieldKey = activeDatePicker;
    setActiveDatePicker(Platform.OS === 'ios' ? fieldKey : null);

    if (selectedDate && fieldKey) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      if (fieldKey === 'license') handleChange('licenseExpiry', formattedDate);
      if (fieldKey === 'soat') handleChange('soatExpiry', formattedDate);
      if (fieldKey === 'techno') handleChange('technoExpiry', formattedDate);
    }
  };

  const handlePhotoUpload = (field, title) => {
    const currentVal = docsData[field];

    const pickGallery = async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') return Alert.alert('Permiso denegado', 'Se necesita acceso a la galería.');
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 0.7 });
      if (!result.canceled && result.assets?.[0]?.uri) handleChange(field, result.assets[0].uri);
    };

    const takeCamera = async () => {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') return Alert.alert('Permiso denegado', 'Se necesita acceso a la cámara.');
      const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.7 });
      if (!result.canceled && result.assets?.[0]?.uri) handleChange(field, result.assets[0].uri);
    };

    const options = [
      { text: 'Tomar foto (Cámara)', onPress: takeCamera },
      { text: 'Elegir de Galería', onPress: pickGallery },
    ];

    if (currentVal) {
      options.push({ text: 'Eliminar archivo', onPress: () => handleChange(field, null) });
    }

    options.push({ text: 'Cancelar', onPress: () => {} });

    Alert.alert(title, 'Selecciona una opción:', options,
        { cancelable: true }
    );
    
  };

  const handleDocOrPdfUpload = (field, title) => {
    const currentVal = docsData[field];

    const pickPDF = async () => {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf', copyToCacheDirectory: true });
      if (!result.canceled && result.assets?.[0]?.uri) {
        handleChange(field, { uri: result.assets[0].uri, name: result.assets[0].name || 'Documento.pdf', isPdf: true });
      }
    };

    const pickImage = async () => {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 0.7 });
      if (!result.canceled && result.assets?.[0]?.uri) {
        handleChange(field, { uri: result.assets[0].uri, isPdf: false });
      }
    };

    const takeCamera = async () => {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') return Alert.alert('Permiso denegado', 'Se necesita cámara.');
      const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.7 });
      if (!result.canceled && result.assets?.[0]?.uri) {
        handleChange(field, { uri: result.assets[0].uri, isPdf: false });
      }
    };

    const options = [
      { text: 'Tomar foto (Cámara)', onPress: takeCamera },
      { text: 'Elegir Imagen (Galería)', onPress: pickImage },
      { text: 'Cargar documento (PDF)', onPress: pickPDF },
    ];

    if (currentVal) {
      options.push({ text: 'Eliminar documento', onPress: () => handleChange(field, null) });
    }

    options.push({ text: 'Cancelar', onPress: () => {} });

    Alert.alert(title, 'Selecciona el formato a cargar:', options,
        { cancelable: true }
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.iconBadge}>
            <Ionicons name="document-text" size={24} color="#0056D2" />
          </View>
          <Text style={styles.title}>Documentos y Pago</Text>
        </View>

        {/* 1. Licencia */}
        <Text style={styles.sectionHeader}>1. Licencia de Conducción</Text>
        
        <View style={styles.fieldGroup}>
          <View style={styles.labelRow}>
            <Ionicons name="key-outline" size={18} color="#0056D2" />
            <Text style={styles.label}>Número de Licencia</Text>
          </View>
          <TextInput
            style={[styles.input, touched.hasSubmitted && errors.licenseNumber && styles.inputError]}
            placeholder="Ej. 1063189230"
            placeholderTextColor="#A0A0A0"
            keyboardType="numeric"
            value={docsData.licenseNumber}
            onChangeText={(val) => handleChange('licenseNumber', val)}
          />
          {touched.hasSubmitted && errors.licenseNumber && <Text style={styles.errorText}>{errors.licenseNumber}</Text>}
        </View>

        <View style={styles.dualRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.subLabel}>Lado Frontal</Text>
            <TouchableOpacity onPress={() => handlePhotoUpload('licenseFront', 'Licencia (Frontal)')} style={styles.docBoxSmall}>
              {docsData.licenseFront ? (
                <Image source={{ uri: docsData.licenseFront }} style={styles.docPreview} />
              ) : (
                <Ionicons name="camera-outline" size={26} color="#0056D2" />
              )}
            </TouchableOpacity>
            {touched.hasSubmitted && errors.licenseFront && <Text style={styles.errorText}>{errors.licenseFront}</Text>}
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.subLabel}>Lado Posterior</Text>
            <TouchableOpacity onPress={() => handlePhotoUpload('licenseBack', 'Licencia (Posterior)')} style={styles.docBoxSmall}>
              {docsData.licenseBack ? (
                <Image source={{ uri: docsData.licenseBack }} style={styles.docPreview} />
              ) : (
                <Ionicons name="camera-outline" size={26} color="#0056D2" />
              )}
            </TouchableOpacity>
            {touched.hasSubmitted && errors.licenseBack && <Text style={styles.errorText}>{errors.licenseBack}</Text>}
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <View style={styles.labelRow}>
            <Ionicons name="calendar-outline" size={18} color="#0056D2" />
            <Text style={styles.label}>Vencimiento de Licencia</Text>
          </View>
          <TouchableOpacity onPress={() => setActiveDatePicker('license')} style={[styles.input, styles.dateButton, touched.hasSubmitted && errors.licenseExpiry && styles.inputError]}>
            <Text style={{ color: docsData.licenseExpiry ? '#0A2540' : '#A0A0A0' }}>
              {docsData.licenseExpiry || 'Seleccionar fecha posterior a hoy...'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#A0A0A0" />
          </TouchableOpacity>
          {touched.hasSubmitted && errors.licenseExpiry && <Text style={styles.errorText}>{errors.licenseExpiry}</Text>}
        </View>

        {/* 2. SOAT */}
        <Text style={styles.sectionHeader}>2. Documento SOAT</Text>
        <View style={styles.fieldGroup}>
          <View style={styles.labelRow}>
            <Ionicons name="shield-checkmark-outline" size={18} color="#0056D2" />
            <Text style={styles.label}>Carga de SOAT (Foto o PDF)</Text>
          </View>
          <TouchableOpacity onPress={() => handleDocOrPdfUpload('soatFile', 'Documento SOAT')} style={styles.docBoxLarge}>
            {docsData.soatFile ? (
              docsData.soatFile.isPdf ? (
                <View style={styles.pdfBadge}>
                  <Ionicons name="document-text" size={32} color="#D32F2F" />
                  <Text style={styles.pdfText}>{docsData.soatFile.name}</Text>
                </View>
              ) : (
                <Image source={{ uri: docsData.soatFile.uri }} style={styles.docPreview} />
              )
            ) : (
              <View style={styles.uploadPlaceholder}>
                <Ionicons name="cloud-upload-outline" size={32} color="#0056D2" />
                <Text style={styles.uploadText}>Cargar Foto o PDF del SOAT</Text>
              </View>
            )}
          </TouchableOpacity>
          {touched.hasSubmitted && errors.soatFile && <Text style={styles.errorText}>{errors.soatFile}</Text>}
        </View>

        <View style={styles.fieldGroup}>
          <View style={styles.labelRow}>
            <Ionicons name="calendar-outline" size={18} color="#0056D2" />
            <Text style={styles.label}>Vencimiento del SOAT</Text>
          </View>
          <TouchableOpacity onPress={() => setActiveDatePicker('soat')} style={[styles.input, styles.dateButton, touched.hasSubmitted && errors.soatExpiry && styles.inputError]}>
            <Text style={{ color: docsData.soatExpiry ? '#0A2540' : '#A0A0A0' }}>
              {docsData.soatExpiry || 'Seleccionar fecha posterior a hoy...'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#A0A0A0" />
          </TouchableOpacity>
          {touched.hasSubmitted && errors.soatExpiry && <Text style={styles.errorText}>{errors.soatExpiry}</Text>}
        </View>

        {/* 3. Técnico-Mecánica */}
        <Text style={styles.sectionHeader}>3. Revisión Técnico-Mecánica</Text>
        {isTechnoExempt ? (
          <View style={styles.exemptBadge}>
            <Ionicons name="checkmark-circle-outline" size={22} color="#2E7D32" />
            <Text style={styles.exemptText}>
              Vehículo exento de revisión técnico-mecánica por ser modelo reciente ({vehicleYear || currentYear}).
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Ionicons name="construct-outline" size={18} color="#0056D2" />
                <Text style={styles.label}>Certificado Técnico-Mecánico (Foto o PDF)</Text>
              </View>
              <TouchableOpacity onPress={() => handleDocOrPdfUpload('technoFile', 'Revisión Técnico-Mecánica')} style={styles.docBoxLarge}>
                {docsData.technoFile ? (
                  docsData.technoFile.isPdf ? (
                    <View style={styles.pdfBadge}>
                      <Ionicons name="document-text" size={32} color="#D32F2F" />
                      <Text style={styles.pdfText}>{docsData.technoFile.name}</Text>
                    </View>
                  ) : (
                    <Image source={{ uri: docsData.technoFile.uri }} style={styles.docPreview} />
                  )
                ) : (
                  <View style={styles.uploadPlaceholder}>
                    <Ionicons name="cloud-upload-outline" size={32} color="#0056D2" />
                    <Text style={styles.uploadText}>Cargar Foto o PDF técnico-mecánico</Text>
                  </View>
                )}
              </TouchableOpacity>
              {touched.hasSubmitted && errors.technoFile && <Text style={styles.errorText}>{errors.technoFile}</Text>}
            </View>

            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Ionicons name="calendar-outline" size={18} color="#0056D2" />
                <Text style={styles.label}>Vencimiento de Técnico-Mecánica</Text>
              </View>
              <TouchableOpacity onPress={() => setActiveDatePicker('techno')} style={[styles.input, styles.dateButton, touched.hasSubmitted && errors.technoExpiry && styles.inputError]}>
                <Text style={{ color: docsData.technoExpiry ? '#0A2540' : '#A0A0A0' }}>
                  {docsData.technoExpiry || 'Seleccionar fecha posterior a hoy...'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#A0A0A0" />
              </TouchableOpacity>
              {touched.hasSubmitted && errors.technoExpiry && <Text style={styles.errorText}>{errors.technoExpiry}</Text>}
            </View>
          </>
        )}

        {/* 4. Mercado Pago y Términos */}
        <Text style={styles.sectionHeader}>4. Cuenta de Cobro y Términos</Text>
        <View style={styles.fieldGroup}>
          <View style={styles.labelRow}>
            <Ionicons name="card-outline" size={18} color="#0056D2" />
            <Text style={styles.label}>Correo de Mercado Pago</Text>
          </View>
          <TextInput
            style={[styles.input, touched.hasSubmitted && errors.mpEmail && styles.inputError]}
            placeholder="mercadopago@ejemplo.com"
            placeholderTextColor="#A0A0A0"
            keyboardType="email-address"
            autoCapitalize="none"
            value={docsData.mpEmail}
            onChangeText={(val) => handleChange('mpEmail', val)}
          />
          {touched.hasSubmitted && errors.mpEmail && <Text style={styles.errorText}>{errors.mpEmail}</Text>}
        </View>

        <View style={styles.commissionBox}>
          <Ionicons name="information-circle-outline" size={20} color="#0056D2" />
          <View style={{ flex: 1 }}>
            <Text style={styles.commissionTitle}>Comisión de la Plataforma</Text>
            <Text style={styles.commissionText}>
              Se aplicará una tarifa del <Text style={{ fontWeight: 'bold' }}>15%</Text> por cada servicio realizado. La liquidación se efectuará a través de Mercado Pago.
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.termsRow} 
          onPress={() => handleChange('acceptedTerms', !docsData.acceptedTerms)}
        >
          <Ionicons name={docsData.acceptedTerms ? "checkbox" : "square-outline"} size={24} color={docsData.acceptedTerms ? "#0056D2" : "#A0A0A0"} />
          <Text style={styles.termsText}>
            Acepto los <Text style={styles.linkText}>Términos y Condiciones</Text> del servicio de conductor.
          </Text>
        </TouchableOpacity>
        {touched.hasSubmitted && errors.acceptedTerms && <Text style={styles.errorText}>{errors.acceptedTerms}</Text>}
      </View>

      {activeDatePicker && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={handleDateSelect}
        />
      )}
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
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0056D2',
    marginTop: 14,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 4
  },
  fieldGroup: {
    marginBottom: 14
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
  subLabel: {
    fontSize: 12,
    color: '#4A5568',
    marginBottom: 4,
    fontWeight: '600'
  },
  dualRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14
  },
  docBoxSmall: {
    height: 90,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden'
  },
  docBoxLarge: {
    height: 110,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden'
  },
  docPreview: {
    width: '100%',
    height: '100%'
  },
  uploadPlaceholder: {
    alignItems: 'center'
  },
  uploadText: {
    color: '#0056D2',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4
  },
  pdfBadge: {
    alignItems: 'center',
    padding: 8
  },
  pdfText: {
    fontSize: 11,
    color: '#2D3748',
    marginTop: 2,
    textAlign: 'center'
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
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
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
  exemptBadge: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 14
  },
  exemptText: {
    flex: 1,
    fontSize: 12,
    color: '#1B5E20',
    fontWeight: '500'
  },
  commissionBox: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#EBF3FF',
    padding: 14,
    borderRadius: 14,
    marginVertical: 10,
    alignItems: 'flex-start'
  },
  commissionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0056D2',
    marginBottom: 2
  },
  commissionText: {
    fontSize: 12,
    color: '#2D3748',
    lineHeight: 16
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    color: '#2D3748'
  },
  linkText: {
    color: '#0056D2',
    fontWeight: 'bold'
  }
});

export default DocumentsTab;