---
title: 安装
createTime: 2026/02/10 12:35:00
permalink: /frontend/vue2/introduction/installation/
---

# 安装

Vue.js 提供了多种安装方式，你可以根据项目需求选择最适合的方式。

## CDN

对于快速原型开发或学习，可以直接通过 CDN 引入 Vue：

```html
<!-- 开发版本，包含详细的警告 -->
<script src="https://cdn.jsdelivr.net/npm/vue@2.6.14/dist/vue.js"></script>

<!-- 生产版本，经过压缩且移除了警告 -->
<script src="https://cdn.jsdelivr.net/npm/vue@2.6.14/dist/vue.min.js"></script>
```

## NPM

在生产项目中，推荐使用 NPM 安装。NPM 能很好地与诸如 webpack 或 Browserify 的模块打包器配合使用：

```bash
# 最新稳定版本
npm install vue

# 最新稳定版本（使用 yarn）
yarn add vue
```

## Vue CLI

Vue CLI 是一个基于 Vue.js 进行快速开发的完整系统，提供：

- 通过 @vue/cli 实现的交互式的项目脚手架
- 通过 @vue/cli-service 实现的零配置原型开发
- 一个运行时依赖 (@vue/component-compiler-utils)
- 开发依赖 (vue-loader 和 vue-template-compiler)

安装 Vue CLI：

```bash
npm install -g @vue/cli
# 或者
yarn global add @vue/cli
```

创建项目：

```bash
vue create my-project
cd my-project
npm run serve
```

## 构建版本

在 NPM 包的 dist/ 目录中提供了不同构建版本的 Vue.js，以下是主要版本的区别：

| UMD | CommonJS | ES Module |
|-----|----------|-----------|
| vue.js | vue.common.js | vue.esm.js |
| vue.min.js | vue.common.prod.js | vue.esm.browser.js |
| | | vue.esm.browser.min.js |

### 对于 Runtime + Compiler 和 Runtime-only

如果你需要编译模板（例如，将字符串模板传递给 template 选项，或挂载到元素上并将其内部 HTML 作为模板），你需要编译器，因此需要使用：

```javascript
// 完整版本，包含编译器
import Vue from 'vue/dist/vue'
```

如果你使用的是构建工具链（如 webpack + vue-loader 或 Browserify + vueify），那么在构建过程中，组件内部的模板会被预编译成 JavaScript。这使得你可以使用 runtime-only 版本，因为运行时版本体积更小：

```javascript
// 运行时版本，不包含编译器
import Vue from 'vue'
```

## 开发版本

如果你想使用最新的开发版本，可以直接从 GitHub 安装：

```bash
npm install github:vuejs/vue#dev
```

## 浏览器支持

Vue.js 支持所有兼容 ECMAScript 5 的浏览器（IE8 及以下版本除外）。

需要注意的是，Vue.js 2.x 不支持 IE8 及以下版本，这是因为 Vue 使用了 IE8 无法模拟的 ECMAScript 5 特性。Vue.js 2.x 支持所有现代浏览器以及 IE9+。

## 验证安装

安装完成后，可以通过以下方式验证 Vue 是否正确安装：

```javascript
// 如果是通过 NPM 安装
import Vue from 'vue'
console.log(Vue.version) // 输出 Vue 版本号

// 或者在浏览器中
console.log(Vue.version)
```

选择合适的安装方式取决于你的项目需求和开发环境。对于学习和快速原型开发，CDN 是最快的选择；对于生产项目，推荐使用 NPM 和构建工具。