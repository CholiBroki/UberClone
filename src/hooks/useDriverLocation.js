// AI-assisted: see docs/AI_LOG.md #12 #19 #20
import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { Alert } from 'react-native';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../service/firebase';

const MIN_WRITE_INTERVAL_MS = 4000; 

export const useDriverLocation = (isAvailable, driverStatus, driverId, options = {}) => {
  const { markAvailable = true } = options;
  const [location, setLocation] = useState({
    latitude: 6.2442,
    longitude: -75.5812,
    latitudeDelta: 0.015,
    longitudeDelta: 0.015,
  });
  const [hasPermission, setHasPermission] = useState(false);
  const lastWriteRef = useRef(0);

  const online = isAvailable && driverStatus === 'Aprobado' && !!driverId;

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

  useEffect(() => {
    if (!online || !markAvailable) return undefined;

    const ref = doc(db, 'drivers', driverId);
    updateDoc(ref, { isAvailable: true }).catch((e) =>
      console.log('useDriverLocation: no se pudo marcar disponible', e)
    );

    return () => {
      if (auth.currentUser?.uid !== driverId) return;
      updateDoc(ref, { isAvailable: false }).catch((e) =>
        console.log('useDriverLocation: no se pudo marcar no disponible', e)
      );
    };
  }, [online, markAvailable, driverId]);

  useEffect(() => {
    let subscription = null;
    let cancelled = false;

    if (online && hasPermission) {
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

              const now = Date.now();
              if (now - lastWriteRef.current < MIN_WRITE_INTERVAL_MS) return;
              lastWriteRef.current = now;

              updateDoc(doc(db, 'drivers', driverId), {
                location: { latitude, longitude },
                locationUpdatedAt: serverTimestamp(),
              }).catch((e) => console.log('useDriverLocation: error enviando ubicación', e));
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
  }, [online, hasPermission, driverId]);

  return { location, hasPermission };
};