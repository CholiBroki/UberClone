// AI-assisted: see docs/AI_LOG.md #15
import React, { useRef, useEffect, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

// Genera la página HTML que se mostrará dentro del WebView.
// Solo se usa para la carga inicial; después se actualiza con JavaScript.
const buildHtml = (lat, lng) => `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; background: #E5E7EB; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    // 1. Crear el mapa centrado en la posición inicial
    var map = L.map('map', { zoomControl: false }).setView([${lat}, ${lng}], 16);

    // 2. Capa principal: OpenStreetMap (gratis, sin API key)
    var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    });

    // 3. Capa de respaldo: Esri World Street Map (gratis, sin API key)
    //    Ojo: en Esri el orden es {z}/{y}/{x}
    var esri = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 19,
        attribution: 'Tiles &copy; Esri'
      }
    );

    osm.addTo(map);

    // Si OSM falla varias veces (por ejemplo, bloqueo 403), cambiar a Esri
    var errorCount = 0;
    var switched = false;
    osm.on('tileerror', function () {
      errorCount++;
      if (errorCount >= 4 && !switched) {
        switched = true;
        map.removeLayer(osm);
        esri.addTo(map);
      }
    });

    // 4. Marcador del conductor (círculo de color)
    var me = L.circleMarker([${lat}, ${lng}], {
      radius: 10,
      color: '#FFFFFF',
      weight: 3,
      fillColor: '#EF4444',
      fillOpacity: 1
    }).addTo(map);

    // 5. Funciones que React Native llamará desde afuera
    window.setPos = function (lat, lng) {
      me.setLatLng([lat, lng]);
      map.setView([lat, lng], map.getZoom());
    };

    window.setAvailable = function (available) {
      me.setStyle({ fillColor: available ? '#22C55E' : '#EF4444' });
    };
  </script>
</body>
</html>`;

const LeafletMap = ({ latitude, longitude, available }) => {
  const webRef = useRef(null);

  // El HTML se genera una sola vez (arreglo de dependencias vacío).
  // Si dependiera de latitude/longitude, el mapa se recargaría en cada movimiento.
  const html = useMemo(() => buildHtml(latitude, longitude), []);

  // Cuando cambia la ubicación, mover el marcador y centrar el mapa
  useEffect(() => {
    webRef.current?.injectJavaScript(
      `window.setPos && window.setPos(${latitude}, ${longitude}); true;`
    );
  }, [latitude, longitude]);

  // Cuando cambia la disponibilidad, cambiar el color del marcador
  useEffect(() => {
    webRef.current?.injectJavaScript(
      `window.setAvailable && window.setAvailable(${available}); true;`
    );
  }, [available]);

  return (
    <WebView
      ref={webRef}
      originWhitelist={['*']}
      source={{ html, baseUrl: 'https://localhost' }}
      style={StyleSheet.absoluteFillObject}
      javaScriptEnabled
      domStorageEnabled
    />
  );
};

export default LeafletMap;