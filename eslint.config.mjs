import importPlugin from 'eslint-plugin-import-x';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import globals from 'globals';
import prettier from 'eslint-plugin-prettier';
import unusedImports from 'eslint-plugin-unused-imports';

export default [
  {
    ignores: ['src/graphql/generated/**']
  },
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
      'react-hooks': reactHooksPlugin,
      'import-x': importPlugin,
      prettier: prettier,
      'unused-imports': unusedImports
    },
    rules: {
      ...reactHooksPlugin.configs.flat.recommended.rules,
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
      // Import rules
      'import-x/order': [
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
              pattern: '{zustand,zustand/**}',
              group: 'external',
              position: 'after'
            },
            {
              pattern: '~/{app,components,pages}{,/**}',
              group: 'internal',
              position: 'before'
            },
            {
              pattern: '~/{hooks,state,graphql,lib,constants}{,/**}',
              group: 'internal',
              position: 'before'
            },
            {
              pattern: '**.css',
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
      ],
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          args: 'after-used',
          argsIgnorePattern: '^(_|key$)',
          varsIgnorePattern: '^(_|key$)',
          caughtErrorsIgnorePattern: '^_'
        }
      ]
    }
  }
];
