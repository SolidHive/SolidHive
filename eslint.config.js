// ESLint global config for monorepo (Vue + Node + TypeScript + Prettier)
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import vue from 'eslint-plugin-vue';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  vue.configs.base,
  vue.configs['vue3-essential'],
  prettier,
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
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: ['./tsconfig.json', './client/tsconfig.json', './server/tsconfig.json'],
        tsconfigRootDir: process.cwd(),
      },
      globals: {
        ...globals.node,
        ...globals.browser,
        ...globals.jest,
      },
    },
    rules: {
      'prettier/prettier': 'warn',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'off',
      'vue/attributes-order': 'warn',
      'vue/html-self-closing': 'warn',
      'vue/max-attributes-per-line': ['warn', { singleline: 3 }],
    },
  },
];
