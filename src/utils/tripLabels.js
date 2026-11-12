// AI-assisted: see docs/AI_LOG.md #23
export const PAYMENT_METHOD_KEYS = {
  cash: 'methodCash',
  mercadopago: 'methodMercadoPago',
  stripe: 'methodStripe',
};

export const PAYMENT_STATUS_KEYS = {
  pending: 'payStatusPending',
  approved: 'payStatusApproved',
  rejected: 'payStatusRejected',
  cash: 'payStatusCash',
};

export const PAYMENT_STATUS_COLORS = {
  approved: { bg: '#DCFCE7', fg: '#15803D' },
  cash: { bg: '#DCFCE7', fg: '#15803D' },
  pending: { bg: '#FEF3C7', fg: '#B45309' },
  rejected: { bg: '#FEE2E2', fg: '#B91C1C' },
};