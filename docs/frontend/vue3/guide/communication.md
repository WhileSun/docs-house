---
title: 组件通信
createTime: 2026/02/11 22:30:00
permalink: /frontend/vue3/guide/communication/
---

# Vue3 组件通信

在Vue应用中，组件间通信是构建复杂应用的关键。本指南将介绍Vue3中各种组件通信方式。

## 父子组件通信

### Props - 父传子

**父组件:**
```vue
<template>
  <ChildComponent 
    :message="parentMessage" 
    :count="parentCount"
    :user="userInfo"
  />
</template>

<script setup>
import { ref } from 'vue'
import ChildComponent from './ChildComponent.vue'

const parentMessage = ref('Hello from parent')
const parentCount = ref(42)
const userInfo = ref({
  name: 'Vue Developer',
  role: 'Frontend'
})
</script>
```

**子组件:**
```vue
<template>
  <div>
    <p>Message: {{ message }}</p>
    <p>Count: {{ count }}</p>
    <p>User: {{ user.name }} ({{ user.role }})</p>
  </div>
</template>

<script setup>
const props = defineProps({
  message: {
    type: String,
    required: true
  },
  count: {
    type: Number,
    default: 0
  },
  user: {
    type: Object,
    default: () => ({})
  }
})
</script>
```

### Emit - 子传父

**子组件:**
```vue
<template>
  <div>
    <input v-model="localValue" @input="updateValue" />
    <button @click="notifyParent">通知父组件</button>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue', 'notify'])

const localValue = ref(props.modelValue)

// 监听props变化更新本地值
watch(() => props.modelValue, (newVal) => {
  localValue.value = newVal
})

// 更新父组件的值
const updateValue = () => {
  emit('update:modelValue', localValue.value)
}

// 通知父组件
const notifyParent = () => {
  emit('notify', {
    message: '子组件的通知',
    timestamp: Date.now()
  })
}
</script>
```

**父组件使用:**
```vue
<template>
  <ChildComponent 
    v-model="inputValue"
    @notify="handleNotification"
  />
  <p>当前值: {{ inputValue }}</p>
</template>

<script setup>
import { ref } from 'vue'
import ChildComponent from './ChildComponent.vue'

const inputValue = ref('Initial Value')

const handleNotification = (data) => {
  console.log('收到通知:', data)
}
</script>
```

## 祖孙组件通信

### Provide/Inject - 跨层级通信

**祖先组件:**
```vue
<template>
  <div>
    <h2>祖先组件</h2>
    <input v-model="theme" placeholder="主题" />
    <ChildComponent />
  </div>
</template>

<script setup>
import { ref, provide, readonly } from 'vue'
import ChildComponent from './ChildComponent.vue'

const theme = ref('light')
const user = ref({
  name: 'Vue Developer',
  level: 'Senior'
})

// 提供响应式数据
provide('theme', readonly(theme)) // 使用readonly防止子组件修改
provide('user', user) // 可以修改
provide('updateTheme', (newTheme) => {
  theme.value = newTheme
})
</script>
```

**孙子组件:**
```vue
<template>
  <div :class="`theme-${currentTheme}`">
    <h3>孙子组件</h3>
    <p>当前主题: {{ currentTheme }}</p>
    <p>用户: {{ currentUser.name }}</p>
    <button @click="changeTheme">切换主题</button>
  </div>
</template>

<script setup>
import { inject } from 'vue'

// 注入数据
const currentTheme = inject('theme')
const currentUser = inject('user')
const updateTheme = inject('updateTheme')

const changeTheme = () => {
  updateTheme(currentTheme.value === 'light' ? 'dark' : 'light')
}
</script>
```

## 兄弟组件通信

### 通过共同父组件

```vue
<!-- 父组件 -->
<template>
  <div>
    <ComponentA @data-change="handleDataChange" />
    <ComponentB :shared-data="sharedData" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ComponentA from './ComponentA.vue'
import ComponentB from './ComponentB.vue'

const sharedData = ref('')

const handleDataChange = (newData) => {
  sharedData.value = newData
}
</script>
```

### 使用事件总线 (mitt)

首先安装mitt:
```bash
npm install mitt
```

创建事件总线:
```javascript
// utils/eventBus.js
import mitt from 'mitt'
export default mitt()
```

**组件A:**
```vue
<template>
  <button @click="sendData">发送数据到组件B</button>
</template>

<script setup>
import eventBus from '@/utils/eventBus'

const sendData = () => {
  eventBus.emit('data-from-a', {
    message: 'Hello from Component A',
    timestamp: Date.now()
  })
}
</script>
```

**组件B:**
```vue
<template>
  <div>
    <p>接收到的数据: {{ receivedData }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import eventBus from '@/utils/eventBus'

const receivedData = ref('')

const handleData = (data) => {
  receivedData.value = data.message
}

onMounted(() => {
  eventBus.on('data-from-a', handleData)
})

onUnmounted(() => {
  eventBus.off('data-from-a', handleData)
})
</script>
```

## 全局状态管理

### 使用 Pinia (推荐)

安装Pinia:
```bash
npm install pinia
```

**1. 创建store:**
```javascript
// stores/counter.js
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  // 状态
  state: () => ({
    count: 0,
    name: 'Vue3',
    items: []
  }),
  
  // 计算属性
  getters: {
    doubleCount: (state) => state.count * 2,
    doubleCountPlusOne(): number {
      return this.doubleCount + 1
    }
  },
  
  // 动作
  actions: {
    increment() {
      this.count++
    },
    decrement() {
      this.count--
    },
    reset() {
      this.count = 0
    },
    async fetchData() {
      try {
        // 模拟API调用
        const response = await fetch('/api/data')
        this.items = await response.json()
      } catch (error) {
        console.error('Failed to fetch data:', error)
      }
    }
  }
})
```

**2. 在main.js中安装:**
```javascript
// main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.mount('#app')
```

**3. 在组件中使用:**
```vue
<template>
  <div>
    <p>计数: {{ store.count }}</p>
    <p>双倍计数: {{ store.doubleCount }}</p>
    <button @click="store.increment">增加</button>
    <button @click="store.decrement">减少</button>
    <button @click="store.reset">重置</button>
  </div>
</template>

<script setup>
import { useCounterStore } from '@/stores/counter'

const store = useCounterStore()
</script>
```

## 插槽 (Slots)

### 默认插槽

```vue
<!-- Card.vue -->
<template>
  <div class="card">
    <div class="card-body">
      <slot></slot>
    </div>
  </div>
</template>
```

```vue
<!-- 使用 -->
<Card>
  <p>这是卡片内容</p>
</Card>
```

### 具名插槽

```vue
<!-- Layout.vue -->
<template>
  <div class="layout">
    <header>
      <slot name="header"></slot>
    </header>
    <main>
      <slot></slot>
    </main>
    <footer>
      <slot name="footer"></slot>
    </footer>
  </div>
</template>
```

```vue
<!-- 使用 -->
<Layout>
  <template #header>
    <h1>页面标题</h1>
  </template>
  
  <p>主要内容</p>
  
  <template #footer>
    <p>版权信息</p>
  </template>
</Layout>
```

### 作用域插槽

```vue
<!-- UserList.vue -->
<template>
  <ul>
    <li v-for="user in users" :key="user.id">
      <slot :user="user" :index="user.index" :is-admin="user.role === 'admin'">
        <!-- 默认内容 -->
        {{ user.name }}
      </slot>
    </li>
  </ul>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps(['users'])

// 计算索引
const usersWithIndex = computed(() => {
  return props.users.map((user, index) => ({
    ...user,
    index
  }))
})
</script>
```

```vue
<!-- 使用 -->
<UserList :users="userList">
  <template #default="{ user, index, isAdmin }">
    <span :class="{ admin: isAdmin }">
      {{ index + 1 }}. {{ user.name }} 
      <span v-if="isAdmin">(Admin)</span>
    </span>
  </template>
</UserList>
```

## 通信方式选择建议

| 场景 | 推荐方式 | 说明 |
|------|----------|------|
| 父传子 | Props | 简单直接，类型安全 |
| 子传父 | Emit | 事件驱动，清晰明确 |
| 跨层级 | Provide/Inject | 靠活，但避免滥用 |
| 全局状态 | Pinia | 适合复杂应用的状态管理 |
| 兄弟组件 | 共同父组件或事件总线 | 简单场景用父组件，复杂场景用事件总线 |
| 内分发 | 插槽 | 组件复用和定制化 |

## 最佳实践

### 1. Props 验证

```javascript
const props = defineProps({
  // 基础类型检查
  propA: Number,
  // 多种可能类型
  propB: [String, Number],
  // 必填的字符串
  propC: {
    type: String,
    required: true
  },
  // 带有默认值的数字
  propD: {
    type: Number,
    default: 100
  },
  // 带有默认值的对象
  propE: {
    type: Object,
    // 对象或数组默认值必须从工厂函数获取
    default: () => ({ message: 'hello' })
  },
  // 自定义验证函数
  propF: {
    validator(value) {
      // 这个值必须匹配下列字符串中的一个
      return ['success', 'warning', 'danger'].includes(value)
    }
  }
})
```

### 2. 事件命名规范

- 使用 kebab-case 命名自定义事件
- 遵循语义化命名，如 `update:model-value`、`item-click`

### 3. 靠活的组件设计

设计组件时考虑多种使用场景，提供足够的灵活性：

```vue
<!-- 灝活的列表组件 -->
<template>
  <ul class="flexible-list">
    <li 
      v-for="(item, index) in items" 
      :key="item.id || index"
      class="list-item"
    >
      <!-- 可以自定义内容 -->
      <slot 
        :item="item" 
        :index="index"
        :default-content="defaultContent(item)"
      >
        {{ defaultContent(item) }}
      </slot>
    </li>
  </ul>
</template>

<script setup>
const props = defineProps({
  items: {
    type: Array,
    default: () => []
  }
})

const defaultContent = (item) => {
  return typeof item === 'string' ? item : item.label || item.text || item.name
}
</script>
```

通过合理选择组件通信方式，可以构建出结构清晰、易于维护的Vue应用。