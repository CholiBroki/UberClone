// AI-assisted: see docs/AI_LOG.md #21
require('dotenv').config();

const express = require('express');

if (!process.env.MP_ACCESS_TOKEN) {
  console.error('Falta MP_ACCESS_TOKEN en el archivo .env');
  process.exit(1);
}

const { router: paymentsRouter } = require('./payments');

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

app.get('/health', (req, res) => res.json({ ok: true }));
app.use('/payments', paymentsRouter);

app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

const PORT = Number(process.env.PORT) || 3000;

if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend de pagos escuchando en http://0.0.0.0:${PORT}`);
    console.log(`Token de Mercado Pago cargado (${process.env.MP_ACCESS_TOKEN.slice(0, 8)}...)`);
    if (!process.env.PUBLIC_BASE_URL) {
      console.log('Sin PUBLIC_BASE_URL: no se recibirán webhooks, se usa la sincronización al volver del checkout.');
    }
  });
}

module.exports = app;