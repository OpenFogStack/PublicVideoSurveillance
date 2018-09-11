module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es6: true
  },
  parserOptions: {
    ecmaVersion: 2017
  },
  // https://github.com/standard/eslint-config-standard
  // https://github.com/prettier/eslint-config-prettier
  extends: ["prettier", "prettier/standard"],
  // required to lint *.vue files
  plugins: ["prettier"],
  // add your custom rules here
  rules: {
    "prettier/prettier": "error"
  }
};
