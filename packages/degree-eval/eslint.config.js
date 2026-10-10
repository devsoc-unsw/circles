import { fixupConfigRules } from '@eslint/compat';
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import airbnbBestPractices from 'eslint-config-airbnb-base/rules/best-practices';
import airbnbEs6 from 'eslint-config-airbnb-base/rules/es6';
import airbnbImports from 'eslint-config-airbnb-base/rules/imports';
import airbnbStyle from 'eslint-config-airbnb-base/rules/style';
import airbnbVariables from 'eslint-config-airbnb-base/rules/variables';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

// eslint-config-airbnb-typescript is unmaintained and stuck on typescript-eslint v7, so its
// non-formatting rules are inlined here (formatting is left to prettier). Kept in sync with
// frontend/eslint.config.js.
// https://github.com/iamturns/eslint-config-airbnb-typescript/blob/master/lib/shared.js (and index.js)
const swap = (rules, name) => ({ [name]: 'off', [`@typescript-eslint/${name}`]: rules[name] });
const airbnbTypescript = [
  {
    settings: {
      'import/parsers': { '@typescript-eslint/parser': ['.ts', '.tsx', '.d.ts'] },
      'import/extensions': ['.js', '.mjs', '.jsx', '.ts', '.tsx', '.d.ts'],
      'import/external-module-folders': ['node_modules', 'node_modules/@types']
    },
    rules: {
      camelcase: 'off',
      '@typescript-eslint/naming-convention': [
        'error',
        { selector: 'variable', format: ['camelCase', 'PascalCase', 'UPPER_CASE'] },
        { selector: 'function', format: ['camelCase', 'PascalCase'] },
        { selector: 'typeLike', format: ['PascalCase'] }
      ],
      ...swap(airbnbBestPractices.rules, 'default-param-last'),
      ...swap(airbnbBestPractices.rules, 'dot-notation'),
      ...swap(airbnbStyle.rules, 'no-array-constructor'),
      ...swap(airbnbEs6.rules, 'no-dupe-class-members'),
      ...swap(airbnbBestPractices.rules, 'no-empty-function'),
      ...swap(airbnbBestPractices.rules, 'no-implied-eval'),
      'no-new-func': 'off',
      ...swap(airbnbBestPractices.rules, 'no-loop-func'),
      ...swap(airbnbBestPractices.rules, 'no-magic-numbers'),
      ...swap(airbnbBestPractices.rules, 'no-redeclare'),
      ...swap(airbnbVariables.rules, 'no-shadow'),
      'no-throw-literal': 'off',
      '@typescript-eslint/only-throw-error': airbnbBestPractices.rules['no-throw-literal'],
      ...swap(airbnbBestPractices.rules, 'no-unused-expressions'),
      ...swap(airbnbVariables.rules, 'no-unused-vars'),
      ...swap(airbnbVariables.rules, 'no-use-before-define'),
      ...swap(airbnbEs6.rules, 'no-useless-constructor'),
      ...swap(airbnbBestPractices.rules, 'require-await'),
      'no-return-await': 'off',
      '@typescript-eslint/return-await': [airbnbBestPractices.rules['no-return-await'], 'in-try-catch'],
      'import/extensions': [
        airbnbImports.rules['import/extensions'][0],
        airbnbImports.rules['import/extensions'][1],
        { ...airbnbImports.rules['import/extensions'][2], ts: 'never', tsx: 'never' }
      ]
    }
  },
  {
    // checked by typescript itself
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      'constructor-super': 'off',
      'getter-return': 'off',
      'no-const-assign': 'off',
      'no-dupe-args': 'off',
      'no-dupe-class-members': 'off',
      'no-dupe-keys': 'off',
      'no-func-assign': 'off',
      'no-import-assign': 'off',
      'no-new-symbol': 'off',
      'no-obj-calls': 'off',
      'no-redeclare': 'off',
      'no-setter-return': 'off',
      'no-this-before-super': 'off',
      'no-undef': 'off',
      'no-unreachable': 'off',
      'no-unsafe-negation': 'off',
      'valid-typeof': 'off',
      'import/named': 'off',
      'import/no-named-as-default-member': 'off',
      'import/no-unresolved': 'off'
    }
  }
];

export default tseslint.config(
  { ignores: ['node_modules/', 'junit/', 'coverage/', 'test-data/', 'eslint.config.js'] },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  // airbnb-base has no eslint 10 release; fixupConfigRules shims the removed context APIs
  // (e.g. context.getFilename) it still calls
  ...fixupConfigRules(compat.extends('airbnb-base')),
  ...airbnbTypescript,
  {
    languageOptions: {
      globals: globals.es2021,
      parserOptions: {
        project: './tsconfig.test.json',
        tsconfigRootDir: import.meta.dirname
      }
    },
    plugins: {
      'simple-import-sort': simpleImportSort
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'warn'
    },
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.ts']
        }
      }
    },
    rules: {
      'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
      'import/order': 'off', // disabled for simple-import-sort plugin
      'import/prefer-default-export': 'off',
      // airbnb also bans for...of; the parser and walkers read better with it
      'no-restricted-syntax': ['error', 'ForInStatement', 'LabeledStatement', 'WithStatement'],
      'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_$' }],
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_$' }],
      'simple-import-sort/imports': ['warn', { groups: [['^@?\\w', '^', '^\\.', '^\\u0000']] }],
      'simple-import-sort/exports': ['error'],
      '@typescript-eslint/no-explicit-any': ['error']
    }
  },
  {
    files: ['test/**', 'scripts/**', '*.config.ts'],
    languageOptions: { globals: globals.node }
  },
  {
    files: ['scripts/**'],
    rules: { 'no-console': 'off' } // command-line output
  },
  prettierRecommended
);
