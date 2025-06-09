import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";


/** @type {import('eslint').Linter.Config[]} */
export default [
  {files: ["**/*.{js,mjs,cjs,ts}"]},
  {languageOptions: { globals: globals.browser }},
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.test.{js,ts}", "test/**/*", "**/test/**/*"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.jest
      }
    }
  },
  {
    files: ["**/*.config.{js,mjs}", "rollup.config.js", "jest.config.js", ".commitlintrc.js", "demo/webpack.config.js"],
    languageOptions: {
      globals: {
        ...globals.node
      }
    },
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      "no-undef": "off"
    }
  },
  {
    ignores: [
      "dist/**/*",
      "**/dist/**/*",
      "coverage/**/*",
      "src/parser.ts",
      "types/parser.terms.d.ts",
      "**/*.d.ts"
    ]
  }
];