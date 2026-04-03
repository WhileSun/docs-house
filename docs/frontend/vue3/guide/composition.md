---
title: 组合式API指南
createTime: 2026/02/11 22:20:00
permalink: /frontend/vue3/guide/composition/
---

# Vue3 组合式API指南

组合式API (Composition API) 是 Vue3 中组织组件逻辑的新方式，它提供了更灵活的代码组织方式。

## 什么是组合式API？

组合式API是一组基于函数的API，允许我们更灵活地组织组件逻辑。与选项式API相比，它有以下优势：

- 更好的逻辑复用
- 更清晰的代码组织
- 更好的TypeScript支持
- 更容易的测试

## 核心API

### setup 函数

`setup` 是组合式API的入口点：

```javascript
import { ref, computed } from 'vue'

export default {
  setup() {
    // 响应式数据
    const count = ref(0)
    
    // 计算属性
    const doubleCount = computed(() => count.value * 2)
    
    // 方法
    const increment = () => {
      count.value++
    }
    
    // 返回需要暴露给模板的数据
    return {
      count,
      doubleCount,
      increment
    }
  }
}
```

### 使用 `<script setup>` 语法糖

```vue
<script setup>
import { ref, computed } from 'vue'

// 响应式数据
const count = ref(0)

// 计算属性
const doubleCount = computed(() => count.value * 2)

// 方法
const increment = () => {
  count.value++
}

// 在模板中可以直接使用
</script>

<template>
  <div>
    <p>{{ count }}</p>
    <p>{{ doubleCount }}</p>
    <button @click="increment">增加</button>
  </div>
</template>
```

## 响应式API

### ref - 处理基本类型

```javascript
import { ref } from 'vue'

const count = ref(0)

// 访问值
console.log(count.value) // 0

// 修改值
count.value++

// 在模板中使用时不需要 .value
```

### reactive - 处理对象类型

```javascript
import { reactive } from 'vue'

const state = reactive({
  count: 0,
  name: 'Vue3'
})

// 直接访问和修改
console.log(state.count) // 0
state.count++ // 自动触发更新
```

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
```

### watch - 侦听器

```javascript
import { ref, watch } from 'vue'

const count = ref(0)

// 侦听单个源
watch(count, (newVal, oldVal) => {
  console.log(`count 从 ${oldVal} 变为 ${newVal}`)
})

// 侦听多个源
watch([count, () => state.name], ([newCount, newName], [oldCount, oldName]) => {
  console.log(`count: ${newCount}, name: ${newName}`)
})

// 侦听深层对象
watch(
  () => state.obj,
  (newObj, oldObj) => {
    // newObj 和 oldObj 是深层拷贝
  },
  { deep: true }
)
```

### watchEffect - 副作用侦听器

```javascript
import { ref, watchEffect } from 'vue'

const count = ref(0)

// 自动追踪依赖
watchEffect(() => {
  console.log(`count is ${count.value}`)
})

// 手动停止侦听
const stop = watchEffect(() => {
  console.log(`count is ${count.value}`)
})

// 之后可以停止
stop()
```

## 生命周期钩子

在组合式API中使用生命周期钩子：

```vue
<script setup>
import {
  onMounted,
  onUpdated,
  onUnmounted,
  onBeforeMount,
  onBeforeUpdate,
  onBeforeUnmount
} from 'vue'

onBeforeMount(() => {
  console.log('组件即将挂载')
})

onMounted(() => {
  console.log('组件已挂载')
})

onBeforeUpdate(() => {
  console.log('组件即将更新')
})

onUpdated(() => {
  console.log('组件已更新')
})

onBeforeUnmount(() => {
  console.log('组件即将卸载')
})

onUnmounted(() => {
  console.log('组件已卸载')
})
</script>
```

## 逻辑复用 - Composables

Composables 是使用组合式API组织逻辑的函数：

```javascript
// composables/useCounter.js
import { ref } from 'vue'

export function useCounter(initialValue = 0) {
  const count = ref(initialValue)
  
  const increment = () => count.value++
  const decrement = () => count.value--
  const reset = () => count.value = initialValue
  
  return {
    count,
    increment,
    decrement,
    reset
  }
}
```

在组件中使用：

```vue
<script setup>
import { useCounter } from '@/composables/useCounter'

const { count, increment, decrement, reset } = useCounter(10)
</script>
```

## 模板引用

### 使用 ref 获取DOM元素

```vue
<script setup>
import { ref, onMounted } from 'vue'

const inputRef = ref(null)

onMounted(() => {
  inputRef.value.focus()
})

const focusInput = () => {
  inputRef.value.focus()
}
</script>

<template>
  <input ref="inputRef" />
  <button @click="focusInput">聚焦输入框</button>
</template>
```

### 使用 ref 获取子组件实例

```vue
<!-- ChildComponent.vue -->
<script setup>
import { ref } from 'vue'

const childValue = ref('child value')

const childMethod = () => {
  console.log('Child method called')
}

// 暴露给父组件
defineExpose({
  childValue,
  childMethod
})
</script>
```

```vue
<!-- ParentComponent.vue -->
<script setup>
import { ref, onMounted } from 'vue'
import ChildComponent from './ChildComponent.vue'

const childRef = ref(null)

onMounted(() => {
  // 访问子组件的属性和方法
  console.log(childRef.value.childValue)
  childRef.value.childMethod()
})
</script>

<template>
  <ChildComponent ref="childRef" />
</template>
```

## 与选项式API的对比

### Options API

```javascript
export default {
  data() {
    return {
      count: 0
    }
  },
  computed: {
    doubleCount() {
      return this.count * 2
    }
  },
  methods: {
    increment() {
      this.count++
    }
  },
  mounted() {
    console.log('Component mounted')
  }
}
```

### Composition API

```javascript
import { ref, computed, onMounted } from 'vue'

export default {
  setup() {
    const count = ref(0)
    const doubleCount = computed(() => count.value * 2)
    
    const increment = () => {
      count.value++
    }
    
    onMounted(() => {
      console.log('Component mounted')
    })
    
    return {
      count,
      doubleCount,
      increment
    }
  }
}
```

## TypeScript 支持

### 定义 Props

```vue
<script setup lang="ts">
interface Props {
  title: string
  count?: number
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  count: 0,
  disabled: false
})
</script>
```

### 定义 Emits

```vue
<script setup lang="ts">
const emit = defineEmits<{
  'update:modelValue': [value: string]
  submit: [formData: FormData]
}>()

const submitForm = (data: FormData) => {
  emit('submit', data)
}
</script>
```

组合式API提供了更灵活的代码组织方式，特别适合大型组件和逻辑复用的场景。