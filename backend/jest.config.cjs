/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/testing/**/*.test.ts"],
  moduleFileExtensions: ["ts", "js", "json"],
  testTimeout: 60000,
  clearMocks: true,
};
