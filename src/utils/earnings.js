// AI-assisted: see docs/AI_LOG.md #22

export const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const startOfWeek = (date) => {
  const start = startOfDay(date);
  const daysSinceMonday = (start.getDay() + 6) % 7; // lunes = 0 ... domingo = 6
  start.setDate(start.getDate() - daysSinceMonday);
  return start;
};

export const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);

export const periodRanges = (now = new Date()) => ({
  today: startOfDay(now),
  week: startOfWeek(now),
  month: startOfMonth(now),
});

export const tripDate = (trip) => {
  const value = trip.completedAt || trip.paidAt || trip.createdAt;
  if (value?.toDate) return value.toDate();
  if (value instanceof Date) return value;
  return new Date(); 
};

export const filterFrom = (trips, from) => trips.filter((trip) => tripDate(trip) >= from);

export const summarize = (trips) => {
  const totals = trips.reduce(
    (acc, trip) => ({
      billed: acc.billed + (trip.fare || 0),
      commissions: acc.commissions + (trip.commission || 0),
      tips: acc.tips + (trip.tip || 0),
      net: acc.net + (trip.driverEarnings || 0),
    }),
    { billed: 0, commissions: 0, tips: 0, net: 0 }
  );
  const count = trips.length;
  return { count, ...totals, average: count ? Math.round(totals.net / count) : 0 };
};

export const computeBalance = (trips) => {
  let gateway = 0;
  let cashCommissions = 0;
  trips.forEach((trip) => {
    if (trip.paymentMethod === 'cash') {
      cashCommissions += trip.commission || 0;
    } else {
      gateway += trip.driverEarnings || 0;
    }
  });
  return { gateway, cashCommissions, balance: gateway - cashCommissions };
};