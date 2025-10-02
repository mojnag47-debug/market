module.exports = {
  root: true,
  ignorePatterns: ['**/*'],
  plugins: ['@nx'],
  overrides: [
    {
      files: ['*.ts', '*.tsx', '*.js', '*.jsx'],
      rules: {
        '@nx/enforce-module-boundaries': [
          'error',
          {
            enforceBuildableLibDependency: true,
            allow: [],
            depConstraints: [
              {
                sourceTag: '*',
                onlyDependOnLibsWithTags: ['*'],
              },
            ],
          },
        ],
      },
    },
    {
      files: ['*.ts', '*.tsx'],
      extends: ['eslint:recommended', 'prettier'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      },
      plugins: ['@typescript-eslint', 'import'],
      rules: {
        // TypeScript specific rules
        '@typescript-eslint/no-unused-vars': [
          'error',
          { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
        ],
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-non-null-assertion': 'warn',
        '@typescript-eslint/prefer-const': 'error',
        '@typescript-eslint/no-var-requires': 'error',
        
        // Import rules
        'import/order': [
          'error',
          {
            groups: [
              'builtin',
              'external',
              'internal',
              'parent',
              'sibling',
              'index',
              'object',
              'type',
            ],
            'newlines-between': 'always',
            alphabetize: {
              order: 'asc',
              caseInsensitive: true,
            },
          },
        ],
        'import/no-duplicates': 'error',
        'import/no-unresolved': 'off', // TypeScript handles this
        
        // General rules
        'no-console': 'warn',
        'no-debugger': 'error',
        'no-alert': 'error',
        'prefer-const': 'error',
        'no-var': 'error',
        'object-shorthand': 'error',
        'prefer-template': 'error',
        'template-curly-spacing': 'error',
        'padding-line-between-statements': [
          'error',
          { blankLine: 'always', prev: '*', next: 'return' },
          { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
          { blankLine: 'any', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var'] },
        ],
      },
    },
    {
      files: ['*.js', '*.jsx'],
      extends: ['eslint:recommended', 'prettier'],
      env: {
        node: true,
        es6: true,
      },
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      },
      rules: {
        'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
        'no-console': 'warn',
        'prefer-const': 'error',
        'no-var': 'error',
      },
    },
    {
      files: ['*.json'],
      parser: 'jsonc-eslint-parser',
      rules: {},
    },
    {
      files: ['*.spec.ts', '*.spec.tsx', '*.spec.js', '*.spec.jsx', '*.test.ts', '*.test.tsx', '*.test.js', '*.test.jsx'],
      env: {
        jest: true,
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'no-console': 'off',
      },
    },
  ],
};