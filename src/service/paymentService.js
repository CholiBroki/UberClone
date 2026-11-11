// AI-assisted: see docs/AI_LOG.md #21
import { auth } from './firebase';
import { API_URL } from '../config/api';

const TIMEOUT_MS = 20000;

const apiError = (code, message) => {
  const error = new Error(message);
  error.code = code;
  return error;
};

async function callApi(path, body) {
  if (!API_URL) {
    throw apiError('NO_API_URL', 'Falta EXPO_PUBLIC_API_URL en el archivo .env de la app.');
  }

  const user = auth.currentUser;
  if (!user) throw apiError('NO_SESSION', 'No hay una sesión iniciada.');

  const token = await user.getIdToken();

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (error) {
    throw apiError(
      'NETWORK',
      'No se pudo conectar con el servidor de pagos. Revisa que el backend esté encendido y que el teléfono esté en la misma red wifi.'
    );
  } finally {
    clearTimeout(timer);
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw apiError('API_ERROR', data.error || `El servidor respondió con el error ${response.status}.`);
  }
  return data;
}

export const createPaymentPreference = (trip) =>
  callApi('/payments/preference', {
    tripId: trip.id,
    amount: Number(trip.fare) + Number(trip.tip || 0),
  });

export const syncPayment = (tripId) => callApi('/payments/sync', { tripId });