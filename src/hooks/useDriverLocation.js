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

  // Solicitar permisos y obtener ubicación inicial
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permiso denegado',
            'Se requiere acceso a la ubicación para operar como conductor.'
          );
          setHasPermission(false);
          return;
        }
        setHasPermission(true);

        let current = await Location.getLastKnownPositionAsync();
        if (!current) {
          current = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
        }

        if (!cancelled && current) {
          setLocation((prev) => ({
            ...prev,
            latitude: current.coords.latitude,
            longitude: current.coords.longitude,
          }));
        }
      } catch (error) {
        console.log('useDriverLocation: no se pudo obtener la ubicación', error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Seguimiento en tiempo real con función de limpieza
  useEffect(() => {
    let subscription = null;
    let cancelled = false;

    if (isAvailable && driverStatus === 'Aprobado' && hasPermission) {
      (async () => {
        try {
          const sub = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.High,
              timeInterval: 5000,
              distanceInterval: 10,
            },
            (newLocation) => {
              const { latitude, longitude } = newLocation.coords;
              setLocation((prev) => ({ ...prev, latitude, longitude }));
              // Aquí se enviará la coordenada a la base de datos (Firestore)
            }
          );
          if (cancelled) {
            sub.remove();
          } else {
            subscription = sub;
          }
        } catch (error) {
          console.log('useDriverLocation: error en watchPosition', error);
        }
      })();
    }

    return () => {
      cancelled = true;
      if (subscription) {
        subscription.remove();
      }
    };
  }, [isAvailable, driverStatus, hasPermission]);

  return { location, hasPermission };
};