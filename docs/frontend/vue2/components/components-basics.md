---
title: 组件基础
createTime: 2026/02/10 12:50:00
permalink: /frontend/vue2/components/components-basics/
---

# 组件基础

组件是 Vue.js 最强大的功能之一。组件可以扩展 HTML 元素，封装可重用的代码。

## 组件注册

### 全局注册

可以使用 `Vue.component()` 全局注册组件：

```javascript
// 注册全局组件
Vue.component('my-component', {
  template: '<div>A global component!</div>'
})

// 创建 Vue 实例
new Vue({
  el: '#app'
})
```

```html
<div id="app">
  <my-component></my-component>
</div>
```

### 局部注册

全局注册往往是不够理想的。比如，如果你使用一个像 webpack 这样的构建系统，全局注册所有的组件意味着即便你已经不再使用一个组件了，它仍然会被包含在最终的构建结果中。这造成了用户下载的 JavaScript 包中包含多余的代码。

在这些情况下，可以通过一个普通的 JavaScript 对象来定义组件，然后在 `components` 选项中定义你想要使用的组件：

```javascript
var ComponentA = { /* ... */ }
var ComponentB = { /* ... */ }
var ComponentC = { /* ... */ }

new Vue({
  el: '#app',
  components: {
    'component-a': ComponentA,
    'component-b': ComponentB
  }
})
```

## Props

### 传递静态或动态 Prop

```html
<!-- 静态 -->
<blog-post title="My journey with Vue"></blog-post>

<!-- 动态 -->
<blog-post v-bind:title="post.title"></blog-post>
```

### Prop 类型

```javascript
props: ['title', 'likes', 'isPublished', 'commentIds', 'author']

// 或者指定类型
props: {
  title: String,
  likes: Number,
  isPublished: Boolean,
  commentIds: Array,
  author: Object,
  callback: Function,
  contacts: Date
}
```

### Prop 验证

```javascript
props: {
  // 基础类型检查 (`null` 和 `undefined` 会通过任何类型验证)
  propA: Number,
  // 多个可能的类型
  propB: [String, Number],
  // 必填的字符串
  propC: {
    type: String,
    required: true
  },
  // 带有默认值的数字
  propD: {
    type: Number,
    default: 100
  },
  // 带有默认值的对象
  propE: {
    type: Object,
    // 对象或数组默认值必须从一个工厂函数返回
    default: function () {
      return { message: 'hello' }
    }
  },
  // 自定义验证函数
  propF: {
    validator: function (value) {
      // 这个值必须匹配下列字符串中的一个
      return ['success', 'warning', 'danger'].indexOf(value) !== -1
    }
  }
}
```

## 自定义事件

### 使用 v-on 绑定自定义事件

```javascript
// 子组件
Vue.component('button-counter', {
  template: `
    <button v-on:click="incrementCounter">
      {{ counter }}
    </button>
  `,
  data: function () {
    return {
      counter: 0
    }
  },
  methods: {
    incrementCounter: function () {
      this.counter += 1
      this.$emit('increment')
    }
  }
})
```

```html
<!-- 父组件 -->
<div id="counter-event-example">
  <p>{{ total }}</p>
  <button-counter v-on:increment="total++"></button-counter>
</div>
```

### 将原生事件绑定到组件

可以使用 `v-on="$listeners"` 将一个组件的根元素上绑定监听器：

```javascript
Vue.component('base-input', {
  inheritAttrs: false,
  props: ['label', 'value'],
  template: `
    <label>
      {{ label }}
      <input
        v-bind="$attrs"
        v-bind:value="value"
        v-on:input="$emit('input', $event.target.value)"
      >
    </label>
  `
})
```

## 插槽

### 具名插槽

```html
<div class="container">
  <header>
    <slot name="header"></slot>
  </header>
  <main>
    <slot></slot>
  </main>
  <footer>
    <slot name="footer"></slot>
  </footer>
</div>
```

```html
<base-layout>
  <template v-slot:header>
    <h1>Here might be a page title</h1>
  </template>

  <p>A paragraph for the main content.</p>
  <p>And another one.</p>

  <template v-slot:footer>
    <p>Here's some contact info</p>
  </template>
</base-layout>
```

## 动态组件

通过使用保留的 `<component>` 元素，并对其 `is` 特性进行动态绑定，你可以在同一个挂载点动态切换多个组件：

```html
<!-- 组件会在 `currentView` 改变时改变 -->
<component v-bind:is="currentView"></component>
```

```javascript
// 组件注册
components: {
  'home': { /* ... */ },
  'posts': { /* ... */ },
  'archive': { /* ... */ }
}
```

## DOM 模板解析注意事项

当使用 DOM 作为模板时，会受到 HTML 本身的一些限制，因为 Vue 只有在浏览器解析和标准化 HTML 后才能获取模板内容。

最常见的限制是：

- `<li>`、`<tr>` 和 `<option>` 元素需要一个特定的父元素
- 一些 HTML 元素限制了哪些元素可以出现在它们内部

```html
<!-- 这样会有效果 -->
<table>
  <my-row></my-row>
</table>

<!-- 但这样不会 -->
<table>
  <tr is="my-row"></tr>
</table>
```

## 组件命名约定

当使用 DOM 模板时，推荐使用 kebab-case：

```javascript
Vue.component('my-component-name', {
  // ...
})
```

当使用字符串模板时，可以使用 camelCase、PascalCase 或 kebab-case：

```javascript
// 在字符串模板中都可以工作
components: {
  'myComponent', // camelCase
  'MyComponent', // PascalCase
  'my-component' // kebab-case
}
```

组件是 Vue.js 的核心概念之一，通过合理使用组件，可以构建出模块化、可重用的代码结构。