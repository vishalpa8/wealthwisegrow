'use client';

import React, { useState } from 'react';

export default function BreakEvenCalculator() {
  const [fixedCost, setFixedCost] = useState(0);
  const [variableCostPerUnit, setVariableCostPerUnit] = useState(0);
  const [sellingPricePerUnit, setSellingPricePerUnit] = useState(0);
  const [breakEvenUnits, setBreakEvenUnits] = useState(0);
  const [breakEvenRevenue, setBreakEvenRevenue] = useState(0);

  const calculateBreakEven = () => {
    if (sellingPricePerUnit <= variableCostPerUnit) {
      alert('Selling price must be greater than variable cost per unit');
      return;
    }

    const units = fixedCost / (sellingPricePerUnit - variableCostPerUnit);
    const revenue = units * sellingPricePerUnit;
    
    setBreakEvenUnits(Math.round(units * 100) / 100);
    setBreakEvenRevenue(Math.round(revenue * 100) / 100);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Break-even Point Calculator</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fixed Costs ($)
              </label>
              <input
                type="number"
                className="w-full p-2 border border-gray-300 rounded"
                value={fixedCost}
                onChange={(e) => setFixedCost(Number(e.target.value))}
                min="0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Variable Cost Per Unit ($)
              </label>
              <input
                type="number"
                className="w-full p-2 border border-gray-300 rounded"
                value={variableCostPerUnit}
                onChange={(e) => setVariableCostPerUnit(Number(e.target.value))}
                min="0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Selling Price Per Unit ($)
              </label>
              <input
                type="number"
                className="w-full p-2 border border-gray-300 rounded"
                value={sellingPricePerUnit}
                onChange={(e) => setSellingPricePerUnit(Number(e.target.value))}
                min="0"
              />
            </div>
          </div>
          
          <div className="mt-6">
            <button
              onClick={calculateBreakEven}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
            >
              Calculate Break-even Point
            </button>
          </div>
        </div>
        
        {breakEvenUnits > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Results</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded">
                <h3 className="text-lg font-medium mb-2">Break-even Point (Units)</h3>
                <p className="text-2xl font-bold text-blue-600">{breakEvenUnits.toLocaleString()}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded">
                <h3 className="text-lg font-medium mb-2">Break-even Revenue ($)</h3>
                <p className="text-2xl font-bold text-blue-600">${breakEvenRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
