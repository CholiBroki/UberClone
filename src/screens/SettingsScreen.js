// AI-assisted: see docs/AI_LOG.md #17
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePreferences } from '../context/PreferencesContext';
import { useConfirmLogout } from '../hooks/useConfirmLogout';

export default function SettingsScreen() {
  const { language, setLanguage, t } = usePreferences();
  const confirmLogout = useConfirmLogout();

  const options = [
    { code: 'es', label: t('spanish') },
    { code: 'en', label: t('english') },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.section}>{t('language')}</Text>
      <View style={styles.card}>
        {options.map((opt, i) => (
          <TouchableOpacity
            key={opt.code}
            style={[styles.option, i > 0 && styles.optionBorder]}
            onPress={() => setLanguage(opt.code)}
            activeOpacity={0.7}
          >
            <Text style={styles.optionText}>{opt.label}</Text>
            {language === opt.code && <Ionicons name="checkmark-circle" size={22} color="#0056D2" />}
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.hint}>{t('languageHint')}</Text>

      <TouchableOpacity style={styles.logoutButton} onPress={confirmLogout} activeOpacity={0.85}>
        <Ionicons name="log-out-outline" size={20} color="#EF4444" />
        <Text style={styles.logoutText}>{t('logout')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 20 },
  section: { fontSize: 13, fontWeight: '700', color: '#64748B', marginBottom: 8, textTransform: 'uppercase' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  option: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  optionBorder: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#E2E8F0' },
  optionText: { fontSize: 15, color: '#0A2540', fontWeight: '600' },
  hint: { fontSize: 12, color: '#94A3B8', marginTop: 8 },
  logoutButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginTop: 32, paddingVertical: 14, borderRadius: 24, borderWidth: 1.5, borderColor: '#EF4444',
  },
  logoutText: { color: '#EF4444', fontSize: 15, fontWeight: '700' },
});