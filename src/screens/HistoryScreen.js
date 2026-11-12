// AI-assisted: see docs/AI_LOG.md #23
import React, { useState, useMemo, useCallback, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, StyleSheet,} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import { useTripHistory } from '../hooks/useTripHistory';
import { getBounds, isRangeIncomplete, isRangeInvalid, formatDateTime } from '../utils/historyFilters';
import { formatLocalDate, parseLocalDate } from '../utils/dateUtils';
import { tripDate } from '../utils/earnings';
import { formatCOP } from '../utils/labels';
import {
  PAYMENT_METHOD_KEYS, PAYMENT_STATUS_KEYS, PAYMENT_STATUS_COLORS,
} from '../utils/tripLabels';

const PERIODS = [
  { key: 'today', label: 'earningsToday' },
  { key: 'week', label: 'earningsWeek' },
  { key: 'month', label: 'earningsMonth' },
  { key: 'range', label: 'historyFilterRange' },
];

const METHODS = [
  { key: 'all', label: 'methodAll' },
  { key: 'cash', label: 'methodCash' },
  { key: 'mercadopago', label: 'methodMercadoPago' },
];

const Chip = ({ label, active, onPress }) => (
  <TouchableOpacity
    style={[styles.chip, active && styles.chipActive]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
  </TouchableOpacity>
);

const HistoryItem = React.memo(function HistoryItem({ trip, t, onOpen }) {
  const status = trip.paymentStatus || 'pending';
  const colors = PAYMENT_STATUS_COLORS[status] || PAYMENT_STATUS_COLORS.pending;

  return (
    <TouchableOpacity style={styles.item} onPress={() => onOpen(trip.id)} activeOpacity={0.85}>
      <View style={styles.itemTop}>
        <Text style={styles.itemDate}>{formatDateTime(tripDate(trip))}</Text>
        <View style={[styles.statusChip, { backgroundColor: colors.bg }]}>
          <Text style={[styles.statusChipText, { color: colors.fg }]}>
            {t(PAYMENT_STATUS_KEYS[status] || 'payStatusPending')}
          </Text>
        </View>
      </View>

      <Text style={styles.itemRoute} numberOfLines={2}>
        {trip.origin?.address} → {trip.destination?.address}
      </Text>

      <View style={styles.itemBottom}>
        <Text style={styles.itemCategory}>{t(trip.category)}</Text>
        <View style={styles.itemAmounts}>
          <Text style={styles.itemFare}>{formatCOP(trip.fare)}</Text>
          <Text style={styles.itemNet}>{formatCOP(trip.driverEarnings)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

export default function HistoryScreen({ navigation }) {
  const { driver } = useAuth();
  const { t } = usePreferences();

  const [period, setPeriod] = useState('today');
  const [method, setMethod] = useState('all');
  const [range, setRange] = useState({ from: '', to: '' });
  const [picker, setPicker] = useState(null); 
  const [focusTick, setFocusTick] = useState(0);

  const bounds = useMemo(
    () => getBounds(period, range, new Date()),
    [period, range, focusTick]
  );

  const history = useTripHistory({
    driverId: driver?.id,
    fromMs: bounds ? bounds.from.getTime() : null,
    toMs: bounds ? bounds.to.getTime() : null,
    paymentMethod: method,
  });

  const firstFocus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (firstFocus.current) {
        firstFocus.current = false;
        return;
      }
      setFocusTick((n) => n + 1);
      history.refresh();
    }, [history.refresh])
  );

  const openTrip = useCallback(
    (tripId) => navigation.navigate('TripDetail', { tripId }),
    [navigation]
  );

  const renderItem = useCallback(
    ({ item }) => <HistoryItem trip={item} t={t} onOpen={openTrip} />,
    [t, openTrip]
  );

  const handlePickDate = (event, selectedDate) => {
    const which = picker;
    setPicker(null);
    if (event?.type === 'dismissed' || !selectedDate) return;
    setRange((prev) => ({ ...prev, [which]: formatLocalDate(selectedDate) }));
  };

  const renderEmpty = () => {
    if (history.loading) {
      return (
        <View style={styles.emptyBox}>
          <ActivityIndicator size="large" color="#0052CC" />
        </View>
      );
    }
    if (isRangeIncomplete(period, range)) {
      return (
        <View style={styles.emptyBox}>
          <Ionicons name="calendar-outline" size={44} color="#94A3B8" />
          <Text style={styles.emptyText}>{t('historyRangeHint')}</Text>
        </View>
      );
    }
    if (isRangeInvalid(period, range)) {
      return (
        <View style={styles.emptyBox}>
          <Ionicons name="alert-circle-outline" size={44} color="#F59E0B" />
          <Text style={styles.emptyText}>{t('historyRangeInvalid')}</Text>
        </View>
      );
    }
    if (history.error) {
      const missingIndex = history.error.code === 'failed-precondition';
      return (
        <View style={styles.emptyBox}>
          <Ionicons name="cloud-offline-outline" size={44} color="#EF4444" />
          <Text style={styles.emptyText}>
            {missingIndex ? t('historyIndexError') : t('historyError')}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={history.refresh}>
            <Text style={styles.retryText}>{t('historyRetry')}</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={styles.emptyBox}>
        <Ionicons name="car-outline" size={44} color="#94A3B8" />
        <Text style={styles.emptyText}>{t('historyEmpty')}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Filtros */}
      <View style={styles.filters}>
        <View style={styles.chipRow}>
          {PERIODS.map((p) => (
            <Chip key={p.key} label={t(p.label)} active={period === p.key} onPress={() => setPeriod(p.key)} />
          ))}
        </View>

        {period === 'range' && (
          <View style={styles.dateRow}>
            <TouchableOpacity style={styles.dateButton} onPress={() => setPicker('from')}>
              <Ionicons name="calendar-outline" size={16} color="#0056D2" />
              <Text style={styles.dateText}>
                {t('dateFrom')}: {range.from || '—'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dateButton} onPress={() => setPicker('to')}>
              <Ionicons name="calendar-outline" size={16} color="#0056D2" />
              <Text style={styles.dateText}>
                {t('dateTo')}: {range.to || '—'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.chipRow}>
          {METHODS.map((m) => (
            <Chip key={m.key} label={t(m.label)} active={method === m.key} onPress={() => setMethod(m.key)} />
          ))}
        </View>
      </View>

      {/* Lista paginada: 20 viajes por carga */}
      <FlatList
        data={history.trips}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        onEndReached={history.loadMore}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl refreshing={history.refreshing} onRefresh={history.refresh} />
        }
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={
          history.loadingMore ? (
            <ActivityIndicator style={{ marginVertical: 16 }} color="#0052CC" />
          ) : null
        }
      />

      {picker && (
        <DateTimePicker
          value={range[picker] ? parseLocalDate(range[picker]) : new Date()}
          mode="date"
          display="default"
          maximumDate={new Date()}
          minimumDate={picker === 'to' && range.from ? parseLocalDate(range.from) : undefined}
          onChange={handlePickDate}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  filters: {
    backgroundColor: '#FFFFFF', paddingHorizontal: 14, paddingTop: 12, paddingBottom: 8,
    borderBottomWidth: 1, borderBottomColor: '#E2E8F0', gap: 8,
  },
  chipRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: {
    paddingVertical: 7, paddingHorizontal: 14, borderRadius: 18,
    backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0',
  },
  chipActive: { backgroundColor: '#0056D2', borderColor: '#0056D2' },
  chipText: { fontSize: 13, fontWeight: '600', color: '#475569' },
  chipTextActive: { color: '#FFFFFF' },
  dateRow: { flexDirection: 'row', gap: 8 },
  dateButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 9, paddingHorizontal: 10, borderRadius: 12,
    borderWidth: 1, borderColor: '#0056D2', backgroundColor: '#EBF3FF',
  },
  dateText: { fontSize: 12, fontWeight: '600', color: '#0056D2' },
  listContent: { padding: 14, paddingBottom: 30, flexGrow: 1 },
  item: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  itemTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemDate: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  statusChip: { paddingVertical: 3, paddingHorizontal: 10, borderRadius: 10 },
  statusChipText: { fontSize: 11, fontWeight: '800' },
  itemRoute: { fontSize: 14, fontWeight: '600', color: '#0A2540', marginTop: 8 },
  itemBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  itemCategory: { fontSize: 12, color: '#64748B', fontWeight: '700' },
  itemAmounts: { alignItems: 'flex-end' },
  itemFare: { fontSize: 12, color: '#64748B' },
  itemNet: { fontSize: 15, fontWeight: '800', color: '#16A34A' },
  emptyBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 50, paddingHorizontal: 24, gap: 10 },
  emptyText: { fontSize: 14, color: '#64748B', textAlign: 'center' },
  retryButton: {
    marginTop: 6, paddingVertical: 10, paddingHorizontal: 22, borderRadius: 20,
    borderWidth: 1.5, borderColor: '#0056D2',
  },
  retryText: { color: '#0056D2', fontWeight: '700', fontSize: 14 },
});