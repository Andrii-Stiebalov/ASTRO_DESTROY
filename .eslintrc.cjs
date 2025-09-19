module.exports = {
    root: true,
    env: {
      browser: true,
      es2021: true,
    },
    parser: '@typescript-eslint/parser',
    parserOptions: {
      project: ['./tsconfig.json'],
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    plugins: ['@typescript-eslint'],
    extends: [
      'standard-with-typescript',
    ],
    rules: {
      // пример: отключаем обязательные return types
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/strict-boolean-expressions': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  }
  