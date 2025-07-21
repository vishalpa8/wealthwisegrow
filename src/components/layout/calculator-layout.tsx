'use client';

import { cn } from '@/lib/utils/cn';
import type { CalculatorLayoutProps } from '@/types/calculator';

export function CalculatorLayout({
  title,
  description,
  children,
  sidebar,
  className,
}: CalculatorLayoutProps) {
  return (
    <div className={cn("container-wide py-8", className)}>
      {/* Header */}
      <header className="text-center mb-12 animate-fade-in">
        <div className="container-narrow">
          <h1 className="text-heading-1 mb-6">{title}</h1>
          {description && (
            <p className="text-body-large">
              {description}
            </p>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
        {/* Calculator Form */}
        <div className={cn("xl:col-span-3", !sidebar && "xl:col-span-5")}>
          <div className="animate-slide-up">
            {children}
          </div>
        </div>

        {/* Sidebar */}
        {sidebar && (
          <div className="xl:col-span-2">
            <div className="sticky top-24 animate-slide-up" style={{animationDelay: '0.2s'}}>
              {sidebar}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
