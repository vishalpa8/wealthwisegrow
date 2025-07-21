'use client'

import { useState, useMemo, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { addHistory } from '@/lib/history'
import { FormInput } from '@/components/form-input'
import { HistoryEntry } from '@/types/history'
import { formatCurrency } from '@/lib/utils/format'

export default function BreakEvenCalculator() {
  const [values, setValues] = useState({
    fixedCost: '',
    sellingPrice: '',
    variableCost: '',
  })

  const handleChange = useCallback((field: string, value: string) => {
    setValues(prev => ({ ...prev, [field]: value }))
  }, [])

  const result = useMemo(() => {
    const fixed = parseFloat(values.fixedCost) || 0
    const selling = parseFloat(values.sellingPrice) || 0
    const variable = parseFloat(values.variableCost) || 0

    if (selling <= variable) return null

    const breakEvenUnits = fixed / (selling - variable)
    const breakEvenRevenue = breakEvenUnits * selling

    return {
      units: Math.ceil(breakEvenUnits),
      revenue: breakEvenRevenue,
    }
  }, [values.fixedCost, values.sellingPrice, values.variableCost])

  const handleCalculate = useCallback(() => {
    if (!result) return

    const entry: HistoryEntry = {
      type: 'break-even',
      timestamp: new Date().toISOString(),
      input: {
        fixedCost: values.fixedCost,
        sellingPrice: values.sellingPrice,
        variableCost: values.variableCost,
      },
      output: {
        units: result.units.toString(),
        revenue: result.revenue.toString(),
      },
    }

    addHistory(entry)
  }, [result, values])

  return (
    <Card>
      <h1 className="text-2xl font-bold mb-4">Break-Even Calculator</h1>
      
      <div className="space-y-4">
        <FormInput
          label="Fixed Cost"
          type="number"
          value={values.fixedCost}
          onChange={v => handleChange('fixedCost', v)}
          placeholder="Enter total fixed costs"
        />

        <FormInput
          label="Selling Price per Unit"
          type="number"
          value={values.sellingPrice}
          onChange={v => handleChange('sellingPrice', v)}
          placeholder="Enter selling price per unit"
        />

        <FormInput
          label="Variable Cost per Unit"
          type="number"
          value={values.variableCost}
          onChange={v => handleChange('variableCost', v)}
          placeholder="Enter variable cost per unit"
        />

        {result && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Results</h2>
            <p>Break-even Units: {result.units}</p>
            <p>Break-even Revenue: {formatCurrency(result.revenue)}</p>
          </div>
        )}

        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={handleCalculate}
          disabled={!result}
        >
          Save Calculation
        </button>
      </div>
    </Card>
  )
}
