// AI-assisted: see docs/AI_LOG.md #17
import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';

const Row = ({ label, value }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue}>{value || '—'}</Text>
  </View>
);

export default function ProfileScreen() {
  const { driver } = useAuth();
  const { t } = usePreferences();

  if (!driver) return null;
  const v = driver.vehicle || {};
  const d = driver.documents || {};
  const approved = driver.status === 'Aprobado';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.top}>
        {driver.profilePhoto ? (
          <Image source={{ uri: driver.profilePhoto }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]}>
            <Ionicons name="person" size={40} color="#FFFFFF" />
          </View>
        )}
        <Text style={styles.name}>{driver.fullName?.trim()}</Text>
        <View style={[styles.badge, approved ? styles.badgeOk : styles.badgeWait]}>
          <Text style={[styles.badgeText, approved ? styles.badgeTextOk : styles.badgeTextWait]}>
            {approved ? t('statusApproved') : t('statusPending')}
          </Text>
        </View>
      </View>

      <Text style={styles.section}>{t('personalData')}</Text>
      <View style={styles.card}>
        <Row label={t('email')} value={driver.email} />
        <Row label={t('phone')} value={driver.phone} />
        <Row label={t('idNumber')} value={driver.idNumber} />
      </View>

      <Text style={styles.section}>{t('vehicle')}</Text>
      <View style={styles.card}>
        <Row label={t('category')} value={t(v.category)} />
        <Row label={t('plate')} value={v.plate} />
        <Row label={t('brandModel')} value={`${(v.brand || '').trim()} ${(v.model || '').trim()}`.trim()} />
        <Row label={t('year')} value={v.year ? String(v.year) : ''} />
        <Row label={t('color')} value={v.color} />
        <Row label={t('capacity')} value={v.capacity ? String(v.capacity) : ''} />
      </View>

      <Text style={styles.section}>{t('documents')}</Text>
      <View style={styles.card}>
        <Row label={t('licenseExpiry')} value={d.licenseExpiry} />
        <Row label={t('soatExpiry')} value={d.soatExpiry} />
      </View>

      <Text style={styles.note}>{t('editSoon')}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 20, paddingBottom: 40 },
  top: { alignItems: 'center', marginBottom: 8 },
  avatar: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#1E3A5F', marginBottom: 12 },
  avatarFallback: { alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 20, fontWeight: '700', color: '#0A2540' },
  badge: { marginTop: 8, paddingVertical: 4, paddingHorizontal: 12, borderRadius: 12 },
  badgeOk: { backgroundColor: '#DCFCE7' },
  badgeWait: { backgroundColor: '#FEF3C7' },
  badgeText: { fontSize: 12, fontWeight: '700' },
  badgeTextOk: { color: '#15803D' },
  badgeTextWait: { color: '#B45309' },
  section: { fontSize: 13, fontWeight: '700', color: '#64748B', marginTop: 20, marginBottom: 8, textTransform: 'uppercase' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, paddingHorizontal: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E2E8F0' },
  rowLabel: { fontSize: 14, color: '#64748B' },
  rowValue: { fontSize: 14, fontWeight: '600', color: '#0A2540', maxWidth: '60%', textAlign: 'right' },
  note: { marginTop: 20, fontSize: 12, color: '#94A3B8', textAlign: 'center' },
});