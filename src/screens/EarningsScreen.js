// AI-assisted: see docs/AI_LOG.md #22
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import { useEarnings } from '../hooks/useEarnings';
import { formatCOP } from '../utils/labels';

const PERIODS = [
  { key: 'today', label: 'earningsToday' },
  { key: 'week', label: 'earningsWeek' },
  { key: 'month', label: 'earningsMonth' },
];

const Row = ({ label, value, bold, negative }) => (
  <View style={styles.row}>
    <Text style={[styles.rowLabel, bold && styles.bold]}>{label}</Text>
    <Text style={[styles.rowValue, bold && styles.bold, negative && styles.negative]}>{value}</Text>
  </View>
);

export default function EarningsScreen() {
  const { driver } = useAuth();
  const { t } = usePreferences();
  const earnings = useEarnings(driver?.id);
  const [period, setPeriod] = useState('today');

  if (earnings.loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0052CC" />
      </View>
    );
  }

  if (earnings.error) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <Text style={styles.errorText}>{t('earningsError')}</Text>
      </View>
    );
  }

  const data = earnings[period];
  const { balance } = earnings;
  const negative = balance.balance < 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Saldo del conductor */}
      <View style={[styles.balanceCard, negative && styles.balanceCardNegative]}>
        <Text style={styles.balanceLabel}>{t('balance')}</Text>
        <Text style={styles.balanceValue}>{formatCOP(balance.balance)}</Text>
        <View style={styles.balanceDetail}>
          <Text style={styles.balanceDetailText}>
            {t('balanceGateway')}: +{formatCOP(balance.gateway)}
          </Text>
          <Text style={styles.balanceDetailText}>
            {t('balanceCash')}: -{formatCOP(balance.cashCommissions)}
          </Text>
        </View>
        {negative && <Text style={styles.balanceWarning}>{t('balanceNegative')}</Text>}
      </View>

      {/* Selector de periodo */}
      <View style={styles.segment}>
        {PERIODS.map((p) => {
          const active = period === p.key;
          return (
            <TouchableOpacity
              key={p.key}
              style={[styles.segmentButton, active && styles.segmentButtonActive]}
              onPress={() => setPeriod(p.key)}
              activeOpacity={0.8}
            >
              <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                {t(p.label)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Totales del periodo */}
      {data.count === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="car-outline" size={48} color="#94A3B8" />
          <Text style={styles.emptyText}>{t('earningsEmpty')}</Text>
        </View>
      ) : (
        <>
          <View style={styles.netBox}>
            <Text style={styles.netLabel}>{t('netEarnings')}</Text>
            <Text style={styles.netValue}>{formatCOP(data.net)}</Text>
          </View>

          <View style={styles.card}>
            <Row label={t('tripsCount')} value={String(data.count)} />
            <Row label={t('billedTotal')} value={formatCOP(data.billed)} />
            <Row label={t('commissionsTotal')} value={`-${formatCOP(data.commissions)}`} negative />
            <Row label={t('tipsTotal')} value={formatCOP(data.tips)} />
            <View style={styles.divider} />
            <Row label={t('netEarnings')} value={formatCOP(data.net)} bold />
            <Row label={t('averagePerTrip')} value={formatCOP(data.average)} />
          </View>
        </>
      )}

      <Text style={styles.note}>{t('earningsNote')}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC', padding: 32, gap: 12 },
  errorText: { fontSize: 14, color: '#64748B', textAlign: 'center' },
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 20, paddingBottom: 40 },
  balanceCard: { backgroundColor: '#0B2545', borderRadius: 20, padding: 20, marginBottom: 20 },
  balanceCardNegative: { backgroundColor: '#7F1D1D' },
  balanceLabel: { color: '#93C5FD', fontSize: 13, fontWeight: '700', textTransform: 'uppercase' },
  balanceValue: { color: '#FFFFFF', fontSize: 32, fontWeight: '800', marginTop: 4 },
  balanceDetail: { marginTop: 12, gap: 2 },
  balanceDetailText: { color: '#CBD5E1', fontSize: 12 },
  balanceWarning: { color: '#FCA5A5', fontSize: 12, fontWeight: '700', marginTop: 10 },
  segment: { flexDirection: 'row', backgroundColor: '#E2E8F0', borderRadius: 14, padding: 4, marginBottom: 16 },
  segmentButton: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 11 },
  segmentButtonActive: { backgroundColor: '#FFFFFF', elevation: 2 },
  segmentText: { fontSize: 14, fontWeight: '600', color: '#64748B' },
  segmentTextActive: { color: '#0056D2', fontWeight: '800' },
  netBox: { alignItems: 'center', marginBottom: 14 },
  netLabel: { fontSize: 13, color: '#64748B', fontWeight: '700', textTransform: 'uppercase' },
  netValue: { fontSize: 30, fontWeight: '800', color: '#16A34A', marginTop: 2 },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 6,
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 11 },
  rowLabel: { fontSize: 14, color: '#64748B', flex: 1, paddingRight: 8 },
  rowValue: { fontSize: 14, fontWeight: '600', color: '#0A2540' },
  bold: { fontSize: 16, fontWeight: '800', color: '#0A2540' },
  negative: { color: '#B91C1C' },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: '#E2E8F0' },
  empty: { alignItems: 'center', paddingVertical: 36, gap: 10 },
  emptyText: { fontSize: 14, color: '#64748B', textAlign: 'center' },
  note: { marginTop: 18, fontSize: 12, color: '#94A3B8', textAlign: 'center' },
});