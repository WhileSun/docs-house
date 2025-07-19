---
title: JSX/TSX
createTime: 2025/07/17 14:46:49
permalink: /frontend/vue3/jsx-render/
---

## 概述

vue采用JSX/TSX的渲染函数的模式

## 安装vite插件

在没有安装vite的``jsx插件``时,默认会采用react去解析，然后会提示错误。

安装[``@vitejs/plugin-vue-jsx``](https://www.npmjs.com/package/@vitejs/plugin-vue-jsx?activeTab=readme)插件，并且在vite中启用。

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
    "@vitejs/plugin-vue-jsx": "^5.0.1", // [!code ++]
    "@vue/tsconfig": "^0.7.0",
    "typescript": "~5.8.3",
    "vite": "^7.0.3",
    "vue-tsc": "^2.2.12"
  }
}
```

@tab vite.config.ts
``` ts
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import jsx from "@vitejs/plugin-vue-jsx";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    jsx() // [!code ++] 
  ],
});
```
:::

## jsx/tsx渲染组件

[``defineComponent``](https://cn.vuejs.org/api/general.html#function-signature)和[``渲染函数或 JSX``](https://cn.vuejs.org/guide/extras/render-function.html) 一起使用

- 仅在 3.3+ 中支持

``` tsx title="TestComp.tsx"
import { defineComponent } from "vue";

const TestComp = defineComponent(
  () => {
    // 就像在 <script setup> 中一样使用组合式 API
    return () => {
      return <div>test</div>;
    };
  },
  {
    props: {},
  },
);

export default TestComp;
```

::: tip props（官方注意事项）
目前仍然需要手动声明运行时的``props``

在将来，我们计划提供一个 Babel 插件，自动推断并注入运行时 props (就像在单文件组件中的 ``defineProps`` 一样)，以便省略运行时 props 的声明。
:::