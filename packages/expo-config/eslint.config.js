const sharedEslintConfig = require('@pension/eslint-config/eslint.config.js');

module.exports = [
  ...sharedEslintConfig,
  {
    files: ['**/*.{ts,tsx,mts,cts}'],
    languageOptions: {
      parserOptions: {
        // Pin the tsconfig root to this package so type-aware parsing never
        // has to guess across multiple workspace tsconfig.json files
        // (see https://tseslint.com/parser-tsconfigrootdir).
        tsconfigRootDir: __dirname,
      },
    },
  },
];
