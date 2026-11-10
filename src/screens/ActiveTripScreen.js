// AI-assisted: see docs/AI_LOG.md #20
import React, { useState, useMemo, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, StatusBar, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LeafletMap from '../components/LeafletMap';
import { useAuth } from '../context/AuthContext';
import { useTripFlow } from '../context/TripFlowContext';
import { useDriverLocation } from '../hooks/useDriverLocation';
import { startArriving, passengerOnBoard, completeTrip, cancelTrip } from '../service/tripService';
import { calculateFare } from '../utils/calculateFare';
import { haversineKm } from '../utils/geo';
import { CATEGORY_LABELS, PAYMENT_LABELS, formatCOP } from '../utils/labels';

const STATUS_INFO = {
  accepted: {
    title: 'Viaje aceptado',
    subtitle: 'Dirígete al punto de recogida cuando estés listo.',
    action: 'Salir hacia el pasajero',
    icon: 'navigate',
  },
  driver_arriving: {
    title: 'Hacia el punto de recogida',
    subtitle: 'Recoge al pasajero y toca "Pasajero a bordo".',
    action: 'Pasajero a bordo',
    icon: 'person-add',
  },
  in_progress: {
    title: 'Viaje en curso',
    subtitle: 'Lleva al pasajero a su destino.',
    action: 'Finalizar viaje',
    icon: 'flag',
  },
};


function useRouteStart(location, thresholdKm = 0.3) {
  const [start, setStart] = useState(null);

  useEffect(() => {
    const current = { latitude: location.latitude, longitude: location.longitude };
    if (
      !start ||
      haversineKm(
        { lat: start.latitude, lng: start.longitude },
        { lat: current.latitude, lng: current.longitude }
      ) > thresholdKm
    ) {
      setStart(current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.latitude, location.longitude]);

  return start;
}

const InfoRow = ({ icon, label, value, color }) => (
  <View style={styles.infoRow}>
    <Ionicons name={icon} size={18} color={color || '#64748B'} style={styles.infoIcon} />
    <View style={{ flex: 1 }}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={2}>{value}</Text>
    </View>
  </View>
);

export default function ActiveTripScreen() {
  const { driver } = useAuth();
  const { trip } = useTripFlow();
  const [busy, setBusy] = useState(false);

  // Sigue enviando la ubicación, pero sin marcarse "disponible": está ocupado
  const { location } = useDriverLocation(true, driver?.status, driver?.id, { markAvailable: false });
  const routeStart = useRouteStart(location);

  const status = trip?.status;
  const oLat = trip?.origin?.lat;
  const oLng = trip?.origin?.lng;
  const dLat = trip?.destination?.lat;
  const dLng = trip?.destination?.lng;

  const route = useMemo(() => {
    if (oLat == null || dLat == null) return null;
    if (status === 'in_progress') {
      return {
        origin: { latitude: oLat, longitude: oLng },
        destination: { latitude: dLat, longitude: dLng },
      };
    }
    if (routeStart) {
      return { origin: routeStart, destination: { latitude: oLat, longitude: oLng } };
    }
    return null;
  }, [status, oLat, oLng, dLat, dLng, routeStart]);

  const estimate = useMemo(
    () =>
      trip
        ? calculateFare({
            distanceKm: trip.distanceKm,
            durationMin: trip.durationMin,
            category: trip.category,
            tip: trip.tip || 0,
          })
        : null,
    [trip]
  );

  if (!trip || !STATUS_INFO[status]) return null;
  const info = STATUS_INFO[status];
  const canCancel = status === 'accepted' || status === 'driver_arriving';

  const run = async (fn, errorMessage) => {
    if (busy) return;
    setBusy(true);
    try {
      await fn();
    } catch (error) {
      console.log('ActiveTripScreen:', error);
      Alert.alert(
        'Error',
        error.code === 'INVALID_STATE'
          ? 'El viaje cambió de estado. Revisa la pantalla.'
          : errorMessage
      );
    } finally {
      setBusy(false);
    }
  };

  const handleMainAction = () => {
    if (status === 'accepted') {
      run(() => startArriving(trip.id, driver.id), 'No se pudo iniciar la ruta. Intenta de nuevo.');
    } else if (status === 'driver_arriving') {
      run(() => passengerOnBoard(trip.id, driver.id), 'No se pudo registrar al pasajero a bordo.');
    } else if (status === 'in_progress') {
      Alert.alert('Finalizar viaje', '¿Confirmas que el pasajero llegó a su destino?', [
        { text: 'Todavía no', style: 'cancel' },
        {
          text: 'Finalizar',
          onPress: () => run(() => completeTrip(trip.id, driver.id), 'No se pudo finalizar el viaje.'),
        },
      ]);
    }
  };

  const handleCancel = () => {
    Alert.alert('Cancelar viaje', '¿Seguro que quieres cancelar este viaje?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Sí, cancelar',
        style: 'destructive',
        onPress: () => run(() => cancelTrip(trip.id, driver.id), 'No se pudo cancelar el viaje.'),
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <LeafletMap
        latitude={location.latitude}
        longitude={location.longitude}
        available
        route={route}
      />

      <View style={styles.topChip}>
        <Ionicons name={info.icon} size={18} color="#0056D2" />
        <Text style={styles.topChipText}>{info.title}</Text>
      </View>

      <View style={styles.panel}>
        <Text style={styles.subtitle}>{info.subtitle}</Text>

        <InfoRow icon="radio-button-on" color="#22C55E" label="Recogida" value={trip.origin?.address} />
        <InfoRow icon="location" color="#EF4444" label="Destino" value={trip.destination?.address} />

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{trip.distanceKm} km</Text>
            <Text style={styles.statLabel}>Distancia</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{trip.durationMin} min</Text>
            <Text style={styles.statLabel}>Duración</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{CATEGORY_LABELS[trip.category] || trip.category}</Text>
            <Text style={styles.statLabel}>Categoría</Text>
          </View>
        </View>

        <View style={styles.earningsBox}>
          <View>
            <Text style={styles.earningsLabel}>Ganancia neta estimada</Text>
            <Text style={styles.earningsPayment}>
              Pago: {PAYMENT_LABELS[trip.paymentMethod] || trip.paymentMethod}
            </Text>
          </View>
          <Text style={styles.earningsValue}>{formatCOP(estimate.driverEarnings)}</Text>
        </View>

        <TouchableOpacity
          style={[styles.mainButton, busy && { opacity: 0.7 }]}
          onPress={handleMainAction}
          disabled={busy}
          activeOpacity={0.85}
        >
          {busy ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.mainButtonText}>{info.action}</Text>
          )}
        </TouchableOpacity>

        {canCancel && (
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel} disabled={busy}>
            <Text style={styles.cancelText}>Cancelar viaje</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E5E7EB' },
  topChip: {
    position: 'absolute',
    top: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 12 : 56,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 24,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  topChipText: { fontSize: 14, fontWeight: '700', color: '#0A2540' },
  panel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingBottom: 28,
    elevation: 12,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -3 },
  },
  subtitle: { fontSize: 13, color: '#64748B', marginBottom: 14 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  infoIcon: { marginTop: 2, marginRight: 10 },
  infoLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase' },
  infoValue: { fontSize: 14, color: '#0A2540', fontWeight: '600' },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingVertical: 12,
    marginVertical: 6,
  },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 14, fontWeight: '700', color: '#0A2540' },
  statLabel: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  earningsBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#EBF3FF',
    borderRadius: 14,
    padding: 14,
    marginTop: 8,
  },
  earningsLabel: { fontSize: 12, color: '#0056D2', fontWeight: '700' },
  earningsPayment: { fontSize: 11, color: '#64748B', marginTop: 2 },
  earningsValue: { fontSize: 18, fontWeight: '800', color: '#0056D2' },
  mainButton: {
    backgroundColor: '#0056D2',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 16,
    elevation: 4,
  },
  mainButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  cancelButton: { alignItems: 'center', paddingVertical: 12, marginTop: 4 },
  cancelText: { color: '#EF4444', fontSize: 14, fontWeight: '700' },
});