'use client';

import { Loader2 } from 'lucide-react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  variant?: 'spinner' | 'skeleton' | 'progress';
  progress?: number;
}

const sizeMap = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12'
};

export function LoadingSpinner({ 
  size = 'md',
  message,
  className = ''
}: LoadingProps & { className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <Loader2 className={`${sizeMap[size]} animate-spin text-blue-600`} />
      {message && (
        <p className="text-sm text-gray-600">{message}</p>
      )}
    </div>
  );
}

export function LoadingSkeleton({ 
  size = 'md',
  className = '' 
}: LoadingProps & { className?: string }) {
  const heights = {
    sm: 'h-4',
    md: 'h-8',
    lg: 'h-12'
  };

  return (
    <div className={`animate-pulse ${className}`}>
      <div className={`bg-gray-200 rounded-lg ${heights[size]}`}></div>
    </div>
  );
}

export function LoadingProgress({ 
  progress = 0,
  message,
  className = ''
}: LoadingProps & { className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      {message && (
        <p className="text-sm text-gray-600 text-center">{message}</p>
      )}
    </div>
  );
}

export function CalculatorFormSkeleton() {
  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow-sm">
      <LoadingSkeleton className="w-1/3" />
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <LoadingSkeleton size="sm" className="w-1/4" />
            <LoadingSkeleton />
          </div>
        ))}
      </div>
      <LoadingSkeleton className="w-full h-12" />
    </div>
  );
}

export function ResultsSkeleton() {
  return (
    <div className="space-y-4 p-6 bg-white rounded-lg shadow-sm">
      <LoadingSkeleton className="w-1/4" />
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 border rounded-lg space-y-2">
            <LoadingSkeleton size="sm" className="w-1/2" />
            <LoadingSkeleton size="md" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CalculationLoadingState({ 
  progress,
  stage = 'Calculating...'
}: { 
  progress?: number;
  stage?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-6 bg-white rounded-lg shadow-sm">
      <LoadingSpinner size="lg" />
      <div className="mt-4 space-y-2 w-full max-w-xs">
        <p className="text-center text-gray-800 font-medium">{stage}</p>
        {progress !== undefined && (
          <LoadingProgress progress={progress} />
        )}
        <p className="text-center text-sm text-gray-600">
          This may take a few moments
        </p>
      </div>
    </div>
  );
}

export function ErrorState({ 
  message = 'An error occurred',
  onRetry
}: { 
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-6 bg-red-50 rounded-lg border border-red-100">
      <div className="text-red-600 mb-4">
        <svg
          className="h-12 w-12"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <p className="text-red-800 text-center mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

export function NetworkLoadingState() {
  return (
    <div className="flex items-center justify-center min-h-[100px] p-4 bg-blue-50 rounded-lg">
      <LoadingSpinner size="sm" message="Loading data..." />
    </div>
  );
}

export function SaveLoadingState() {
  return (
    <div className="flex items-center justify-center min-h-[100px] p-4">
      <LoadingSpinner size="sm" message="Saving changes..." />
    </div>
  );
}

export function ValidationLoadingState() {
  return (
    <div className="flex items-center justify-center min-h-[100px] p-4">
      <LoadingSpinner size="sm" message="Validating inputs..." />
    </div>
  );
}
