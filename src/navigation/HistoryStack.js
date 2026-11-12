// AI-assisted: see docs/AI_LOG.md #23
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DrawerActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import HistoryScreen from '../screens/HistoryScreen';
import TripDetailScreen from '../screens/TripDetailScreen';
import { usePreferences } from '../context/PreferencesContext';

const Stack = createNativeStackNavigator();

export default function HistoryStack() {
  const { t } = usePreferences();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#0B2545' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen
        name="HistoryList"
        component={HistoryScreen}
        options={({ navigation }) => ({
          title: t('history'),
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
              style={{ marginRight: 14 }}
            >
              <Ionicons name="menu" size={26} color="#FFFFFF" />
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen
        name="TripDetail"
        component={TripDetailScreen}
        options={{ title: t('tripDetail') }}
      />
    </Stack.Navigator>
  );
}