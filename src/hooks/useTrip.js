// AI-assisted: see docs/AI_LOG.md #20
import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../service/firebase';

export const useTrip = (tripId) => {
  const [trip, setTrip] = useState(null);

  useEffect(() => {
    if (!tripId) {
      setTrip(null);
      return undefined;
    }
    const unsubscribe = onSnapshot(
      doc(db, 'trips', tripId),
      (snap) => setTrip(snap.exists() ? { id: snap.id, ...snap.data() } : null),
      (error) => console.log('useTrip: error escuchando el viaje', error)
    );
    return unsubscribe;
  }, [tripId]);

  return { trip };
};