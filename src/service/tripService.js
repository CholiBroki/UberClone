// AI-assisted: see docs/AI_LOG.md #19 #20
import { collection,addDoc, doc, runTransaction, serverTimestamp,} from 'firebase/firestore';
import { db } from './firebase';
import PRICING_CONFIG from '../config/pricing';
import { calculateFare } from '../utils/calculateFare';
import { haversineKm } from '../utils/geo';

const tripError = (code) => {
  const error = new Error(code);
  error.code = code;
  return error;
};

export const mapTripForUI = (trip) => ({
  id: trip.id,
  originAddress: trip.origin?.address,
  destinationAddress: trip.destination?.address,
  originCoords: trip.origin ? { latitude: trip.origin.lat, longitude: trip.origin.lng } : null,
  destinationCoords: trip.destination
    ? { latitude: trip.destination.lat, longitude: trip.destination.lng }
    : null,
  distanceKm: trip.distanceKm,
  durationMin: trip.durationMin,
  category: trip.category,
  paymentMethod: trip.paymentMethod,
  tip: trip.tip || 0,
});

const isPermissionDenied = (error) => error?.code === 'permission-denied';

export const acceptTrip = async (tripId, driverId) => {
  const ref = doc(db, 'trips', tripId);
  try {
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists()) throw tripError('TRIP_UNAVAILABLE');
      const trip = snap.data();
      if (trip.status !== 'requested' || trip.offeredTo !== driverId) {
        throw tripError('TRIP_UNAVAILABLE');
      }
      tx.update(ref, {
        status: 'accepted',
        driverId,
        offeredTo: null,
        acceptedAt: serverTimestamp(),
      });
    });
  } catch (error) {
    if (isPermissionDenied(error)) throw tripError('TRIP_UNAVAILABLE');
    throw error;
  }
};

export const rejectTrip = async (tripId, driverId, reason = 'manual') => {
  const ref = doc(db, 'trips', tripId);
  try {
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists()) return;
      const trip = snap.data();
      if (trip.status !== 'requested' || trip.offeredTo !== driverId) return;

      const rejectedBy = [...(trip.rejectedBy || []), driverId];
      const next = (trip.candidateDriverIds || []).find((id) => !rejectedBy.includes(id));

      if (next) {
        tx.update(ref, {
          rejectedBy,
          offeredTo: next,
          offeredAt: serverTimestamp(),
          lastRejectReason: reason,
        });
      } else {
        tx.update(ref, {
          rejectedBy,
          offeredTo: null,
          status: 'rejected',
          lastRejectReason: reason,
        });
      }
    });
  } catch (error) {
    if (isPermissionDenied(error)) return;
    throw error;
  }
};

export const TRIP_ACTIVE_STATUSES = ['accepted', 'driver_arriving', 'in_progress'];
export const TRIP_OPEN_STATUSES = [...TRIP_ACTIVE_STATUSES, 'completed'];

const transition = async (tripId, driverId, allowedFrom, updates) => {
  const ref = doc(db, 'trips', tripId);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) throw tripError('TRIP_NOT_FOUND');
    const trip = snap.data();
    if (trip.driverId !== driverId) throw tripError('NOT_YOUR_TRIP');
    if (!allowedFrom.includes(trip.status)) throw tripError('INVALID_STATE');
    tx.update(ref, typeof updates === 'function' ? updates(trip) : updates);
  });
};

export const startArriving = (tripId, driverId) =>
  transition(tripId, driverId, ['accepted'], {
    status: 'driver_arriving',
    arrivingAt: serverTimestamp(),
  });

export const passengerOnBoard = (tripId, driverId) =>
  transition(tripId, driverId, ['driver_arriving'], {
    status: 'in_progress',
    startedAt: serverTimestamp(),
  });

export const completeTrip = (tripId, driverId) =>
  transition(tripId, driverId, ['in_progress'], (trip) => {
    const { fare, commission, driverEarnings, commissionRate } = calculateFare({
      distanceKm: trip.distanceKm,
      durationMin: trip.durationMin,
      category: trip.category,
      tip: trip.tip || 0,
    });
    return {
      status: 'completed',
      fare,
      commission,
      driverEarnings,
      commissionRate,
      paymentStatus: 'pending',
      completedAt: serverTimestamp(),
    };
  });

export const cancelTrip = (tripId, driverId, reason = 'driver_cancelled') =>
  transition(tripId, driverId, ['accepted', 'driver_arriving'], {
    status: 'cancelled',
    cancelledBy: 'driver',
    cancelReason: reason,
    cancelledAt: serverTimestamp(),
  });

export const confirmCashPayment = (tripId, driverId) =>
  transition(tripId, driverId, ['completed'], (trip) => {
    if (trip.paymentMethod !== 'cash') throw tripError('NOT_CASH');
    return { status: 'paid', paymentStatus: 'cash', paidAt: serverTimestamp() };
  });

export const simulateApprovedPayment = (tripId, driverId) =>
  transition(tripId, driverId, ['completed'], {
    status: 'paid',
    paymentStatus: 'approved',
    paymentId: `dev_${Date.now()}`,
    paidAt: serverTimestamp(),
  });


const pick = (list) => list[Math.floor(Math.random() * list.length)];
const jitter = (max) => (Math.random() * 2 - 1) * max;

export const createMockTripRequest = async ({ driverId, location }) => {
  const origin = {
    lat: location.latitude + jitter(0.008),
    lng: location.longitude + jitter(0.008),
  };
  const destination = {
    lat: origin.lat + jitter(0.04),
    lng: origin.lng + jitter(0.04),
  };

  const distanceKm = Math.max(1, Math.round(haversineKm(origin, destination) * 1.3 * 10) / 10);
  const durationMin = Math.max(5, Math.round((distanceKm / 25) * 60));

  const category = pick(['economy', 'xl', 'premium']);
  const tip = pick([0, 0, 2000, 3000]);
  const { fare } = calculateFare({ distanceKm, durationMin, category, tip });

  await addDoc(collection(db, 'trips'), {
    passengerId: 'dev_passenger',
    driverId: null,
    offeredTo: driverId,
    candidateDriverIds: [driverId],
    rejectedBy: [],
    origin: { ...origin, address: 'Punto de recogida simulado' },
    destination: { ...destination, address: 'Destino simulado' },
    distanceKm,
    durationMin,
    category,
    tip,
    estimatedFare: fare,
    commissionRate: PRICING_CONFIG.PLATFORM_COMMISSION_RATE,
    paymentMethod: pick(['mercadopago', 'cash']),
    paymentStatus: 'pending',
    paymentId: null,
    status: 'requested',
    rating: null,
    isMock: true,
    createdAt: serverTimestamp(),
    offeredAt: serverTimestamp(),
    completedAt: null,
  });
};