/**
 * Shared Prettier config for workspace packages (`packages/*`).
 *
 * Consumers wire it in with:
 *   module.exports = require('@pension/config/prettier.config.js');
 *
 * Matches apps/pension's formatting (printWidth 100, single quotes, trailing
 * comma es5) minus the Tailwind-specific plugin, which only applies to the
 * React Native apps' TSX.
 */
module.exports = {
  printWidth: 100,
  tabWidth: 2,
  singleQuote: true,
  bracketSameLine: true,
  trailingComma: 'es5',
};
