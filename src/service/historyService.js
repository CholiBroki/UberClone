// AI-assisted: see docs/AI_LOG.md #23
import {
  collection, query, where, orderBy, limit, startAfter, getDocs, Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';

export const PAGE_SIZE = 20;

export const fetchHistoryPage = async ({
  driverId,
  fromMs,
  toMs,
  paymentMethod = 'all',
  cursor = null,
}) => {
  const constraints = [
    where('driverId', '==', driverId),
    where('completedAt', '>=', Timestamp.fromMillis(fromMs)),
    where('completedAt', '<=', Timestamp.fromMillis(toMs)),
  ];
  if (paymentMethod !== 'all') {
    constraints.push(where('paymentMethod', '==', paymentMethod));
  }
  constraints.push(orderBy('completedAt', 'desc'));
  if (cursor) constraints.push(startAfter(cursor));
  constraints.push(limit(PAGE_SIZE));

  const snapshot = await getDocs(query(collection(db, 'trips'), ...constraints));

  return {
    trips: snapshot.docs.map((d) => ({ id: d.id, ...d.data() })),
    lastDoc: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null,
    hasMore: snapshot.docs.length === PAGE_SIZE,
  };
};