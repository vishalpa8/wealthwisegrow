import { useCallback } from 'react';
import { CalculatorResult } from '@/components/organisms/enhanced-calculator-form';

export function useCalculatorActions(
  title: string,
  results: CalculatorResult[],
  showFeedback: (id: string, msg: string) => void
) {
  const resultText = results.map(r => `${r.label}: ${r.value}`).join('\n');

  const copyResults = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(resultText);
      showFeedback('copy', 'Copied!');
    } catch {
      showFeedback('copy', 'Failed to copy');
    }
  }, [resultText, showFeedback]);

  const exportResults = useCallback(() => {
    const csv = `"Label","Value"\n${results.map(r => `"${r.label}","${r.value}"`).join('\n')}`;
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = Object.assign(document.createElement('a'), {
      href: url,
      download: `${title.toLowerCase().replace(/\s+/g, '-')}-results.csv`,
      style: 'display:none',
    });
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
    showFeedback('download', 'Download Started!');
  }, [results, title, showFeedback]);

  return { copyResults, exportResults, resultText };
}
