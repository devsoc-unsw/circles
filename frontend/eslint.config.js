import { fixupConfigRules } from '@eslint/compat';
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import airbnbBestPractices from 'eslint-config-airbnb-base/rules/best-practices';
import airbnbEs6 from 'eslint-config-airbnb-base/rules/es6';
import airbnbImports from 'eslint-config-airbnb-base/rules/imports';
import airbnbStyle from 'eslint-config-airbnb-base/rules/style';
import airbnbVariables from 'eslint-config-airbnb-base/rules/variables';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import reactHooks from 'eslint-plugin-react-hooks';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

// eslint-config-airbnb-typescript is unmaintained and stuck on typescript-eslint v7, so its
// non-formatting rules are inlined here (formatting is left to prettier).
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
      'react/jsx-filename-extension': ['error', { extensions: ['.jsx', '.tsx'] }],
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
  { ignores: ['build/', 'node_modules/', 'eslint.config.js'] },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  // airbnb and eslint-plugin-react have no eslint 10 release; fixupConfigRules shims the
  // removed context APIs (e.g. context.getFilename) they still call
  ...fixupConfigRules(compat.extends('plugin:react/recommended', 'airbnb')),
  ...airbnbTypescript,
  {
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname
      }
    },
    plugins: {
      'react-hooks': reactHooks,
      'simple-import-sort': simpleImportSort
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'warn'
    },
    settings: {
      'import/resolver': {
        node: {
          moduleDirectory: ['node_modules', 'src/'],
          extensions: ['.ts', '.tsx']
        }
      }
    },
    rules: {
      'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
      'no-param-reassign': ['error', { ignorePropertyModificationsFor: ['state'] }], // enabled only for redux toolkit
      'no-nested-ternary': ['off'], // disabled to allow for nested ternary statements
      'import/order': 'off', // disabled for simple-import-sort plugin
      'react/jsx-props-no-spreading': ['off'], // disabled as to prefer using {...args} for props
      'react/jsx-one-expression-per-line': ['off'], // disabled jsx needing to be only in a single line
      'react/jsx-no-bind': ['off'], // disabled as it is needed for some antd components
      'jsx-a11y/click-events-have-key-events': ['off'],
      'jsx-a11y/interactive-supports-focus': ['off'],
      'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_$' }],
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_$' }],
      'react/function-component-definition': [
        'error',
        { namedComponents: 'arrow-function', unnamedComponents: 'arrow-function' }
      ],
      'simple-import-sort/imports': [
        'warn',
        {
          groups: [
            [
              // react based packages
              '^react',
              // packages
              '^@?\\w',
              // absolute imports
              '^(assets|components|config|hooks|pages|reducers)',
              // absolute path or other imports that is not matched by the other groups
              '^',
              // relative imports
              '^\\.',
              // side effect imports
              '^\\u0000'
            ]
          ]
        }
      ],
      'simple-import-sort/exports': ['error'],
      '@typescript-eslint/no-explicit-any': ['error'],
      '@typescript-eslint/no-floating-promises': ['off'],
      'react/require-default-props': ['off'], // off since we have typescript instead
      '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: false }],
      'react-hooks/exhaustive-deps': ['error'],
      'react-hooks/rules-of-hooks': ['error'] // Checks rules of Hooks
    }
  },
  {
    files: ['src/utils/api/**/*'],
    rules: {
      'import/prefer-default-export': 'off',
      'no-console': 'off' // TODO-OLLI(pm): remove this when we unify api error handling
    }
  },
  prettierRecommended
);
