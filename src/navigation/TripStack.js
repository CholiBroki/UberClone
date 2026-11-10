// AI-assisted: see docs/AI_LOG.md #17
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DrawerActions } from '@react-navigation/native';
import HomeScreen from '../screens/HomeScreen';
import { ActiveTripScreen, TripSummaryScreen } from '../screens/PlaceholderScreen';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';

const Stack = createNativeStackNavigator();

function HomeRoute({ navigation }) {
  const { driver } = useAuth();
  const { lastAvailability, setLastAvailability } = usePreferences();

  return (
    <HomeScreen
      driverStatus={driver?.status}
      onOpenProfile={() => navigation.dispatch(DrawerActions.openDrawer())}
      initialAvailable={lastAvailability}
      onAvailabilityChange={setLastAvailability}
    />
  );
}

export default function TripStack() {
  const { t } = usePreferences();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeRoute} />
      <Stack.Screen
        name="ActiveTrip"
        component={ActiveTripScreen}
        options={{ headerShown: true, title: t('activeTrip') }}
      />
      <Stack.Screen
        name="TripSummary"
        component={TripSummaryScreen}
        options={{ headerShown: true, title: t('tripSummary') }}
      />
    </Stack.Navigator>
  );
}