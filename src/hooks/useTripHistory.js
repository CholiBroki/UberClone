// AI-assisted: see docs/AI_LOG.md #23
import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchHistoryPage } from '../service/historyService';

export const useTripHistory = ({ driverId, fromMs, toMs, paymentMethod = 'all' }) => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState(null);

  const cursorRef = useRef(null);
  const requestRef = useRef(0); 

  const fetchPage = useCallback(
    async (reset) => {
      const requestId = ++requestRef.current;

      if (!driverId || fromMs == null || toMs == null) {
        cursorRef.current = null;
        setTrips([]);
        setHasMore(false);
        setError(null);
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
        return;
      }

      if (reset) cursorRef.current = null;

      try {
        const page = await fetchHistoryPage({
          driverId,
          fromMs,
          toMs,
          paymentMethod,
          cursor: cursorRef.current,
        });
        if (requestId !== requestRef.current) return;

        if (page.lastDoc) cursorRef.current = page.lastDoc;
        setTrips((prev) => (reset ? page.trips : [...prev, ...page.trips]));
        setHasMore(page.hasMore);
        setError(null);
      } catch (err) {
        if (requestId !== requestRef.current) return;
        console.log('useTripHistory: error cargando el historial', err);
        setError(err);
        if (reset) {
          setTrips([]);
          setHasMore(false);
        }
      } finally {
        if (requestId === requestRef.current) {
          setLoading(false);
          setLoadingMore(false);
          setRefreshing(false);
        }
      }
    },
    [driverId, fromMs, toMs, paymentMethod]
  );

  useEffect(() => {
    setLoading(true);
    setTrips([]);
    fetchPage(true);
  }, [fetchPage]);

  const loadMore = useCallback(() => {
    if (loading || loadingMore || refreshing || !hasMore) return;
    setLoadingMore(true);
    fetchPage(false);
  }, [loading, loadingMore, refreshing, hasMore, fetchPage]);

  const refresh = useCallback(() => {
    setRefreshing(true);
    fetchPage(true);
  }, [fetchPage]);

  return { trips, loading, loadingMore, refreshing, hasMore, error, loadMore, refresh };
};