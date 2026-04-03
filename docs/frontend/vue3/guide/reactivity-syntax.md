---
title: 响应式语法
createTime: 2026/02/11 23:00:00
permalink: /frontend/vue3/guide/reactivity-syntax/
---

# Vue3 响应式语法

Vue3 的响应式系统是框架的核心，本指南将详细介绍其语法和用法。

## 基础响应式 API

### ref - 处理基本类型

`ref` 用于创建包含基本类型值的响应式引用：

```javascript
import { ref } from 'vue'

// 创建响应式引用
const count = ref(0)

// 访问值
console.log(count.value) // 0

// 修改值
count.value++

// 在模板中使用时不需要 .value
```

```vue
<template>
  <div>
    <p>计数: {{ count }}</p>
    <button @click="increment">增加</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const count = ref(0)

const increment = () => {
  count.value++
}
</script>
```

### reactive - 处理对象类型

`reactive` 用于创建响应式对象：

```javascript
import { reactive } from 'vue'

const state = reactive({
  count: 0,
  name: 'Vue3',
  user: {
    id: 1,
    profile: {
      name: 'John',
      email: 'john@example.com'
    }
  }
})

// 直接访问和修改，无需 .value
console.log(state.count) // 0
state.count++ // 自动触发更新
state.user.profile.name = 'Jane' // 深层响应式
```

### toRefs - 解构响应式对象

当需要解构响应式对象但仍保持响应性时使用 `toRefs`：

```vue
<template>
  <div>
    <p>计数: {{ count }}</p>
    <p>名称: {{ name }}</p>
    <button @click="increment">增加</button>
  </div>
</template>

<script setup>
import { reactive, toRefs } from 'vue'

const state = reactive({
  count: 0,
  name: 'Vue3'
})

// 解构后仍保持响应性
const { count, name } = toRefs(state)

const increment = () => {
  state.count++ // 或者 count.value++
}
</script>
```

### toRef - 为属性创建引用

`toRef` 为响应式对象的属性创建引用：

```javascript
import { reactive, toRef } from 'vue'

const state = reactive({
  count: 0,
  name: 'Vue3'
})

// 为特定属性创建引用
const countRef = toRef(state, 'count')

// 两者保持同步
console.log(countRef.value) // 0
state.count = 5
console.log(countRef.value) // 5

countRef.value = 10
console.log(state.count) // 10
```

## 计算属性和侦听器

### computed - 计算属性

```javascript
import { ref, computed } from 'vue'

const count = ref(1)

// 只读计算属性
const doubleCount = computed(() => count.value * 2)

// 可读可写的计算属性
const writableDoubleCount = computed({
  get: () => count.value * 2,
  set: (value) => {
    count.value = value / 2
  }
})

// 使用
console.log(doubleCount.value) // 2
writableDoubleCount.value = 6 // count 变为 3
```

### watch - 侦听器

```javascript
import { ref, watch } from 'vue'

const count = ref(0)
const name = ref('Vue')

// 侦听单个源
watch(count, (newVal, oldVal) => {
  console.log(`count 从 ${oldVal} 变为 ${newVal}`)
})

// 侦听多个源
watch([count, name], ([newCount, newName], [oldCount, oldName]) => {
  console.log(`count: ${newCount}, name: ${newName}`)
})

// 侦听响应式对象的属性
const state = reactive({
  count: 0,
  name: 'Vue'
})

watch(
  () => state.count, // 侦听函数
  (newVal, oldVal) => {
    console.log(`state.count 从 ${oldVal} 变为 ${newVal}`)
  }
)

// 深层侦听
watch(
  () => state,
  (newState, oldState) => {
    // newState 和 oldState 是深层拷贝
  },
  { deep: true }
)

// 立即执行
watch(
  count,
  (newVal) => {
    console.log(`count is ${newVal}`)
  },
  { immediate: true } // 立即执行一次
)
```

### watchEffect - 副作用侦听器

`watchEffect` 会立即执行一次，并自动追踪依赖：

```javascript
import { ref, watchEffect } from 'vue'

const count = ref(0)
const name = ref('Vue')

// 自动追踪依赖
watchEffect(() => {
  console.log(`${name.value} count is ${count.value}`)
})

// 手动停止
const stop = watchEffect(() => {
  console.log(`Count: ${count.value}`)
})

// 之后可以停止
setTimeout(stop, 5000)
```

## 响应式语法糖（实验性）

### $ref 语法糖

```vue
<script setup>
// 传统方式
import { ref } from 'vue'
const count = ref(0)
const increment = () => {
  count.value++ // 需要 .value
}

// 使用 $ref 语法糖（需要配置支持）
let count = $ref(0)
const increment = () => {
  count++ // 不需要 .value
}
</script>
```

### $computed 语法糖

```vue
<script setup>
// 传统方式
import { ref, computed } from 'vue'
const count = ref(0)
const doubleCount = computed(() => count.value * 2)

// 使用 $computed 语法糖
let count = $ref(0)
let doubleCount = $computed(() => count * 2)
</script>
```

### $reactive 语法糖

```vue
<script setup>
// 传统方式
import { reactive } from 'vue'
const state = reactive({
  count: 0,
  name: 'Vue'
})

// 使用 $reactive 语法糖
let state = $reactive({
  count: 0,
  name: 'Vue'
})
// 不需要 .value
state.count++
</script>
```

### defineModel 语法糖

Vue3.4+ 引入的 `defineModel` 语法糖简化了 v-model 的实现：

```vue
<!-- 子组件 -->
<template>
  <div>
    <input v-model="modelValue" />
    <p>模型值: {{ modelValue }}</p>
  </div>
</template>

<script setup>
// 使用 defineModel 语法糖
const modelValue = defineModel()

// 可以设置默认值
// const modelValue = defineModel({ default: 'default value' })

// 可以设置类型和验证
// const modelValue = defineModel(String, {
//   required: true,
//   validator: (value) => typeof value === 'string' && value.length > 0
// })
</script>
```

## 高级响应式 API

### customRef - 自定义 ref

创建自定义响应式引用：

```javascript
import { customRef } from 'vue'

// 创建防抖 ref
function useDebounceRef(value, delay = 300) {
  let timeout
  return customRef((track, trigger) => {
    return {
      get() {
        track() // 追踪依赖
        return value
      },
      set(newValue) {
        clearTimeout(timeout)
        timeout = setTimeout(() => {
          value = newValue
          trigger() // 触发更新
        }, delay)
      }
    }
  })
}

// 使用
const debouncedValue = useDebounceRef('', 500)
```

### shallowRef - 浅层响应式

只对 .value 的变更作出响应：

```javascript
import { shallowRef, triggerRef } from 'vue'

const state = shallowRef({
  count: 1
})

// 不会触发更新
state.value.count = 2

// 手动触发更新
triggerRef(state)

// 或者替换整个值会触发更新
state.value = { count: 3 }
```

### triggerRef - 强制触发更新

强制触发浅层响应式引用的更新：

```javascript
import { shallowRef, triggerRef } from 'vue'

const shallow = shallowRef({
  count: 0
})

// 修改内部属性不会触发更新
shallow.value.count++

// 手动触发更新
triggerRef(shallow)
```

## 响应式工具函数

### isRef - 检查是否为 ref

```javascript
import { ref, isRef } from 'vue'

const count = ref(0)
const normal = 1

console.log(isRef(count)) // true
console.log(isRef(normal)) // false
```

### unref - 解包 ref

如果参数是 ref，则返回其 value，否则返回参数本身：

```javascript
import { ref, unref } from 'vue'

const count = ref(0)

console.log(unref(count)) // 0
console.log(unref(1)) // 1
```

### shallowReactive - 浅层响应式对象

只对对象根级属性的变更作出响应：

```javascript
import { shallowReactive } from 'vue'

const state = shallowReactive({
  foo: 1,
  nested: {
    bar: 2
  }
})

// 触发更新
state.foo = 2

// 不会触发更新
state.nested.bar = 3
```

## 在模板中的使用

### 响应式数据的自动解包

在模板中，ref 会自动解包：

```vue
<template>
  <!-- 不需要 .value -->
  <p>{{ count }}</p>
  <p>{{ object.nestedProperty }}</p>
  
  <!-- 计算属性也不需要 .value -->
  <p>{{ doubleCount }}</p>
</template>

<script setup>
import { ref, computed } from 'vue'

const count = ref(0)
const object = ref({ nestedProperty: 'value' })
const doubleCount = computed(() => count.value * 2)
</script>
```

### 事件处理中的响应式

```vue
<template>
  <div>
    <button @click="increment">计数: {{ count }}</button>
    <button @click="reset">重置</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const count = ref(0)

const increment = () => {
  count.value++
}

const reset = () => {
  count.value = 0
}
</script>
```

## 最佳实践

### 1. 合理选择 ref 和 reactive

- 基本类型使用 `ref`
- 对象类型使用 `reactive`
- 需要在模板中解构使用 `toRefs`

### 2. 避免不必要的响应式

对于大型不可变数据，考虑使用普通对象：

```javascript
// 不必要的响应式
const largeImmutableData = reactive(largeObject)

// 更好的做法
const largeImmutableData = largeObject
```

### 3. 正确使用侦听器

```javascript
// 好的做法：明确指定侦听目标
watch(
  () => props.userId,
  async (newId) => {
    if (newId) {
      await fetchData(newId)
    }
  }
)

// 避免：侦听整个 props 对象
watch(props, (newProps) => {
  // 这会侦听所有 props 变化
})
```

### 4. 性能优化

- 使用 `shallowRef` 处理大型不可变对象
- 合理使用 `watch` 的 `flush` 选项
- 避免在模板中使用复杂计算

Vue3 的响应式系统提供了强大而灵活的 API，正确使用这些 API 可以构建高性能的响应式应用。