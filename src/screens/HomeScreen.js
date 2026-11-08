// AI-assisted: see docs/AI_LOG.md #10 #15
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDriverLocation } from '../hooks/useDriverLocation';
import IncomingRequestModal from '../components/IncomingRequestModal';
import LeafletMap from '../components/LeafletMap';

const HomeScreen = ({ driverStatus = 'Aprobado', onOpenProfile }) => {
  const [isAvailable, setIsAvailable] = useState(false);
  const { location } = useDriverLocation(isAvailable, driverStatus);

  const [incomingRequest, setIncomingRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Simulación: generar viaje entrante a los 4 segundos de estar Disponible
  useEffect(() => {
    let timeout = null;
    if (isAvailable && driverStatus === 'Aprobado' && !incomingRequest) {
      timeout = setTimeout(() => {
        const mockTrip = {
          id: 'TRIP_101',
          originAddress: 'Parque Lleras, Poblado',
          destinationAddress: 'Centro Comercial Santafé',
          distanceKm: 6.5,
          durationMin: 18,
          category: 'economy',
          paymentMethod: 'mercadopago',
          tip: 2000,
        };
        setIncomingRequest(mockTrip);
        setShowModal(true);
      }, 4000);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isAvailable, driverStatus, incomingRequest]);

  const handleToggleAvailability = (value) => {
    if (driverStatus === 'Pendiente') {
      Alert.alert(
        'Cuenta en Revisión',
        'Tu solicitud de registro se encuentra Pendiente de aprobación. No puedes ponerte Disponible hasta que tus documentos sean verificados.'
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

  const handleAcceptTrip = useCallback((requestData, fareInfo) => {
    setShowModal(false);
    Alert.alert(
      '¡Viaje Aceptado!',
      `Navegando al origen.\nGanancia Neta: $${fareInfo.driverEarnings.toLocaleString('es-CO')} COP`
    );
  }, []);

  const handleRejectTrip = useCallback((reason) => {
    setShowModal(false);
    setIncomingRequest(null);
    if (reason === 'timeout') {
      Alert.alert(
        'Tiempo agotado',
        'La solicitud ha sido rechazada automáticamente por el sistema.'
      );
    }
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Mapa de fondo (Leaflet dentro de un WebView) */}
      <LeafletMap
        latitude={location.latitude}
        longitude={location.longitude}
        available={isAvailable}
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
      </View>

      {/* Modal de solicitud entrante */}
      <IncomingRequestModal
        visible={showModal}
        requestData={incomingRequest}
        onAccept={handleAcceptTrip}
        onReject={handleRejectTrip}
      />
    </View>
  );
};

const styles = StyleSheet.create({
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