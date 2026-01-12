---
title: 响应式：创建
createTime: 2026/01/12 09:32:57
permalink: /frontend/vue3/reactivity-create/
---

## ref()
接受一个内部值，返回一个响应式的、可更改的 ref 对象，此对象只有一个指向其内部值的属性 `.value`。

- 详细信息

ref 对象是可更改的，也就是说你可以为 `.value` 赋予新的值。它也是响应式的，即所有对 `.value` 的操作都将被追踪，并且写操作会触发与之相关的副作用。

如果将一个对象赋值给 ref，那么==这个对象将通过 [reactive()](#reactive) 转为具有深层次响应式的对象==。这也意味着如果对象中包含了嵌套的 ref，它们将被深层地解包。

若要避免这种深层次的转换，请使用 [shallowRef()](#shallowref) 来替代。

- 示例

``` javascript
const count = ref(0)
console.log(count.value) // 0

count.value = 1
console.log(count.value) // 1
```

## shallowRef()
`ref()` 的浅层作用形式。

- 详细信息

和 `ref()` 不同，浅层 ref 的内部值将会原样存储和暴露，并且不会被深层递归地转为响应式。==只有对 `.value` 的访问是响应式的==。

`shallowRef()` 常常用于对大型数据结构的性能优化或是与外部的状态管理系统集成。

- 示例

``` javascript
const state = shallowRef({ count: 1 })

// 不会触发更改
state.value.count = 2

// 会触发更改
state.value = { count: 2 }
```

## triggerRef()
**强制触发**依赖于一个==浅层 `ref` 的副作用==，这通常在对浅引用的内部值进行深度变更后使用。

- 类型

``` typescript
function triggerRef(ref: ShallowRef): void
```

- 示例

``` javascript
const shallow = shallowRef({
  greet: 'Hello, world'
})

// 触发该副作用第一次应该会打印 "Hello, world"
watchEffect(() => {
  console.log(shallow.value.greet)
})

// 这次变更不应触发副作用，因为这个 ref 是浅层的
shallow.value.greet = 'Hello, universe'

// 打印 "Hello, universe"
triggerRef(shallow)
```

## customRef()
创建一个**自定义的 ref**，显式声明对其依赖==追踪和更新触发==的控制方式。

- 详细信息

`customRef()` 预期接收一个工厂函数作为参数，这个工厂函数接受 `track` 和 `trigger` 两个函数作为参数，并返回一个带有 `get` 和 `set` 方法的对象。

一般来说，`track()` 应该在 `get()` 方法中调用，而 `trigger()` 应该在 `set()` 中调用。然而事实上，你对何时调用、是否应该调用他们有完全的控制权。

- 示例

创建一个==防抖 ref==，即只在最近一次 set 调用后的一段固定间隔后再调用：

``` javascript
import { customRef } from 'vue'

export function useDebouncedRef(value, delay = 200) {
  let timeout
  return customRef((track, trigger) => {
    return {
      get() {
        track()
        return value
      },
      set(newValue) {
        clearTimeout(timeout)
        timeout = setTimeout(() => {
          value = newValue
          trigger()
        }, delay)
      }
    }
  })
}
```

在组件中使用：

``` vue
<script setup>
import { useDebouncedRef } from './debouncedRef'
const text = useDebouncedRef('hello')
</script>

<template>
  <input v-model="text" />
</template>
```




## reactive()
返回一个对象的响应式代理。

- 详细信息

响应式转换是“深层”的：它会影响到所有嵌套的属性。==一个响应式对象也将深层地解包任何 [`ref`](#ref) 属性，同时保持响应性==。

值得注意的是，当访问到某个响应式数组或 `Map` 这样的原生集合类型中的 ref 元素时，不会执行 ref 的解包。

若要避免深层响应式转换，只想保留对这个对象顶层次访问的响应性，请使用 [shallowReactive()](#shallowreactive) 作替代。

返回的对象以及其中嵌套的对象都会通过 ``ES Proxy`` 包裹，==因此不等于源对象，建议只使用响应式代理，避免使用原始对象==。

- 示例

创建一个响应式对象：

``` javascript
const obj = reactive({ count: 0 })
obj.count++
```

ref 的**解包**：

``` javascript
const count = ref(1)
const obj = reactive({ count })

// ref 会被解包
console.log(obj.count === count.value) // true

// 会更新 `obj.count`
count.value++
console.log(count.value) // 2
console.log(obj.count) // 2

// 也会更新 `count` ref
obj.count++
console.log(obj.count) // 3
console.log(count.value) // 3
```

注意当访问到某个响应式数组或 `Map` 这样的==**原生集合类型中**的 ref 元素时==，不会执行 ref 的解包：

``` javascript
const books = reactive([ref('Vue 3 Guide')])
// 这里需要 .value
console.log(books[0].value)

const map = reactive(new Map([['count', ref(0)]]))
// 这里需要 .value
console.log(map.get('count').value)
```

## shallowReactive()
`reactive()` 的浅层作用形式。

- 详细信息

和 `reactive()` 不同，这里没有深层级的转换：一个浅层响应式对象里只有==根级别的属性是响应式==的。属性的值会被原样存储和暴露，这也==意味着值为 ref 的属性不会被自动解包了==。

::: warning
浅层数据结构应该只用于组件中的根级状态。请避免将其嵌套在深层次的响应式对象中，因为它创建的树具有不一致的响应行为，这可能很难理解和调试。
::: 

- 示例

``` javascript
const state = shallowReactive({
  foo: 1,
  nested: {
    bar: 2
  }
})

// 更改状态自身的属性是响应式的
state.foo++

// ...但下层嵌套对象不会被转为响应式
isReactive(state.nested) // false

// 不是响应式的
state.nested.bar++
```


## readonly()

接受一个对象 (不论是响应式还是普通的) 或是一个 [ref](#ref)，返回一个原值的只读代理。

- 详细信息

只读代理是深层的：对任何嵌套属性的访问都将是只读的。它的 ==ref 解包行为与 `reactive()` 相同==，但解包得到的值是只读的。

要避免深层级的转换行为，请使用 [shallowReadonly()](#shallowreadonly) 作替代。

- 示例

``` javascript
const original = reactive({ count: 0 })

const copy = readonly(original)

watchEffect(() => {
  // 用来做响应性追踪
  console.log(copy.count)
})

// 更改源属性会触发其依赖的侦听器
original.count++

// 更改该只读副本将会失败，并会得到一个警告
copy.count++ // warning!
```

## shallowReadonly()
`readonly()` 的浅层作用形式

- 详细信息

和 `readonly()` 不同，这里没有深层级的转换：==只有根层级的属性==变为了==只读==。属性的值都会被原样存储和暴露，这也==意味着值为 ref 的属性不会被自动解包了==。

::: warning
浅层数据结构应该只用于组件中的根级状态。请避免将其嵌套在深层次的响应式对象中，因为它创建的树具有不一致的响应行为，这可能很难理解和调试。
:::

- 示例

``` javascript
const state = shallowReadonly({
  foo: 1,
  nested: {
    bar: 2
  }
})

// 更改状态自身的属性会失败
state.foo++

// ...但可以更改下层嵌套对象
isReadonly(state.nested) // false

// 这是可以通过的
state.nested.bar++
```