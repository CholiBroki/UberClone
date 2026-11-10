// AI-assisted: see docs/AI_LOG.md #10 #15 #17 #19
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, StatusBar, Platform, Alert,} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDriverLocation } from '../hooks/useDriverLocation';
import { useTripRequests } from '../hooks/useTripRequests';
import { acceptTrip, rejectTrip, createMockTripRequest, mapTripForUI,} from '../service/tripService';
import IncomingRequestModal from '../components/IncomingRequestModal';
import LeafletMap from '../components/LeafletMap';

const HomeScreen = ({
  driverId,
  driverStatus = 'Pendiente',
  onOpenProfile,
  initialAvailable = false,
  onAvailabilityChange,
}) => {
  const [isAvailable, setIsAvailable] = useState(false);


  useEffect(() => {
    if (initialAvailable && driverStatus === 'Aprobado') {
      setIsAvailable(true);
    }
  }, []);

  const { location } = useDriverLocation(isAvailable, driverStatus, driverId);

  const canReceive = isAvailable && driverStatus === 'Aprobado';
  const { request } = useTripRequests(driverId, canReceive);
  const incomingRequest = useMemo(() => (request ? mapTripForUI(request) : null), [request]);

  const [activeRoute, setActiveRoute] = useState(null);

  const handleToggleAvailability = (value) => {
    if (driverStatus === 'Pendiente') {
      Alert.alert(
        'Cuenta en Revisión',
        'Tu solicitud de registro se encuentra Pendiente de aprobación. No puedes ponerte Disponible hasta que tus documentos sean verificados.'
      );
      setIsAvailable(false);
      onAvailabilityChange?.(false);
      return;
    }

    setIsAvailable(value);
    onAvailabilityChange?.(value);
    if (!value) {
      setActiveRoute(null);
    }
  };

  const handleCompleteTrip = useCallback((fareInfo) => {
    setActiveRoute(null);

    Alert.alert(
      '¡Viaje Completado!',
      `Total Cobrado: $${fareInfo.fare.toLocaleString('es-CO')} COP\nComisión Plataforma (${Math.round(
        fareInfo.commissionRate * 100
      )}%): -$${fareInfo.commission.toLocaleString('es-CO')} COP\nPropina: $${fareInfo.tip.toLocaleString(
        'es-CO'
      )} COP\nGanancia Neta Conductor: $${fareInfo.driverEarnings.toLocaleString('es-CO')} COP`,
      [{ text: 'Entendido' }]
    );
  }, []);

  const handleAcceptTrip = useCallback(
    async (requestData, fareInfo) => {
      try {
        await acceptTrip(requestData.id, driverId);
      } catch (error) {
        if (error.code === 'TRIP_UNAVAILABLE') {
          Alert.alert('Solicitud no disponible', 'Esta solicitud ya no está disponible.');
        } else {
          console.log('HomeScreen: error aceptando viaje', error);
          Alert.alert('Error', 'No se pudo aceptar el viaje. Intenta de nuevo.');
        }
        return;
      }

      if (requestData.originCoords && requestData.destinationCoords) {
        setActiveRoute({
          origin: requestData.originCoords,
          destination: requestData.destinationCoords,
        });
      }

      Alert.alert(
        '¡Viaje Aceptado!',
        `Ruta trazada hacia el origen.\nGanancia Neta Est: $${fareInfo.driverEarnings.toLocaleString('es-CO')} COP`,
        [{ text: 'Simular Finalizar Viaje', onPress: () => handleCompleteTrip(fareInfo) }]
      );
    },
    [driverId, handleCompleteTrip]
  );

  const tripId = incomingRequest?.id;
  const handleRejectTrip = useCallback(
    async (reason) => {
      if (!tripId) return;
      try {
        await rejectTrip(tripId, driverId, reason);
      } catch (error) {
        console.log('HomeScreen: error rechazando viaje', error);
      }
      if (reason === 'timeout') {
        Alert.alert(
          'Tiempo agotado',
          'La solicitud ha sido rechazada automáticamente por el sistema.'
        );
      }
    },
    [tripId, driverId]
  );

  const handleSimulateRequest = async () => {
  console.log('SIMULAR: toque', { driverId, tieneUbicacion: !!location });
  try {
    await createMockTripRequest({ driverId, location });
    console.log('SIMULAR: documento creado');
  } catch (error) {
    console.log('SIMULAR: error', error.code, error.message);
    Alert.alert('Error', `${error.code || 'sin código'}\n${error.message || String(error)}`);
  }
};

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Mapa de fondo con soporte de trazado de ruta OSRM */}
      <LeafletMap
        latitude={location.latitude}
        longitude={location.longitude}
        available={isAvailable}
        route={activeRoute}
      />

      {/* Barra de encabezado flotante */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.menuButton} onPress={onOpenProfile}>
          <Ionicons name="menu-outline" size={26} color="#0A2540" />
        </TouchableOpacity>

        <View style={styles.headerStatusBadge}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: isAvailable ? '#22C55E' : '#EF4444' },
            ]}
          />
          <Text style={styles.headerStatusText}>
            {isAvailable ? 'Disponible' : 'No disponible'}
          </Text>
        </View>
      </View>

      {/* Tarjeta inferior de disponibilidad */}
      <View style={styles.bottomCard}>
        <View style={styles.switchRow}>
          <View style={styles.switchInfo}>
            <Text style={styles.switchTitle}>
              {isAvailable ? 'Disponible' : 'No disponible'}
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

        {/* Solo desarrollo: simula la solicitud de un pasajero */}
        {__DEV__ && isAvailable && (
          <TouchableOpacity style={styles.devButton} onPress={handleSimulateRequest}>
            <Ionicons name="flask-outline" size={16} color="#0056D2" />
            <Text style={styles.devButtonText}>Simular solicitud de pasajero</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Modal de solicitud entrante */}
      <IncomingRequestModal
        key={incomingRequest?.id || 'none'}
        visible={!!incomingRequest}
        requestData={incomingRequest}
        onAccept={handleAcceptTrip}
        onReject={handleRejectTrip}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  devButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#0056D2',
  },
  devButtonText: { fontSize: 13, fontWeight: '600', color: '#0056D2' },
  container: {
    flex: 1,
    backgroundColor: '#E5E7EB',
  },
  topHeader: {
    position: 'absolute',
    top: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 12 : 56,
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