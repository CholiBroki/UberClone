// AI-assisted: see docs/AI_LOG.md #21
const fs = require('fs');
const path = require('path');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');

const keyPath = path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './serviceAccountKey.json');

if (!fs.existsSync(keyPath)) {
  console.error(`No se encontró la cuenta de servicio de Firebase en: ${keyPath}`);
  console.error('Descárgala en Firebase > Configuración del proyecto > Cuentas de servicio > Generar nueva clave privada.');
  process.exit(1);
}

const app = initializeApp({ credential: cert(require(keyPath)) });

module.exports = {
  db: getFirestore(app),
  auth: getAuth(app),
  FieldValue,
};