export default [
  {
    ignores: ['node_modules/**', 'ui/**', 'Test Environment/**', '.npm-cache/**', '.local-package/**'],
  },
  {
    files: ['**/*.{js,cjs,mjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: {
        console: 'readonly',
        process: 'readonly',
        URL: 'readonly',
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
      },
    },
    rules: {
      'no-undef': 'error',
      'no-unused-vars': 'warn',
    },
  },
];
