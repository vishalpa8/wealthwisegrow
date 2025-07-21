export default function BudgetGuide() {
  return (
    <section className="max-w-2xl mx-auto p-8 mt-8 bg-white rounded-2xl shadow-lg border border-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">How to Use the Budget Calculator</h1>
      <ol className="list-decimal list-inside space-y-3 mb-6 text-lg text-gray-700">
        <li>Enter your total monthly income.</li>
        <li>Input your total monthly expenses.</li>
        <li>The calculator will show your estimated monthly savings instantly.</li>
      </ol>
      <p className="mb-2 text-gray-600">Use this tool to track your spending and savings. Adjust your expenses to see how you can save more each month.</p>
      <p className="text-sm text-blue-600">Tip: Review your budget monthly to stay on track with your financial goals.</p>
    </section>
  );
} 