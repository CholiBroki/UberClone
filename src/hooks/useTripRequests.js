// AI-assisted: see docs/AI_LOG.md #19
import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../service/firebase';

export const useTripRequests = (driverId, enabled) => {
  const [request, setRequest] = useState(null);

  useEffect(() => {
    if (!driverId || !enabled) {
      setRequest(null);
      return undefined;
    }

    const q = query(
      collection(db, 'trips'),
      where('status', '==', 'requested'),
      where('offeredTo', '==', driverId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const trips = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        trips.sort((a, b) => (a.createdAt?.toMillis?.() ?? 0) - (b.createdAt?.toMillis?.() ?? 0));
        setRequest(trips[0] || null);
      },
      (error) => {
        console.log('useTripRequests: error escuchando trips', error);
      }
    );

    return unsubscribe;
  }, [driverId, enabled]);

  return { request };
};