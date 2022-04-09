module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    "plugin:react/recommended",
    "airbnb",
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: [
    "react",
  ],
  rules: {
    quotes: ["error", "double"],
    "react/jsx-props-no-spreading": [0],
    "react/jsx-one-expression-per-line": [0],
    "no-case-declarations": [0],
    "no-plusplus": ["error", { "allowForLoopAfterthoughts": true }],
    "react/function-component-definition": [2, { namedComponents: "arrow-function", unnamedComponents: "arrow-function" }],
  },
};
