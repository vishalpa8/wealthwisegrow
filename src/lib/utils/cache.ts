import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface CalculatorCache extends DBSchema {
  results: {
    key: string;
    value: {
      data: any;
      timestamp: number;
      expiresAt: number;
    };
  };
  calculations: {
    key: string;
    value: {
      inputs: Record<string, any>;
      results: any[];
      timestamp: number;
    };
  };
}

const DB_NAME = 'wealthwisegrow-cache';
const DB_VERSION = 1;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

let db: IDBPDatabase<CalculatorCache>;

async function getDB() {
  if (!db) {
    db = await openDB<CalculatorCache>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Results store for API responses
        if (!db.objectStoreNames.contains('results')) {
          db.createObjectStore('results');
        }
        // Calculations store for expensive calculations
        if (!db.objectStoreNames.contains('calculations')) {
          db.createObjectStore('calculations');
        }
      },
    });
  }
  return db;
}

// Cache key generation
function generateCacheKey(type: string, params: Record<string, any>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {} as Record<string, any>);

  return `${type}:${JSON.stringify(sortedParams)}`;
}

// Cache API responses
export async function cacheResults<T>(
  type: string,
  params: Record<string, any>,
  data: T,
  duration = CACHE_DURATION
): Promise<void> {
  const db = await getDB();
  const key = generateCacheKey(type, params);
  const now = Date.now();

  await db.put('results', {
    data,
    timestamp: now,
    expiresAt: now + duration,
  }, key);
}

export async function getCachedResults<T>(
  type: string,
  params: Record<string, any>
): Promise<T | null> {
  const db = await getDB();
  const key = generateCacheKey(type, params);
  const cached = await db.get('results', key);

  if (!cached) {
    return null;
  }

  // Check if cache is expired
  if (cached.expiresAt < Date.now()) {
    await db.delete('results', key);
    return null;
  }

  return cached.data as T;
}

// Cache calculator results
export async function cacheCalculation(
  calculatorType: string,
  inputs: Record<string, any>,
  results: any[]
): Promise<void> {
  const db = await getDB();
  const key = generateCacheKey(calculatorType, inputs);

  await db.put('calculations', {
    inputs,
    results,
    timestamp: Date.now(),
  }, key);
}

export async function getCachedCalculation(
  calculatorType: string,
  inputs: Record<string, any>
): Promise<any[] | null> {
  const db = await getDB();
  const key = generateCacheKey(calculatorType, inputs);
  const cached = await db.get('calculations', key);

  if (!cached) {
    return null;
  }

  // Check if inputs match exactly
  const inputsMatch = Object.keys(inputs).every(
    (key) => inputs[key] === cached.inputs[key]
  );

  if (!inputsMatch) {
    return null;
  }

  return cached.results;
}

// Clear expired cache entries
export async function clearExpiredCache(): Promise<void> {
  const db = await getDB();
  const now = Date.now();

  // Clear expired results
  const resultsTx = db.transaction('results', 'readwrite');
  const resultsStore = resultsTx.store;
  for await (const cursor of resultsStore) {
    if (cursor.value.expiresAt < now) {
      await cursor.delete();
    }
  }
  await resultsTx.done;

  // Clear old calculations (older than 24 hours)
  const calculationsTx = db.transaction('calculations', 'readwrite');
  const calculationsStore = calculationsTx.store;
  const oldestAllowed = now - CACHE_DURATION;

  for await (const cursor of calculationsStore) {
    if (cursor.value.timestamp < oldestAllowed) {
      await cursor.delete();
    }
  }
  await calculationsTx.done;
}

// Initialize cache cleanup
export function initializeCache(): void {
  // Clear expired cache entries every hour
  setInterval(clearExpiredCache, 60 * 60 * 1000);
  
  // Clear expired cache on app start
   
  clearExpiredCache().catch(() => {
    // Silent error handling instead of console.error
    // We don't want to break the app if cache clearing fails
  });
}

// Helper hook for React components
export function useCachedCalculation<T>(
  calculatorType: string,
  inputs: Record<string, any>,
  calculate: (inputs: Record<string, any>) => Promise<T>
): Promise<T> {
  return new Promise((resolve, reject) => {
    // Proper promise chaining instead of async executor
    getCachedCalculation(calculatorType, inputs)
      .then(cached => {
        if (cached) {
          resolve(cached as T);
          return null; // Return null to indicate we're done
        }
        // No cached result, calculate new one
        return calculate(inputs);
      })
      .then(result => {
        if (result === null) return; // Skip if we resolved from cache
        
        // Cache the new result and resolve
        return cacheCalculation(calculatorType, inputs, result as any[])
          .then(() => resolve(result));
      })
      .catch(error => {
        reject(error);
      });
  });
}
