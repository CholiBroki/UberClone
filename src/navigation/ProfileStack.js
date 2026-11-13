// AI-assisted: see docs/AI_LOG.md #24
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DrawerActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import { usePreferences } from '../context/PreferencesContext';

const Stack = createNativeStackNavigator();

export default function ProfileStack() {
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
        name="ProfileView"
        component={ProfileScreen}
        options={({ navigation }) => ({
          title: t('profile'),
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
        name="EditProfile"
        component={EditProfileScreen}
        options={{ title: t('editProfile') }}
      />
    </Stack.Navigator>
  );
}