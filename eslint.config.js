// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettier = require('eslint-plugin-prettier/recommended');

module.exports = defineConfig([
  expoConfig, // already includes eslint-plugin-react-hooks v7 (with the React Compiler rules)
  prettier, // last: turns off formatting rules that conflict with Prettier
  {
    files: ['**/*.test.ts', '**/*.test.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [{ name: '@testing-library/react-native', message: 'Import from @/test/render' }],
        },
      ],
    },
  },
  {
    // Jest (Node) and browsers have these; Hermes, the engine on iOS/Android, doesn't: the app crashes only on a phone
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.property.name='toSorted']",
          message: 'Hermes (iOS/Android) has no toSorted(): use [...array].sort(…).',
        },
        {
          selector: "CallExpression[callee.object.name='Object'][callee.property.name='groupBy']",
          message: 'Hermes (iOS/Android) has no Object.groupBy(): use reduce().',
        },
        {
          selector: "CallExpression[callee.name='structuredClone']",
          message: 'Hermes (iOS/Android) has no structuredClone().',
        },
      ],
    },
  },
  { files: ['jest.setup.js'], languageOptions: { globals: { jest: 'readonly' } } },
  { ignores: ['dist/*', 'ios/*', 'android/*', 'drizzle/*', 'coverage/*'] },
]);
