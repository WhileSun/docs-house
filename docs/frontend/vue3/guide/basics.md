---
title: 基础指南
createTime: 2026/02/11 22:10:00
permalink: /frontend/vue3/guide/basics/
---

# Vue3 基础指南

本指南将介绍 Vue3 的基础概念和使用方法。

## 创建第一个 Vue3 应用

### 使用 Vite 创建项目

```bash
npm create vue@latest
```

### 手动创建应用

```javascript
import { createApp } from 'vue'

const app = createApp({
  data() {
    return {
      message: 'Hello Vue3!'
    }
  }
})

app.mount('#app')
```

## 响应式基础

### ref - 处理基本类型

```javascript
import { ref } from 'vue'

const count = ref(0)
console.log(count.value) // 0
count.value++
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

## 模板语法

### 插值

```vue
<template>
  <p>{{ message }}</p>
  <p>{{ message.toUpperCase() }}</p>
</template>
```

### 指令

#### 条件渲染

```vue
<template>
  <div v-if="seen">现在你看到我了</div>
  <div v-else>现在你看不到我了</div>
</template>
```

#### 列表渲染

```vue
<template>
  <ul>
    <li v-for="item in items" :key="item.id">
      {{ item.name }}
    </li>
  </ul>
</template>
```

#### 事件处理

```vue
<template>
  <button @click="counter++">点击次数: {{ counter }}</button>
</template>

<script setup>
import { ref } from 'vue'

const counter = ref(0)
</script>
```

## 组件基础

### 定义组件

```vue
<!-- MyComponent.vue -->
<template>
  <h1>{{ greeting }}</h1>
</template>

<script setup>
import { ref } from 'vue'

const greeting = ref('Hello Vue3!')
</script>
```

### 使用组件

```vue
<template>
  <MyComponent />
</template>

<script setup>
import MyComponent from './MyComponent.vue'
</script>
```

## Props

### 定义 Props

```vue
<!-- ChildComponent.vue -->
<template>
  <h2>{{ title }}</h2>
  <p>{{ content }}</p>
</template>

<script setup>
defineProps({
  title: String,
  content: {
    type: String,
    required: true
  }
})
</script>
```

### 传递 Props

```vue
<template>
  <ChildComponent 
    title="标题" 
    content="内容" 
  />
</template>
```

## 事件

### 定义和触发事件

```vue
<!-- ChildComponent.vue -->
<template>
  <button @click="notifyParent">通知父组件</button>
</template>

<script setup>
const emit = defineEmits(['notify'])

const notifyParent = () => {
  emit('notify', '来自子组件的消息')
}
</script>
```

### 监听事件

```vue
<template>
  <ChildComponent @notify="handleNotification" />
</template>

<script setup>
const handleNotification = (message) => {
  console.log(message) // '来自子组件的消息'
}
</script>
```

## 计算属性和侦听器

### 计算属性

```vue
<script setup>
import { ref, computed } from 'vue'

const firstName = ref('Foo')
const lastName = ref('Bar')

const fullName = computed(() => {
  return firstName.value + ' ' + lastName.value
})
</script>
```

### 侦听器

```vue
<script setup>
import { ref, watch } from 'vue'

const question = ref('')
const answer = ref('Questions usually contain a question mark. ;-)')

// 侦听一个问题的变化
watch(question, async (newQuestion, oldQuestion) => {
  if (newQuestion.indexOf('?') > -1) {
    answer.value = 'Thinking...'
    try {
      const res = await fetch('https://yesno.wtf/api')
      answer.value = (await res.json()).answer
    } catch (error) {
      answer.value = 'Error! Could not reach the API. ' + error
    }
  }
})
</script>
```

## 生命周期钩子

```vue
<script setup>
import { 
  onMounted, 
  onUpdated, 
  onUnmounted 
} from 'vue'

onMounted(() => {
  console.log('组件已挂载')
})

onUpdated(() => {
  console.log('组件已更新')
})

onUnmounted(() => {
  console.log('组件已卸载')
})
</script>
```

## 模板引用

```vue
<template>
  <div ref="root">This is a root element</div>
  <button @click="logRoot">Log root</button>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const root = ref(null)

onMounted(() => {
  // DOM 元素将在初始渲染后分配给 ref
  console.log(root.value) // <div>This is a root element</div>
})

const logRoot = () => {
  console.log(root.value)
}
</script>
```

这些是 Vue3 的基础概念，掌握了这些内容后，您可以开始构建简单的 Vue3 应用了。