// AI-assisted: see docs/AI_LOG.md #17 #19 #20
import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DrawerActions } from '@react-navigation/native';
import HomeScreen from '../screens/HomeScreen';
import ActiveTripScreen from '../screens/ActiveTripScreen';
import TripSummaryScreen from '../screens/TripSummaryScreen';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import { TripFlowProvider, useTripFlow } from '../context/TripFlowContext';

const Stack = createNativeStackNavigator();

function HomeRoute({ navigation }) {
  const { driver } = useAuth();
  const { lastAvailability, setLastAvailability } = usePreferences();

  return (
    <HomeScreen
      driverId={driver?.id}
      driverStatus={driver?.status}
      onOpenProfile={() => navigation.dispatch(DrawerActions.openDrawer())}
      initialAvailable={lastAvailability}
      onAvailabilityChange={setLastAvailability}
    />
  );
}

function LoadingRoute() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' }}>
      <ActivityIndicator size="large" color="#0052CC" />
    </View>
  );
}

function TripStackInner() {
  const { phase } = useTripFlow();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {phase === 'loading' ? (
        <Stack.Screen name="TripLoading" component={LoadingRoute} />
      ) : phase === 'active' ? (
        <Stack.Screen name="ActiveTrip" component={ActiveTripScreen} />
      ) : phase === 'summary' ? (
        <Stack.Screen name="TripSummary" component={TripSummaryScreen} />
      ) : (
        <Stack.Screen name="Home" component={HomeRoute} />
      )}
    </Stack.Navigator>
  );
}

export default function TripStack() {
  return (
    <TripFlowProvider>
      <TripStackInner />
    </TripFlowProvider>
  );
}