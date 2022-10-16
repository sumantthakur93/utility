module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  plugins: ["@typescript-eslint"],
  parser: "@typescript-eslint/parser",
  rules: {
    semi: "off",
    "space-before-function-paren": ["off", "never"],
    "@typescript-eslint/no-unused-vars": [
      "error",
      { vars: "all", args: "after-used" },
    ],
    quotes: ["error", "double", { allowTemplateLiterals: true }],
    "max-len": ["warn", { code: 80, tabWidth: 2 }],
  },
  env: {
    node: true,
  },
};
