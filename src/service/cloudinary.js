// AI-assisted: see docs/AI_LOG.md #16
import * as FileSystem from 'expo-file-system/legacy';

const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || 'bgorkhcq';
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'uber_preset';

export const uploadToCloudinary = async (fileUri, isPdf = false) => {
  if (!fileUri) return null;

  // Si ya es una URL pública (http/https), la retornamos directamente
  if (typeof fileUri === 'string' && (fileUri.startsWith('http://') || fileUri.startsWith('https://'))) {
    return fileUri;
  }

  // Extraer la URI limpia si viene en un objeto { uri, name, ... }
  const cleanUri = typeof fileUri === 'object' && fileUri.uri ? fileUri.uri : fileUri;

  try {
    // 1. Leer el archivo en Base64 mediante el módulo legacy de Expo SDK 54+
    const base64Data = await FileSystem.readAsStringAsync(cleanUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const mimeType = isPdf ? 'application/pdf' : 'image/jpeg';
    const fileBase64Uri = `data:${mimeType};base64,${base64Data}`;

    // 2. Construir el FormData con la cadena Base64 Data URI
    const formData = new FormData();
    formData.append('file', fileBase64Uri);
    formData.append('upload_preset', UPLOAD_PRESET);

    // 3. Petición POST a Cloudinary
    const resourceType = isPdf ? 'raw' : 'image';
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await response.json();

    if (data.secure_url) {
      return data.secure_url;
    } else {
      console.error('Error devuelto por Cloudinary:', data);
      throw new Error(data.error?.message || 'Error al subir archivo a Cloudinary');
    }
  } catch (error) {
    console.error('Error en uploadToCloudinary:', error);
    throw error;
  }
};