/**
 * Shared ESLint flat config for workspace packages (`packages/*`).
 *
 * Consumers wire it in with:
 *   module.exports = require('@pension/config/eslint.config.js');
 *
 * Lints TypeScript with typescript-eslint recommended rules and defers all
 * formatting concerns to Prettier (via eslint-config-prettier).
 */
const { defineConfig } = require('eslint/config');
const js = require('@eslint/js');
const tseslint = require('typescript-eslint');
const prettier = require('eslint-config-prettier/flat');

module.exports = defineConfig([
  {
    ignores: ['node_modules/**', 'dist/**'],
  },
  js.configs.recommended,
  // Scope typescript-eslint rules to TS sources only — the recommended block
  // otherwise lints the CommonJS tooling files (*.config.js) where `require()`
  // is expected and would trip @typescript-eslint/no-require-imports.
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: ['**/*.{ts,tsx,mts,cts}'],
  })),
  prettier,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      globals: {
        __dirname: 'readonly',
        console: 'readonly',
        module: 'readonly',
        process: 'readonly',
        require: 'readonly',
      },
    },
  },
]);
