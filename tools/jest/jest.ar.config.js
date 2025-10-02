module.exports = {
  // config file is under tools/jest/ so repo root is two levels up
  rootDir: '../../',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/__tests__/**/*.(ts|js)', '<rootDir>/src/**/?(*.)+(spec|test).(ts|js)'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.(t|j)sx?$': ['@swc/jest', { jsc: { parser: { tsx: true }, target: 'es2022' } }],
  },
};
