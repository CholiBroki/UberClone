// AI-assisted: see docs/AI_LOG.md #21
const { db, FieldValue } = require('./firebase');

async function applyPayment(payment) {
  const tripId = payment.external_reference;
  if (!tripId) return { ignored: 'El pago no tiene external_reference' };

  const ref = db.collection('trips').doc(tripId);

  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) return { ignored: 'El viaje no existe' };

    const trip = snap.data();

    if (trip.status === 'paid') {
      return { status: 'paid', paymentStatus: trip.paymentStatus, ignored: 'Ya estaba pagado' };
    }
    if (trip.status !== 'completed') {
      return { ignored: `El viaje está en estado ${trip.status}` };
    }

    const mpStatus = payment.status;

    if (mpStatus === 'approved') {
      const expected = Number(trip.fare) + Number(trip.tip || 0);
      if (Number(payment.transaction_amount) !== expected || payment.currency_id !== 'COP') {
        console.warn(
          `[pagos] Monto/moneda no coinciden en el viaje ${tripId}: ` +
            `esperado ${expected} COP, recibido ${payment.transaction_amount} ${payment.currency_id}`
        );
        return { ignored: 'El monto del pago no coincide con el del viaje' };
      }

      tx.update(ref, {
        status: 'paid',
        paymentStatus: 'approved',
        paymentId: String(payment.id),
        paidAt: FieldValue.serverTimestamp(),
      });
      return { status: 'paid', paymentStatus: 'approved' };
    }

    if (mpStatus === 'rejected' || mpStatus === 'cancelled') {
      tx.update(ref, { paymentStatus: 'rejected', paymentId: String(payment.id) });
      return { status: 'completed', paymentStatus: 'rejected' };
    }

    tx.update(ref, { paymentStatus: 'pending', paymentId: String(payment.id) });
    return { status: 'completed', paymentStatus: 'pending' };
  });
}

module.exports = { applyPayment };