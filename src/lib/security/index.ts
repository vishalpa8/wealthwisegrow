import { encryptData, decryptData } from './encryption';

// Handle DOMPurify for both server and client side
let DOMPurify: any = { sanitize: (input: string) => input }; // Default sanitizer that returns input

// Only import DOMPurify on the client side
if (typeof window !== 'undefined') {
  // Dynamic import for client-side only
  import('dompurify').then(module => {
    DOMPurify = module.default;
  });
}

// Input sanitization
export function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [] // No attributes allowed
  });
}

// Number validation and sanitization
export function sanitizeNumber(input: string | number): number | null {
  if (typeof input === 'number') {
    return isFinite(input) ? input : null;
  }
  
  const sanitized = sanitizeInput(input);
  const parsed = parseFloat(sanitized);
  return isFinite(parsed) ? parsed : null;
}

// Input validation for financial calculations
export function validateFinancialInput(
  value: number,
  min: number = 0,
  max: number = Number.MAX_SAFE_INTEGER
): boolean {
  return (
    typeof value === 'number' &&
    isFinite(value) &&
    value >= min &&
    value <= max
  );
}

// Secure storage handling
export function secureStore(key: string, value: any): void {
  try {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') return;
    
    const serialized = JSON.stringify(value);
    const encrypted = encryptData(serialized);
    localStorage.setItem(key, encrypted);
  } catch (error) {
    console.error('Error storing data securely:', error);
  }
}

export function secureRetrieve(key: string): any {
  try {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') return null;
    
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return null;
    
    const decrypted = decryptData(encrypted);
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('Error retrieving secure data:', error);
    return null;
  }
}

// Rate limiting for calculations
const rateLimits = new Map<string, number[]>();

export function checkRateLimit(
  operation: string,
  maxRequests: number = 10,
  timeWindow: number = 60000 // 1 minute
): boolean {
  const now = Date.now();
  const timestamps = rateLimits.get(operation) || [];
  
  // Remove old timestamps
  const recentTimestamps = timestamps.filter(
    timestamp => now - timestamp < timeWindow
  );
  
  if (recentTimestamps.length >= maxRequests) {
    return false;
  }
  
  recentTimestamps.push(now);
  rateLimits.set(operation, recentTimestamps);
  return true;
}

// Content Security Policy
export const CSP = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'"],
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", 'data:', 'https:'],
  'connect-src': ["'self'", 'https:'],
  'font-src': ["'self'"],
  'object-src': ["'none'"],
  'media-src': ["'self'"],
  'frame-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'upgrade-insecure-requests': []
};

// Error handling with security context
export class SecureError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: Record<string, any>
  ) {
    super(message);
    this.name = 'SecureError';
    
    // Remove sensitive information from error context
    if (this.context) {
      delete this.context.userInput;
      delete this.context.rawData;
      delete this.context.credentials;
    }
  }
}

// Security headers
export const securityHeaders = {
  'Content-Security-Policy': Object.entries(CSP)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; '),
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
};

// Secure calculation wrapper
export function secureCalculation<T>(
  operation: string,
  inputs: Record<string, any>,
  calculate: () => T
): T | null {
  try {
    // Rate limiting
    if (!checkRateLimit(operation)) {
      throw new SecureError(
        'Too many calculations',
        'RATE_LIMIT_EXCEEDED'
      );
    }

    // Input validation
    Object.entries(inputs).forEach(([key, value]) => {
      if (typeof value === 'string') {
        inputs[key] = sanitizeInput(value);
      } else if (typeof value === 'number') {
        if (!validateFinancialInput(value)) {
          throw new SecureError(
            'Invalid numerical input',
            'INVALID_INPUT',
            { field: key }
          );
        }
      }
    });

    // Perform calculation
    const result = calculate();

    // Validate output
    if (typeof result === 'number' && !isFinite(result)) {
      throw new SecureError(
        'Invalid calculation result',
        'INVALID_RESULT'
      );
    }

    return result;
  } catch (error) {
    if (error instanceof SecureError) {
      throw error;
    }
    
    console.error('Secure calculation error:', error);
    return null;
  }
}
