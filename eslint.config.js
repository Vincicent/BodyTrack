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
  { files: ['jest.setup.js'], languageOptions: { globals: { jest: 'readonly' } } },
  { ignores: ['dist/*', 'ios/*', 'android/*', 'drizzle/*', 'coverage/*'] },
]);
