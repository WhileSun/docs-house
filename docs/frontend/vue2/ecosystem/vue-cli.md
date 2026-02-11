---
title: Vue CLI
createTime: 2026/02/10 14:20:00
permalink: /frontend/vue2/ecosystem/vue-cli/
---

# Vue CLI

Vue CLI 是一个基于 Vue.js 进行快速开发的完整系统，提供：

- 通过 @vue/cli 实现的交互式的项目脚手架
- 通过 @vue/cli-service 实现的零配置原型开发
- 一个运行时依赖 (@vue/component-compiler-utils)
- 开发依赖 (vue-loader 和 vue-template-compiler)

## 安装

### 安装 CLI

```bash
npm install -g @vue/cli
# 或者
yarn global add @vue/cli
```

### 检查版本

```bash
vue --version
```

## 创建项目

### 交互式创建

```bash
vue create my-project
```

这将启动交互式创建流程，可以选择预设配置或手动选择功能。

### 快速原型开发

```bash
npm install -g @vue/cli-service-global
# 或者
yarn global add @vue/cli-service-global
```

安装后，可以使用 `vue serve` 和 `vue build` 命令：

```bash
# 在当前目录提供服务
vue serve

# 在当前目录构建应用
vue build
```

## 项目结构

一个典型的 Vue CLI 项目结构如下：

```
my-project/
├── public/
│   ├── index.html              # 主页面模板
│   └── favicon.ico             # 图标
├── src/
│   ├── assets/                 # 静态资源
│   ├── components/             # 组件
│   ├── views/                  # 页面组件
│   ├── router/                 # 路由配置
│   ├── store/                  # Vuex 状态管理
│   ├── App.vue                 # 根组件
│   └── main.js                 # 入口文件
├── package.json                # 项目配置
├── vue.config.js               # Vue CLI 配置 (可选)
├── babel.config.js             # Babel 配置 (可选)
└── postcss.config.js           # PostCSS 配置 (可选)
```

## 配置

### vue.config.js

在项目根目录创建 `vue.config.js` 文件来自定义构建配置：

```javascript
module.exports = {
  // 基本路径
  publicPath: process.env.NODE_ENV === 'production'
    ? '/production-sub-path/'
    : '/',

  // 输出目录
  outputDir: 'dist',

  // 静态资源目录
  assetsDir: 'static',

  // 构建时是否生成 source map
  productionSourceMap: false,

  // 开发服务器配置
  devServer: {
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''
        }
      }
    }
  },

  // 链式 webpack 配置
  chainWebpack: config => {
    // 配置规则
  },

  // 覆盖 webpack 配置
  configureWebpack: config => {
    // 修改配置
  }
}
```

### Babel 配置

在 `babel.config.js` 中配置 Babel：

```javascript
module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ]
}
```

## CLI 插件

Vue CLI 使用一个基于插件的架构，你可以使用 CLI 插件来安装和管理：

- Babel/TypeScript 转换
- CSS 抽象
- 代码检查 (linter)
- 代码格式化 (formatter)
- 单元测试
- 端到端测试

### 常用插件

```bash
# 安装 Babel 插件
vue add @vue/babel

# 安装 TypeScript 插件
vue add @vue/typescript

# 安装 ESLint 插件
vue add @vue/eslint

# 安装 PWA 插件
vue add @vue/pwa

# 安装 Router 插件
vue add @vue/router

# 安装 Vuex 插件
vue add @vue/vuex
```

## 命令

### 开发命令

```bash
# 启动开发服务器
npm run serve

# 构建生产版本
npm run build

# 检查和修复文件
npm run lint
```

### 高级命令

```bash
# 构建并查看包分析报告
npm run build --report

# 预览生产构建
npm run serve -- --mode production
```

## 环境变量

在 `.env` 文件中定义环境变量：

```bash
# .env
VUE_APP_TITLE=My App

# .env.local
VUE_APP_API_BASE_URL=https://api.example.com

# .env.production
NODE_ENV=production
```

在代码中使用：

```javascript
console.log(process.env.VUE_APP_TITLE)
console.log(process.env.VUE_APP_API_BASE_URL)
```

## 构建优化

### 代码分割

在 `vue.config.js` 中配置代码分割：

```javascript
module.exports = {
  configureWebpack: config => {
    if (process.env.NODE_ENV === 'production') {
      // 代码分割配置
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            name: 'chunk-vendors',
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
            chunks: 'initial'
          },
          common: {
            name: 'chunk-common',
            minChunks: 2,
            priority: 5,
            chunks: 'initial',
            reuseExistingChunk: true
          }
        }
      }
    }
  }
}
```

### 图片优化

```javascript
module.exports = {
  chainWebpack: config => {
    // 图片优化
    config.module
      .rule('images')
      .use('image-webpack-loader')
      .loader('image-webpack-loader')
      .options({
        mozjpeg: { progressive: true, quality: 65 },
        optipng: { enabled: false },
        pngquant: { quality: [0.65, 0.90], speed: 4 },
        gifsicle: { interlaced: false }
      })
  }
}
```

## 部署

### 静态部署

构建后的应用可以部署到任何静态文件服务器：

```bash
npm run build
```

### 部署到 GitHub Pages

```bash
# 安装 gh-pages
npm install --save-dev gh-pages

# 在 package.json 中添加脚本
{
  "scripts": {
    "deploy": "gh-pages -d dist"
  }
}

# 部署
npm run deploy
```

### 部署到服务器

```bash
# 构建应用
npm run build

# 将 dist 目录内容复制到服务器
scp -r dist/* user@server:/path/to/website/
```

## 最佳实践

### 项目初始化

```bash
# 创建项目
vue create my-project

# 选择手动配置
# - Babel
# - Router
# - Vuex
# - CSS Pre-processors
# - Linter / Formatter
# - Unit Testing
# - E2E Testing
```

### 依赖管理

```bash
# 添加依赖
npm install package-name
npm install --save-dev package-name # 开发依赖

# 更新 CLI
npm update -g @vue/cli

# 更新项目依赖
vue upgrade
```

### 性能优化

1. **启用 gzip 压缩**：在服务器上启用 gzip 压缩
2. **使用 CDN**：将静态资源托管到 CDN
3. **代码分割**：合理分割代码以减少初始加载时间
4. **图片优化**：压缩和优化图片资源
5. **Tree Shaking**：移除未使用的代码

Vue CLI 是 Vue.js 生态系统中最重要的工具之一，它提供了完整的开发体验，从项目创建到部署都有很好的支持。