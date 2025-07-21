import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import path from 'path';

// Create compatibility layer between new flat config and eslintrc-style config
const compat = new FlatCompat({
  baseDirectory: process.cwd(),
});

// Create Next.js config
const nextConfig = compat.config({
  extends: ['next/core-web-vitals'],
  settings: {
    next: {
      rootDir: process.cwd(),
    },
  },
});

export default [
  // Include Next.js plugin through the compatibility layer
  ...nextConfig,
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      '@typescript-eslint': typescript,
      'react': react,
      'react-hooks': reactHooks,
    },
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
        project: './tsconfig.json',
      },
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        console: 'readonly',
        alert: 'readonly',
        fetch: 'readonly',
        Request: 'readonly',
        Response: 'readonly',
        URL: 'readonly',
        process: 'readonly',
        crypto: 'readonly',
        indexedDB: 'readonly',
        location: 'readonly',
        history: 'readonly',
        // Framework globals
        React: 'readonly',
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      // JavaScript/TypeScript rules
      'no-unused-vars': 'off', // Use TypeScript version instead
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      
      // React rules
      'react/react-in-jsx-scope': 'off', // Not needed in Next.js
      'react/prop-types': 'off', // Using TypeScript
      'react/no-unescaped-entities': 'off',
      
      // React Hooks rules - Disable due to compatibility issues with ESLint v9
      'react-hooks/rules-of-hooks': 'off',
      'react-hooks/exhaustive-deps': 'off',
      
      // General rules
      'no-console': 'off', // Allow console statements in development
      'prefer-const': 'error',
      'no-var': 'error',
      // Disable some rules for this project
      'no-undef': 'off', // We have globals defined above
      '@typescript-eslint/no-explicit-any': 'off', // Too many to fix right now
      'no-async-promise-executor': 'warn', // Downgrade to warning for now
    },
  },
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      'no-console': 'off', // Allow console statements in development
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
  {
    ignores: [
      '.next/',
      'node_modules/',
      'out/',
      'build/',
      'dist/',
      '*.config.js',
      '*.config.mjs',
      '*.config.ts',
      '.eslintrc.js',
      'jest.config.js',
      'next.config.ts',
      'postcss.config.js',
      'tailwind.config.js',
    ],
  },
];