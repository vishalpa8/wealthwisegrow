import { useCallback, useMemo } from 'react';

export interface CalculatorExportRow {
  label: string;
  value: string;
}

function csvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

export function buildCalculatorExport(
  title: string,
  inputs: CalculatorExportRow[],
  results: CalculatorExportRow[]
) {
  const text = [
    title,
    '',
    'Inputs',
    ...inputs.map((row) => `${row.label}: ${row.value}`),
    '',
    'Results',
    ...results.map((row) => `${row.label}: ${row.value}`),
  ].join('\n');

  const csv = [
    [csvCell('Section'), csvCell('Label'), csvCell('Value')].join(','),
    ...inputs.map((row) => [csvCell('Inputs'), csvCell(row.label), csvCell(row.value)].join(',')),
    ...results.map((row) => [csvCell('Results'), csvCell(row.label), csvCell(row.value)].join(',')),
  ].join('\n');

  return { text, csv };
}

export function useCalculatorActions(
  title: string,
  inputs: CalculatorExportRow[],
  results: CalculatorExportRow[],
  showFeedback: (id: string, msg: string) => void
) {
  const exportDocument = useMemo(
    () => buildCalculatorExport(title, inputs, results),
    [title, inputs, results]
  );

  const copyResults = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(exportDocument.text);
      showFeedback('copy', 'Inputs and results copied');
    } catch {
      showFeedback('copy', 'Failed to copy');
    }
  }, [exportDocument.text, showFeedback]);

  const exportResults = useCallback(() => {
    const url = URL.createObjectURL(new Blob([exportDocument.csv], { type: 'text/csv;charset=utf-8' }));
    const a = Object.assign(document.createElement('a'), {
      href: url,
      download: `${title.toLowerCase().replace(/\s+/g, '-')}-inputs-and-results.csv`,
      style: 'display:none',
    });
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
    showFeedback('download', 'Inputs and results downloaded');
  }, [exportDocument.csv, title, showFeedback]);

  return { copyResults, exportResults, resultText: exportDocument.text };
}
