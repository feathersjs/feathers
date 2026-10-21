import config from '@feathers-community/eslint-config'
import globals from 'globals'

export default config(
  {},
  {
    ignores: ['**/lib/', '**/cjs/', 'website/']
  },
  {
    rules: {
      // `[].concat(x)` and `[...x]` behave differently when `x` is not an array
      'e18e/prefer-spread-syntax': 'off',
      // Feathers targets ES2020 (browsers, React Native)
      'e18e/prefer-object-has-own': 'off',
      'e18e/prefer-array-at': 'off',
      'e18e/prefer-array-to-sorted': 'off',
      'e18e/prefer-array-to-reversed': 'off'
    }
  },
  {
    files: ['**/*.test.ts'],
    rules: {
      'e18e/prefer-static-regex': 'off'
    }
  },
  {
    files: ['packages/*/bin/**/*.js'],
    languageOptions: {
      globals: globals.node
    },
    rules: {
      // Bin scripts import the compiled `lib/` output which does not exist before compiling
      'import-x/no-unresolved': 'off'
    }
  }
)
