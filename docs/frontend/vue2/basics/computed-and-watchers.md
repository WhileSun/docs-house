---
title: 计算属性和侦听器
createTime: 2026/02/10 12:45:00
permalink: /frontend/vue2/basics/computed-and-watchers/
---

# 计算属性和侦听器

在模板中放入太多的逻辑会让模板过重且难以维护。对于任何复杂逻辑，都应该使用计算属性。

## 计算属性

### 基础示例

```html
<div id="example">
  <p>Original message: "{{ message }}"</p>
  <p>Computed reversed message: "{{ reversedMessage }}"</p>
</div>
```

```javascript
var vm = new Vue({
  el: '#example',
  data: {
    message: 'Hello'
  },
  computed: {
    // 计算属性的 getter
    reversedMessage: function () {
      // `this` 指向 vm 实例
      return this.message.split('').reverse().join('')
    }
  }
})
```

### 计算属性缓存 vs 方法

我们可以将同一个函数定义为一个方法而不是一个计算属性。两种方式的最终结果确实是完全相同的，然而，不同的是计算属性是基于它们的响应式依赖进行缓存的。只在相关响应式依赖发生改变时它们才会重新求值。

```html
<!-- 计算属性 -->
<p>Reversed message: "{{ reversedMessage }}"</p>

<!-- 方法 -->
<p>Reversed message: "{{ reverseMessage() }}"</p>
```

```javascript
// 在组件中
methods: {
  reverseMessage: function () {
    return this.message.split('').reverse().join('')
  }
}
```

### 计算属性的 setter

计算属性默认只有 getter，不过在需要时你也可以提供一个 setter：

```javascript
// ...
computed: {
  fullName: {
    // getter
    get: function () {
      return this.firstName + ' ' + this.lastName
    },
    // setter
    set: function (newValue) {
      var names = newValue.split(' ')
      this.firstName = names[0]
      this.lastName = names[names.length - 1]
    }
  }
}
// ...
```

## 侦听器

虽然计算属性在大多数情况下更合适，但有时也需要一个自定义的侦听器。当需要在数据变化时执行异步或开销较大的操作时，这个方式是最有用的：

```html
<div id="watch-example">
  <p>
    Ask a yes/no question:
    <input v-model="question">
  </p>
  <p>{{ answer }}</p>
</div>
```

```javascript
var watchExampleVM = new Vue({
  el: '#watch-example',
  data: {
    question: '',
    answer: 'Questions usually contain a question mark. ;-)'
  },
  watch: {
    // 如果 `question` 发生改变，这个函数就会运行
    question: function (newQuestion, oldQuestion) {
      this.answer = 'Waiting for you to stop typing...'
      this.debouncedGetAnswer()
    }
  },
  created: function () {
    // `_.debounce` 是一个通过 Lodash 限制操作频率的函数。
    this.debouncedGetAnswer = _.debounce(this.getAnswer, 500)
  },
  methods: {
    getAnswer: function () {
      if (this.question.indexOf('?') === -1) {
        this.answer = 'Questions usually contain a question mark. ;-)'
        return
      }
      this.answer = 'Thinking...'
      axios.get('https://yesno.wtf/api')
        .then(response => {
          this.answer = _.capitalize(response.data.answer)
        })
        .catch(error => {
          this.answer = 'Error! Could not reach the API. ' + error
        })
    }
  }
})
```

## 计算属性 vs 侦听器

Vue 提供了一种更通用的方式来观察和响应 Vue 实例上的数据变动：侦听器。当你有一些数据需要随着其它数据变动而变动时，你很容易滥用 `watch`。

通常更好的做法是使用计算属性而不是命令式的 `watch` 回调：

```javascript
var vm = new Vue({
  el: '#demo',
  data: {
    firstName: 'Foo',
    lastName: 'Bar',
    fullName: 'Foo Bar'
  },
  watch: {
    firstName: function (val) {
      this.fullName = val + ' ' + this.lastName
    },
    lastName: function (val) {
      this.fullName = this.firstName + ' ' + val
    }
  }
})
```

上面代码是命令式且重复的。将它与计算属性的版本进行比较：

```javascript
var vm = new Vue({
  el: '#demo',
  data: {
    firstName: 'Foo',
    lastName: 'Bar'
  },
  computed: {
    fullName: function () {
      return this.firstName + ' ' + this.lastName
    }
  }
})
```

## 深度侦听

当需要侦听一个对象的深层属性变化时，可以使用深度侦听：

```javascript
watch: {
  obj: {
    handler: function (val, oldVal) { /* ... */ },
    deep: true
  }
}
```

## 立即执行侦听

使用 `immediate: true` 选项可以立即执行侦听器的回调函数：

```javascript
watch: {
  question: {
    handler: function (newVal, oldVal) {
      // 立即执行，newVal 等于初始值
    },
    immediate: true
  }
}
```

计算属性是 Vue.js 中非常强大的特性，它允许我们声明式地创建依赖于其他值的新值。当依赖发生改变时，计算属性会自动更新。