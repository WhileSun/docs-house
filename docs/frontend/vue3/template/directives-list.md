---
title: 指令：列表渲染
createTime: 2026/01/15 14:15:33
permalink: /frontend/vue3/template/directives-list/
---

## v-for
我们可以使用 `v-for` 指令基于一个数组来渲染一个列表。`v-for` 指令的值需要使用 `item in items` 形式的特殊语法，其中 `items` 是源数据的数组，而 `item` 是迭代项的别名

``` vue
<script setup>
  const items = ref([{ message: 'Foo' }, { message: 'Bar' }])
</script>

<template>
  <li v-for="item in items">
    {{ item.message }}
  </li>
</template>
```

在 `v-for` 块中可以完整地访问父作用域内的属性和变量。`v-for` 也支持使用可选的==第二个参数表示当前项的位置索引==。

``` vue
<script setup>
  parentMessage = ref('Parent')
  const items = ref([{ message: 'Foo' }, { message: 'Bar' }])
</script>

<template>
  <li v-for="(item, index) in items">
    {{ parentMessage }} - {{ index }} - {{ item.message }}
  </li>
</template>
```

`v-for` 变量的作用域和下面的 `JavaScript` 代码很类似：

``` js
const parentMessage = 'Parent'
const items = [
  /* ... */
]

items.forEach((item, index) => {
  // 可以访问外层的 `parentMessage`
  // 而 `item` 和 `index` 只在这个作用域可用
  console.log(parentMessage, item.message, index)
})
```

注意 `v-for` 是如何对应 `forEach` 回调的函数签名的。实际上，你也可以在定义 `v-for` 的变量别名时使用解构，和解构函数参数类似：

``` vue
<li v-for="{ message } in items">
  {{ message }}
</li>

<!-- 有 index 索引时 -->
<li v-for="({ message }, index) in items">
  {{ message }} {{ index }}
</li>
```

对于**多层嵌套**的 `v-for`，作用域的工作方式和函数的作用域很类似。每个 `v-for` 作用域都可以访问到父级作用域：

``` vue
<template>
  <li v-for="item in items">
    <span v-for="childItem in item.children">
      {{ item.message }} {{ childItem }}
    </span>
  </li>
</template>
```

你也可以使用 `of` 作为分隔符来替代 `in`，这更接近 JavaScript 的迭代器语法：

``` vue
<div v-for="item of items"></div>
```

## `v-for` 与对象
你也可以使用 `v-for` 来遍历一个对象的所有属性。遍历的顺序会基于对该对象调用 `Object.values()` 的返回值来决定。

``` vue
<script setup>
  const myObject = reactive({
    title: 'How to do lists in Vue',
    author: 'Jane Doe',
    publishedAt: '2016-04-10'
  })
</script>
```

``` vue
<template>
  <ul>
    <li v-for="value in myObject">
      {{ value }}
    </li>
  </ul>
</template>
```

可以通过提供第二个参数表示==属性名== (例如 key)：

``` vue
<template>
  <li v-for="(value, key) in myObject">
    {{ key }}: {{ value }}
  </li>
</template>
```

第三个参数表示位置索引：

``` vue
<template>
  <li v-for="(value, key, index) in myObject">
    {{ index }}. {{ key }}: {{ value }}
  </li>
</template>
```

## 在 `v-for` 里使用范围值
`v-for` 可以直接接受一个整数值。在这种用例中，会将该模板基于 `1...n` 的取值范围重复多次。

``` vue
<span v-for="n in 10">{{ n }}</span>
```

注意此处 `n` 的初值是从 `1` 开始而非 `0`。

## `<template>` 上的 `v-for`
与模板上的 `v-if` 类似，你也可以在 `<template>` 标签上使用 `v-for` 来渲染一个包含多个元素的块。例如：

``` vue
<template>
  <ul>
    <template v-for="item in items">
      <li>{{ item.msg }}</li>
      <li class="divider" role="presentation"></li>
    </template>
  </ul>
</template>
```

## `v-for` 与 `v-if`
当它们同时存在于一个节点上时，**`v-if`** 比 `v-for` 的==优先级更高==。这意味着 `v-if` 的条件将无法访问到 `v-for` 作用域内定义的变量别名：

``` vue
<!--
 这会抛出一个错误，因为属性 todo 此时
 没有在该实例上定义
-->
<li v-for="todo in todos" v-if="!todo.isComplete">
  {{ todo.name }}
</li>
```

在外先包装一层 `<template>` 再在其上使用 `v-for` 可以解决这个问题 (这也更加明显易读)：

``` vue
<template v-for="todo in todos">
  <li v-if="!todo.isComplete">
    {{ todo.name }}
  </li>
</template>
```

## 通过 key 管理状态
Vue 默认按照“就地更新”的策略来更新通过 `v-for` 渲染的元素列表。当数据项的**顺序改变**时，==Vue 不会随之移动 DOM 元素的顺序==，而是就地更新每个元素，确保它们==在原本指定的索引位置上渲染==。

默认模式是高效的，但==只适用于列表渲染输出的结果不依赖子组件状态或者临时 DOM 状态 (例如表单输入值) 的情况==。

为了给 `Vue` 一个提示，以便它可以跟踪每个节点的标识，从而==重用和重新排序现有的元素==，你需要为每个元素对应的块提供一个唯一的 **`key attribute`**：

``` vue
<template>
  <div v-for="item in items" :key="item.id">
    <!-- 内容 -->
  </div>
</template>
```

当你使用 `<template v-for>` 时，key 应该被放置在这个 `<template>` 容器上：

``` vue
<template v-for="todo in todos" :key="todo.name">
  <li>{{ todo.name }}</li>
</template>
```

推荐在任何可行的时候为 `v-for` 提供一个 `key attribute`，除非所迭代的 DOM 内容非常简单 (例如：不包含组件或有状态的 DOM 元素)，或者你想有意采用默认行为来提高性能。

key 绑定的值期望是一个==基础类型的值==，例如**字符串**或 **number 类型**。不要用对象作为 v-for 的 key。

## 数组变化侦测

### 变更方法

Vue 能够侦听响应式数组的变更方法，并在它们被调用时触发相关的更新。这些变更方法包括：

- push()
- pop()
- shift()
- unshift()
- splice()
- sort()
- reverse()

### 替换一个数组
变更方法，顾名思义，就是会对调用它们的原数组进行变更。相对地，也有一些不可变 (immutable) 方法，例如 `filter()`，`concat()` 和 `slice()`，这些都==不会更改原数组==，而总是返回一个新数组。当遇到的是非变更方法时，我们==需要将旧的数组替换为新的==：

``` vue
<script setup>
  // `items` 是一个数组的 ref
  items.value = items.value.filter((item) => item.message.match(/Foo/))
</script>
```

你可能认为这将==导致 Vue 丢弃现有的 DOM 并重新渲染整个列表==——幸运的是，情况并非如此。Vue 实现了一些巧妙的方法来最大化对 DOM 元素的重用，因此==用另一个包含部分重叠对象的数组来做替换==，仍会是一种非常高效的操
作。


