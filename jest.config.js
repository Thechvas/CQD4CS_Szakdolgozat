// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleDirectories: ['node_modules', 'src'],
  moduleNameMapper: {
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
  },
  reporters: [
  "default",
  ["jest-html-reporter", {
    pageTitle: "Test Report",
    outputPath: "test-report.html",
    includeFailureMsg: true,
    includeConsoleLog: true
  }]
],
};
