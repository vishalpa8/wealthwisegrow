import 'react';

declare module 'react' {
  // Extend JSX namespace
  namespace JSX {
    interface IntrinsicElements {
      'style': React.DetailedHTMLProps<
        React.StyleHTMLAttributes<HTMLStyleElement> & {
          jsx?: boolean;
          global?: boolean;
        },
        HTMLStyleElement
      >;
    }
  }
}

// Extend global type definitions
declare global {
  // Add custom window properties
  interface Window {
    __NEXT_DATA__: any;
    __NEXT_LOADED_PAGES__: string[];
  }

  // Add custom event types
  interface CustomEventMap {
    'calculator:result': CustomEvent<{
      type: string;
      values: Record<string, unknown>;
      results: unknown[];
    }>;
    'calculator:error': CustomEvent<{
      type: string;
      error: string;
    }>;
  }

  // Add custom error types
  interface CalculatorError extends Error {
    code: string;
    details?: Record<string, unknown>;
  }
}

// Add module declarations for CSS modules
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { [key: string]: string };
  export default classes;
}

// Add types for styled-jsx
declare module 'styled-jsx/css' {
  export default function css(strings: TemplateStringsArray, ...interpolations: any[]): string;
  export function resolve(styles: string): { className: string; styles: string };
  export function global(strings: TemplateStringsArray, ...interpolations: any[]): string;
}
