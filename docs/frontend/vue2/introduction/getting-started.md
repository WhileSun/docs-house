---
title: 开始使用
createTime: 2026/02/10 12:30:00
permalink: /frontend/vue2/introduction/getting-started/
---

# 开始使用 Vue.js

Vue.js 是一款渐进式 JavaScript 框架，用于构建用户界面。与其他重量级框架不同，Vue 采用自底向上增量开发的设计理念。

## Vue.js 是什么

Vue.js 是一个用于构建用户界面的 JavaScript 框架。它基于标准 HTML、CSS 和 JavaScript 构建，并提供了一套声明式的、组件化的编程模型。

Vue 的核心库专注于视图层，不仅易于上手，还便于与第三方库或现有项目整合。

## 声明式渲染

Vue.js 的核心是一个允许采用简洁的模板语法来声明式地将数据渲染进 DOM 的系统：

```html
<div id="app">
  {{ message }}
</div>
```

```javascript
var app = new Vue({
  el: '#app',
  data: {
    message: 'Hello Vue!'
  }
})
```

我们已经成功创建了第一个 Vue 应用！看起来这跟渲染一个字符串模板非常类似，但是 Vue 在背后做了大量工作。现在数据和 DOM 已经被建立了关联，所有东西都是响应式的。

## 条件与循环

除了文本插值，我们还可以像这样来绑定元素的属性：

```html
<div id="app-2">
  <span v-bind:title="message">
    鼠标悬停几秒钟查看此处动态绑定的提示信息！
  </span>
</div>
```

```javascript
var app2 = new Vue({
  el: '#app-2',
  data: {
    message: '页面加载于 ' + new Date().toLocaleString()
  }
})
```

这里我们遇到了一点新东西。你看到的 `v-bind` 属性被称为指令。指令带有前缀 `v-`，以表示它们是 Vue 提供的特殊属性，可能具有某些特殊行为。

再来一个例子——这次是一个被称为列表渲染的指令：

```html
<div id="app-3">
  <ol>
    <li v-for="todo in todos">
      {{ todo.text }}
    </li>
  </ol>
</div>
```

```javascript
var app3 = new Vue({
  el: '#app-3',
  data: {
    todos: [
      { text: '学习 JavaScript' },
      { text: '学习 Vue' },
      { text: '整个牛项目' }
    ]
  }
})
```

## 处理用户输入

为了让用户和你的应用进行交互，我们可以用 `v-on` 指令添加一个事件监听器，通过它调用在 Vue 实例中定义的方法：

```html
<div id="app-5">
  <p>{{ message }}</p>
  <button v-on:click="reverseMessage">逆转消息</button>
</div>
```

```javascript
var app5 = new Vue({
  el: '#app-5',
  data: {
    message: 'Hello Vue.js!'
  },
  methods: {
    reverseMessage: function () {
      this.message = this.message.split('').reverse().join('')
    }
  }
})
```

## 组件化应用构建

组件系统是 Vue 的另一个重要概念，因为它是一种抽象，允许我们使用小型、独立和通常可复用的组件构建大型应用。

在 Vue 里，一个组件本质上是一个拥有预定义选项的 Vue 实例：

```javascript
// 定义名为 todo-item 的新组件
Vue.component('todo-item', {
  template: '<li>这是个待办项</li>'
})

var app = new Vue(...)
```

现在你可以用它构建另一个组件模板：

```html
<ol>
  <!-- 创建一个 todo-item 组件的实例 -->
  <todo-item></todo-item>
</ol>
```

但是这样会为每个待办项渲染同样的文本，这看起来不太对。我们应该能从父作用域将数据传到子组件。让我们来修改一下组件的定义，使之能够接受一个 prop：

```javascript
Vue.component('todo-item', {
  // todo-item 组件现在接受一个 "prop"，
  // 类似于一个自定义 attribute。
  // 这个 prop 名为 todo。
  props: ['todo'],
  template: '<li>{{ todo.text }}</li>'
})
```

现在我们可以使用 `v-bind` 指令将待办项传到循环输出的每个组件中：

```html
<div id="app-7">
  <ol>
    <!--
      现在我们为每个 todo-item 提供 todo 对象
      todo 对象是变量，即其内容可以是动态的。
    -->
    <todo-item
      v-for="item in groceryList"
      v-bind:todo="item"
      v-bind:key="item.id"
    ></todo-item>
  </ol>
</div>
```

```javascript
Vue.component('todo-item', {
  props: ['todo'],
  template: '<li>{{ todo.text }}</li>'
})

var app7 = new Vue({
  el: '#app-7',
  data: {
    groceryList: [
      { id: 0, text: '蔬菜' },
      { id: 1, text: '奶酪' },
      { id: 2, text: '随便其他什么人吃的东西' }
    ]
  }
})
```

这就是一个组件树的示例，它允许我们将复杂的应用分解为更小的、更易于管理的部分。

## 准备就绪

我们已经介绍了 Vue.js 的基础概念，包括数据绑定、指令、事件处理和组件。这些构成了 Vue.js 的核心功能，掌握了这些概念，你就可以开始构建 Vue.js 应用了。

在接下来的章节中，我们将深入了解这些概念以及其他高级功能。