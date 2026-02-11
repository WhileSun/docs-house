---
title: 响应式原理
createTime: 2026/02/10 16:10:00
permalink: /frontend/vue2/advanced/reactivity/
---

# 响应式原理

Vue.js 最核心的特性之一就是其响应式系统。理解 Vue 2 的响应式原理对于开发高质量的应用至关重要。

## 基础概念

Vue.js 的响应式系统基于数据劫持结合发布者-订阅者模式实现。当把一个普通的 JavaScript 对象传给 Vue 实例的 data 选项时，Vue.js 会遍历此对象的所有属性，并使用 `Object.defineProperty` 把这些属性全部转为 getter/setter。

```javascript
// Vue 内部实现的简化示例
function defineReactive(obj, key, val) {
  // 递归处理嵌套对象
  observe(val)
  
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter() {
      // 依赖收集
      if (Dep.target) {
        dep.depend()
      }
      return val
    },
    set: function reactiveSetter(newVal) {
      if (newVal === val) {
        return
      }
      val = newVal
      // 通知更新
      dep.notify()
    }
  })
}
```

## 依赖收集

当模板中访问某个属性时，会触发对应属性的 getter，此时 Vue 会将当前的 Watcher 记录下来，形成依赖关系。

```javascript
// 简化的依赖收集机制
class Dep {
  constructor() {
    this.subs = []
  }
  
  addSub(sub) {
    this.subs.push(sub)
  }
  
  depend() {
    if (Dep.target) {
      Dep.target.addDep(this)
    }
  }
  
  notify() {
    const subs = this.subs.slice()
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update()
    }
  }
}

// 全局的依赖目标
Dep.target = null
const targetStack = []

function pushTarget(_target) {
  if (Dep.target) targetStack.push(Dep.target)
  Dep.target = _target
}

function popTarget() {
  Dep.target = targetStack.pop()
}
```

## Watcher

Watcher 是连接数据变化和视图更新的桥梁：

```javascript
class Watcher {
  constructor(vm, expOrFn, cb, options) {
    this.vm = vm
    this.getter = typeof expOrFn === 'function' ? expOrFn : parsePath(expOrFn)
    this.cb = cb
    this.deps = []
    this.newDeps = []
    
    this.value = this.get()
  }
  
  get() {
    pushTarget(this)
    let value
    const vm = this.vm
    try {
      value = this.getter.call(vm, vm)
    } catch (e) {
      // 错误处理
    } finally {
      popTarget()
      this.cleanupDeps()
    }
    return value
  }
  
  addDep(dep) {
    const id = dep.id
    if (!this.newDepIds.has(id)) {
      this.newDepIds.add(id)
      this.newDeps.push(dep)
      if (!this.depIds.has(id)) {
        dep.addSub(this)
      }
    }
  }
  
  update() {
    this.run()
  }
  
  run() {
    const value = this.get()
    if (value !== this.value || isObject(value)) {
      const oldValue = this.value
      this.value = value
      this.cb.call(this.vm, value, oldValue)
    }
  }
}
```

## 数组的响应式处理

由于 JavaScript 的限制，Vue 无法检测到数组索引的变化。Vue 通过重写数组的变异方法来实现响应式：

```javascript
// 重写数组原型
const arrayProto = Array.prototype
export const arrayMethods = Object.create(arrayProto)

const methodsToPatch = [
  'push',
  'pop', 
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]

methodsToPatch.forEach(function (method) {
  // 缓存原始方法
  const original = arrayProto[method]
  def(arrayMethods, method, function mutator(...args) {
    const result = original.apply(this, args)
    const ob = this.__ob__
    let inserted
    
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break
      case 'splice':
        inserted = args.slice(2)
        break
    }
    
    if (inserted) ob.observeArray(inserted)
    
    // 通知更新
    ob.dep.notify()
    return result
  })
})
```

## Vue 2 响应式系统的限制

### 1. 对象属性的添加或删除

由于 ES5 的限制，Vue 2 无法检测到对象属性的添加或删除：

```javascript
var vm = new Vue({
  data: {
    a: 1
  }
})
// `vm.b` 是非响应的
vm.b = 2

// 解决方案：使用 Vue.set 或 vm.$set
vm.$set(vm, 'b', 2)
// 或
Vue.set(vm, 'b', 2)
```

### 2. 数组索引的直接设置

Vue 2 无法检测到数组索引的变化：

```javascript
var vm = new Vue({
  data: {
    items: ['a', 'b', 'c']
  }
})
vm.items[0] = 'x' // 非响应的

// 解决方案：使用 Vue.set、vm.$set 或数组的变异方法
vm.$set(vm.items, 0, 'x')
// 或
vm.items.splice(0, 1, 'x')
```

### 3. 数组长度的直接设置

```javascript
vm.items.length = 0 // 非响应的

// 解决方案：使用 splice
vm.items.splice(0)
```

## 解决响应式限制的方法

### Vue.set 和 vm.$set

```javascript
// 添加响应式属性
vm.$set(vm.someObject, 'b', 2)
// 或
Vue.set(vm.someObject, 'b', 2)

// 删除响应式属性
Vue.delete(vm.someObject, 'b')
// 或
vm.$delete(vm.someObject, 'b')
```

### Object.freeze()

对于大型的静态数据列表，可以使用 `Object.freeze()` 阵止响应式转换：

```javascript
export default {
  data() {
    return {
      users: []
    }
  },
  async created() {
    const users = await api.getLargeUserList()
    // 用户列表不会改变，使用 freeze 遞免响应式转换
    this.users = Object.freeze(users)
  }
}
```

## 计算属性和侦听器

### 计算属性的响应式

计算属性是基于它们的响应式依赖进行缓存的：

```javascript
computed: {
  reversedMessage: function () {
    // `this.message` 发生改变时才会重新计算
    return this.message.split('').reverse().join('')
  }
}
```

### 侦听器

当需要在数据变化时执行异步或开销较大的操作时，使用侦听器：

```javascript
export default {
  data() {
    return {
      question: '',
      answer: 'Questions usually contain a question mark. ;-)'
    }
  },
  watch: {
    // 如果 `question` 发生改变，这个函数就会运行
    question: function (newQuestion) {
      this.answer = 'Waiting for you to stop typing...'
      this.debouncedGetAnswer()
    }
  },
  created: function () {
    this.debouncedGetAnswer = _.debounce(this.getAnswer, 500)
  },
  methods: {
    getAnswer: function () {
      if (this.question.indexOf('?') === -1) {
        this.answer = 'Questions usually contain a question mark. ;-)'
        return
      }
      this.answer = 'Thinking...'
      // ... 异步操作
    }
  }
}
```

## 深度观测

### 深度侦听对象

```javascript
watch: {
  someObject: {
    handler: function (val, oldVal) {
      // 对象的任何变化都会触发
    },
    deep: true
  }
}
```

### 计算属性的深度依赖

```javascript
computed: {
  computedObject: function () {
    // 当嵌套对象的任何属性变化时，都会重新计算
    return {
      a: this.nestedObject.a,
      b: this.nestedObject.b
    }
  }
}
```

## 异步更新队列

Vue 在更新 DOM 时是异步执行的。只要侦听到数据变化，Vue 将开启一个队列，并缓冲在同一事件循环中发生的所有数据改变。在缓冲时会去除重复数据，从而避免不必要的计算和 DOM 操作。

```javascript
export default {
  methods: {
    updateMessage() {
      this.message = 'changed'
      // DOM 尚未更新
      console.log(this.$el.textContent) // 旧的值
      
      this.$nextTick(() => {
        // DOM 现在更新了
        console.log(this.$el.textContent) // 'changed'
      })
      
      // 或者使用 Promise 语法
      this.$nextTick().then(() => {
        console.log(this.$el.textContent) // 'changed'
      })
    }
  }
}
```

## 性能优化

### 遵活使用 Object.freeze()

对于不会改变的大型静态数据，使用 `Object.freeze()` 可以避免将其转换为响应式数据：

```javascript
export default {
  data() {
    return {
      staticData: null
    }
  },
  async created() {
    const data = await api.getStaticData()
    this.staticData = Object.freeze(data)
  }
}
```

### 遵活使用 v-once

对于不需要更新的静态内容，使用 `v-once` 指令：

```html
<!-- 只渲染一次，之后不再响应数据变化 -->
<p v-once>This will never change: {{msg}}</p>
```

### 遵活使用函数式组件

对于无状态、只负责渲染的组件，使用函数式组件可以避免响应式系统的开销：

```javascript
export default {
  functional: true,
  props: ['item'],
  render(h, { props }) {
    return h('div', { class: 'item' }, [
      h('h2', props.item.title),
      h('p', props.item.description)
    ])
  }
}
```

## 响应式原理的实际应用

### 自定义响应式数据

```javascript
// 创建一个响应式对象
function createReactiveObject(obj) {
  const observed = observe(obj)
  return observed
}

// 观察对象
function observe(value) {
  if (typeof value !== 'object') {
    return value
  }
  
  const ob = new Observer(value)
  return ob
}

class Observer {
  constructor(value) {
    this.value = value
    this.dep = new Dep()
    this.vmCount = 0
    
    def(value, '__ob__', this)
    
    if (Array.isArray(value)) {
      // 处理数组
      const augment = hasProto
        ? protoAugment
        : copyAugment
      augment(value, arrayMethods, arrayKeys)
      this.observeArray(value)
    } else {
      // 处理对象
      this.walk(value)
    }
  }
  
  walk(obj) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i], obj[keys[i]])
    }
  }
  
  observeArray(items) {
    for (let i = 0, l = items.length; i < l; i++) {
      observe(items[i])
    }
  }
}
```

### 响应式数据的调试

```javascript
// 为响应式数据添加调试信息
function debugDefineReactive(obj, key, val, customSetter) {
  const dep = new Dep()
  
  const property = Object.getOwnPropertyDescriptor(obj, key)
  if (property && property.configurable === false) {
    return
  }
  
  const getter = property && property.get
  const setter = property && property.set
  
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter() {
      const value = getter ? getter.call(obj) : val
      if (Dep.target) {
        dep.depend()
        if (childOb) {
          childOb.dep.depend()
          if (Array.isArray(value)) {
            dependArray(value)
          }
        }
      }
      
      // 调试信息
      console.log(`Getting property: ${key}, value: ${value}`)
      
      return value
    },
    set: function reactiveSetter(newVal) {
      const value = getter ? getter.call(obj) : val
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return
      }
      
      // 调试信息
      console.log(`Setting property: ${key}, old value: ${value}, new value: ${newVal}`)
      
      if (setter) {
        setter.call(obj, newVal)
      } else {
        val = newVal
      }
      childOb = !shallow && observe(newVal)
      dep.notify()
    }
  })
}
```

## Vue 3 的改进

Vue 3 使用 Proxy 替代了 `Object.defineProperty`，解决了 Vue 2 中的许多限制：

- 可以检测到对象属性的添加和删除
- 可以检测到数组索引的变化
- 可以检测到数组长度的变化
- 性能更好

响应式系统是 Vue.js 的核心机制，理解其工作原理有助于更好地使用 Vue 进行开发，并解决可能出现的相关问题。