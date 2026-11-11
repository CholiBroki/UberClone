// AI-assisted: see docs/AI_LOG.md #21
import React, { useState, useRef, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, StatusBar, Platform,} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';

export default function MercadoPagoCheckout({ visible, initPoint, returnUrl, onFinish, onClose }) {
  const [loading, setLoading] = useState(true);
  const finishedRef = useRef(false);

  useEffect(() => {
    if (visible) {
      finishedRef.current = false;
      setLoading(true);
    }
  }, [visible]);

  const handleRequest = (request) => {
    const url = request.url || '';

    if (returnUrl && url.startsWith(returnUrl)) {
      if (!finishedRef.current) {
        finishedRef.current = true;
        const result = url.slice(returnUrl.length).split(/[/?#]/).filter(Boolean)[0] || 'unknown';
        onFinish(result);
      }
      return false;
    }

    return /^(https?:|about:|data:|blob:)/i.test(url);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={26} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Pago con Mercado Pago</Text>
          <View style={{ width: 40 }} />
        </View>

        {!!initPoint && (
          <WebView
            source={{ uri: initPoint }}
            style={{ flex: 1 }}
            javaScriptEnabled
            domStorageEnabled
            thirdPartyCookiesEnabled
            sharedCookiesEnabled
            setSupportMultipleWindows={false}
            onShouldStartLoadWithRequest={handleRequest}
            onLoadEnd={() => setLoading(false)}
          />
        )}

        {loading && (
          <View style={styles.loader} pointerEvents="none">
            <ActivityIndicator size="large" color="#0056D2" />
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    backgroundColor: '#0B2545',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 8 : 50,
    paddingBottom: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  loader: {
    ...StyleSheet.absoluteFillObject,
    top: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
});