---
title: 从 Vue 1 迁移
createTime: 2026/02/10 14:25:00
permalink: /frontend/vue2/migration/from-vue-1/
---

# 从 Vue 1 迁移

Vue.js 2.x 相比 Vue 1.x 有很多重大变化，主要包括虚拟 DOM 的引入、组件系统的改进、指令系统的调整和 API 的变化。

## 概述

Vue 2.x 的主要变化包括：

- 虚拟 DOM 的引入
- 组件系统的改进
- 指令系统的调整
- API 的变化
- 性能的提升

## 模板语法变化

### v-for 变化

**Vue 1.x:**
```html
<!-- Vue 1.x -->
<div v-for="item in items" track-by="$index">
  {{ item }}
</div>
```

**Vue 2.x:**
```html
<!-- Vue 2.x -->
<div v-for="(item, index) in items" :key="index">
  {{ item }}
</div>
```

在 Vue 2.x 中，`track-by` 被 `:key` 替代，推荐使用唯一的 key 值来提高渲染性能。

### 事件处理变化

**Vue 1.x:**
```html
<!-- Vue 1.x -->
<button v-on:click="doSomething | debounce 1000">Click me</button>
```

**Vue 2.x:**
```html
<!-- Vue 2.x -->
<button v-on:click="doSomethingDebounced">Click me</button>
```

```javascript
// 在组件中实现防抖
methods: {
  doSomethingDebounced: _.debounce(function() {
    this.doSomething()
  }, 1000)
}
```

## 组件变化

### 组件注册

**Vue 1.x:**
```javascript
// Vue 1.x
Vue.component('my-component', {
  replace: true, // 默认为 true
  template: '<div>{{ message }}</div>',
  data: function() {
    return {
      message: 'Hello Vue 1.x'
    }
  }
})
```

**Vue 2.x:**
```javascript
// Vue 2.x
Vue.component('my-component', {
  // replace 选项被移除，组件模板总是替换挂载元素
  template: `
    <div>{{ message }}</div>
  `,
  data: function() {
    return {
      message: 'Hello Vue 2.x'
    }
  }
})
```

### 组件通信

**Vue 1.x:**
```html
<!-- Vue 1.x -->
<my-component v-ref:comp></my-component>
```

```javascript
// 访问子组件
this.$refs.comp
```

**Vue 2.x:**
```html
<!-- Vue 2.x -->
<my-component ref="comp"></my-component>
```

```javascript
// 访问子组件
this.$refs.comp
```

## 过滤器变化

### 内联过滤器移除

**Vue 1.x:**
```html
<!-- Vue 1.x -->
{{ message | uppercase }}
{{ message | capitalize }}
{{ items | orderBy 'name' }}
```

**Vue 2.x:**
```html
<!-- Vue 2.x -->
{{ message.toUpperCase() }}
{{ message | capitalize }} <!-- 仍支持简单的过滤器 -->
```

```javascript
// 使用计算属性替代复杂过滤器
computed: {
  orderedItems() {
    return this.items.slice().sort((a, b) => {
      return a.name.localeCompare(b.name)
    })
  }
}
```

## 事件系统变化

### 事件传播

**Vue 1.x:**
```html
<!-- Vue 1.x -->
<div v-on:click.once="doThis"></div>
```

**Vue 2.x:**
```html
<!-- Vue 2.x -->
<div v-on:click.once="doThis"></div>
```

大部分事件修饰符保持不变，但需要注意一些细微差别。

## 生命周期钩子变化

### 钎子名称变化

**Vue 1.x:**
```javascript
// Vue 1.x
module.exports = {
  init: function() {
    console.log('组件初始化')
  },
  created: function() {
    console.log('实例创建')
  },
  ready: function() {
    console.log('DOM已准备好')
  }
}
```

**Vue 2.x:**
```javascript
// Vue 2.x
export default {
  beforeCreate: function() {
    console.log('实例创建前')
  },
  created: function() {
    console.log('实例创建后')
  },
  beforeMount: function() {
    console.log('挂载前')
  },
  mounted: function() {
    console.log('挂载后')
  }
  // ready 钎子被移除，使用 mounted 替代
}
```

## 指令变化

### v-el 和 v-ref 合并

**Vue 1.x:**
```html
<!-- Vue 1.x -->
<div v-el:my-div></div>
<my-component v-ref:my-comp></my-component>
```

```javascript
// Vue 1.x
this.$els.myDiv
this.$refs.myComp
```

**Vue 2.x:**
```html
<!-- Vue 2.x -->
<div ref="myDiv"></div>
<my-component ref="myComp"></my-component>
```

```javascript
// Vue 2.x
this.$refs.myDiv
this.$refs.myComp
```

## 虚拟 DOM 和性能

Vue 2.x 引入了虚拟 DOM，这带来了显著的性能提升：

- 更快的渲染速度
- 更好的批量更新
- 更智能的差异算法

## 迁移策略

### 渐进式迁移

对于大型应用，可以采用渐进式迁移策略：

1. 将 Vue 1.x 应用重构为组件化结构
2. 逐步替换组件为 Vue 2.x 版本
3. 使用 Vue 2.x 的新特性重构应用逻辑

### 迁移检查清单

- [ ] 更新 Vue 版本
- [ ] 更新模板语法（v-for, 事件处理等）
- [ ] 更新组件定义和通信方式
- [ ] 替换或重构过滤器
- [ ] 更新生命周期钩子
- [ ] 更新指令使用方式
- [ ] 更新构建工具配置
- [ ] 测试应用功能完整性

## 常见迁移问题及解决方案

### 虚拟DOM相关问题

在 Vue 2.x 中，由于引入了虚拟DOM，某些直接操作DOM的代码可能需要调整：

```javascript
// 不推荐：直接操作DOM
mounted() {
  document.getElementById('my-element').style.color = 'red'
}

// 推荐：使用Vue的数据绑定
data() {
  return {
    elementColor: 'red'
  }
},
template: '<div :style="{ color: elementColor }" id="my-element">Content</div>'
```

### 组件作用域问题

Vue 2.x 中组件样式默认不是作用域化的，需要显式使用作用域CSS：

```vue
<template>
  <div class="my-component">Content</div>
</template>

<style scoped>
.my-component {
  color: blue;
}
</style>
```

## 迁移工具

### Vue Migration Helper

Vue 提供了迁移辅助工具来帮助识别和修复迁移问题：

```bash
npm install -g @vue/cli
vue upgrade --next
```

### ESLint 插件

使用 ESLint 插件来检测 Vue 1.x 的过时语法：

```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'plugin:vue/essential',
    '@vue/standard'
  ],
  plugins: [
    'vue'
  ]
}
```

## 测试迁移

在迁移过程中，确保测试覆盖：

```javascript
// 迁移前后的测试
describe('Component Migration', () => {
  test('should render correctly in Vue 2.x', () => {
    // 测试 Vue 2.x 的渲染
  })
  
  test('should handle events properly', () => {
    // 测试事件处理
  })
  
  test('should maintain data flow', () => {
    // 测试数据流
  })
})
```

通过遵循这些迁移指南，可以顺利地将项目从 Vue 1.x 迁移到 Vue 2.x，充分利用 Vue 2.x 的新特性和性能优势。