// ESLint flat config — modern format (ESLint 9+)
// Catches real bugs without being noisy on stylistic rules (those go to Prettier).

import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  // Base JS rules
  js.configs.recommended,

  // TypeScript rules (relaxed: we don't use strict yet)
  ...tseslint.configs.recommended,

  // Global ignores
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'coverage/**',
      '*.config.js',
      '*.config.ts',
      'scripts/**',
    ],
  },

  // Apply all plugins globally
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'jsx-a11y': jsxA11y,
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
        crypto: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        fetch: 'readonly',
        console: 'readonly',
        alert: 'readonly',
        confirm: 'readonly',
        URL: 'readonly',
        FormData: 'readonly',
        FileReader: 'readonly',
        HTMLElement: 'readonly',
        HTMLInputElement: 'readonly',
        HTMLDivElement: 'readonly',
        NodeListOf: 'readonly',
        KeyboardEvent: 'readonly',
      },
    },
    rules: {
      // React Hooks
      ...reactHooks.configs.recommended.rules,

      // Vite HMR — only flag default exports in entry files
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],

      // A11y — keep the useful ones, disable noisy ones
      ...jsxA11y.configs.recommended.rules,
      'jsx-a11y/no-autofocus': 'off',
      // Labels here are visually associated but use a div+input pattern.
      // Tightening this is a follow-up; warn is too noisy for this codebase.
      'jsx-a11y/label-has-associated-control': 'off',
      // div with role="dialog" legitimately needs keyboard handlers; this
      // rule doesn't understand role-based interactivity.
      'jsx-a11y/no-noninteractive-element-interactions': 'off',

      // TypeScript — relax the noisy ones
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/consistent-type-imports': 'error',

      // General
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
      'prefer-const': 'error',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
    },
  },

  // Disable rules that conflict with Prettier
  prettier,
);
