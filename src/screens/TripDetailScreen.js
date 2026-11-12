// AI-assisted: see docs/AI_LOG.md #23
import React, { useMemo } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LeafletMap from '../components/LeafletMap';
import { usePreferences } from '../context/PreferencesContext';
import { useTrip } from '../hooks/useTrip';
import { tripDate } from '../utils/earnings';
import { formatDateTime } from '../utils/historyFilters';
import { formatCOP } from '../utils/labels';
import {
  PAYMENT_METHOD_KEYS, PAYMENT_STATUS_KEYS, PAYMENT_STATUS_COLORS,
} from '../utils/tripLabels';

const Row = ({ label, value, bold, negative }) => (
  <View style={styles.row}>
    <Text style={[styles.rowLabel, bold && styles.bold]}>{label}</Text>
    <Text style={[styles.rowValue, bold && styles.bold, negative && { color: '#B91C1C' }]}>{value}</Text>
  </View>
);

export default function TripDetailScreen({ route }) {
  const { tripId } = route.params;
  const { trip } = useTrip(tripId);
  const { t } = usePreferences();

  const oLat = trip?.origin?.lat;
  const oLng = trip?.origin?.lng;
  const dLat = trip?.destination?.lat;
  const dLng = trip?.destination?.lng;

  const mapRoute = useMemo(() => {
    if (oLat == null || dLat == null) return null;
    return {
      origin: { latitude: oLat, longitude: oLng },
      destination: { latitude: dLat, longitude: dLng },
    };
  }, [oLat, oLng, dLat, dLng]);

  if (!trip) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0052CC" />
      </View>
    );
  }

  const status = trip.paymentStatus || 'pending';
  const colors = PAYMENT_STATUS_COLORS[status] || PAYMENT_STATUS_COLORS.pending;
  const rating = Number(trip.rating) || 0;

  return (
    <View style={styles.container}>
      <View style={styles.map}>
        {mapRoute && (
          <LeafletMap latitude={oLat} longitude={oLng} available={false} route={mapRoute} />
        )}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Row label={t('dateTime')} value={formatDateTime(tripDate(trip))} />
          <Row label={t('origin')} value={trip.origin?.address} />
          <Row label={t('destination')} value={trip.destination?.address} />
          <Row label={t('category')} value={t(trip.category)} />
          <Row label={t('distance')} value={`${trip.distanceKm} km`} />
          <Row label={t('duration')} value={`${trip.durationMin} min`} />
        </View>

        <View style={styles.card}>
          <Row label={t('fare')} value={formatCOP(trip.fare)} />
          <Row
            label={`${t('commissionsTotal')} (${Math.round((trip.commissionRate || 0) * 100)} %)`}
            value={`-${formatCOP(trip.commission)}`}
            negative
          />
          <Row label={t('tip')} value={formatCOP(trip.tip)} />
          <View style={styles.divider} />
          <Row label={t('netEarnings')} value={formatCOP(trip.driverEarnings)} bold />
        </View>

        <View style={styles.card}>
          <Row label={t('paymentMethod')} value={t(PAYMENT_METHOD_KEYS[trip.paymentMethod] || 'methodAll')} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>{t('paymentStatus')}</Text>
            <View style={[styles.chip, { backgroundColor: colors.bg }]}>
              <Text style={[styles.chipText, { color: colors.fg }]}>
                {t(PAYMENT_STATUS_KEYS[status] || 'payStatusPending')}
              </Text>
            </View>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>{t('passengerRating')}</Text>
            {rating > 0 ? (
              <View style={styles.stars}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Ionicons
                    key={i}
                    name={i <= rating ? 'star' : 'star-outline'}
                    size={18}
                    color="#F59E0B"
                  />
                ))}
              </View>
            ) : (
              <Text style={styles.noRating}>{t('noRating')}</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  map: { height: 260, backgroundColor: '#E5E7EB', overflow: 'hidden' },
  content: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 4,
    borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 14,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 11 },
  rowLabel: { fontSize: 14, color: '#64748B', paddingRight: 12 },
  rowValue: { fontSize: 14, fontWeight: '600', color: '#0A2540', flex: 1, textAlign: 'right' },
  bold: { fontSize: 16, fontWeight: '800', color: '#0A2540' },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: '#E2E8F0' },
  chip: { paddingVertical: 4, paddingHorizontal: 12, borderRadius: 12 },
  chipText: { fontSize: 12, fontWeight: '800' },
  stars: { flexDirection: 'row', gap: 2 },
  noRating: { fontSize: 13, color: '#94A3B8', fontStyle: 'italic' },
});