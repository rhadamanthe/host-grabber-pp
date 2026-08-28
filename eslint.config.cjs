// eslint.config.js
const { defineConfig } = require('eslint/config');

const globals = require('globals');
const jsdoc = require('eslint-plugin-jsdoc');

module.exports = defineConfig([
  {
    files: ['**/*.js', '**/*.cjs'],
  },
  {
    ignores: ['browsers/**/*', 'coverage/**/*', 'src/scripts/npm/**/*']
  },
  {
    languageOptions: {
      ecmaVersion: 2018, // 'es9'
      sourceType: 'script',
      globals: {
        ...globals.browser,
        ...globals.amd,
        ...globals.webextensions
      }
    },
    plugins: {
      jsdoc
    },
    rules: {
      eqeqeq: 'error',
      curly: ['error'],
      quotes: ['error', 'single'],
      'no-eval': ['error'],
      'eol-last': ['error', 'always'],
      indent: ['error', 2],
      'linebreak-style': ['error', 'unix'],
      'no-tabs': 'error',
      'no-trailing-spaces': 'error',

      'jsdoc/require-jsdoc': 'error',
      'jsdoc/check-param-names': 'error',
      'jsdoc/check-tag-names': 'error'
    }
  }
]);
