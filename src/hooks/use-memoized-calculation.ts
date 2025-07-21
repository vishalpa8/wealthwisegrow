import { useMemo, useCallback } from 'react';

type CalculationFn<T, R> = (params: T) => R;

export function useMemoizedCalculation<T, R>(
  calculationFn: CalculationFn<T, R>,
  params: T,
  dependencies: any[] = []
) {
  // Memoize the calculation function
  const memoizedFn = useCallback(calculationFn, dependencies);

  // Memoize the result
  const result = useMemo(() => {
    try {
      return {
        data: memoizedFn(params),
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Calculation failed')
      };
    }
  }, [memoizedFn, params]);

  return result;
}

// Example usage:
// const { data: result, error } = useMemoizedCalculation(
//   (params) => complexCalculation(params),
//   { amount: 1000, rate: 0.05 },
//   [/* dependencies */]
// );
