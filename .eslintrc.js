// .eslintrc.js
module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ['eslint:recommended', 'plugin:react/recommended', 'prettier'],
  parser: '@typescript-eslint/parser',
  plugins: ['react', '@typescript-eslint'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  rules: {
    // You can customize these:
    'react/react-in-jsx-scope': 'off', // for React 17+
    '@typescript-eslint/no-unused-vars': 'warn',
  },
};
