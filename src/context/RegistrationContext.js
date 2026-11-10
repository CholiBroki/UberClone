// AI-assisted: see docs/AI_LOG.md #18
import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { Alert } from 'react-native';
import { useAuth } from './AuthContext';
import { uploadToCloudinary } from '../service/cloudinary';
import {
  validatePersonalData,
  validateVehicleData,
  validateDocumentsData,
} from '../utils/validators';

const RegistrationContext = createContext(null);

const initialPersonal = {
  profilePhoto: null,
  fullName: '',
  idNumber: '',
  phone: '',
  email: '',
  password: '',
  birthDate: '',
  gender: '',
  language: 'Español',
};

const initialVehicle = {
  vehiclePhoto: null,
  category: '',
  plate: '',
  brand: '',
  model: '',
  year: '',
  color: '',
  capacity: '',
};

const initialDocs = {
  licenseFront: null,
  licenseBack: null,
  licenseNumber: '',
  licenseExpiry: '',
  soatFile: null,
  soatExpiry: '',
  technoFile: null,
  technoExpiry: '',
  mpEmail: '',
  acceptedTerms: false,
};

export function RegistrationProvider({ children }) {
  const { registerDriver } = useAuth();

  const [personalData, setPersonalData] = useState(initialPersonal);
  const [vehicleData, setVehicleData] = useState(initialVehicle);
  const [docsData, setDocsData] = useState(initialDocs);
  const [submitted, setSubmitted] = useState({ 1: false, 2: false, 3: false });
  const [loading, setLoading] = useState(false);

  const errors = useMemo(
    () => ({
      personal: validatePersonalData(personalData),
      vehicle: validateVehicleData(vehicleData),
      docs: validateDocumentsData(docsData, vehicleData.year),
    }),
    [personalData, vehicleData, docsData]
  );

  const validity = useMemo(
    () => ({
      personal: Object.keys(errors.personal).length === 0,
      vehicle: Object.keys(errors.vehicle).length === 0,
      docs: Object.keys(errors.docs).length === 0,
    }),
    [errors]
  );

  const markSubmitted = useCallback((step) => {
    setSubmitted((prev) => ({ ...prev, [step]: true }));
  }, []);

  const submit = useCallback(async () => {
    try {
      setLoading(true);

      // 1. Subir archivos a Cloudinary
      const profilePhotoUrl = await uploadToCloudinary(personalData.profilePhoto);
      const vehiclePhotoUrl = await uploadToCloudinary(vehicleData.vehiclePhoto);
      const licenseFrontUrl = await uploadToCloudinary(docsData.licenseFront);
      const licenseBackUrl = await uploadToCloudinary(docsData.licenseBack);

      const soatUri = docsData.soatFile?.uri || docsData.soatFile;
      const soatUrl = await uploadToCloudinary(soatUri, docsData.soatFile?.isPdf);

      let technoUrl = null;
      if (docsData.technoFile) {
        const technoUri = docsData.technoFile?.uri || docsData.technoFile;
        technoUrl = await uploadToCloudinary(technoUri, docsData.technoFile?.isPdf);
      }

      // 2. Crear la cuenta en Firebase Auth + perfil en drivers/{uid}.
      //    La contraseña no se guarda en Firestore: la maneja Firebase Auth.
      const { password, ...personalWithoutPassword } = personalData;
      await registerDriver(personalData.email, password, {
        ...personalWithoutPassword,
        fullName: personalData.fullName.trim(),
        profilePhoto: profilePhotoUrl,
        vehicle: {
          ...vehicleData,
          brand: vehicleData.brand.trim(),
          model: vehicleData.model.trim(),
          plate: vehicleData.plate.trim().toUpperCase(),
          year: Number(vehicleData.year),
          capacity: Number(vehicleData.capacity),
          vehiclePhoto: vehiclePhotoUrl,
        },
        documents: {
          ...docsData,
          licenseNumber: docsData.licenseNumber.trim(),
          licenseFront: licenseFrontUrl,
          licenseBack: licenseBackUrl,
          soatFile: soatUrl,
          technoFile: technoUrl,
          technoExpiry: docsData.technoExpiry || null,
        },
      });

      setLoading(false);
      Alert.alert(
        '¡Registro Completado!',
        'Tu solicitud ha sido enviada con éxito. Las imágenes y documentos fueron subidos a la nube y tu cuenta está en revisión.',
        [{ text: 'Aceptar' }]
      );
    } catch (error) {
      setLoading(false);
      console.log('Error al guardar o subir archivos:', error);
      if (error.code === 'auth/email-already-in-use') {
        Alert.alert('Correo en uso', 'Ya existe una cuenta con ese correo. Inicia sesión o usa otro correo.');
      } else if (error.code === 'auth/weak-password') {
        Alert.alert('Contraseña débil', 'Elige una contraseña más segura.');
      } else if (error.code === 'FILE_NOT_FOUND') {
        Alert.alert('Archivo no disponible', error.message);
      } else {
        Alert.alert('Error', 'No se pudo completar el registro ni la carga de archivos. Intenta de nuevo.');
      }
    }
  }, [personalData, vehicleData, docsData, registerDriver]);

  const value = useMemo(
    () => ({
      personalData, setPersonalData,
      vehicleData, setVehicleData,
      docsData, setDocsData,
      errors, validity,
      submitted, markSubmitted,
      loading, submit,
    }),
    [personalData, vehicleData, docsData, errors, validity, submitted, markSubmitted, loading, submit]
  );

  return <RegistrationContext.Provider value={value}>{children}</RegistrationContext.Provider>;
}

export const useRegistration = () => {
  const ctx = useContext(RegistrationContext);
  if (!ctx) throw new Error('useRegistration debe usarse dentro de <RegistrationProvider>');
  return ctx;
};