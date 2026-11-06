// AI-assisted: see docs/AI_LOG.md #10
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import IncomingRequestModal from '../components/IncomingRequestModal';

const HomeScreen = ({ driverStatus = 'Aprobado', onOpenProfile }) => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [location, setLocation] = useState({
    latitude: 6.2442,
    longitude: -75.5812,
    latitudeDelta: 0.015,
    longitudeDelta: 0.015,
  });
  
  const [incomingRequest, setIncomingRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Solicitud de permisos de ubicación
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Se requiere acceso a la ubicación para operar como conductor.');
        return;
      }

      let currentLoc = await Location.getCurrentPositionAsync({});
      setLocation(prev => ({
        ...prev,
        latitude: currentLoc.coords.latitude,
        longitude: currentLoc.coords.longitude,
      }));
    })();
  }, []);

  // Seguimiento de ubicación en tiempo real mientras esté 'Disponible'
  useEffect(() => {
    let subscription = null;

    if (isAvailable) {
      console.log('Iniciando seguimiento de ubicación...');
      (async () => {
        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 5000,
            distanceInterval: 10,
          },
          (newLocation) => {
            const { latitude, longitude } = newLocation.coords;
            setLocation(prev => ({ ...prev, latitude, longitude }));
          }
        );
      })();
    }

    return () => {
      if (subscription) {
        console.log('Deteniendo seguimiento de ubicación (Limpieza useEffect)...');
        subscription.remove();
      }
    };
  }, [isAvailable]);

  // Simulación: Generar viaje entrante a los 4 segundos de conectarse
  useEffect(() => {
    let timeout = null;
    if (isAvailable && !incomingRequest) {
      timeout = setTimeout(() => {
        const mockTrip = {
          id: 'TRIP_101',
          originAddress: 'Parque Lleras, Poblado',
          destinationAddress: 'Centro Comercial Santafé',
          distanceKm: 6.5,
          durationMin: 18,
          category: 'economy',
          paymentMethod: 'mercadopago',
          tip: 2000
        };
        setIncomingRequest(mockTrip);
        setShowModal(true);
      }, 4000);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isAvailable, incomingRequest]);

  const handleToggleAvailability = (value) => {
    if (driverStatus === 'Pendiente') {
      Alert.alert(
        'Cuenta en Revisión',
        'Tu solicitud de registro se encuentra Pendiente de aprobación. No puedes conectarte hasta que un administrador revise tus documentos.'
      );
      setIsAvailable(false);
      return;
    }

    setIsAvailable(value);
    if (!value) {
      setIncomingRequest(null);
      setShowModal(false);
    }
  };

  const handleAcceptTrip = (requestData, fareInfo) => {
    setShowModal(false);
    Alert.alert(
      '¡Viaje Aceptado!',
      `Navegando al origen.\nGanancia Neta: $${fareInfo.driverEarnings.toLocaleString('es-CO')} COP`
    );
  };

  const handleRejectTrip = (reason) => {
    setShowModal(false);
    setIncomingRequest(null);
    if (reason === 'timeout') {
      Alert.alert('Tiempo agotado', 'La solicitud ha sido rechazada automáticamente por el sistema.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Mapa de Fondo */}
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={location}
        showsUserLocation={true}
        showsMyLocationButton={false}
      >
        {isAvailable && (
          <Marker
            coordinate={{ latitude: location.latitude, longitude: location.longitude }}
            title="Tu Vehículo"
            description="Estás disponible para recibir carreras"
          >
            <View style={styles.driverMarker}>
              <Ionicons name="car" size={22} color="#FFFFFF" />
            </View>
          </Marker>
        )}
      </MapView>

      {/* Bar de Encabezado Flotante */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.menuButton} onPress={onOpenProfile}>
          <Ionicons name="menu-outline" size={26} color="#0A2540" />
        </TouchableOpacity>

        <View style={styles.headerStatusBadge}>
          <View style={[styles.statusDot, { backgroundColor: isAvailable ? '#22C55E' : '#EF4444' }]} />
          <Text style={styles.headerStatusText}>
            {isAvailable ? 'Conectado' : 'Desconectado'}
          </Text>
        </View>
      </View>

      {/* Tarjeta Inferior de Control de Disponibilidad */}
      <View style={styles.bottomCard}>
        <View style={styles.switchRow}>
          <View style={styles.switchInfo}>
            <Text style={styles.switchTitle}>
              {isAvailable ? 'Estás Disponible' : 'Estás Desconectado'}
            </Text>
            <Text style={styles.switchSubtitle}>
              {isAvailable
                ? 'Buscando solicitudes de viaje cercanas...'
                : 'Ponte disponible para empezar a recibir viajes.'}
            </Text>
          </View>

          <Switch
            trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
            thumbColor={isAvailable ? '#0056D2' : '#64748B'}
            ios_backgroundColor="#CBD5E1"
            onValueChange={handleToggleAvailability}
            value={isAvailable}
          />
        </View>
      </View>

      {/* Modal de Solicitud Entrante */}
      <IncomingRequestModal
        visible={showModal}
        requestData={incomingRequest}
        onAccept={handleAcceptTrip}
        onReject={handleRejectTrip}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  driverMarker: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#0056D2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  topHeader: {
    position: 'absolute',
    top: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 12 : 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  headerStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  headerStatusText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0A2540',
  },
  bottomCard: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchInfo: {
    flex: 1,
    marginRight: 12,
  },
  switchTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0A2540',
  },
  switchSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
});

export default HomeScreen;