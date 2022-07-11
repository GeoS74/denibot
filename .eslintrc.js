module.exports = {
  env: {
    node: true,
    commonjs: true,
    es2021: true,
  },
  extends: 'airbnb-base',
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    'no-console': 'off',
    'linebreak-style': 1,
    'no-template-curly-in-string': 'off',
    'no-underscore-dangle': 'off',
    'no-use-before-define': 'off',
    'consistent-return': 'off',
    'no-return-assign': 'off',
    'no-restricted-syntax': 'off',
    'no-await-in-loop': 'off',
    'no-plusplus': 'off',
  },
  ignorePatterns: ['*.test.js'],
};
