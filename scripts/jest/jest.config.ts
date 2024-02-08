import type { Config } from "jest";

const jestDefaultConfig: Config = {
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  rootDir: ".",
  roots: ["<rootDir>/src"],
  transformIgnorePatterns: ["[/\\\\]node_modules[/\\\\].+\\.(js|jsx)$"],
};

const webConfig: Config = {
  ...jestDefaultConfig,
  displayName: {
    name: "Web",
    color: "cyan",
  },
  setupFilesAfterEnv: ["<rootDir>/scripts/jest/setup.ts"],
  testEnvironment: "jsdom",
  testMatch: ["**/__tests__/**/*.(spec|test).ts?(x)"],
  transform: {
    "^.+\\.tsx?$": "@swc/jest",
    "^.+\\.(css|scss|sass)$": "jest-preview/transforms/css",
    "^(?!.*\\.(js|jsx|mjs|cjs|ts|tsx|css|json)$)":
      "jest-preview/transforms/file",
  },
};

const serverConfig: Config = {
  ...jestDefaultConfig,
  displayName: {
    name: "Server",
    color: "blue",
  },
  testEnvironment: "node",
  testMatch: ["**/+([a-zA-Z]).server.(spec|test).ts?(x)"],
  transform: {
    "^.+\\.tsx?$": "@swc/jest",
  },
};

const getProjects = (): Config["projects"] => {
  switch (process.env.TEST_ENV) {
    case "web":
      return [webConfig];
    case "server":
      return [serverConfig];
    default:
      return [webConfig, serverConfig];
  }
};

export const collectCoverageFrom: string[] = [
  "**/**/*.{ts,tsx}",
  "!**/**/*.test.{ts,tsx}",
  "!**/src/types/**",
  "!**/node_modules/**",
  "!**/dist/**",
  "!**/__tests__/**",
];

const config: Config = {
  collectCoverageFrom,
  projects: getProjects(),
};

export default config;
