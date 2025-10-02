import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  dir: './',
});

const config: Config = {
  displayName: 'marketplace-web',
  preset: '../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../coverage/marketplace-web',
  testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/../../tools/config/jest/setup.ts'],
  // allow projects with no tests to exit 0 in workspace test runs
  passWithNoTests: true,
};

export default createJestConfig(config);
