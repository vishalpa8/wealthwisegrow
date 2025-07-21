import { AES, enc } from 'crypto-js';

// In a real application, this should be an environment variable
// and should be different for each deployment
const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'default-dev-key';

/**
 * Encrypts data using AES encryption
 * @param data - Data to encrypt
 * @returns Encrypted string
 */
export function encryptData(data: string): string {
  try {
    return AES.encrypt(data, ENCRYPTION_KEY).toString();
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypts AES encrypted data
 * @param encryptedData - Encrypted data to decrypt
 * @returns Decrypted string
 */
export function decryptData(encryptedData: string): string {
  try {
    const bytes = AES.decrypt(encryptedData, ENCRYPTION_KEY);
    return bytes.toString(enc.Utf8);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Generates a secure hash of the data
 * @param data - Data to hash
 * @returns Hashed string
 */
export function hashData(data: string): string {
  try {
    return AES.encrypt(data, ENCRYPTION_KEY)
      .toString()
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 32);
  } catch (error) {
    console.error('Hashing error:', error);
    throw new Error('Failed to hash data');
  }
}

/**
 * Securely compares two strings in constant time
 * @param a - First string
 * @param b - Second string
 * @returns Whether the strings are equal
 */
export function secureCompare(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false;
  }

  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Generates a random string of specified length
 * @param length - Length of the string to generate
 * @returns Random string
 */
export function generateRandomString(length: number = 32): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  
  // Check if we're in a browser environment
  if (typeof window !== 'undefined' && window.crypto) {
    const values = new Uint8Array(length);
    window.crypto.getRandomValues(values);
    return Array.from(values)
      .map(x => charset[x % charset.length])
      .join('');
  } else {
    // Fallback for server-side rendering
    let result = '';
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return result;
  }
}

/**
 * Masks sensitive data by showing only the last few characters
 * @param data - Data to mask
 * @param visibleChars - Number of characters to show
 * @returns Masked string
 */
export function maskSensitiveData(
  data: string,
  visibleChars: number = 4
): string {
  if (!data) return '';
  if (data.length <= visibleChars) return data;
  
  const mask = '*'.repeat(data.length - visibleChars);
  return mask + data.slice(-visibleChars);
}

/**
 * Validates that a string contains no common XSS patterns
 * @param input - String to validate
 * @returns Whether the string is safe
 */
export function isXSSSafe(input: string): boolean {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /onerror=/gi,
    /onload=/gi,
    /onclick=/gi,
    /onmouseover=/gi
  ];

  return !xssPatterns.some(pattern => pattern.test(input));
}
