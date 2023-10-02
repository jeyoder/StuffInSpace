module.exports = {
  env: {
    browser: true,
    es2021: true,
    jquery: true
  },
  extends: 'airbnb-base',
  overrides: [
    {
      env: {
        node: true
      },
      files: [
        '.eslintrc.{js,cjs}'
      ],
      parserOptions: {
        sourceType: 'script'
      }
    }
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    'no-plusplus': 'off',
    'comma-dangle': ['error', 'never'],
    'no-console': 'warn',
    'max-len': ['error', { code: 130 }],
    'no-else-return': 'warn',
    'no-param-reassign': 'off',
    'prefer-destructuring': 'off',
    'prefer-template': 'warn',
    'no-continue': 'off',
    'space-before-function-paren': ['error', { anonymous: 'never', named: 'always' }],
    'no-await-in-loop': 'off',
    'class-methods-use-this': 'off',
    indent: ['error', 2]
  }
};
