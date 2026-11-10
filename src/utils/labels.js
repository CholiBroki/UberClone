// AI-assisted: see docs/AI_LOG.md #20
export const CATEGORY_LABELS = { economy: 'Económico', xl: 'XL', premium: 'Premium' };

export const PAYMENT_LABELS = {
  mercadopago: 'Mercado Pago',
  stripe: 'Stripe',
  cash: 'Efectivo',
};

export const PAYMENT_STATUS_LABELS = {
  pending: 'Pendiente',
  approved: 'Aprobado',
  rejected: 'Rechazado',
  cash: 'Efectivo',
};

export const formatCOP = (n) => `$${Number(n || 0).toLocaleString('es-CO')} COP`;