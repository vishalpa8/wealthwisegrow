"use client";
import { useState, useEffect, useCallback, useRef, KeyboardEvent } from 'react';
import { formatCurrency, formatPercentage, SUPPORTED_CURRENCIES, setGlobalCurrency, getCurrentCurrency, detectUserCurrency } from '@/lib/utils/currency';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Copy, Share2, Download, GitCompare, Globe, Calculator, TrendingUp, Info } from 'lucide-react';

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

export interface ComparisonScenario {
  id: string;
  name: string;
  inputs: Record<string, any>;
  results: CalculatorResult[];
}

interface EnhancedCalculatorFormProps {
  title: string;
  description?: string;
  fields: EnhancedCalculatorField[];
  values: Record<string, any>;
  onChange: (name: string, value: any) => void;
  onCalculate?: () => void;
  results?: CalculatorResult[];
  loading?: boolean;
  error?: string;
  showComparison?: boolean;
  comparisonScenarios?: ComparisonScenario[];
  onAddComparison?: () => void;
  onRemoveComparison?: (id: string) => void;
}

export function EnhancedCalculatorForm({
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
  onRemoveComparison
}: EnhancedCalculatorFormProps) {
  const [selectedCurrency, setSelectedCurrency] = useState(getCurrentCurrency().code);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
// const [showAdvanced, setShowAdvanced] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowTooltip(null);
    }
  }, []);

  // Trap focus within modal/tooltip when shown
  useEffect(() => {
    if (showTooltip) {
      const focusableElements = formRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements?.length) {
        (focusableElements[0] as HTMLElement).focus();
      }
    }
  }, [showTooltip]);

  // Initialize currency detection
  useEffect(() => {
    const detectedCurrency = detectUserCurrency();
    setSelectedCurrency(detectedCurrency);
    setGlobalCurrency(detectedCurrency);
  }, []);

  // Handle currency change
  const handleCurrencyChange = (currencyCode: string) => {
    setSelectedCurrency(currencyCode);
    setGlobalCurrency(currencyCode);
  };

  // Validate field value
  const validateField = (field: EnhancedCalculatorField, value: any): string | null => {
    if (field.required && (!value || value === '')) {
      return `${field.label} is required`;
    }

    if (field.type === 'number' || field.type === 'percentage') {
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        return `${field.label} must be a valid number`;
      }
      if (field.min !== undefined && numValue < field.min) {
        return `${field.label} must be at least ${field.min}`;
      }
      if (field.max !== undefined && numValue > field.max) {
        return `${field.label} cannot exceed ${field.max}`;
      }
    }

    return null;
  };

  // Handle field change with validation
  const handleFieldChange = (field: EnhancedCalculatorField, value: any) => {
    const error = validateField(field, value);
    setValidationErrors(prev => ({
      ...prev,
      [field.name]: error || ''
    }));

    onChange(field.name, value);
  };

  // Export results as CSV
  const exportResults = () => {
    const csvContent = results.map(result => 
      `${result.label},${result.value}`
    ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '-')}-results.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Copy results to clipboard
  const copyResults = async () => {
    const resultText = results.map(result => 
      `${result.label}: ${result.value}`
    ).join('\n');
    
    try {
      await navigator.clipboard.writeText(resultText);
      // Show success toast (you might want to add a toast system)
    } catch (err) {
      console.error('Failed to copy results:', err);
    }
  };

  // Share results
  const shareResults = async () => {
    const resultText = results.map(result => 
      `${result.label}: ${result.value}`
    ).join('\n');
    
    const shareData = {
      title: `${title} Results`,
      text: resultText,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await copyResults();
      }
    } catch (err) {
      console.error('Failed to share results:', err);
    }
  };

  const renderField = (field: EnhancedCalculatorField) => {
    const hasError = validationErrors[field.name];
    const fieldId = `field-${field.name}`;

    return (
      <div key={field.name} className="relative">
        <label htmlFor={fieldId} className="block text-sm font-medium text-gray-700 mb-1">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
          {field.tooltip && (
            <button
              type="button"
              className="ml-1 text-gray-600 hover:text-gray-800"
              onMouseEnter={() => setShowTooltip(field.name)}
              onMouseLeave={() => setShowTooltip(null)}
              aria-label={`Information about ${field.label}`}
              role="tooltip"
            >
              <Info className="w-4 h-4 inline" />
            </button>
          )}
        </label>

        {field.type === 'select' ? (
          <select
            id={fieldId}
            value={values[field.name] || ''}
            onChange={(e) => handleFieldChange(field, e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              hasError ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">{field.placeholder || 'Select...'}</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : field.type === 'date' ? (
          <input
            id={fieldId}
            type="date"
            value={values[field.name] || ''}
            onChange={(e) => handleFieldChange(field, e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              hasError ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        ) : (
          <div className="relative">
            <input
              id={fieldId}
              type="number"
              value={values[field.name] || ''}
              onChange={(e) => handleFieldChange(field, parseFloat(e.target.value) || 0)}
              placeholder={field.placeholder}
              min={field.min}
              max={field.max}
              step={field.step || 'any'}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                hasError ? 'border-red-500' : 'border-gray-300'
              } ${field.unit ? 'pr-12' : ''}`}
            />
            {field.unit && (
              <span className="absolute right-3 top-2 text-gray-500 text-sm">
                {field.type === 'percentage' ? '%' : field.unit}
              </span>
            )}
          </div>
        )}

        {hasError && (
          <div className="flex items-center mt-1 text-red-500 text-sm">
            <AlertTriangle className="w-4 h-4 mr-1" />
            {hasError}
          </div>
        )}

        {showTooltip === field.name && field.tooltip && (
          <div className="absolute z-10 p-2 mt-1 text-sm bg-gray-800 text-white rounded-lg shadow-lg max-w-xs">
            {field.tooltip}
          </div>
        )}
      </div>
    );
  };

  const renderResult = (result: CalculatorResult, index: number) => {
    let displayValue: string;
    
    switch (result.type) {
      case 'currency':
        displayValue = formatCurrency(result.value as number);
        break;
      case 'percentage':
        displayValue = formatPercentage(result.value as number);
        break;
      default:
        displayValue = result.value.toString();
    }

    return (
      <div
        key={index}
        className={`p-4 rounded-lg border ${
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
            >
              <Info className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className={`text-lg font-bold ${
          result.highlight ? 'text-blue-700' : 'text-gray-800'
        }`}>
          {displayValue}
        </div>
        
        {showTooltip === `result-${index}` && result.tooltip && (
          <div className="absolute z-10 p-2 mt-1 text-sm bg-gray-800 text-white rounded-lg shadow-lg max-w-xs">
            {result.tooltip}
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      ref={formRef}
      className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6 sm:p-8 mt-8 border border-gray-100"
      onKeyDown={handleKeyDown}
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Calculator className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-blue-700">{title}</h1>
          </div>
          
          {/* Currency Selector */}
          <div className="flex items-center space-x-2">
            <Globe className="w-5 h-5 text-gray-500" />
            <select
              value={selectedCurrency}
              onChange={(e) => handleCurrencyChange(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(SUPPORTED_CURRENCIES).map(([code, config]) => (
                <option key={code} value={code}>
                  {config.symbol} {code}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {description && (
          <p className="text-gray-800 text-lg">{description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <div>
          <div className="space-y-4">
            {fields.map(renderField)}
          </div>

          {/* Calculate Button */}
          <div className="mt-6">
            <Button
              onClick={onCalculate}
              disabled={loading || Object.values(validationErrors).some(error => error)}
              className="w-full py-3 text-lg font-semibold"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
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
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center text-red-700">
                <AlertTriangle className="w-5 h-5 mr-2" />
                <span className="font-medium">Calculation Error</span>
              </div>
              <p className="text-red-600 mt-1">{error}</p>
            </div>
          )}
        </div>

        {/* Results */}
        <div>
          {results.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Results</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={copyResults}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                    title="Copy Results"
                    aria-label="Copy calculation results to clipboard"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={shareResults}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                    title="Share Results"
                    aria-label="Share calculation results"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={exportResults}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                    title="Export to CSV"
                    aria-label="Export calculation results to CSV file"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {results.map(renderResult)}
              </div>
            </div>
          )}

          {/* Comparison Feature */}
          {showComparison && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Compare Scenarios</h3>
                {onAddComparison && (
                  <Button
                    onClick={onAddComparison}
                    variant="outline"
                    size="sm"
                    className="flex items-center"
                  >
                    <GitCompare className="w-4 h-4 mr-1" />
                    Add Scenario
                  </Button>
                )}
              </div>

              {comparisonScenarios.length > 0 && (
                <div className="space-y-4">
                  {comparisonScenarios.map((scenario) => (
                    <div
                      key={scenario.id}
                      className="p-4 border border-gray-200 rounded-lg bg-gray-50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-800">{scenario.name}</h4>
                        {onRemoveComparison && (
                          <button
                            onClick={() => onRemoveComparison(scenario.id)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {scenario.results.map((result, index) => (
                          <div key={index} className="flex justify-between">
                            <span className="text-gray-600">{result.label}:</span>
                            <span className="font-medium">{result.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: none; }
        }
        .animate-fade-in {
          animation: fade-in 0.7s cubic-bezier(.4,0,.2,1);
        }
      `}</style>
    </div>
  );
}
