// AI-assisted: see docs/AI_LOG.md #22
import { useState, useEffect, useMemo } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../service/firebase';
import { periodRanges, filterFrom, summarize, computeBalance } from '../utils/earnings';

export const useEarnings = (driverId) => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dayKey, setDayKey] = useState(() => new Date().toDateString());

  useEffect(() => {
    if (!driverId) {
      setTrips([]);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    const q = query(
      collection(db, 'trips'),
      where('driverId', '==', driverId),
      where('status', '==', 'paid')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setTrips(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
        setError(null);
        setLoading(false);
      },
      (err) => {
        console.log('useEarnings: error escuchando los viajes pagados', err);
        setError(err);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [driverId]);

  useEffect(() => {
    const id = setInterval(() => {
      const key = new Date().toDateString();
      setDayKey((prev) => (prev === key ? prev : key));
    }, 60000);
    return () => clearInterval(id);
  }, []);

  const summary = useMemo(() => {
    const ranges = periodRanges(new Date());
    return {
      today: summarize(filterFrom(trips, ranges.today)),
      week: summarize(filterFrom(trips, ranges.week)),
      month: summarize(filterFrom(trips, ranges.month)),
    };
  }, [trips, dayKey]);

  const balance = useMemo(() => computeBalance(trips), [trips]);

  return { ...summary, balance, loading, error };
};