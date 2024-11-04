import importPlugin from 'eslint-plugin-import';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import globals from 'globals';
import prettier from 'eslint-plugin-prettier';

export default [
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      parser: typescriptParser,
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        ...globals.browser
      }
    },
    plugins: {
      '@typescript-eslint': typescript,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      import: importPlugin,
      prettier: prettier
    },
    rules: {
      'prettier/prettier': 'error',
      ...typescript.configs.recommended.rules,
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^(_|key$)',
          varsIgnorePattern: '^(_|key$)',
          caughtErrorsIgnorePattern: '^_'
        }
      ],
      '@typescript-eslint/no-unused-expressions': ['error', { allowTernary: true }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'no-type-imports'
        }
      ],
      '@typescript-eslint/no-empty-function': 'warn',
      // React and import rules
      'react/react-in-jsx-scope': 'off',
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', ['sibling', 'parent'], 'index', 'unknown'],
          pathGroups: [
            {
              pattern: 'react',
              group: 'external',
              position: 'before'
            },
            {
              pattern: '@**/**',
              group: 'external',
              position: 'after'
            },
            {
              pattern: '{graphql,@apollo/**}',
              group: 'external',
              position: 'after'
            },
            {
              pattern: '{recoil,zustand,redux,~/context/**,~/providers/**}',
              group: 'external',
              position: 'after'
            },
            {
              pattern: '{~/components/**,~/layouts/**,~/pages/**}',
              group: 'internal',
              position: 'before'
            },
            {
              pattern: '{~/hooks/**,~/utils/**}',
              group: 'internal',
              position: 'before'
            },
            {
              pattern: '{~/types/**,~/interfaces/**}',
              group: 'internal',
              position: 'after'
            },
            {
              pattern: '**.scss',
              group: 'unknown',
              position: 'after'
            }
          ],
          pathGroupsExcludedImportTypes: ['react'],
          'newlines-between': 'never',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true
          }
        }
      ]
    },
    settings: {
      react: {
        version: 'detect'
      }
    }
  }
];
