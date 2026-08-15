"use client";
import { useState, useEffect, useCallback, useRef, KeyboardEvent } from 'react';
import { useCurrency } from '@/contexts/currency-context';
import { CurrencySelector } from '@/components/molecules/currency-selector';
import { NumericInput } from '@/components/atoms/numeric-input';
import { Button } from '@/components/atoms/button';
import { AlertTriangle, Copy, Download, GitCompare, Calculator, TrendingUp, Info } from 'lucide-react';
import { parseRobustNumber } from '@/lib/utils/number';
import { ShareButton } from '@/components/molecules/share-button';
import { RelatedCalculators } from '@/components/molecules/related-calculators';
import { useCalculatorActions } from '@/hooks/use-calculator-actions';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface EnhancedCalculatorField {
  label: string;
  name: string;
  type: 'number' | 'select' | 'date' | 'percentage';
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  options?: Array<{ value: string | number; label: string }>;
  required?: boolean;
  tooltip?: string;
  unit?: string;
}

export interface CalculatorResult {
  label: string;
  value: number | string;
  type?: 'currency' | 'percentage' | 'number';
  highlight?: boolean;
  tooltip?: string;
}

export interface ComparisonScenario<T extends Record<string, unknown> = Record<string, unknown>> {
  id: string;
  name: string;
  inputs: T;
  results: CalculatorResult[];
}

interface EnhancedCalculatorFormProps<T extends Record<string, unknown>> {
  title: string;
  description?: string;
  fields: EnhancedCalculatorField[];
  values: T;
  onChange: <K extends keyof T>(name: Extract<K, string>, value: T[K]) => void;
  onCalculate?: () => void;
  results?: CalculatorResult[];
  loading?: boolean;
  error?: string;
  showComparison?: boolean;
  comparisonScenarios?: ComparisonScenario<T>[];
  onAddComparison?: () => void;
  onRemoveComparison?: (id: string) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Tooltip bubble shared by all action buttons */
function ActionTooltip({ message }: { message: string }) {
  return (
    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-green-600 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap z-10 pointer-events-none">
      <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-green-600" />
      {message}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function EnhancedCalculatorForm<T extends Record<string, any>>({
  title,
  description,
  fields,
  values,
  onChange,
  onCalculate,
  results = [],
  loading = false,
  error,
  showComparison = false,
  comparisonScenarios = [],
  onAddComparison,
  onRemoveComparison,
}: EnhancedCalculatorFormProps<T>) {
  const { formatCurrency, formatNumber } = useCurrency();
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [clickedButton, setClickedButton] = useState<string | null>(null);
  const [tooltipMessage, setTooltipMessage] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  // Single timer helper — auto-clears any transient state after a delay
  const showFeedback = useCallback((buttonId: string, message: string) => {
    setClickedButton(buttonId);
    setTooltipMessage(message);
  }, []);

  // Reset button + tooltip after 600ms
  useEffect(() => {
    if (!clickedButton) return;
    const t = setTimeout(() => {
      setClickedButton(null);
      setTooltipMessage(null);
    }, 600);
    return () => clearTimeout(t);
  }, [clickedButton]);

  // Dismiss tooltip on Escape
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') setShowTooltip(null);
  }, []);

  // Trap focus in tooltip area when open
  useEffect(() => {
    if (!showTooltip) return;
    const el = formRef.current?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    el?.focus();
  }, [showTooltip]);

  // ── Field helpers ──────────────────────────────────────────────────────────

  const handleFieldChange = useCallback(
    (field: EnhancedCalculatorField, value: unknown) => {
      const fieldName = field.name as Extract<keyof T, string>;
      if (field.type === 'number' || field.type === 'percentage') {
        if (value === '' || value === null || value === undefined) {
          onChange(fieldName, 0 as T[keyof T]);
        } else {
          onChange(fieldName, parseRobustNumber(value as string | number) as T[keyof T]);
        }
      } else {
        onChange(fieldName, value as T[keyof T]);
      }
    },
    [onChange]
  );

  // ── Action handlers ────────────────────────────────────────────────────────

  const { copyResults, exportResults, resultText } = useCalculatorActions(title, results, showFeedback);

  // ── Format helpers ─────────────────────────────────────────────────────────

  /** Single source of truth for result value formatting */
  const formatValue = useCallback(
    (result: CalculatorResult): string => {
      const num = parseRobustNumber(result.value as string | number);
      switch (result.type) {
        case 'currency':    return formatCurrency(num);
        case 'percentage':  return `${formatNumber(num)}%`;
        case 'number':      return formatNumber(num);
        default:            return result.value != null ? String(result.value) : '0';
      }
    },
    [formatCurrency, formatNumber]
  );

  // ── Renderers ──────────────────────────────────────────────────────────────

  const renderField = (field: EnhancedCalculatorField) => {
    const fieldId = `field-${field.name}`;
    const currentValue = values[field.name];

    return (
      <div key={field.name} className="relative">
        <label htmlFor={fieldId} className="block text-sm font-medium text-gray-700 mb-1">
          {field.label}
          {field.tooltip && (
            <button
              type="button"
              className="ml-1 text-gray-600 hover:text-gray-800"
              onMouseEnter={() => setShowTooltip(field.name)}
              onMouseLeave={() => setShowTooltip(null)}
              aria-label={`Information about ${field.label}`}
            >
              <Info className="w-4 h-4 inline" />
            </button>
          )}
        </label>

        {field.type === 'select' ? (
          <select
            id={fieldId}
            value={(currentValue as string) || ''}
            onChange={(e) => handleFieldChange(field, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{field.placeholder || 'Select...'}</option>
            {field.options?.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        ) : field.type === 'date' ? (
          <input
            id={fieldId}
            type="date"
            value={(currentValue as string) || ''}
            onChange={(e) => handleFieldChange(field, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        ) : (
          <NumericInput
            id={fieldId}
            label=""
            value={(currentValue as number) || 0}
            onValueChange={(value) => handleFieldChange(field, value)}
            placeholder={field.placeholder}
            step={field.step}
            decimalPlaces={2}
            allowNegative={true}
            allowZero={true}
            showCurrencySymbol={field.type === 'number' && Boolean(field.unit)}
            errorText=""
            isValid={true}
            className="w-full"
            inputClassName="w-full"
          />
        )}

        {showTooltip === field.name && field.tooltip && (
          <div className="absolute z-10 p-2 mt-1 text-sm bg-gray-800 text-white rounded-lg shadow-lg max-w-xs">
            {field.tooltip}
          </div>
        )}
      </div>
    );
  };

  const renderResult = (result: CalculatorResult, index: number) => (
    <div
      key={index}
      className={`relative p-4 rounded-lg border ${
        result.highlight ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-600">{result.label}</span>
        {result.tooltip && (
          <button
            type="button"
            className="text-gray-400 hover:text-gray-600"
            onMouseEnter={() => setShowTooltip(`result-${index}`)}
            onMouseLeave={() => setShowTooltip(null)}
            aria-label={`More info about ${result.label}`}
          >
            <Info className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className={`text-lg font-bold ${result.highlight ? 'text-blue-700' : 'text-gray-800'}`}>
        {formatValue(result)}
      </div>
      {showTooltip === `result-${index}` && result.tooltip && (
        <div className="absolute z-10 p-2 mt-1 text-sm bg-gray-800 text-white rounded-lg shadow-lg max-w-xs">
          {result.tooltip}
        </div>
      )}
    </div>
  );

  // ── Action button config ───────────────────────────────────────────────────

  const actionButtons = [
    {
      id: 'copy',
      icon: <Copy className="w-4 h-4" />,
      label: 'Copy Results',
      ariaLabel: 'Copy calculation results to clipboard',
      onClick: copyResults,
      activeColor: 'bg-blue-100 text-blue-600',
      hoverColor: 'hover:text-blue-600 hover:bg-blue-50',
    },
    {
      id: 'download',
      icon: <Download className="w-4 h-4" />,
      label: 'Export to CSV',
      ariaLabel: 'Export calculation results to CSV file',
      onClick: exportResults,
      activeColor: 'bg-green-100 text-green-600',
      hoverColor: 'hover:text-green-600 hover:bg-green-50',
    },
  ] as const;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <section
      ref={formRef}
      className="mx-auto bg-white rounded-2xl shadow-lg p-6 sm:p-8 mt-8 border border-gray-100 max-w-4xl"
      onKeyDown={handleKeyDown}
      aria-label={`${title} Form`}
    >
      {/* Header */}
      <header className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Calculator className="w-8 h-8 text-blue-600" />
            <h2 className="text-3xl font-bold text-blue-700">{title}</h2>
          </div>
          <CurrencySelector />
        </div>
        {description && (
          <p className="text-gray-800 text-lg">{description}</p>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <form onSubmit={(e) => { e.preventDefault(); onCalculate?.(); }}>
          <div className="space-y-4">
            {fields.map(renderField)}
          </div>

          {/* Calculate Button */}
          <div className="mt-6">
            <Button
              onClick={onCalculate}
              disabled={loading}
              className="w-full py-3 text-lg font-semibold"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Calculating...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Calculate
                </div>
              )}
            </Button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg" role="alert">
              <div className="flex items-center text-red-700">
                <AlertTriangle className="w-5 h-5 mr-2" aria-hidden="true" />
                <span className="font-medium">Calculation Error</span>
              </div>
              <p className="text-red-600 mt-1">{error}</p>
            </div>
          )}
        </form>

        {/* Results */}
        <section aria-label="Calculation Results">
          {results.length > 0 && (
            <div>
              {/* Results header + action buttons */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Results</h3>
                <div className="flex items-center space-x-2">
                  <ShareButton title={`${title} - Results`} description={resultText} />
                  <div className="flex space-x-1 border-l pl-2 border-gray-200">
                    {actionButtons.map(({ id, icon, ariaLabel, onClick, activeColor, hoverColor }) => (
                      <div key={id} className="relative">
                        <button
                          type="button"
                          onClick={() => onClick()}
                          className={`relative p-3 text-gray-500 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 ${hoverColor} ${
                            clickedButton === id ? activeColor : ''
                          }`}
                          aria-label={ariaLabel}
                        >
                          {icon}
                          {clickedButton === id && tooltipMessage && (
                            <ActionTooltip message={tooltipMessage} />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Result cards */}
              <div className="space-y-3">
                {results.map(renderResult)}
              </div>
            </div>
          )}

          {/* Comparison Feature */}
          {showComparison && (
            <article className="mt-8">
              <header className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Compare Scenarios</h3>
                {onAddComparison && (
                  <Button onClick={onAddComparison} variant="outline" size="sm" className="flex items-center" type="button">
                    <GitCompare className="w-4 h-4 mr-1" aria-hidden="true" />
                    Add Scenario
                  </Button>
                )}
              </header>

              {comparisonScenarios.length > 0 && (
                <ul className="space-y-4">
                  {comparisonScenarios.map((scenario) => (
                    <li key={scenario.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <header className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-800">{scenario.name}</h4>
                        {onRemoveComparison && (
                          <button
                            type="button"
                            onClick={() => onRemoveComparison(scenario.id)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </header>
                      <dl className="grid grid-cols-2 gap-2 text-sm">
                        {scenario.results.map((result, index) => (
                          <div key={index} className="flex justify-between">
                            <dt className="text-gray-600">{result.label}:</dt>
                            <dd className="font-medium text-gray-900">{result.value}</dd>
                          </div>
                        ))}
                      </dl>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          )}
        </section>
      </div>
      
      {/* Related Calculators for SEO and Internal Linking */}
      <aside className="mt-8 border-t border-gray-100 pt-8" aria-label="Related Calculators">
        <RelatedCalculators />
      </aside>
    </section>
  );
}