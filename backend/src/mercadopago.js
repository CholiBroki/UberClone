// AI-assisted: see docs/AI_LOG.md #21
const MP_API = 'https://api.mercadopago.com';

async function mpFetch(pathname, options = {}) {
  const response = await fetch(`${MP_API}${pathname}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(`Mercado Pago ${response.status}: ${data.message || JSON.stringify(data)}`);
    error.status = response.status;
    throw error;
  }
  return data;
}

const createPreference = (body) =>
  mpFetch('/checkout/preferences', { method: 'POST', body: JSON.stringify(body) });

const getPayment = (paymentId) => mpFetch(`/v1/payments/${encodeURIComponent(paymentId)}`);

const searchPaymentsByReference = async (externalReference) => {
  const query = new URLSearchParams({
    external_reference: externalReference,
    sort: 'date_created',
    criteria: 'desc',
  });
  const data = await mpFetch(`/v1/payments/search?${query.toString()}`);
  return data.results || [];
};

module.exports = { createPreference, getPayment, searchPaymentsByReference };