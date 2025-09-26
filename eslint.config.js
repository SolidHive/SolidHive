// ESLint global config for monorepo (Vue + Node + TypeScript + Prettier)
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import vue from 'eslint-plugin-vue';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';
import path from 'path';

export default [
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...vue.configs['flat/essential'],
  prettierConfig,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      },
      globals: {
        ...globals.node,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        parser: '@typescript-eslint/parser',
        extraFileExtensions: ['.vue'],
      },
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'off',
      'vue/attributes-order': 'off',
      'vue/html-self-closing': 'off',
      'vue/max-attributes-per-line': 'off',
    },
  },
  {
    ignores: [
      'node_modules',
      'dist',
      '**/dist/**',
      '**/node_modules/**',
      '**/.output/**',
      '**/.nuxt/**',
      '**/.vercel/**',
      '**/.next/**',
      '**/.cache/**',
      '**/coverage/**',
      '**/*.d.ts',
      '**/*.js.map',
      '**/*.ts.map',
      '**/*.snap',
    ],
  },
];
