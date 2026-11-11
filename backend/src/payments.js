// AI-assisted: see docs/AI_LOG.md #21
const crypto = require('crypto');
const express = require('express');
const { db } = require('./firebase');
const { requireAuth } = require('./auth');
const { createPreference, getPayment, searchPaymentsByReference } = require('./mercadopago');
const { applyPayment } = require('./tripPayments');

const router = express.Router();

async function loadOwnTrip(tripId, uid) {
  if (!tripId || typeof tripId !== 'string') {
    return { error: { code: 400, message: 'tripId es obligatorio' } };
  }
  const snap = await db.collection('trips').doc(tripId).get();
  if (!snap.exists) return { error: { code: 404, message: 'El viaje no existe' } };
  const trip = snap.data();
  if (trip.driverId !== uid) return { error: { code: 403, message: 'Este viaje no es tuyo' } };
  return { snap, trip };
}

router.post('/preference', requireAuth, async (req, res) => {
  try {
    const { tripId, amount } = req.body || {};
    const { snap, trip, error } = await loadOwnTrip(tripId, req.uid);
    if (error) return res.status(error.code).json({ error: error.message });

    if (trip.status !== 'completed') {
      return res.status(409).json({ error: 'El viaje todavía no está listo para cobrar' });
    }
    if (trip.paymentMethod !== 'mercadopago') {
      return res.status(400).json({ error: 'Este viaje no se paga con Mercado Pago' });
    }

    const total = Number(trip.fare) + Number(trip.tip || 0);
    if (!Number.isInteger(total) || total <= 0) {
      return res.status(400).json({ error: 'El viaje no tiene un monto válido' });
    }
    if (amount !== undefined && Number(amount) !== total) {
      return res.status(400).json({ error: 'El monto enviado no coincide con el del viaje' });
    }

    const returnUrl = (process.env.RETURN_URL || 'https://example.com/pago').replace(/\/$/, '');
    const publicBase = (process.env.PUBLIC_BASE_URL || '').replace(/\/$/, '');

    const preference = await createPreference({
      items: [
        {
          id: tripId,
          title: 'Viaje UberClone',
          quantity: 1,
          currency_id: 'COP',
          unit_price: total,
        },
      ],
      external_reference: tripId,
      back_urls: {
        success: `${returnUrl}/success`,
        failure: `${returnUrl}/failure`,
        pending: `${returnUrl}/pending`,
      },
      auto_return: 'approved',
      ...(publicBase ? { notification_url: `${publicBase}/payments/webhook` } : {}),
      statement_descriptor: 'UBERCLONE',
      metadata: { tripId, driverId: req.uid },
    });

    await snap.ref.update({ paymentPreferenceId: preference.id, paymentStatus: 'pending' });

    return res.json({
      preferenceId: preference.id,
      initPoint: preference.init_point,
      returnUrl,
    });
  } catch (error) {
    console.error('[pagos] Error creando la preferencia:', error.message);
    return res.status(502).json({ error: 'No se pudo crear el pago con Mercado Pago' });
  }
});

router.post('/sync', requireAuth, async (req, res) => {
  try {
    const { tripId } = req.body || {};
    const { trip, error } = await loadOwnTrip(tripId, req.uid);
    if (error) return res.status(error.code).json({ error: error.message });

    if (trip.status === 'paid') {
      return res.json({ found: true, status: 'paid', paymentStatus: trip.paymentStatus });
    }

    const payments = await searchPaymentsByReference(tripId);
    if (payments.length === 0) {
      return res.json({ found: false, status: trip.status, paymentStatus: trip.paymentStatus });
    }

    const payment = payments.find((p) => p.status === 'approved') || payments[0];
    const outcome = await applyPayment(payment);
    return res.json({ found: true, mpStatus: payment.status, ...outcome });
  } catch (error) {
    console.error('[pagos] Error sincronizando el pago:', error.message);
    return res.status(502).json({ error: 'No se pudo consultar el pago en Mercado Pago' });
  }
});

function hasValidSignature(req) {
  const secret = process.env.MP_WEBHOOK_SECRET;
  const header = req.get('x-signature');
  if (!secret || !header) return false;

  const parts = {};
  header.split(',').forEach((piece) => {
    const [key, ...rest] = piece.trim().split('=');
    parts[key] = rest.join('=');
  });
  if (!parts.ts || !parts.v1) return false;

  const dataId = req.query['data.id'];
  const requestId = req.get('x-request-id');

  // Plantilla oficial: id:[data.id];request-id:[x-request-id];ts:[ts]; (se omiten los que no vengan)
  let manifest = '';
  if (dataId) manifest += `id:${String(dataId).toLowerCase()};`;
  if (requestId) manifest += `request-id:${requestId};`;
  manifest += `ts:${parts.ts};`;

  const expected = crypto.createHmac('sha256', secret).update(manifest).digest('hex');
  const received = Buffer.from(parts.v1, 'hex');
  const computed = Buffer.from(expected, 'hex');
  return received.length === computed.length && crypto.timingSafeEqual(received, computed);
}

/* POST /payments/webhook
   Mercado Pago avisa cuando un pago se crea o cambia. Solo recibe un id: el estado
   real se consulta a la API con el access_token, nunca se confía en el cuerpo. */
router.post('/webhook', async (req, res) => {
  if (process.env.MP_WEBHOOK_SECRET && !hasValidSignature(req)) {
    console.warn('[webhook] Firma inválida: notificación rechazada');
    return res.sendStatus(401);
  }

  // Responder rápido (Mercado Pago reintenta si tarda) y procesar después
  res.sendStatus(200);

  const body = req.body || {};
  const type = req.query.type || req.query.topic || body.type || body.topic;
  const dataId = req.query['data.id'] || req.query.id || body.data?.id;
  if (type !== 'payment' || !dataId) return;

  try {
    const payment = await getPayment(dataId);
    const outcome = await applyPayment(payment);
    console.log(`[webhook] Pago ${dataId} (${payment.status}) ->`, outcome);
  } catch (error) {
    console.error('[webhook] Error procesando el pago:', error.message);
  }
});

module.exports = { router, hasValidSignature };