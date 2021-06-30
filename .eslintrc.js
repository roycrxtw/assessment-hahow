module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    'jest/globals': true,
  },
  plugins: ['jest'],
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    'max-len': ['error', { code: 140, ignoreComments: true }],
    'no-restricted-syntax': 'off',
    'no-continue': 'off',
    'object-curly-newline': ['error', { consistent: true }],
    'prefer-destructuring': 'off',
    'func-names': ['error', 'as-needed'],
  },
  settings: {
    'import/resolver': {
      node: {
        paths: ['.'],
      },
    },
  },
};
