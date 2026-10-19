const expoPreset = require('jest-expo/jest-preset');

// Packages published as ES modules must be transformed by Babel too. Extend jest-expo's allow-list instead of replacing it.
const ESM_PACKAGES = ['react-redux', 'immer'];
const [expoPattern, ...otherPatterns] = expoPreset.transformIgnorePatterns;

module.exports = {
  preset: 'jest-expo',
  // Reanimated 4 runs on react-native-worklets, which needs its own resolver in Jest
  resolver: 'react-native-worklets/jest/resolver',
  setupFiles: ['react-native-gesture-handler/jestSetup', '<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    expoPattern.replace('(?!(', `(?!(${ESM_PACKAGES.join('|')}|`),
    ...otherPatterns,
  ],
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
  testPathIgnorePatterns: ['/node_modules/', '/.maestro/'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}',
    '!src/test/**',
    '!src/app/**',
  ],
};
