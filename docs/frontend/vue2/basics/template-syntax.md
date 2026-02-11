---
title: 模板语法
createTime: 2026/02/10 12:40:00
permalink: /frontend/vue2/basics/template-syntax/
---

# 模板语法

Vue.js 使用基于 HTML 的模板语法，允许开发者声明式地将 DOM 绑定到底层 Vue 实例的数据。

## 插值

### 文本插值

最基本的形式是使用 `{{ }}` 进行文本插值：

```html
<span>Message: {{ msg }}</span>
```

插值文本中可以使用任何有效的 JavaScript 表达式：

```html
{{ number + 1 }}
{{ ok ? 'YES' : 'NO' }}
{{ message.split('').reverse().join('') }}
```

### 原始 HTML

使用 `v-html` 指令输出原始 HTML：

```html
<p>Using text interpolation: {{ rawHtml }}</p>
<p>Using v-html directive: <span v-html="rawHtml"></span></p>
```

### 特性绑定

使用 `v-bind` 指令绑定 HTML 特性：

```html
<div v-bind:id="dynamicId"></div>
<div v-bind:class="{ active: isActive }"></div>
```

### 使用 JavaScript 表达式

在模板中可以使用 JavaScript 表达式：

```html
{{ number + 1 }}
{{ message.split('').reverse().join('') }}
<div v-bind:id="'list-' + id"></div>
{{ ok ? 'YES' : 'NO' }}
```

## 指令

指令 (Directives) 是带有 `v-` 前缀的特殊特性。指令特性的值预期是单个 JavaScript 表达式。

### 参数

一些指令能够接收一个"参数"，在指令名称之后以冒号指明：

```html
<a v-bind:href="url">...</a>
<a v-on:click="doSomething">...</a>
```

### 修饰符

修饰符 (Modifiers) 是以半角句号 `.` 指明的特殊后缀，用于指出一个指令应该以特殊方式绑定：

```html
<form v-on:submit.prevent="onSubmit">...</form>
```

## 缩写

Vue.js 为最常用的指令提供了缩写：

### v-bind 缩写

```html
<!-- 完整语法 -->
<a v-bind:href="url">...</a>

<!-- 缩写 -->
<a :href="url">...</a>
```

### v-on 缩写

```html
<!-- 完整语法 -->
<a v-on:click="doSomething">...</a>

<!-- 缩写 -->
<a @click="doSomething">...</a>
```

## 条件渲染

### v-if

条件渲染，只有在条件为真时才渲染元素：

```html
<h1 v-if="awesome">Vue is awesome!</h1>
```

### v-show

元素始终会被渲染并保留在 DOM 中，只是简单地切换元素的 CSS display 属性：

```html
<h1 v-show="awesome">Vue is awesome!</h1>
```

## 列表渲染

使用 `v-for` 指令基于一个数组来渲染一个列表：

```html
<ul>
  <li v-for="item in items" :key="item.id">
    {{ item.message }}
  </li>
</ul>
```

## 事件处理

使用 `v-on` 指令监听 DOM 事件：

```html
<button v-on:click="counter++">Add 1</button>
```

## 表单输入绑定

使用 `v-model` 指令在表单 `<input>`、`<textarea>` 及 `<select>` 元素上创建双向数据绑定：

```html
<input v-model="message" placeholder="edit me">
<p>Message is: {{ message }}</p>
```

## 动态参数

从 Vue 2.6.0 开始，可以用方括号括起来的 JavaScript 表达式作为一个指令的参数：

```html
<!-- 动态参数预计会求出一个字符串，异常情况下值为 null -->
<a v-bind:[attributeName]="url"> ... </a>

<!-- 动态参数中也可以使用多个值组成的计算属性 -->
<a v-bind:[getDynamicAttribute()]="url"> ... </a>
```

模板语法是 Vue.js 的核心特性之一，它使得数据绑定变得直观和简洁。熟练掌握模板语法是使用 Vue.js 的基础。