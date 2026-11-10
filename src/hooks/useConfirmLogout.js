// AI-assisted: see docs/AI_LOG.md #17
import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';

// Pregunta y cierra sesión. Al salir, el último estado de disponibilidad
// vuelve a "No disponible" para que el siguiente inicio no arranque en línea.
export const useConfirmLogout = () => {
  const { logout } = useAuth();
  const { t, setLastAvailability } = usePreferences();

  return useCallback(() => {
    Alert.alert(t('logoutTitle'), t('logoutMessage'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('logout'),
        style: 'destructive',
        onPress: async () => {
          await setLastAvailability(false);
          await logout();
        },
      },
    ]);
  }, [logout, setLastAvailability, t]);
};