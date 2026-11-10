// AI-assisted: see docs/AI_LOG.md #17
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePreferences } from '../context/PreferencesContext';

function Placeholder({ icon, step }) {
  const { t } = usePreferences();
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={56} color="#94A3B8" />
      <Text style={styles.title}>{t('placeholderTitle')}</Text>
      <Text style={styles.text}>{t('placeholderText', { step })}</Text>
    </View>
  );
}

export const EarningsScreen = () => <Placeholder icon="cash-outline" step={6} />;
export const HistoryScreen = () => <Placeholder icon="time-outline" step={7} />;
export const ActiveTripScreen = () => <Placeholder icon="navigate-outline" step={4} />;
export const TripSummaryScreen = () => <Placeholder icon="receipt-outline" step={5} />;

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC', padding: 32, gap: 10 },
  title: { fontSize: 18, fontWeight: '700', color: '#0A2540' },
  text: { fontSize: 14, color: '#64748B', textAlign: 'center' },
});