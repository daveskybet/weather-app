import { dirname } from 'path';
import { fileURLToPath } from 'url';
import eslintReact from '@eslint-react/eslint-plugin';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('typescript-eslint').ConfigArray} */
export default [
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**',
      '.expo/**',
    ],
  },
  // --- TypeScript-ESLint recommended rules ---
  ...tseslint.configs.recommended,
  // --- @eslint-react recommended with type checking ---
  eslintReact.configs['recommended-type-checked'],
  // --- Project-wide: React Hooks + type-aware parser ---
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooksPlugin,
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      ...reactHooksPlugin.configs.recommended.rules,
      // Calling setState inside useEffect via a useCallback is the standard
      // async data-fetch pattern — disable the overly strict rule.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  // --- Mocks: suppress use-prefix warning on intentional API-matching names ---
  {
    files: ['src/__mocks__/**'],
    rules: {
      '@eslint-react/no-unnecessary-use-prefix': 'off',
    },
  },
];
