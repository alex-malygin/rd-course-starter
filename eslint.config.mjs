// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { args: 'none', ignoreRestSiblings: true },
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'import/named': 'warn',
      'import/no-absolute-path': 'error',
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'import/first': 'error',
      'import/newline-after-import': 'error',
      'import/no-duplicates': 'error',
      'array-callback-return': 'error',
      'arrow-spacing': [
        'error',
        {
          after: true,
          before: true,
        },
      ],
      'block-spacing': 'error',
      'brace-style': [
        'error',
        '1tbs',
        {
          allowSingleLine: true,
        },
      ],
      'comma-dangle': [
        'error',
        {
          arrays: 'always-multiline',
          exports: 'ignore',
          functions: 'ignore',
          imports: 'ignore',
          objects: 'always-multiline',
        },
      ],
      'comma-spacing': [
        'error',
        {
          after: true,
          before: false,
        },
      ],
      curly: ['warn', 'all'],
      'default-case': 'error',
      eqeqeq: 'error',
      'implicit-arrow-linebreak': 'off',
      'import/no-dynamic-require': 'off',
      'import/no-self-import': 'off',
      'import/order': 'off',
      'import/prefer-default-export': 'off',
      'key-spacing': [
        'error',
        {
          afterColon: true,
          beforeColon: false,
        },
      ],
      'keyword-spacing': [
        'error',
        {
          after: true,
          before: true,
        },
      ],
      'linebreak-style': ['error', 'unix'],
      'max-len': [
        'error',
        {
          code: 120,
          ignoreComments: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
          ignoreUrls: true,
        },
      ],
      'newline-per-chained-call': [
        'error',
        {
          ignoreChainWithDepth: 3,
        },
      ],
      'no-console': 'error',
      'no-debugger': 'warn',
      'no-duplicate-imports': 'error',
      'no-else-return': 'error',
      'no-floating-decimal': 'error',
      'no-implicit-coercion': 'error',
      'no-multi-spaces': [
        'error',
        {
          exceptions: {
            ImportDeclaration: true,
            Property: true,
            VariableDeclarator: true,
          },
          ignoreEOLComments: true,
        },
      ],
      'no-multiple-empty-lines': [
        'error',
        {
          max: 1,
          maxBOF: 1,
          maxEOF: 1,
        },
      ],
      'no-negated-condition': 'error',
      'no-nested-ternary': 'error',
      'no-plusplus': 'off',
      'no-restricted-syntax': [
        'error',
        'ForInStatement',
        'LabeledStatement',
        'WithStatement',
      ],
      'no-self-compare': 'error',
      'no-template-curly-in-string': 'error',
      'no-trailing-spaces': 'error',
      'no-underscore-dangle': [
        'error',
        {
          allow: ['_id'],
        },
      ],
      'no-unneeded-ternary': 'error',
      'no-use-before-define': [
        'error',
        {
          functions: false,
        },
      ],
      'no-useless-rename': 'error',
      'no-var': 'error',
      'no-whitespace-before-property': 'error',
      'padding-line-between-statements': [
        'error',
        {
          blankLine: 'always',
          next: 'return',
          prev: '*',
        },
      ],
      'prefer-const': 'error',
      'prefer-destructuring': [
        'error',
        {
          AssignmentExpression: {
            array: false,
            object: false,
          },
          VariableDeclarator: {
            array: false,
            object: true,
          },
        },
        {
          enforceForRenamedProperties: false,
        },
      ],
      'prefer-promise-reject-errors': 'off',
      quotes: ['error', 'single'],
      semi: ['error', 'always'],
      'space-before-blocks': [
        'error',
        {
          classes: 'always',
          functions: 'always',
          keywords: 'always',
        },
      ],
      strict: 'off',
      'template-curly-spacing': 'error',
    },
  },
);
