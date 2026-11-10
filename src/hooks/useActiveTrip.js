// AI-assisted: see docs/AI_LOG.md #20
import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../service/firebase';
import { TRIP_OPEN_STATUSES } from '../service/tripService';

export const useActiveTrip = (driverId) => {
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!driverId) {
      setTrip(null);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    const q = query(
      collection(db, 'trips'),
      where('driverId', '==', driverId),
      where('status', 'in', TRIP_OPEN_STATUSES)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const trips = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        // El más reciente primero (acceptedAt es null un instante mientras llega el serverTimestamp)
        const t = (x) => x.acceptedAt?.toMillis?.() ?? Date.now();
        trips.sort((a, b) => t(b) - t(a));
        setTrip(trips[0] || null);
        setLoading(false);
      },
      (error) => {
        console.log('useActiveTrip: error escuchando el viaje activo', error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [driverId]);

  return { trip, loading };
};