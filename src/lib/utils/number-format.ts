/**
 * Format large numbers with appropriate suffixes
 */
export function formatLargeNumber(value: number): string {
  if (value >= 1e9) {
    return `${(value / 1e9).toFixed(2)}B`;
  } else if (value >= 1e7) {
    return `${(value / 1e7).toFixed(2)}Cr`;
  } else if (value >= 1e5) {
    return `${(value / 1e5).toFixed(2)}L`;
  } else if (value >= 1e3) {
    return `${(value / 1e3).toFixed(2)}K`;
  } else {
    return value.toFixed(0);
  }
}

/**
 * Format currency with proper separators for Indian format
 */
export function formatIndianCurrency(value: number, decimals: number = 0): string {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  
  return formatter.format(value);
}

/**
 * Format large currency values with suffixes
 */
export function formatLargeCurrency(value: number): string {
  if (value >= 1e7) {
    return `₹${(value / 1e7).toFixed(2)} Cr`;
  } else if (value >= 1e5) {
    return `₹${(value / 1e5).toFixed(2)} L`;
  } else if (value >= 1e3) {
    return `₹${(value / 1e3).toFixed(1)} K`;
  } else {
    return formatIndianCurrency(value);
  }
}

/**
 * Shorten text with ellipsis if too long
 */
export function shortenText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}
