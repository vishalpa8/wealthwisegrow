'use client';

import { cn } from '@/lib/utils';
import type { CalculatorLayoutProps } from '@/types/calculator';

type ContainerSize = 'narrow' | 'medium' | 'wide' | 'extra-wide' | 'full' | 'content-light' | 'content-medium' | 'content-heavy' | 'content-extensive';

interface ExtendedCalculatorLayoutProps extends CalculatorLayoutProps {
  containerSize?: ContainerSize;
}

function getContainerClass(size: ContainerSize): string {
  const containerClasses = {
    'narrow': 'container-narrow',
    'medium': 'container-content-medium',
    'wide': 'container-wide',
    'extra-wide': 'container-extra-wide',
    'full': 'container-full',
    'content-light': 'container-content-light',
    'content-medium': 'container-content-medium',
    'content-heavy': 'container-content-heavy',
    'content-extensive': 'container-content-extensive',
  };
  return containerClasses[size] || 'container-wide';
}

export function CalculatorLayout({
  title,
  description,
  children,
  sidebar,
  className,
  containerSize = 'wide',
}: ExtendedCalculatorLayoutProps) {
  const containerClass = getContainerClass(containerSize);
  
  // Determine header container based on content size
  const getHeaderContainer = (size: ContainerSize) => {
    if (size === 'content-extensive' || size === 'extra-wide' || size === 'full') {
      return 'container-content-medium'; // Wider header for extensive content
    }
    return 'container-narrow';
  };
  
  const headerContainerClass = getHeaderContainer(containerSize);
  
  return (
    <div className={cn(containerClass, "py-6 sm:py-8", className)}>
      {/* Header */}
      <header className="text-center mb-8 sm:mb-12 animate-fade-in">
        <div className={headerContainerClass}>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-4 sm:mb-6">{title}</h1>
          {description && (
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-4xl mx-auto">
              {description}
            </p>
          )}
        </div>
      </header>

      {/* Main Content - Full width container for all content */}
      <div className="w-full">
        <div className={cn(
          "grid gap-6 lg:gap-8",
          sidebar ? "grid-cols-1 xl:grid-cols-5" : "grid-cols-1"
        )}>
          {/* Calculator Form - Full width within grid */}
          <div className={cn(
            "w-full",
            sidebar ? "xl:col-span-3" : "xl:col-span-5"
          )}>
            <div className="animate-slide-up w-full">
              {children}
            </div>
          </div>

          {/* Sidebar */}
          {sidebar && (
            <div className="xl:col-span-2 order-first xl:order-last">
              <div className="xl:sticky xl:top-24 animate-slide-up" style={{animationDelay: '0.2s'}}>
                {sidebar}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
