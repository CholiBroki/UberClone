// AI-assisted: see docs/AI_LOG.md #3 #15
import PRICING_CONFIG from '../config/pricing';

export const calculateFare = ({ distanceKm, durationMin, category = 'economy', tip = 0 }) => {
  const multiplier = PRICING_CONFIG.CATEGORY_MULTIPLIERS[category] || 1.0;
  
  const rawCalculated = PRICING_CONFIG.BASE_FARE + 
    (distanceKm * PRICING_CONFIG.PRICE_PER_KM) + 
    (durationMin * PRICING_CONFIG.PRICE_PER_MINUTE);

  const rawFareWithCategory = rawCalculated * multiplier;

  const rawFare = Math.max(PRICING_CONFIG.MINIMUM_FARE, rawFareWithCategory);

  const fare = Math.round(rawFare / 100) * 100;

  const commission = fare * PRICING_CONFIG.PLATFORM_COMMISSION_RATE;

  // Ganancia neta exacta sin mezclar la propina en el desglose base
  const driverEarnings = fare - commission;

  return {
    fare,
    commission,
    driverEarnings,
    tip,
    totalDriverEarningsWithTip: driverEarnings + tip,
    commissionRate: PRICING_CONFIG.PLATFORM_COMMISSION_RATE
  };
};