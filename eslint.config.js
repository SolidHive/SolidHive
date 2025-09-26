// ESLint global config for monorepo (Vue + Node + TypeScript + Prettier)
import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginVue from 'eslint-plugin-vue';
import globals from 'globals';
import typescriptEslint from 'typescript-eslint';

export default typescriptEslint.config(
  { ignores: ['*.d.ts', '**/coverage', '**/dist', '**/node_modules', '**/.output/**', '**/.nuxt/**', '**/.vercel/**', '**/.next/**', '**/.cache/**', '**/coverage/**', '**/*.js.map', '**/*.ts.map', '**/*.snap'] },
  {
    extends: [
      eslint.configs.recommended,
      ...typescriptEslint.configs.recommended,
      ...eslintPluginVue.configs['flat/essential'],
    ],
    files: ['server/**/*.ts'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.node,
      parserOptions: {
        parser: typescriptEslint.parser,
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
    },
  },
  {
    extends: [
      eslint.configs.recommended,
      ...typescriptEslint.configs.recommended,
      ...eslintPluginVue.configs['flat/essential'],
    ],
    files: ['client/**/*.{ts,vue}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser,
      parserOptions: {
        parser: typescriptEslint.parser,
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        extraFileExtensions: ['.vue'],
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'off',
      'vue/attributes-order': 'warn',
    },
  },
  eslintConfigPrettier
);
