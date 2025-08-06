export function parseCurrency(value: string | number | null | undefined): number {
  if (value === null || value === undefined) {
    return NaN;
  }
  if (typeof value === 'number') {
    return isFinite(value) ? value : NaN;
  }
  if (typeof value === 'string') {
    const cleanedValue = value.replace(/[^0-9.-]+/g, "");
    const parsedValue = parseFloat(cleanedValue);
    return isFinite(parsedValue) ? parsedValue : NaN;
  }
  return NaN;
}

export function formatCurrency(value: number, showSymbol: boolean = true): string {
  const parsed = isNaN(value) ? 0 : value;
  const formatter = new Intl.NumberFormat('en-US', {
    style: showSymbol ? 'currency' : 'decimal',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return formatter.format(parsed);
}
