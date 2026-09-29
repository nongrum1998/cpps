const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier');
const unusedImports = require('eslint-plugin-unused-imports');
const pluginQuery = require('@tanstack/eslint-plugin-query');

module.exports = defineConfig([
  expoConfig,
  ...pluginQuery.configs['flat/recommended'],

  {
    // Comprehensive ignores for modern Expo/Mobile development
    ignores: [
      '**/node_modules/**',
      '.expo/**',
      'android/**',
      'ios/**',
      'dist/**',
      'build/**',
      '.eas/**',
      '*.min.js',
      'pnpm-lock.yaml',
    ],
  },
  {
    plugins: {
      'unused-imports': unusedImports,
    },
    rules: {
      'react/display-name': 'off',
      // Disable base rules to avoid duplicates
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      // Enable unused-imports rules as ERRORS
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
    },
  },
  // Prettier must be last to disable conflicting ESLint rules
  prettierConfig,
]);
