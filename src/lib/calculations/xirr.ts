export type DatedCashFlow = {
  date: Date;
  amount: number;
};

function xnpv(rate: number, cashFlows: DatedCashFlow[]): number {
  const firstDate = cashFlows[0]?.date;
  if (!firstDate || rate <= -1) return Number.NaN;
  return cashFlows.reduce((sum, flow) => {
    const years =
      (flow.date.getTime() - firstDate.getTime()) /
      (365.25 * 24 * 60 * 60 * 1000);
    return sum + flow.amount / Math.pow(1 + rate, years);
  }, 0);
}

export function calculateXirr(cashFlows: DatedCashFlow[]): number | null {
  if (
    cashFlows.length < 2 ||
    !cashFlows.some((flow) => flow.amount < 0) ||
    !cashFlows.some((flow) => flow.amount > 0)
  ) {
    return null;
  }

  const sorted = [...cashFlows].sort(
    (a, b) => a.date.getTime() - b.date.getTime(),
  );
  let low = -0.9999;
  let high = 10;
  let lowValue = xnpv(low, sorted);
  let highValue = xnpv(high, sorted);

  while (Number.isFinite(highValue) && lowValue * highValue > 0 && high < 1_000_000) {
    high *= 2;
    highValue = xnpv(high, sorted);
  }
  if (!Number.isFinite(lowValue) || !Number.isFinite(highValue) || lowValue * highValue > 0) {
    return null;
  }

  for (let iteration = 0; iteration < 200; iteration += 1) {
    const mid = (low + high) / 2;
    const midValue = xnpv(mid, sorted);
    if (!Number.isFinite(midValue)) return null;
    if (Math.abs(midValue) < 0.000001) return mid * 100;
    if (lowValue * midValue <= 0) {
      high = mid;
    } else {
      low = mid;
      lowValue = midValue;
    }
  }

  return ((low + high) / 2) * 100;
}
