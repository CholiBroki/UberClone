// AI-assisted: see docs/AI_LOG.md #12
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { Alert } from 'react-native';

export const useDriverLocation = (isAvailable, driverStatus) => {
  const [location, setLocation] = useState({
    latitude: 6.2442,
    longitude: -75.5812,
    latitudeDelta: 0.015,
    longitudeDelta: 0.015,
  });
  const [hasPermission, setHasPermission] = useState(false);

  // Solicitar permisos de ubicación
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Se requiere acceso a la ubicación para operar como conductor.');
        setHasPermission(false);
        return;
      }
      setHasPermission(true);

      let currentLoc = await Location.getCurrentPositionAsync({});
      setLocation(prev => ({
        ...prev,
        latitude: currentLoc.coords.latitude,
        longitude: currentLoc.coords.longitude,
      }));
    })();
  }, []);

  // Seguimiento en tiempo real con limpieza limpia de useEffect
  useEffect(() => {
    let subscription = null;

    if (isAvailable && driverStatus === 'Aprobado' && hasPermission) {
      console.log('useDriverLocation: Enviando ubicación en tiempo real...');
      (async () => {
        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 5000,
            distanceInterval: 10,
          },
          (newLocation) => {
            const { latitude, longitude } = newLocation.coords;
            setLocation(prev => ({ ...prev, latitude, longitude }));
            // Aquí se enviará la coordenada a la base de datos (Firestore / REST API)
          }
        );
      })();
    }

    return () => {
      if (subscription) {
        console.log('useDriverLocation: Deteniendo seguimiento de ubicación (Limpieza useEffect)...');
        subscription.remove();
      }
    };
  }, [isAvailable, driverStatus, hasPermission]);

  return { location, hasPermission };
};