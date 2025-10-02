const { readFileSync } = require('fs');

// Reading the SWC compilation config and remove the "exclude"
// for the test files to be compiled by SWC
const { exclude: _, ...swcJestConfig } = JSON.parse(
  readFileSync(`${__dirname}/.swcrc`, 'utf-8')
);

// disable .swcrc look-up by SWC core because we're passing in swcJestConfig ourselves.
// If we do not disable this, SWC Core will read .swcrc and won't transform our test files due to "exclude"
if (swcJestConfig.swcrc === undefined) {
  swcJestConfig.swcrc = false;
}

// Uncomment if using global setup/teardown files being transformed via swc
// https://nx.dev/packages/jest/documents/overview#global-setup/teardown-with-nx-libraries
// jest will try to resolve these files from the root of the workspace, so we have to provide the full path
// swcJestConfig.globalSetup = '<rootDir>/tools/config/jest/global-setup.ts';
// swcJestConfig.globalTeardown = '<rootDir>/tools/config/jest/global-teardown.ts';

module.exports = {
  displayName: {
    name: 'NEXTGEN-MARKETPLACE',
    color: 'magentaBright',
  },
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['@swc/jest', swcJestConfig],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageReporters: ['html'],
  collectCoverageFrom: [
    '**/*.{ts,js}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/build/**',
  ],
  testMatch: [
    '<rootDir>/**/*.(test|spec).(ts|js)',
    '<rootDir>/**/__tests__/**/*.(ts|js)',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/build/'],
  setupFilesAfterEnv: ['<rootDir>/tools/config/jest/setup.ts'],
};