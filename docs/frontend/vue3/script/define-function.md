---
title: define函数
createTime: 2026/01/12 15:59:16
permalink: /frontend/vue3/script/define-function/
---


## defineProps() 和 defineEmits()
为了在声明 `props` 和 `emits` 选项时获得完整的类型推导支持，我们可以使用 `defineProps` 和 `defineEmits` API，它们将自动地在 `<script setup>` 中可用：

``` vue
<script setup>
const props = defineProps({
  foo: String
})

const emit = defineEmits(['change', 'delete'])
// setup 代码
</script>
```

- `defineProps` 和 `defineEmits` 都是只能在 `<script setup>` 中使用的编译器宏。他们不需要导入，且会随着 `<script setup>` 的处理过程一同被编译掉。
- `defineProps` 接收与 `props` 选项相同的值，`defineEmits` 接收与 `emits` 选项相同的值。
- `defineProps` 和 `defineEmits` 在选项传入后，会提供恰当的类型推导。
- 传入到 `defineProps` 和 `defineEmits` 的选项会从 setup 中提升到模块的作用域。因此，传入的选项不能引用在 setup 作用域中声明的局部变量。这样做会引起编译错误。但是，它可以引用导入的绑定，因为它们也在模块作用域内。

## defineModel()
- 仅在 3.4+ 中可用

这个宏可以用来声明一个双向绑定 prop，通过父组件的 `v-model` 来使用。组件 v-model 指南中也讨论了示例用法。

在底层，这个宏声明了一个 model prop 和一个相应的值更新事件。如果第一个参数是一个字符串字面量，它将被用作 prop 名称；否则，prop 名称将默认为 `"modelValue"`。在这两种情况下，你都可以再传递一个额外的对象，它可以包含 prop 的选项和 model ref 的值转换选项。

``` javascript
// 声明 "modelValue" prop，由父组件通过 v-model 使用
const model = defineModel()
// 或者：声明带选项的 "modelValue" prop
const model = defineModel({ type: String })

// 在被修改时，触发 "update:modelValue" 事件
model.value = "hello"

// 声明 "count" prop，由父组件通过 v-model:count 使用
const count = defineModel("count")
// 或者：声明带选项的 "count" prop
const count = defineModel("count", { type: Number, default: 0 })

function inc() {
  // 在被修改时，触发 "update:count" 事件
  count.value++
}
```

::: warning
如果为 `defineModel` prop ==设置了一个 default 值且父组件没有为该 prop 提供任何值==，会导致父组件与子组件之间不同步。在下面的示例中，父组件的 `myRef` 是 undefined，而子组件的 model 是 1：

``` vue title="Child.vue"
<script setup>
const model = defineModel({ default: 1 })
</script>
```

``` vue title="Parent.vue"
<script setup>
const myRef = ref()
</script>

<template>
  <Child v-model="myRef"></Child>
</template>
```
:::

**修饰符和转换器**
为了获取 `v-model` 指令使用的修饰符，我们可以像这样解构 `defineModel()` 的返回值：

``` javascript
const [modelValue, modelModifiers] = defineModel()

// 对应 v-model.trim
if (modelModifiers.trim) {
  // ...
}
```

当存在修饰符时，我们可能需要在读取或将其同步回父组件时对其值进行转换。我们可以通过使用 `get` 和 `set` 转换器选项来实现这一点：

``` javascript
const [modelValue, modelModifiers] = defineModel({
  // get() 省略了，因为这里不需要它
  set(value) {
    // 如果使用了 .trim 修饰符，则返回裁剪过后的值
    if (modelModifiers.trim) {
      return value.trim()
    }
    // 否则，原样返回
    return value
  }
})
```

## defineExpose()
使用 `<script setup>` 的组件是==默认关闭的——即通过模板引用==或者 `$parent` 链获取到的组件的公开实例，不会暴露任何在 `<script setup>` 中声明的绑定。

可以通过 `defineExpose` 编译器宏来显式指定在 `<script setup>` 组件中要暴露出去的属性：

``` vue
<script setup>
import { ref } from 'vue'

const a = 1
const b = ref(2)

defineExpose({
  a,
  b
})
</script>
```

当父组件通过模板引用的方式获取到当前组件的实例，获取到的实例会像这样 `{ a: number, b: number }` (ref 会和在普通实例中一样被自动解包)

## defineOptions()
- 仅在 3.3+ 中支持

这个宏可以用来直接在 `<script setup>` 中声明组件选项，而不必使用单独的 `<script>` 块：

``` vue
<script setup>
defineOptions({
  inheritAttrs: false,
  customOptions: {
    /* ... */
  }
})
</script>
```

这是一个宏定义，选项将会被提升到模块作用域中，无法访问 `<script setup>` 中不是字面常数的局部变量。

