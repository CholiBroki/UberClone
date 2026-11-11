// AI-assisted: see docs/AI_LOG.md #20 #21
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, StatusBar, Platform,} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTripFlow } from '../context/TripFlowContext';
import { useTrip } from '../hooks/useTrip';
import { confirmCashPayment, simulateApprovedPayment } from '../service/tripService';
import { createPaymentPreference, syncPayment } from '../service/paymentService';
import MercadoPagoCheckout from '../components/MercadoPagoCheckout';
import {
  CATEGORY_LABELS, PAYMENT_LABELS, PAYMENT_STATUS_LABELS, formatCOP,
} from '../utils/labels';

const STATUS_COLORS = {
  approved: { bg: '#DCFCE7', fg: '#15803D' },
  cash: { bg: '#DCFCE7', fg: '#15803D' },
  pending: { bg: '#FEF3C7', fg: '#B45309' },
  rejected: { bg: '#FEE2E2', fg: '#B91C1C' },
};

const Row = ({ label, value, bold, negative }) => (
  <View style={styles.row}>
    <Text style={[styles.rowLabel, bold && styles.bold]}>{label}</Text>
    <Text style={[styles.rowValue, bold && styles.bold, negative && { color: '#B91C1C' }]}>{value}</Text>
  </View>
);

export default function TripSummaryScreen() {
  const { driver } = useAuth();
  const { summaryId, closeSummary } = useTripFlow();
  const { trip } = useTrip(summaryId);
  const [busy, setBusy] = useState(false);
  const [checkout, setCheckout] = useState(null); 

  if (!trip) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0052CC" />
      </View>
    );
  }

  const paid = trip.status === 'paid';
  const isCash = trip.paymentMethod === 'cash';
  const paymentStatus = trip.paymentStatus || 'pending';
  const colors = STATUS_COLORS[paymentStatus] || STATUS_COLORS.pending;
  const total = Number(trip.fare) + Number(trip.tip || 0);

  const run = async (fn, errorMessage) => {
    if (busy) return null;
    setBusy(true);
    try {
      return await fn();
    } catch (error) {
      console.log('TripSummaryScreen:', error);
      const known = ['NETWORK', 'NO_API_URL', 'API_ERROR'].includes(error.code);
      Alert.alert('Error', known ? error.message : errorMessage);
      return null;
    } finally {
      setBusy(false);
    }
  };

  const handleConfirmCash = () => {
    Alert.alert(
      'Confirmar cobro en efectivo',
      `¿Recibiste ${formatCOP(total)} del pasajero?`,
      [
        { text: 'Todavía no', style: 'cancel' },
        {
          text: 'Sí, recibido',
          onPress: () =>
            run(() => confirmCashPayment(trip.id, driver.id), 'No se pudo registrar el cobro.'),
        },
      ]
    );
  };

  const handlePayWithMercadoPago = async () => {
    const preference = await run(
      () => createPaymentPreference(trip),
      'No se pudo iniciar el pago con Mercado Pago.'
    );
    if (preference?.initPoint) {
      setCheckout({ initPoint: preference.initPoint, returnUrl: preference.returnUrl });
    }
  };

  const verifyPayment = async (showNotFound) => {
    const result = await run(() => syncPayment(trip.id), 'No se pudo verificar el pago.');
    if (result && result.found === false && showNotFound) {
      Alert.alert(
        'Sin pago registrado',
        'Todavía no hay un pago de este viaje en Mercado Pago. Si ya pagaste, espera unos segundos y verifica de nuevo.'
      );
    }
    return result;
  };

  const handleCheckoutFinish = async (result) => {
    setCheckout(null);
    const sync = await verifyPayment(false);
    if (!sync) return;

    if (sync.paymentStatus === 'rejected') {
      Alert.alert('Pago rechazado', 'El pago no fue aprobado. Puedes intentarlo de nuevo.');
    } else if (sync.paymentStatus === 'pending' && sync.status !== 'paid') {
      Alert.alert('Pago pendiente', 'Mercado Pago aún está procesando el pago. Verifica de nuevo en unos segundos.');
    } else if (result === 'success' && sync.found === false) {
      Alert.alert('Verificando pago', 'Aún no vemos el pago. Toca "Verificar pago" en unos segundos.');
    }
  };

  const handleCheckoutClose = () => {
    setCheckout(null);
    verifyPayment(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <View style={[styles.iconCircle, paid && { backgroundColor: '#DCFCE7' }]}>
          <Ionicons
            name={paid ? 'checkmark-circle' : 'receipt-outline'}
            size={44}
            color={paid ? '#16A34A' : '#0056D2'}
          />
        </View>
        <Text style={styles.title}>{paid ? 'Viaje pagado' : 'Cobro del viaje'}</Text>
        <Text style={styles.route} numberOfLines={2}>
          {trip.origin?.address} → {trip.destination?.address}
        </Text>
      </View>

      <View style={styles.card}>
        <Row label="Categoría" value={CATEGORY_LABELS[trip.category] || trip.category} />
        <Row label="Distancia y duración" value={`${trip.distanceKm} km · ${trip.durationMin} min`} />
        <Row label="Método de pago" value={PAYMENT_LABELS[trip.paymentMethod] || trip.paymentMethod} />
      </View>

      <View style={styles.card}>
        <Row label="Tarifa final" value={formatCOP(trip.fare)} />
        <Row
          label={`Comisión plataforma (${Math.round((trip.commissionRate || 0) * 100)} %)`}
          value={`-${formatCOP(trip.commission)}`}
          negative
        />
        <Row label="Propina" value={formatCOP(trip.tip)} />
        <View style={styles.divider} />
        <Row label="Ganancia neta" value={formatCOP(trip.driverEarnings)} bold />
      </View>

      <View style={styles.statusBox}>
        <Text style={styles.statusLabel}>Estado del pago</Text>
        <View style={[styles.chip, { backgroundColor: colors.bg }]}>
          <Text style={[styles.chipText, { color: colors.fg }]}>
            {PAYMENT_STATUS_LABELS[paymentStatus] || paymentStatus}
          </Text>
        </View>
      </View>

      {paid ? (
        <TouchableOpacity style={styles.mainButton} onPress={closeSummary} activeOpacity={0.85}>
          <Text style={styles.mainButtonText}>Listo</Text>
        </TouchableOpacity>
      ) : isCash ? (
        <TouchableOpacity
          style={[styles.mainButton, busy && { opacity: 0.7 }]}
          onPress={handleConfirmCash}
          disabled={busy}
          activeOpacity={0.85}
        >
          {busy ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.mainButtonText}>Confirmar cobro en efectivo</Text>
          )}
        </TouchableOpacity>
      ) : (
        <>
          {paymentStatus === 'rejected' && (
            <View style={styles.rejectedBox}>
              <Text style={styles.rejectedText}>
                El último pago fue rechazado. Puedes intentarlo de nuevo con otra tarjeta.
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.mainButton, busy && { opacity: 0.7 }]}
            onPress={handlePayWithMercadoPago}
            disabled={busy}
            activeOpacity={0.85}
          >
            {busy ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.mainButtonText}>
                {paymentStatus === 'rejected'
                  ? 'Reintentar pago'
                  : `Cobrar ${formatCOP(total)} con Mercado Pago`}
              </Text>
            )}
          </TouchableOpacity>

          {!!trip.paymentPreferenceId && (
            <TouchableOpacity
              style={styles.outlineButton}
              onPress={() => verifyPayment(true)}
              disabled={busy}
              activeOpacity={0.85}
            >
              <Ionicons name="refresh" size={16} color="#0056D2" />
              <Text style={styles.outlineButtonText}>Verificar pago</Text>
            </TouchableOpacity>
          )}
        </>
      )}

      {/* SOLO DESARROLLO: atajo para probar sin pasar por Mercado Pago */}
      {__DEV__ && !paid && !isCash && (
        <TouchableOpacity
          style={styles.devButton}
          disabled={busy}
          onPress={() =>
            run(() => simulateApprovedPayment(trip.id, driver.id), 'No se pudo simular el pago.')
          }
        >
          <Ionicons name="flask-outline" size={16} color="#0056D2" />
          <Text style={styles.devButtonText}>Simular pago aprobado (solo desarrollo)</Text>
        </TouchableOpacity>
      )}

      <MercadoPagoCheckout
        visible={!!checkout}
        initPoint={checkout?.initPoint}
        returnUrl={checkout?.returnUrl}
        onFinish={handleCheckoutFinish}
        onClose={handleCheckoutClose}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: {
    padding: 20,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 24 : 60,
    paddingBottom: 40,
  },
  header: { alignItems: 'center', marginBottom: 20 },
  iconCircle: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#EBF3FF',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  title: { fontSize: 22, fontWeight: '800', color: '#0A2540' },
  route: { fontSize: 13, color: '#64748B', marginTop: 6, textAlign: 'center' },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 6,
    borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 14,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  rowLabel: { fontSize: 14, color: '#64748B', flex: 1, paddingRight: 8 },
  rowValue: { fontSize: 14, fontWeight: '600', color: '#0A2540' },
  bold: { fontSize: 16, fontWeight: '800', color: '#0A2540' },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: '#E2E8F0' },
  statusBox: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 20,
  },
  statusLabel: { fontSize: 14, color: '#64748B' },
  chip: { paddingVertical: 5, paddingHorizontal: 14, borderRadius: 14 },
  chipText: { fontSize: 13, fontWeight: '800' },
  mainButton: {
    backgroundColor: '#0056D2', paddingVertical: 16, borderRadius: 30, alignItems: 'center', elevation: 4,
  },
  mainButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  outlineButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    marginTop: 12, paddingVertical: 13, borderRadius: 30, borderWidth: 1.5, borderColor: '#0056D2',
  },
  outlineButtonText: { color: '#0056D2', fontSize: 14, fontWeight: '700' },
  rejectedBox: { backgroundColor: '#FEE2E2', borderRadius: 14, padding: 14, marginBottom: 14 },
  rejectedText: { color: '#B91C1C', fontSize: 13, fontWeight: '600' },
  devButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    marginTop: 18, paddingVertical: 10, borderRadius: 14,
    borderWidth: 1, borderStyle: 'dashed', borderColor: '#94A3B8',
  },
  devButtonText: { fontSize: 12, fontWeight: '600', color: '#64748B' },
});