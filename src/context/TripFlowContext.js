// AI-assisted: see docs/AI_LOG.md #20
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { useActiveTrip } from '../hooks/useActiveTrip';
import { TRIP_ACTIVE_STATUSES } from '../service/tripService';

const TripFlowContext = createContext(null);

export function TripFlowProvider({ children }) {
  const { driver } = useAuth();
  const { trip, loading } = useActiveTrip(driver?.id);

  const [summaryTripId, setSummaryTripId] = useState(null);
  const [dismissedId, setDismissedId] = useState(null);

  const completedId = trip?.status === 'completed' && trip.id !== dismissedId ? trip.id : null;

  useEffect(() => {
    if (completedId) setSummaryTripId(completedId);
  }, [completedId]);

  const summaryId = summaryTripId || completedId;

  let phase = 'home';
  if (loading) phase = 'loading';
  else if (summaryId) phase = 'summary';
  else if (trip && TRIP_ACTIVE_STATUSES.includes(trip.status)) phase = 'active';

  const closeSummary = useCallback(() => {
    setDismissedId(summaryId);
    setSummaryTripId(null);
  }, [summaryId]);

  const value = useMemo(
    () => ({ phase, trip, summaryId, closeSummary }),
    [phase, trip, summaryId, closeSummary]
  );

  return <TripFlowContext.Provider value={value}>{children}</TripFlowContext.Provider>;
}

export const useTripFlow = () => {
  const ctx = useContext(TripFlowContext);
  if (!ctx) throw new Error('useTripFlow debe usarse dentro de <TripFlowProvider>');
  return ctx;
};