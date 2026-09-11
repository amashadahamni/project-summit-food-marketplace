const js = require("@eslint/js");
const react = require("eslint-plugin-react");
const globals = require("globals");

module.exports = [
  { ignores: ["dist/**", "node_modules/**", "cypress/screenshots/**"] },
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser, ...globals.mocha, cy: "readonly", expect: "readonly" }
    },
    plugins: { react },
    settings: { react: { version: "detect" } },
    rules: { ...js.configs.recommended.rules, ...react.configs.recommended.rules, "react/prop-types": "off" }
  }
];