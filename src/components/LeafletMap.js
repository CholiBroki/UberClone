// AI-assisted: see docs/AI_LOG.md #16
import React, { useRef, useEffect, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

const buildHtml = (lat, lng) => `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; background: #E5E7EB; }
    .leaflet-control-attribution { display: none !important; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    var map = L.map('map', { zoomControl: false }).setView([${lat}, ${lng}], 15);

    var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
    var esri = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19 });

    var errorCount = 0;
    osm.on('tileerror', function () {
      errorCount++;
      if (errorCount >= 4) {
        map.removeLayer(osm);
        esri.addTo(map);
      }
    });

    // Marcador del Conductor
    var driverMarker = L.circleMarker([${lat}, ${lng}], {
      radius: 10,
      color: '#FFFFFF',
      weight: 3,
      fillColor: '#EF4444',
      fillOpacity: 1
    }).addTo(map);

    var routePolyline = null;
    var originMarker = null;
    var destMarker = null;

    // Actualizar posición del Conductor
    window.setPos = function (lat, lng) {
      driverMarker.setLatLng([lat, lng]);
      if (!routePolyline) {
        map.setView([lat, lng], map.getZoom());
      }
    };

    window.setAvailable = function (available) {
      driverMarker.setStyle({ fillColor: available ? '#22C55E' : '#EF4444' });
    };

    // Trazar Ruta usando la API de OSRM
    window.drawRoute = function (startLat, startLng, endLat, endLng) {
      var osrmUrl = 'https://router.project-osrm.org/route/v1/driving/' + 
                    startLng + ',' + startLat + ';' + endLng + ',' + endLat + 
                    '?overview=full&geometries=geojson';

      fetch(osrmUrl)
        .then(function(response) { return response.json(); })
        .then(function(data) {
          if (data.routes && data.routes.length > 0) {
            var route = data.routes[0];
            var coordinates = route.geometry.coordinates.map(function(coord) {
              return [coord[1], coord[0]];
            });

            // Limpiar ruta previa
            if (routePolyline) map.removeLayer(routePolyline);
            if (originMarker) map.removeLayer(originMarker);
            if (destMarker) map.removeLayer(destMarker);

            // Trazar línea de trayectoria en azul
            routePolyline = L.polyline(coordinates, { color: '#0056D2', weight: 5, opacity: 0.8 }).addTo(map);

            // Marcador Origen (Verde)
            originMarker = L.circleMarker([startLat, startLng], {
              radius: 8, color: '#FFFFFF', weight: 2, fillColor: '#22C55E', fillOpacity: 1
            }).addTo(map);

            // Marcador Destino (Rojo)
            destMarker = L.circleMarker([endLat, endLng], {
              radius: 8, color: '#FFFFFF', weight: 2, fillColor: '#EF4444', fillOpacity: 1
            }).addTo(map);

            // Ajustar vista para mostrar toda la ruta
            map.fitBounds(routePolyline.getBounds(), { padding: [50, 50] });
          }
        })
        .catch(function(err) {
          console.error('Error al obtener ruta OSRM:', err);
        });
    };

    // Limpiar Ruta Trazada
    window.clearRoute = function () {
      if (routePolyline) { map.removeLayer(routePolyline); routePolyline = null; }
      if (originMarker) { map.removeLayer(originMarker); originMarker = null; }
      if (destMarker) { map.removeLayer(destMarker); destMarker = null; }
    };
  </script>
</body>
</html>`;

const LeafletMap = ({ latitude, longitude, available, route }) => {
  const webRef = useRef(null);
  const html = useMemo(() => buildHtml(latitude, longitude), []);

  useEffect(() => {
    webRef.current?.injectJavaScript(
      `window.setPos && window.setPos(${latitude}, ${longitude}); true;`
    );
  }, [latitude, longitude]);

  useEffect(() => {
    webRef.current?.injectJavaScript(
      `window.setAvailable && window.setAvailable(${available}); true;`
    );
  }, [available]);

  // Dibujar o limpiar ruta cuando cambie el objeto route
  useEffect(() => {
    if (route && route.origin && route.destination) {
      const { origin, destination } = route;
      webRef.current?.injectJavaScript(
        `window.drawRoute && window.drawRoute(${origin.latitude}, ${origin.longitude}, ${destination.latitude}, ${destination.longitude}); true;`
      );
    } else {
      webRef.current?.injectJavaScript(`window.clearRoute && window.clearRoute(); true;`);
    }
  }, [route]);

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