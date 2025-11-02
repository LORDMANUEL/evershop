import js from '@eslint/js';
import globals from 'globals';
import typescriptParser from '@typescript-eslint/parser';

const IGNORE_PATTERNS = [
  '/node_modules/',
  '**/*test.js',
  '**/tests/**',
  '**/create-evershop-app/**',
  '**/.evershop/**',
  '/.vscode/**',
  '/.git/**',
  '/.idea/**',
  '**/extensions/**/dist/**',
  '**/public/**',
  '**/themes/**',
  '**/media/**',
  '**/packages/*/dist/**',
  '**/packages/product_review/**',
  '**/packages/resend/**'
];

const CUSTOM_RULES = {
  ...js.configs.recommended.rules,
  'no-console': 'error',
  'prefer-const': 'error',
  'no-else-return': 'off',
  'camelcase': 'off',
  'no-multi-assign': 'off',
  'no-template-curly-in-string': 'off',
  'no-await-in-loop': 'off',
  'no-use-before-define': 'off',
  'no-continue': 'off',
  'no-shadow': 'off',
  'no-useless-return': 'off',
  'no-lonely-if': 'warn',
  'no-unused-vars': 'off',
  'no-undef': 'off',
  'no-prototype-builtins': 'off',
  'no-useless-escape': 'off'
};

export default [
  {
    ignores: IGNORE_PATTERNS
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    rules: CUSTOM_RULES
  }
];
