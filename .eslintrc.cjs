module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:import/recommended",
    "plugin:jsx-a11y/recommended",
    "plugin:@typescript-eslint/recommended",
    "eslint-config-prettier",
  ],
  ignorePatterns: ["dist", ".eslintrc.cjs"],
  parser: "@typescript-eslint/parser",
  plugins: ["react-refresh"],
  "import/resolver": {
    node: {
      paths: ["src"],
      extensions: [".js", ".jsx", ".ts", ".tsx"],
    },
  },
  rules: {
    "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
    "max-len": ["error", { code: 120 }],
  },
};
