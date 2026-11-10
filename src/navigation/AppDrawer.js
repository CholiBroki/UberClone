// AI-assisted: see docs/AI_LOG.md #17
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList,} from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import TripStack from './TripStack';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { EarningsScreen, HistoryScreen } from '../screens/PlaceholderScreen';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import { useConfirmLogout } from '../hooks/useConfirmLogout';

const Drawer = createDrawerNavigator();

function CustomDrawerContent(props) {
  const { driver } = useAuth();
  const { t } = usePreferences();
  const confirmLogout = useConfirmLogout();
  const approved = driver?.status === 'Aprobado';

  return (
    <View style={styles.flex}>
      <DrawerContentScrollView {...props} contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          {driver?.profilePhoto ? (
            <Image source={{ uri: driver.profilePhoto }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Ionicons name="person" size={36} color="#FFFFFF" />
            </View>
          )}
          <Text style={styles.name} numberOfLines={1}>
            {driver?.fullName?.trim() || '—'}
          </Text>
          <View style={[styles.badge, approved ? styles.badgeOk : styles.badgeWait]}>
            <Text style={[styles.badgeText, approved ? styles.badgeTextOk : styles.badgeTextWait]}>
              {approved ? t('statusApproved') : t('statusPending')}
            </Text>
          </View>
        </View>

        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      <TouchableOpacity style={styles.logout} onPress={confirmLogout}>
        <Ionicons name="log-out-outline" size={22} color="#EF4444" />
        <Text style={styles.logoutText}>{t('logout')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const icon = (name) => ({ color, size }) => <Ionicons name={name} size={size} color={color} />;

export default function AppDrawer() {
  const { t } = usePreferences();

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: '#0B2545' },
        headerTintColor: '#FFFFFF',
        drawerActiveTintColor: '#0056D2',
        drawerActiveBackgroundColor: '#EBF3FF',
      }}
    >
      <Drawer.Screen
        name="HomeStack"
        component={TripStack}
        options={{
          title: t('home'),
          headerShown: false, // el Stack y HomeScreen traen su propio encabezado
          swipeEnabled: false, // evita chocar con el arrastre del mapa; se abre con el botón de menú
          drawerIcon: icon('home-outline'),
        }}
      />
      <Drawer.Screen
        name="Earnings"
        component={EarningsScreen}
        options={{ title: t('earnings'), drawerIcon: icon('cash-outline') }}
      />
      <Drawer.Screen
        name="History"
        component={HistoryScreen}
        options={{ title: t('history'), drawerIcon: icon('time-outline') }}
      />
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: t('profile'), drawerIcon: icon('person-outline') }}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: t('settings'), drawerIcon: icon('settings-outline') }}
      />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#FFFFFF' },
  scroll: { paddingTop: 0 },
  header: {
    backgroundColor: '#0B2545',
    paddingTop: 56,
    paddingBottom: 20,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  avatar: { width: 72, height: 72, borderRadius: 36, marginBottom: 12, backgroundColor: '#1E3A5F' },
  avatarFallback: { alignItems: 'center', justifyContent: 'center' },
  name: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  badge: { alignSelf: 'flex-start', marginTop: 8, paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12 },
  badgeOk: { backgroundColor: '#DCFCE7' },
  badgeWait: { backgroundColor: '#FEF3C7' },
  badgeText: { fontSize: 12, fontWeight: '700' },
  badgeTextOk: { color: '#15803D' },
  badgeTextWait: { color: '#B45309' },
  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  logoutText: { color: '#EF4444', fontSize: 15, fontWeight: '700' },
});