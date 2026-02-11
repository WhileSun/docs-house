---
title: 条件渲染
createTime: 2026/02/10 13:45:00
permalink: /frontend/vue2/basics/conditional-rendering/
---

# 条件渲染

Vue.js 提供了专门的指令来处理条件渲染。

## v-if

在 Vue.js 中，我们可以使用 `v-if` 指令来条件性地渲染一块内容。这块内容只会在指令的表达式返回真值的时候被渲染。

```html
<h1 v-if="awesome">Vue is awesome!</h1>
```

也可以使用 `v-else` 和 `v-else-if`：

```html
<div v-if="type === 'A'">
  A
</div>
<div v-else-if="type === 'B'">
  B
</div>
<div v-else-if="type === 'C'">
  C
</div>
<div v-else>
  Not A/B/C
</div>
```

## 在 `<template>` 上使用 v-if

因为 `v-if` 是一个指令，所以必须附加在某个元素上。如果想切换多个元素，可以使用 `<template>` 元素作为包装元素：

```html
<template v-if="ok">
  <h1>Title</h1>
  <p>Paragraph 1</p>
  <p>Paragraph 2</p>
</template>
```

## v-show

另一个条件渲染的是 `v-show` 指令。用法大致一样：

```html
<h1 v-show="ok">Hello!</h1>
```

不同的是，带 `v-show` 的元素始终会被渲染并保留在 DOM 中。`v-show` 只是简单地切换元素的 CSS `display` 属性。

## v-if vs v-show

- `v-if` 是"真正"的条件渲染，因为它会确保在切换过程中条件块内的事件监听器和子组件适当地被销毁和重建。
- `v-if` 也是惰性的：如果在初始渲染时条件为假，则什么也不做——直到条件第一次变为真时，才会开始渲染条件块。
- 相比之下，`v-show` 就简单得多——不管初始条件是什么，元素总是会被渲染，并且只是简单地基于 CSS 进行切换。

一般来说，`v-if` 有更高的切换开销，而 `v-show` 有更高的初始渲染开销。因此，如果需要非常频繁地切换，则使用 `v-show` 较好；如果在运行时条件很少改变，则使用 `v-if` 较好。

## v-if 与 v-for 一起使用

当 `v-if` 与 `v-for` 一起使用时，`v-for` 具有比 `v-if` 更高的优先级。请谨慎使用，因为这可能导致性能问题：

```html
<!-- 警告：在每次迭代时都会检查 isActive -->
<li v-for="user in users" v-if="user.isActive" :key="user.id">
  {{ user.name }}
</li>
```

更好的方式是使用计算属性来过滤列表：

```javascript
computed: {
  activeUsers: function () {
    return this.users.filter(user => user.isActive)
  }
}
```

```html
<!-- 只在计算属性改变时检查一次 -->
<li v-for="user in activeUsers" :key="user.id">
  {{ user.name }}
</li>
```

## 实际应用示例

### 登录状态显示

```html
<div id="app">
  <div v-if="isLoggedIn">
    <p>欢迎，{{ username }}!</p>
    <button @click="logout">退出登录</button>
  </div>
  <div v-else>
    <p>请先登录</p>
    <button @click="login">登录</button>
  </div>
</div>
```

```javascript
new Vue({
  el: '#app',
  data: {
    isLoggedIn: false,
    username: 'John'
  },
  methods: {
    login() {
      this.isLoggedIn = true
    },
    logout() {
      this.isLoggedIn = false
    }
  }
})
```

### 加载状态指示

```html
<div id="app">
  <div v-if="loading">加载中...</div>
  <div v-else-if="error">
    <p>出错了: {{ error }}</p>
    <button @click="retry">重试</button>
  </div>
  <div v-else>
    <ul>
      <li v-for="item in items" :key="item.id">
        {{ item.name }}
      </li>
    </ul>
  </div>
</div>
```

```javascript
new Vue({
  el: '#app',
  data: {
    loading: true,
    error: null,
    items: []
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      try {
        this.loading = true
        this.error = null
        
        // 模拟 API 调用
        const response = await fetch('/api/items')
        this.items = await response.json()
      } catch (err) {
        this.error = err.message
      } finally {
        this.loading = false
      }
    },
    retry() {
      this.fetchData()
    }
  }
})
```

条件渲染是 Vue.js 中控制元素显示和隐藏的重要机制，通过合理使用 `v-if` 和 `v-show`，可以实现丰富的用户界面交互效果。