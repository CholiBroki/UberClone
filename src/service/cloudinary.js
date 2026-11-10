// AI-assisted: see docs/AI_LOG.md #15 #16
import * as FileSystem from 'expo-file-system/legacy';

const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export const uploadToCloudinary = async (fileInput, isPdf = false) => {
  if (!fileInput) return null;

  // Acepta una URI (string) o un objeto { uri, name, isPdf }
  const uri = typeof fileInput === 'object' && fileInput.uri ? fileInput.uri : fileInput;
  if (typeof uri !== 'string') return null;

  // Si ya es una URL pública, no hay nada que subir
  if (uri.startsWith('http://') || uri.startsWith('https://')) return uri;

  const pdf = isPdf || fileInput?.isPdf === true || uri.toLowerCase().endsWith('.pdf');

  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error('Faltan EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME o EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET en el .env');
  }

  // Verificar que el archivo todavía existe antes de subirlo
  const info = await FileSystem.getInfoAsync(uri);
  if (!info.exists) {
    const err = new Error('El archivo seleccionado ya no está disponible. Vuelve a seleccionarlo.');
    err.code = 'FILE_NOT_FOUND';
    throw err;
  }

  try {
    // uploadAsync sube el archivo con una petición nativa multipart: no usa
    // FormData (que falla en el fetch nuevo de Expo) ni carga el archivo en Base64.
    const resourceType = pdf ? 'raw' : 'image';
    const result = await FileSystem.uploadAsync(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`,
      uri,
      {
        httpMethod: 'POST',
        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
        fieldName: 'file',
        mimeType: pdf ? 'application/pdf' : 'image/jpeg',
        parameters: { upload_preset: UPLOAD_PRESET },
      }
    );

    let data = {};
    try {
      data = JSON.parse(result.body);
    } catch (e) {
      throw new Error(`Respuesta inesperada de Cloudinary (HTTP ${result.status})`);
    }

    if (data.secure_url) return data.secure_url;

    console.log('Error devuelto por Cloudinary:', data);
    throw new Error(data.error?.message || 'Error al subir archivo a Cloudinary');
  } catch (error) {
    console.log('Error en uploadToCloudinary:', error);
    throw error;
  }
};