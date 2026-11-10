// AI-assisted: see docs/AI_LOG.md #11
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { calculateFare } from '../utils/calculateFare';

const IncomingRequestModal = ({ visible, requestData, onAccept, onReject }) => {
  const [timeLeft, setTimeLeft] = useState(15);

  const handleAutoReject = useCallback(() => {
    onReject('timeout');
  }, [onReject]);

  // Manejo del temporizador limpio sin llamadas síncronas en renderizado
  useEffect(() => {
    if (!visible) {
      setTimeLeft(15);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setTimeout(() => handleAutoReject(), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [visible, handleAutoReject]);

  if (!requestData || !visible) return null;

  // Cálculo de tarifa
  const fareInfo = calculateFare({
    distanceKm: requestData.distanceKm || 0,
    durationMin: requestData.durationMin || 0,
    category: requestData.category || 'economy',
    tip: requestData.tip || 0
  });

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={() => onReject('manual')}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header con Temporizador */}
          <View style={styles.header}>
            <View style={styles.timerBadge}>
              <Ionicons name="time-outline" size={18} color="#0056D2" />
              <Text style={styles.timerText}>{timeLeft}s</Text>
            </View>
            <Text style={styles.headerTitle}>¡Nueva Solicitud de Viaje!</Text>
          </View>

          {/* Resumen de Ganancias */}
          <View style={styles.earningsBox}>
            <View>
              <Text style={styles.earningsLabel}>Tu Ganancia Neta Est.</Text>
              <Text style={styles.earningsAmount}>
                ${fareInfo.driverEarnings.toLocaleString('es-CO')} COP
              </Text>
            </View>
            <View style={styles.fareTag}>
              <Text style={styles.fareTagText}>
                Tarifa: ${fareInfo.fare.toLocaleString('es-CO')}
              </Text>
            </View>
          </View>

          {/* Detalles del Recorrido */}
          <View style={styles.routeContainer}>
            {/* Origen */}
            <View style={styles.routeRow}>
              <Ionicons name="radio-button-on" size={18} color="#22C55E" />
              <View style={styles.routeTextContainer}>
                <Text style={styles.routeLabel}>Punto de Recogida</Text>
                <Text style={styles.routeAddress} numberOfLines={1}>
                  {requestData.originAddress || 'Calle 10 # 43A - 12, El Poblado'}
                </Text>
              </View>
            </View>

            <View style={styles.routeLine} />

            {/* Destino */}
            <View style={styles.routeRow}>
              <Ionicons name="location" size={18} color="#EF4444" />
              <View style={styles.routeTextContainer}>
                <Text style={styles.routeLabel}>Destino</Text>
                <Text style={styles.routeAddress} numberOfLines={1}>
                  {requestData.destinationAddress || 'CC Santafé, Medellín'}
                </Text>
              </View>
            </View>
          </View>

          {/* Datos Meta */}
          <View style={styles.metaGrid}>
            <View style={styles.metaItem}>
              <Ionicons name="navigate-outline" size={16} color="#64748B" />
              <Text style={styles.metaText}>{requestData.distanceKm} km</Text>
            </View>

            <View style={styles.metaItem}>
              <Ionicons name="stopwatch-outline" size={16} color="#64748B" />
              <Text style={styles.metaText}>{requestData.durationMin} min</Text>
            </View>

            <View style={styles.metaItem}>
              <Ionicons name="car-outline" size={16} color="#64748B" />
              <Text style={styles.metaText}>
                {requestData.category?.toUpperCase() || 'ECONÓMICO'}
              </Text>
            </View>

            <View style={styles.metaItem}>
              <Ionicons name="card-outline" size={16} color="#64748B" />
              <Text style={styles.metaText}>
                {requestData.paymentMethod === 'cash' ? 'Efectivo' : 'Mercado Pago'}
              </Text>
            </View>
          </View>

          {/* Botones de Acción */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.rejectButton}
              onPress={() => onReject('manual')}
            >
              <Text style={styles.rejectText}>Rechazar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.acceptButton}
              onPress={() => onAccept(requestData, fareInfo)}
            >
              <Text style={styles.acceptText}>Aceptar Viaje</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 37, 69, 0.65)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF3FF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 4,
  },
  timerText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0056D2',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0A2540',
  },
  earningsBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  earningsLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  earningsAmount: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#16A34A',
    marginTop: 2,
  },
  fareTag: {
    backgroundColor: '#DCFCE7',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  fareTagText: {
    fontSize: 11,
    color: '#15803D',
    fontWeight: 'bold',
  },
  routeContainer: {
    marginBottom: 16,
    paddingLeft: 4,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  routeTextContainer: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  routeAddress: {
    fontSize: 14,
    color: '#0A2540',
    fontWeight: '600',
  },
  routeLine: {
    width: 2,
    height: 18,
    backgroundColor: '#CBD5E1',
    marginLeft: 8,
    marginVertical: 2,
  },
  metaGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 12,
    marginBottom: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
  },
  rejectText: {
    color: '#64748B',
    fontWeight: 'bold',
    fontSize: 15,
  },
  acceptButton: {
    flex: 2,
    backgroundColor: '#0056D2',
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
    elevation: 4,
  },
  acceptText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default IncomingRequestModal;