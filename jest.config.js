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
  testPathIgnorePatterns: ['/node_modules/', '/.maestro/', '/e2e-web/'],
  coverageThreshold: {
    // Files matched by a path key below are EXCLUDED from "global", which is why global is lower than overall coverage.
    // A glob key is checked file by file: EVERY domain file must reach these numbers on its own.
    global: { lines: 60, branches: 55 },
    './src/features/*/domain/*.ts': { lines: 95, branches: 90 },
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}',
    '!src/test/**',
    '!src/app/**',
  ],
};
