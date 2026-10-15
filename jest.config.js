module.exports = {
  preset: 'jest-expo',
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
  testPathIgnorePatterns: ['/node_modules/', '/.maestro/'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}',
    '!src/test/**',
    '!src/app/**',
  ],
  // Reanimated 4 runs on react-native-worklets, which needs its own resolver in Jest
  resolver: 'react-native-worklets/jest/resolver',
  setupFiles: ['react-native-gesture-handler/jestSetup', '<rootDir>/jest.setup.js'],
};
