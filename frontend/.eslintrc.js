module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parserOptions: {
    parser: "babel-eslint"
  },
  // https://github.com/standard/eslint-config-standard
  // https://github.com/prettier/eslint-config-prettier
  // https://github.com/vuejs/eslint-plugin-vue
  extends: ["prettier", "prettier/standard", "plugin:vue/recommended"],
  // required to lint *.vue files
  plugins: ["vue", "prettier"],
  // add your custom rules here
  rules: {
    "prettier/prettier": "error"
  }
};
