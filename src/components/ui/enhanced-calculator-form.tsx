"use client";
import { useState, useEffect, useCallback, useRef, KeyboardEvent } from 'react';
import { useCurrency } from '@/contexts/currency-context';
import { CurrencySelector } from '@/components/ui/currency-selector';
import { NumericInput } from '@/components/ui/numeric-input';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Copy, Share2, Download, GitCompare, Calculator, TrendingUp, Info } from 'lucide-react';
import { parseRobustNumber } from '@/lib/utils/number';

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
  const { formatCurrency, formatNumber } = useCurrency();
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [clickedButton, setClickedButton] = useState<string | null>(null);
  const [tooltipMessage, setTooltipMessage] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (clickedButton) {
      const timer = setTimeout(() => {
        setClickedButton(null);
      }, 600); // Reset after 600ms to keep button state visible longer
      return () => clearTimeout(timer);
    }
  }, [clickedButton]);

  useEffect(() => {
    if (tooltipMessage) {
      const timer = setTimeout(() => {
        setTooltipMessage(null);
      }, 3500); // Hide tooltip after 3.5 seconds for better visibility
      return () => clearTimeout(timer);
    }
  }, [tooltipMessage]);

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

  // Handle field change with ultra-flexible validation
  const handleFieldChange = (field: EnhancedCalculatorField, value: any) => {
    // For number and percentage fields, ensure we handle empty values gracefully
    if (field.type === 'number' || field.type === 'percentage') {
      if (value === '' || value === null || value === undefined) {
        onChange(field.name, 0);
        return;
      }
      
      const parsedValue = parseRobustNumber(value);
      // Accept any value - parseRobustNumber handles all edge cases
      onChange(field.name, parsedValue);
    } else {
      onChange(field.name, value);
    }
  };

  // Export results as CSV
  const exportResults = () => {
    const csvContent = results.map(result => 
      `"${result.label}","${result.value}"`
    ).join('\n');
    
    const blob = new Blob([`"Label","Value"\n${csvContent}`], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '-')}-results.csv`;
    document.body.appendChild(a);
    // Perform the download operation immediately
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    // Show feedback immediately after triggering download
    setTooltipMessage('Download Started!');
  };

  // Copy results to clipboard
  const copyResults = async () => {
    const resultText = results.map(result => 
      `${result.label}: ${result.value}`
    ).join('\n');
    
    try {
      // Perform the copy operation immediately
      await navigator.clipboard.writeText(resultText);
      // Show feedback immediately after successful operation
      setTooltipMessage('Copied!');
    } catch (err) {
      console.error('Failed to copy results:', err);
      setTooltipMessage('Failed to copy');
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
        // Perform the share operation immediately
        await navigator.share(shareData);
        // Show feedback immediately after successful operation
        setTooltipMessage('Shared!');
      } else {
        // Fallback to copy if share is not available
        await copyResults();
      }
    } catch (err) {
      console.error('Failed to share results:', err);
      setTooltipMessage('Failed to share');
    }
  };



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
              role="tooltip"
            >
              <Info className="w-4 h-4 inline" />
            </button>
          )}
        </label>

        {field.type === 'select' ? (
          <select
            id={fieldId}
            value={currentValue || ''}
            onChange={(e) => handleFieldChange(field, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            value={currentValue || ''}
            onChange={(e) => handleFieldChange(field, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        ) : (
          <NumericInput
            id={fieldId}
            label=""
            value={currentValue || 0}
            onValueChange={(value) => handleFieldChange(field, value)}
            placeholder={field.placeholder}
            step={field.step}
            
            decimalPlaces={field.type === 'percentage' ? 2 : 2}
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

  const renderResult = (result: CalculatorResult, index: number) => {
    let displayValue: string;
    
    // Safely handle any type of value with parseRobustNumber
    switch (result.type) {
      case 'currency':
        displayValue = formatCurrency(parseRobustNumber(result.value));
        break;
      case 'percentage':
        displayValue = `${formatNumber(parseRobustNumber(result.value))}%`;
        break;
      case 'number':
        if (result.value !== null && result.value !== undefined) {
          displayValue = formatNumber(parseRobustNumber(result.value));
        } else {
          displayValue = '0';
        }
        break;
      default:
        // For any other types, just convert to string safely
        displayValue = result.value !== null && result.value !== undefined ? 
          result.value.toString() : '0';
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
      className={`mx-auto bg-white rounded-2xl shadow-lg p-6 sm:p-8 mt-8 border border-gray-100 ${
        results.length === 3 ? 'max-w-6xl' : 'max-w-4xl'
      }`}
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
          <CurrencySelector />
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
              disabled={loading}
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
                <div className="relative flex space-x-1">
                  <div className="relative">
                    <button
                      onClick={() => {
                        copyResults();
                        setClickedButton('copy');
                      }}
                      className={`group relative p-3 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 ${clickedButton === 'copy' ? 'bg-blue-100 text-blue-600 animate-button-success' : ''}`}
                      title="Copy Results"
                      aria-label="Copy calculation results to clipboard"
                    >
                      <Copy className="w-4 h-4" />
                      {clickedButton === 'copy' && tooltipMessage && (
                        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-green-600 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg animate-tooltip-appear whitespace-nowrap z-10">
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-green-600"></div>
                          {tooltipMessage}
                        </div>
                      )}
                    </button>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => {
                        shareResults();
                        setClickedButton('share');
                      }}
                      className={`group relative p-3 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 ${clickedButton === 'share' ? 'bg-purple-100 text-purple-600 animate-button-success' : ''}`}
                      title="Share Results"
                      aria-label="Share calculation results"
                    >
                      <Share2 className="w-4 h-4" />
                      {clickedButton === 'share' && tooltipMessage && (
                        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-green-600 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg animate-tooltip-appear whitespace-nowrap z-10">
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-green-600"></div>
                          {tooltipMessage}
                        </div>
                      )}
                    </button>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => {
                        exportResults();
                        setClickedButton('download');
                      }}
                      className={`group relative p-3 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 ${clickedButton === 'download' ? 'bg-green-100 text-green-600 animate-button-success' : ''}`}
                      title="Export to CSV"
                      aria-label="Export calculation results to CSV file"
                    >
                      <Download className="w-4 h-4" />
                      {clickedButton === 'download' && tooltipMessage && (
                        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-green-600 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg animate-tooltip-appear whitespace-nowrap z-10">
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-green-600"></div>
                          {tooltipMessage}
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              </div>
              <div className={results.length === 3 ? "calculator-results-grid" : "space-y-3"}>
                {results.length === 3 ? (
                  results.map((result, index) => {
                    const isHighlight = result.highlight || index === 0;
                    let displayValue: string;
                    
                    // Format display value
                    switch (result.type) {
                      case 'currency':
                        displayValue = formatCurrency(parseRobustNumber(result.value));
                        break;
                      case 'percentage':
                        displayValue = `${formatNumber(parseRobustNumber(result.value))}%`;
                        break;
                      case 'number':
                        if (result.value !== null && result.value !== undefined) {
                          displayValue = formatNumber(parseRobustNumber(result.value));
                        } else {
                          displayValue = '0';
                        }
                        break;
                      default:
                        displayValue = result.value !== null && result.value !== undefined ? 
                          result.value.toString() : '0';
                    }
                    
                    return (
                      <div
                        key={index}
                        className={isHighlight ? "result-card result-card-primary" : "pricing-card"}
                      >
                        <div className={isHighlight ? "result-label result-label-primary" : "pricing-card-title"}>
                          {result.label}
                        </div>
                        <div className={isHighlight ? "result-highlight result-highlight-primary" : "pricing-card-value"}>
                          {displayValue}
                        </div>
                        {result.tooltip && (
                          <div className={isHighlight ? "result-description result-description-primary" : "pricing-card-description"}>
                            {result.tooltip}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  results.map(renderResult)
                )}
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