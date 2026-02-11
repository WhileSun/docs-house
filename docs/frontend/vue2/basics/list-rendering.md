---
title: 列表渲染
createTime: 2026/02/10 13:50:00
permalink: /frontend/vue2/basics/list-rendering/
---

# 列表渲染

我们可以使用 `v-for` 指令基于一个数组来渲染一个列表。`v-for` 指令需要使用 `item in items` 形式的特殊语法，其中 `items` 是源数据数组，而 `item` 是被迭代的数组元素的别名。

## 基础用法

```html
<ul id="example-1">
  <li v-for="item in items" :key="item.id">
    {{ item.message }}
  </li>
</ul>
```

```javascript
new Vue({
  el: '#example-1',
  data: {
    items: [
      { id: 1, message: 'Foo' },
      { id: 2, message: 'Bar' }
    ]
  }
})
```

在 `v-for` 中，我们也可以访问元素的索引：

```html
<ul id="example-2">
  <li v-for="(item, index) in items" :key="item.id">
    {{ parentMessage }} - {{ index }} - {{ item.message }}
  </li>
</ul>
```

## 在对象上使用 v-for

你也可以用 `v-for` 来遍历一个对象的属性：

```html
<ul id="v-for-object" class="demo">
  <li v-for="value in object" :key="value">
    {{ value }}
  </li>
</ul>
```

```javascript
new Vue({
  el: '#v-for-object',
  data: {
    object: {
      title: 'How to do lists in Vue',
      author: 'Jane Doe',
      publishedAt: '2016-04-10'
    }
  }
})
```

你也可以提供第二个参数作为键名：

```html
<li v-for="(value, key) in object" :key="key">
  {{ key }}: {{ value }}
</li>
```

第三个参数作为索引：

```html
<li v-for="(value, key, index) in object" :key="index">
  {{ index }}. {{ key }}: {{ value }}
</li>
```

## 维护状态

当 Vue.js 用 `v-for` 正在更新已渲染过的元素列表时，它默认用"就地复用"策略。如果数据项的顺序被改变，Vue 将不会移动 DOM 元素来匹配数据项的顺序，而是简单复用此处每个元素，并且确保它在特定索引下显示的是什么。

这个默认的模式是高效的，但只适用于列表渲染输出不依赖子组件状态或临时 DOM 状态 (例如：表单输入值) 的列表渲染输出。

为了给 Vue 一个提示，以便它可以跟踪每个节点的身份，从而重用和重新排序现有元素，你需要为每项提供一个唯一的 `key` 属性：

```html
<div v-for="item in items" :key="item.id">
  <!-- 内容 -->
</div>
```

## 数组更新检测

### 变异方法

Vue 将被侦听的数组的变异方法进行了包裹，所以它们也将会触发视图更新。这些被包裹过的方法包括：

- `push()`
- `pop()`
- `shift()`
- `unshift()`
- `splice()`
- `sort()`
- `reverse()`

你可以打开控制台，然后对前面例子的 `items` 数组尝试调用变异方法。例如：`example1.items.push({ message: 'Baz' })`。

### 替换数组

变异方法 (mutating method)，顾名思义，会改变调用它们的原始数组。相比之下，也有非变异 (non-mutating method) 方法，例如 `filter()`、`concat()` 和 `slice()`。它们不会改变原始数组，而总是返回一个新数组。当使用非变异方法时，可以用新数组替换旧数组：

```javascript
example1.items = example1.items.filter(function (item) {
  return item.message.match(/Foo/)
})
```

你可能认为这将导致 Vue 丢弃现有 DOM 并重新渲染整个列表。幸运的是，事实并非如此。Vue 为了使得 DOM 元素得到最大范围的重用而实现了一些智能的启发式方法，所以用一个含有相同元素的数组去替换原来的数组是非常高效的操作。

## 对象变更检测注意事项

受现代 JavaScript 的限制 (以及废弃 `Object.observe`)，Vue 不能检测到对象属性的添加或删除。

```javascript
var vm = new Vue({
  data: {
    a: 1
  }
})
// `vm.a` 是响应式的

vm.b = 2
// `vm.b` 不是响应式的
```

对于已经创建的实例，Vue 不允许动态添加根级别的响应式属性。但是，可以使用 `Vue.set(object, key, value)` 方法向嵌套对象添加响应式属性：

```javascript
Vue.set(vm.someObject, 'b', 2)

// 或者
vm.$set(vm.someObject, 'b', 2)
```

## 显示过滤/排序后的结果

有时，我们想要显示一个数组经过过滤或排序后的内容，而不实际改变或重置原始数据。在这种情况下，可以创建一个计算属性来返回过滤或排序后的数组：

```html
<li v-for="n in evenNumbers" :key="n">{{ n }}</li>
```

```javascript
data: {
  numbers: [ 1, 2, 3, 4, 5 ]
},
computed: {
  evenNumbers: function () {
    return this.numbers.filter(function (number) {
      return number % 2 === 0
    })
  }
}
```

在计算属性不适用的情况下 (例如，在多层嵌套循环中)，你可以使用一个方法：

```html
<li v-for="n in even(numbers)" :key="n">{{ n }}</li>
```

```javascript
methods: {
  even: function (numbers) {
    return numbers.filter(function (number) {
      return number % 2 === 0
    })
  }
}
```

## 在组件上使用 v-for

在自定义组件上，你可以像在任何普通元素上一样使用 `v-for`：

```html
<my-component v-for="item in items" :key="item.id" :item="item"></my-component>
```

但是，这样做不会自动传递数据到组件里，因为组件有自己独立的作用域。为了把迭代数据传递到组件里，我们要使用 props：

```javascript
Vue.component('todo-item', {
  props: ['todo'],
  template: '<li>{{ todo.text }}</li>'
})
```

```html
<ul>
  <todo-item
    v-for="item in groceryList"
    :key="item.id"
    :todo="item">
  </todo-item>
</ul>
```

```javascript
new Vue({
  el: '#app',
  data: {
    groceryList: [
      { id: 0, text: '蔬菜' },
      { id: 1, text: '奶酪' },
      { id: 2, text: '随便其他什么人吃的东西' }
    ]
  }
})
```

## 实际应用示例

### 动态列表管理

```html
<div id="list-demo">
  <input v-model="newItem" @keyup.enter="addItem">
  <button @click="addItem">添加</button>
  <ul>
    <li v-for="(item, index) in items" :key="item.id">
      {{ item.text }}
      <button @click="removeItem(index)">删除</button>
    </li>
  </ul>
  <p>共有 {{ items.length }} 个项目</p>
</div>
```

```javascript
new Vue({
  el: '#list-demo',
  data: {
    newItem: '',
    items: [
      { id: 1, text: '学习 Vue' },
      { id: 2, text: '学习组件' },
      { id: 3, text: '学习路由' }
    ]
  },
  methods: {
    addItem() {
      if (this.newItem.trim() === '') return
      
      this.items.push({
        id: Date.now(),
        text: this.newItem
      })
      
      this.newItem = ''
    },
    removeItem(index) {
      this.items.splice(index, 1)
    }
  }
})
```

### 列表搜索和过滤

```html
<div id="search-demo">
  <input v-model="searchTerm" placeholder="搜索...">
  <ul>
    <li v-for="user in filteredUsers" :key="user.id">
      {{ user.name }} - {{ user.email }}
    </li>
  </ul>
</div>
```

```javascript
new Vue({
  el: '#search-demo',
  data: {
    searchTerm: '',
    users: [
      { id: 1, name: 'Alice', email: 'alice@example.com' },
      { id: 2, name: 'Bob', email: 'bob@example.com' },
      { id: 3, name: 'Charlie', email: 'charlie@example.com' }
    ]
  },
  computed: {
    filteredUsers() {
      if (!this.searchTerm) {
        return this.users
      }
      
      return this.users.filter(user => {
        return user.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
               user.email.toLowerCase().includes(this.searchTerm.toLowerCase())
      })
    }
  }
})
```

列表渲染是 Vue.js 中处理动态内容的重要功能，通过合理使用 `v-for` 和 `key`，可以高效地渲染和更新列表数据。