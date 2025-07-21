import { Metadata } from 'next'
import { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Financial Calculators | WealthWise Hub',
  description: 'Comprehensive financial calculators for all your investment, loan, and planning needs',
  // Add any other shared metadata properties here
}

export default function CalculatorsLayout({
  children,
}: {
  children: ReactNode
}) {
  return <>{children}</>
}
