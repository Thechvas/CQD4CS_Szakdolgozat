module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  moduleDirectories: ['node_modules', 'src'],
  moduleNameMapper: {
  '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
  '^@/generated/(.*)$': '<rootDir>/src/generated/$1',
},
  transformIgnorePatterns: [
    '/node_modules/(?!(?:@auth|@uploadthing|next-auth|bcrypt)/)',
  ],
  globals: {
    'ts-jest': {
      tsconfig: './tsconfig.jest.json',
      useESM: true,
    },
  },
  reporters: [
    'default',
    ['jest-html-reporter', {
      pageTitle: 'Test Report',
      outputPath: 'test-report.html',
      includeFailureMsg: true,
      includeConsoleLog: true,
    }],
  ],
};