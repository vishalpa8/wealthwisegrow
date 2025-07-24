import { Metadata } from 'next'
import { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Financial Calculators | WealthWiseGrow',
  description: 'Explore our collection of 34+ financial calculators for loans, investments, retirement planning, and more. Simple, accurate, and free to use.',
  keywords: ['financial calculators', 'loan calculator', 'investment calculator', 'retirement calculator', 'mortgage calculator', 'budget calculator'],
  openGraph: {
    title: 'Financial Calculators | WealthWiseGrow',
    description: 'Explore our collection of 34+ financial calculators for loans, investments, retirement planning, and more.',
    type: 'website',
  },
}

export default function CalculatorsLayout({
  children,
}: {
  children: ReactNode
}) {
  return <>{children}</>
}
