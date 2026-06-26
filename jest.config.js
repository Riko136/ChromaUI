import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const babelConfigFile = path.join(__dirname, "babel.config.json");

// Per-project rootDir narrows Babel's own upward config search, so point
// each project's transform at the shared root babel.config.json explicitly.
const transform = {
  "^.+\\.(m|c)?(js|jsx|ts|tsx)$": ["babel-jest", { configFile: babelConfigFile }],
};

export default {
  projects: [
    {
      displayName: "frontend",
      rootDir: path.join(__dirname, "apps/frontend"),
      // jest-fixed-jsdom keeps Node's web globals (fetch/Request/Response/
      // streams) that plain jsdom strips but msw v2 needs.
      testEnvironment: "jest-fixed-jsdom",
      setupFilesAfterEnv: [path.join(__dirname, "jest.setup.js")],
      transform,
      // msw v2 and its dependency chain ship ESM-only modules; un-ignore them
      // so babel transpiles them (Jest ignores node_modules by default).
      transformIgnorePatterns: [
        "/node_modules/(?!(?:msw|@mswjs|@bundled-es-modules|rettime|until-async|headers-polyfill|@open-draft|outvariant|strict-event-emitter|is-node-process|tough-cookie)/)",
        "\\.pnp\\.[^\\/]+$",
      ],
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
      },
    },
    {
      displayName: "backend",
      rootDir: path.join(__dirname, "apps/backend"),
      testEnvironment: "node",
      transform,
      moduleNameMapper: {
        // TS source uses NodeNext-style relative imports (e.g. "./chroma.js")
        // that point at .ts files; strip the extension so Jest can resolve them.
        "^(\\.{1,2}/.*)\\.js$": "$1",
      },
    },
  ],
};
