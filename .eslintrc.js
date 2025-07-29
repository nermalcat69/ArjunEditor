module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
  ],
  rules: {
    // TypeScript specific rules
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    
    // General rules
    'no-console': 'off', // Allow console logs in this package
    'prefer-const': 'error',
    'no-var': 'error',
    'no-unused-expressions': 'error',
    
    // Import/export rules
    'no-duplicate-imports': 'error',
  },
  env: {
    node: true,
    es2020: true,
    browser: true,
  },
  ignorePatterns: [
    'dist/',
    'node_modules/',
    '*.d.ts',
  ],
}; 