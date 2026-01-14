---
title: use函数
createTime: 2026/01/12 15:12:38
permalink: /frontend/vue3/api-helpers/
---

## useAttrs()
从 Setup 上下文中返回 **attrs** 对象，其中包含当前组件的透传 attributes。这是用于 `<script setup>` 中的，因为在 `<script setup>` 中无法获取 setup 上下文对象。

- 类型

``` typescript
function useAttrs(): Record<string, unknown>
```

## useSlots()
从 Setup 上下文中返回 **slots** 对象，其中包含父组件传递的插槽。这些插槽为可调用的函数，返回虚拟 DOM 节点。这是用于 `<script setup>` 中的，因为在 `<script setup>` 中无法获取 setup 上下文对象。

如果使用 TypeScript，建议优先使用 ``defineSlots()``。

- 类型

``` typescript
function useSlots(): Record<string, (...args: any[]) => VNode[]>
```

## useModel()
这是驱动 `defineModel()` 的底层辅助函数。如果使用 `<script setup>`，应当优先使用 defineModel()。

- 仅在 3.4+ 版本中可用

- 类型

``` typescript
function useModel(
  props: Record<string, any>,
  key: string,
  options?: DefineModelOptions
): ModelRef

type DefineModelOptions<T = any> = {
  get?: (v: T) => any
  set?: (v: T) => any
}

type ModelRef<T, M extends PropertyKey = string, G = T, S = T> = Ref<G, S> & [
  ModelRef<T, M, G, S>,
  Record<M, true | undefined>
]
```

- 示例

``` javascript
export default {
  props: ['count'],
  emits: ['update:count'],
  setup(props) {
    const msg = useModel(props, 'count')
    msg.value = 1
  }
}
```

- 详细信息
`useModel()` 可以用于非单文件组件，例如在使用原始的 `setup()` 函数时。它预期的第一个参数是 ==props 对象==，第二个参数是 ==model 名称==。可选的第三个参数可以用于为生成的 ==model ref 声明自定义的 getter 和 setter==。请注意，与 `defineModel()` 不同，你需要自己==声明 props 和 emits==。

## useTemplateRef() <Badge type="tip" text="3.5+"/>
返回一个浅层 ref，其值将与模板中的具有匹配 ref attribute 的元素或组件同步。

- 类型

``` typescript
function useTemplateRef<T>(key: string): Readonly<ShallowRef<T | null>>
```

- 示例

``` vue
<script setup>
import { useTemplateRef, onMounted } from 'vue'

// 定义对应的ts了类型
const inputRef = useTemplateRef('input')

onMounted(() => {
  inputRef.value.focus()
})
</script>

<template>
  <input ref="input" />
</template>
```
