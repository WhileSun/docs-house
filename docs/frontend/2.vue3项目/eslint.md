---
title: eslint+prettier
createTime: 2025/07/16 15:29:12
permalink: /frontend/vue3/eslint/
---

## 概述

此文章主要介绍如何实现代码规范和代码美化，实现统一风格。

- **``eslint``** 实现代码规范，防止错误写法
- **``prettier``** 实现代码格式美化，统一代码风格

配合vscode的插件``eslint``实现保存时自动格式化代码。

## 实现

### eslint语法校验

通过[eslint-plugin-vue](https://eslint.vuejs.org/user-guide/)插件现实vue的语法检查

::: warning
ESLint < v9采用``.eslintrc.*``文件名

ESLint >= v9采用``eslint.config.js``文件名
:::

::: code-tabs

@tab package.json
``` json
{
  "name": "new",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "vue": "^3.5.17"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^6.0.0",
    "@vitejs/plugin-vue-jsx": "^5.0.1",
    "@vue/tsconfig": "^0.7.0", 
    "eslint": "^9.30.1", // [!code ++]
    "eslint-plugin-vue": "^10.3.0", // [!code ++]
    "typescript": "~5.8.3",
    "typescript-eslint": "^8.36.0", // [!code ++]
    "vite": "^7.0.3",
    "vue-tsc": "^2.2.12"
  }
}
```

@tab eslint.config.js
``` js
import eslint from '@eslint/js';
import eslintPluginVue from 'eslint-plugin-vue';
import globals from 'globals';
import typescriptEslint from 'typescript-eslint';

export default typescriptEslint.config(
  { ignores: ['*.d.ts', '**/coverage', '**/dist'] },
  {
    extends: [
      eslint.configs.recommended,
      ...typescriptEslint.configs.recommended,
      ...eslintPluginVue.configs['flat/recommended']
    ],
    files: ['**/*.{ts,tsx,vue}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser,
      parserOptions: {
        parser: typescriptEslint.parser,
      },
    },
    rules: {
      // your rules
    },
  },
);
```
:::

### prettier美化

- ``prettier`` 代码美化基础包
- ``eslint-config-prettier`` 处理与eslint规则冲突的包
- ``eslint-plugin-prettier`` 美化规则包

``prettier``自定义的美化规则放在``prettierrc.json``文件生效

::: code-tabs

@tab package.json 
``` json
{
  "name": "new",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "vue": "^3.5.17"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^6.0.0",
    "@vitejs/plugin-vue-jsx": "^5.0.1",
    "@vue/tsconfig": "^0.7.0",
    "eslint": "^9.30.1",
    "eslint-config-prettier": "^10.1.5", // [!code ++]
    "eslint-plugin-prettier": "^5.5.1", // [!code ++]
    "eslint-plugin-vue": "^10.3.0",
    "prettier": "^3.6.2", // [!code ++]
    "typescript": "~5.8.3",
    "typescript-eslint": "^8.36.0",
    "vite": "^7.0.3",
    "vue-tsc": "^2.2.12"
  }
}
```
@tab eslint.config.js
``` ts
import eslint from '@eslint/js';
import eslintPluginVue from 'eslint-plugin-vue';
import globals from 'globals';
import typescriptEslint from 'typescript-eslint';
import eslintConfigPrettier from "eslint-config-prettier"; // [!code ++]
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended"; // [!code ++]

export default typescriptEslint.config(
  { ignores: ['*.d.ts', '**/coverage', '**/dist'] },
  {
    extends: [
      eslint.configs.recommended,
      ...typescriptEslint.configs.recommended,
      ...eslintPluginVue.configs['flat/recommended'],
      eslintConfigPrettier, // [!code ++]
      eslintPluginPrettierRecommended // [!code ++]
    ],
    files: ['**/*.{ts,tsx,vue}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser,
      parserOptions: {
        parser: typescriptEslint.parser,
      },
    },
    rules: {
      // your rules
    },
  },
);
```

@tab .prettierrc.json
``` json
{
  "htmlWhitespaceSensitivity": "ignore"
}
```
:::

### vite启用eslint验证

::: code-tabs

@tab package.json
``` json
{
  "name": "new",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "vue": "^3.5.17"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^6.0.0",
    "@vitejs/plugin-vue-jsx": "^5.0.1",
    "@vue/tsconfig": "^0.7.0",
    "eslint": "^9.30.1",
    "eslint-config-prettier": "^10.1.5",
    "eslint-plugin-prettier": "^5.5.1",
    "eslint-plugin-vue": "^10.3.0",
    "prettier": "^3.6.2",
    "typescript": "~5.8.3",
    "typescript-eslint": "^8.36.0",
    "vite": "^7.0.3",
    "vite-plugin-eslint": "^1.8.1", // [!code ++]
    "vue-tsc": "^2.2.12"
  }
}
```
@tab vite.config.ts
``` ts
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import eslint from "vite-plugin-eslint"; // [!code ++]

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    eslint(), // [!code ++]
  ],
});

```
:::

### vscode自动格式化

首次先安装``ESLint``插件，然后settings.json添加配置。

插件启用后会去读取项目下得eslint的配置文件，根据配置实现代码规范和美化代码。

``` json title="settings.json"
{
  "eslint.validate": ["javascript", "vue", "javascriptreact","typescript","typescriptreact"],
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  }
}
```