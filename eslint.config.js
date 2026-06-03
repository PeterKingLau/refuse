const js = require('@eslint/js')
const globals = require('globals')
const tsPlugin = require('@typescript-eslint/eslint-plugin')
const tsParser = require('@typescript-eslint/parser')
const prettierConfig = require('eslint-config-prettier')
const prettierPlugin = require('eslint-plugin-prettier')
const vue = require('eslint-plugin-vue')
const vueParser = require('vue-eslint-parser')

const commonRules = {
  'no-use-before-define': 'off',
  'no-unused-vars': 'off',
  'space-before-function-paren': 'off',
  'no-case-declarations': 'off',
  'no-debugger': 'off',
  'no-extra-boolean-cast': 'off',
  'no-redeclare': 'off',
  'no-useless-assignment': 'off',
  'no-useless-escape': 'off',
  'vue/multi-word-component-names': 'off'
}

const typescriptRules = {
  ...tsPlugin.configs.recommended.rules,
  'no-undef': 'off',
  '@typescript-eslint/explicit-function-return-type': 'off',
  '@typescript-eslint/no-explicit-any': 'off',
  '@typescript-eslint/no-empty-function': 'off',
  '@typescript-eslint/no-unsafe-function-type': 'off',
  '@typescript-eslint/no-unused-expressions': [
    'error',
    {
      allowShortCircuit: true,
      allowTernary: true
    }
  ],
  '@typescript-eslint/no-use-before-define': 'off',
  '@typescript-eslint/ban-ts-comment': 'off',
  '@typescript-eslint/no-non-null-assertion': 'off',
  '@typescript-eslint/explicit-module-boundary-types': 'off',
  '@typescript-eslint/no-unused-vars': 'off',
  '@typescript-eslint/no-wrapper-object-types': 'off'
}

const vueRules = {
  'vue/no-reserved-component-names': 'off',
  'vue/custom-event-name-casing': 'off',
  'vue/attributes-order': 'off',
  'vue/one-component-per-file': 'off',
  'vue/html-closing-bracket-newline': 'off',
  'vue/max-attributes-per-line': 'off',
  'vue/multiline-html-element-content-newline': 'off',
  'vue/singleline-html-element-content-newline': 'off',
  'vue/attribute-hyphenation': 'off',
  'vue/require-default-prop': 'off',
  'vue/require-explicit-emits': 'off',
  'vue/no-mutating-props': 'off',
  'vue/no-ref-as-operand': 'off',
  'vue/no-required-prop-with-default': 'off',
  'vue/no-side-effects-in-computed-properties': 'off',
  'vue/html-self-closing': 'off',
  'vue/multi-word-component-names': 'off',
  'vue/no-v-html': 'off'
}

module.exports = [
  {
    ignores: ['build/**', 'config/**', 'dist/**', 'test/unit/coverage/**', 'node_modules/**', 'dist*/**', 'src/main.ts']
  },
  js.configs.recommended,
  {
    files: ['*.config.{js,ts}', 'eslint.config.js', '.husky/**/*.js', 'commitlint.config.js', 'postcss.config.js', 'prettier.config.js', 'stylelint.config.js'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'commonjs',
      globals: {
        ...globals.node
      }
    },
    rules: {
      ...prettierConfig.rules,
      ...commonRules,
      'prettier/prettier': 'off'
    }
  },
  ...vue.configs['flat/recommended'],
  {
    files: ['src/**/*.{js,jsx,ts,tsx,vue}', 'types/**/*.d.ts'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    plugins: {
      prettier: prettierPlugin
    },
    rules: {
      ...prettierConfig.rules,
      ...commonRules,
      'prettier/prettier': 'off'
    }
  },
  {
    files: ['src/**/*.{ts,tsx}', 'types/**/*.d.ts', 'vite.config.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin
    },
    rules: typescriptRules
  },
  {
    files: ['types/**/*.d.ts'],
    rules: {
      '@typescript-eslint/no-empty-object-type': 'off'
    }
  },
  {
    files: ['src/**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin
    },
    rules: {
      ...typescriptRules,
      ...vueRules
    }
  }
]
