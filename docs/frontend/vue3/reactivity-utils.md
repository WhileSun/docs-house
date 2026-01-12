---
title: 响应式：工具
createTime: 2026/01/12 14:31:21
permalink: /frontend/vue3/reactivity-utils/
---

## isRef()
检查某个值是否为 ref。

- 类型

``` typescript
function isRef<T>(r: Ref<T> | unknown): r is Ref<T>
```

请注意，返回值是一个类型判定 (type predicate)，这意味着 `isRef` 可以被用作类型守卫

``` javascript
let foo: unknown
if (isRef(foo)) {
  // foo 的类型被收窄为了 Ref<unknown>
  foo.value
}
```

## unref()
如果参数是 ref，则返回内部值，否则返回参数本身。这是 `val = isRef(val) ? val.value : val` 计算的一个语法糖。

- 类型

``` typescript
function unref<T>(ref: T | Ref<T>): T
```

- 示例

``` javascript
function useFoo(x: number | Ref<number>) {
  const unwrapped = unref(x)
  // unwrapped 现在保证为 number 类型
}
```

## toRef()
可以将值、refs 或 getters 规范化为 refs (3.3+)。

也可以基于响应式对象上的一个属性，创建一个对应的 ref。这样创建的 ref 与其源属性保持同步：改变源属性的值将更新 ref 的值，反之亦然。

- 类型

``` typescript
// 规范化签名 (3.3+)
function toRef<T>(
  value: T
): T extends () => infer R
  ? Readonly<Ref<R>>
  : T extends Ref
  ? T
  : Ref<UnwrapRef<T>>

// 对象属性签名
function toRef<T extends object, K extends keyof T>(
  object: T,
  key: K,
  defaultValue?: T[K]
): ToRef<T[K]>

type ToRef<T> = T extends Ref ? T : Ref<T>
```

- 示例

规范化签名 (3.3+)：

``` javascript
// 按原样返回现有的 ref
toRef(existingRef)

// 创建一个只读的 ref，当访问 .value 时会调用此 getter 函数
toRef(() => props.foo)

// 从非函数的值中创建普通的 ref
// 等同于 ref(1)
toRef(1)
```

对象属性签名：

``` javascript
const state = reactive({
  foo: 1,
  bar: 2
})

// 双向 ref，会与源属性同步
const fooRef = toRef(state, 'foo')

// 更改该 ref 会更新源属性
fooRef.value++
console.log(state.foo) // 2

// 更改源属性也会更新该 ref
state.foo++
console.log(fooRef.value) // 3
```

请注意，这不同于:

``` javascript
const fooRef = ref(state.foo)
```

上面这个 ref 不会和 `state.foo` 保持同步，因为这个 `ref()` 接收到的是一个纯数值。

`toRef()` 这个函数在你想把一个 prop 的 ref 传递给一个组合式函数时会很有用：

``` vue
<script setup>
import { toRef } from 'vue'

const props = defineProps(/* ... */)

// 将 `props.foo` 转换为 ref，然后传入
// 一个组合式函数
useSomeFeature(toRef(props, 'foo'))

// getter 语法——推荐在 3.3+ 版本使用
useSomeFeature(toRef(() => props.foo))
</script>
```

当 `toRef` 与组件 props 结合使用时，关于禁止对 props 做出更改的限制依然有效。==尝试将新的值传递给 ref 等效于尝试直接更改 props，这是不允许的==。在这种场景下，你可能可以考虑使用带有 get 和 set 的 computed 替代。详情请见在组件上使用 v-model 指南。

当使用对象属性签名时，即使源属性当前不存在，`toRef()` 也会返回一个可用的 ref。这让它在==处理可选 props 的时候格外实用==，相比之下 `toRefs` 就不会为可选 props 创建对应的 refs。

## toValue()
- 仅在 3.3+ 中支持

将值、refs 或 getters 规范化为值。这与 unref() 类似，不同的是此函数也会规范化 getter 函数。如果参数是一个 getter，它将会被调用并且返回它的返回值。

- 类型

``` typescript
function toValue<T>(source: T | Ref<T> | (() => T)): T
```

- 示例

``` javascript
toValue(1) //       --> 1
toValue(ref(1)) //  --> 1
toValue(() => 1) // --> 1
```

在组合式函数中规范化参数：

``` javascript
import type { MaybeRefOrGetter } from 'vue'

function useFeature(id: MaybeRefOrGetter<number>) {
  watch(() => toValue(id), id => {
    // 处理 id 变更
  })
}

// 这个组合式函数支持以下的任意形式：
useFeature(1)
useFeature(ref(1))
useFeature(() => 1)
```

## toRefs()
将一个响应式对象转换为一个普通对象，这个普通对象的每个属性都是指向源对象相应属性的 ref。每个单独的 ref 都是使用 `toRef()` 创建的。

- 类型

``` typescript
function toRefs<T extends object>(
  object: T
): {
  [K in keyof T]: ToRef<T[K]>
}

type ToRef = T extends Ref ? T : Ref<T>
```

- 示例

``` javascript
const state = reactive({
  foo: 1,
  bar: 2
})

const stateAsRefs = toRefs(state)
/*
stateAsRefs 的类型：{
  foo: Ref<number>,
  bar: Ref<number>
}
*/

// 这个 ref 和源属性已经“链接上了”
state.foo++
console.log(stateAsRefs.foo.value) // 2

stateAsRefs.foo.value++
console.log(state.foo) // 3
```

当从组合式函数中返回响应式对象时，`toRefs` 相当有用。使用它，消费者组件可以解构/展开返回的对象而不会失去响应性：

``` javascript
function useFeatureX() {
  const state = reactive({
    foo: 1,
    bar: 2
  })

  // ...基于状态的操作逻辑

  // 在返回时都转为 ref
  return toRefs(state)
}

// 可以解构而不会失去响应性
const { foo, bar } = useFeatureX()
```

`toRefs` 在调用时只会为源对象上可以枚举的属性创建 ref。如果要==为可能还不存在的属性创建 ref，请改用 `toRef`==。\


## isProxy()
检查一个对象是否是由 `reactive()`、`readonly()`、`shallowReactive()` 或 `shallowReadonly()` 创建的代理。

- 类型

``` typescript
function isProxy(value: any): boolean
```

## isReactive()
检查一个对象是否是由 `reactive()` 或 `shallowReactive()` 创建的代理。

- 类型

``` typescript
function isReactive(value: unknown): boolean
```

## isReadonly()
检查传入的值是否为只读对象。只读对象的属性可以更改，但他们不能通过传入的对象直接赋值。

通过 `readonly()` 和 `shallowReadonly`()` 创建的代理都是只读的，类似于没有 set 函数的 `computed()` ref。

- 类型

``` typescript
function isReadonly(value: unknown): boolean
```

## toRaw()
根据一个 Vue 创建的代理返回其原始对象。

- 类型

``` typescript
function toRaw<T>(proxy: T): T
```

- 详细信息

`toRaw()` 可以返回由 `reactive()`、`readonly()`、`shallowReactive()` 或者 `shallowReadonly()` 创建的代理对应的原始对象。

这是一个可以用于临时读取而不引起代理访问/跟踪开销，或是写入而不触发更改的特殊方法。不建议保存对原始对象的持久引用，请谨慎使用。

- 示例

``` javascript
const foo = {}
const reactiveFoo = reactive(foo)

console.log(toRaw(reactiveFoo) === foo) // true
```

## markRaw()
将一个对象标记为不可被转为代理。返回该对象本身。

- 类型

``` typescript
function markRaw<T extends object>(value: T): T
```

- 示例

``` javascript
const foo = markRaw({})
console.log(isReactive(reactive(foo))) // false

// 也适用于嵌套在其他响应性对象
const bar = reactive({ foo })
console.log(isReactive(bar.foo)) // false
```
