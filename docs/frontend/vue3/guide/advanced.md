---
title: 高级特性
createTime: 2026/02/11 23:10:00
permalink: /frontend/vue3/guide/advanced/
---

# Vue3 高级特性

Vue3 提供了许多高级特性，帮助开发者构建更复杂、更高效的应用。

## Teleport - 传送门

Teleport 允许将组件内容渲染到 DOM 树的任何位置：

```vue
<template>
  <div class="component-container">
    <h2>组件内容</h2>
    
    <!-- 模态框将被渲染到 body 元素下 -->
    <Teleport to="body">
      <div class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <h3>模态框</h3>
          <p>这个内容实际上被渲染到了 body 下</p>
          <button @click="closeModal">关闭</button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
const closeModal = () => {
  // 关闭模态框的逻辑
}
</script>

<style>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style>
```

### 动态目标传送

```vue
<template>
  <div>
    <select v-model="target">
      <option value="#modal-1">模态框 1</option>
      <option value="#modal-2">模态框 2</option>
    </select>
    
    <Teleport :to="target">
      <div class="content">传送的内容</div>
    </Teleport>
    
    <div id="modal-1" class="modal-container">目标 1</div>
    <div id="modal-2" class="modal-container">目标 2</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const target = ref('#modal-1')
</script>
```

## Suspense - 异步组件处理

Suspense 用于优雅地处理异步组件和数据加载：

```vue
<template>
  <div>
    <h2>用户信息</h2>
    <Suspense>
      <template #default>
        <UserProfile :userId="userId" />
      </template>
      <template #fallback>
        <div class="loading">加载中...</div>
      </template>
    </Suspense>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import UserProfile from './UserProfile.vue'

const userId = ref(1)
</script>
```

### 异步组件示例

```vue
<!-- UserProfile.vue -->
<template>
  <div>
    <h3>{{ user.name }}</h3>
    <p>{{ user.email }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps(['userId'])
const user = ref(null)

onMounted(async () => {
  // 模拟异步数据获取
  const response = await fetch(`/api/users/${props.userId}`)
  user.value = await response.json()
})
</script>
```

## 动态组件和异步组件

### 动态组件

使用 `is` 特性动态切换组件：

```vue
<template>
  <div>
    <button 
      v-for="tab in tabs" 
      :key="tab"
      @click="currentTab = tab"
      :class="{ active: currentTab === tab }"
    >
      {{ tab }}
    </button>
    
    <component :is="currentTabComponent" class="tab-content" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Home from './Home.vue'
import About from './About.vue'
import Contact from './Contact.vue'

const tabs = ['Home', 'About', 'Contact']
const currentTab = ref('Home')

const components = {
  Home,
  About,
  Contact
}

const currentTabComponent = computed(() => components[currentTab.value])
</script>
```

### 异步组件

```javascript
import { defineAsyncComponent } from 'vue'

// 基本用法
const AsyncComponent = defineAsyncComponent(() => import('./AsyncComponent.vue'))

// 高级配置
const AdvancedAsyncComponent = defineAsyncComponent({
  // 加载组件的工厂函数
  loader: () => import('./AsyncComponent.vue'),
  
  // 加载时显示的组件
  loadingComponent: LoadingComponent,
  
  // 加载失败时显示的组件
  errorComponent: ErrorComponent,
  
  // 延迟显示加载组件的时间（毫秒）
  delay: 200,
  
  // 超时时间（毫秒），为 0 则永不超时
  timeout: 3000,
  
  // 在加载之前调用
  suspensible: false
})
```

## Mixins 的替代方案

Vue3 推荐使用 Composables 替代 Mixins：

### Vue2 Mixins 示例

```javascript
// userMixin.js
export const userMixin = {
  data() {
    return {
      user: null,
      loading: false
    }
  },
  methods: {
    async loadUser(id) {
      this.loading = true
      try {
        this.user = await fetchUser(id)
      } finally {
        this.loading = false
      }
    }
  },
  created() {
    if (this.autoLoad) {
      this.loadUser(this.userId)
    }
  }
}
```

### Vue3 Composables 替代

```javascript
// composables/useUser.js
import { ref } from 'vue'

export function useUser(autoLoad = false) {
  const user = ref(null)
  const loading = ref(false)
  
  const loadUser = async (id) => {
    loading.value = true
    try {
      user.value = await fetchUser(id)
    } finally {
      loading.value = false
    }
  }
  
  if (autoLoad && userId) {
    loadUser(userId)
  }
  
  return {
    user,
    loading,
    loadUser
  }
}
```

```vue
<!-- 在组件中使用 -->
<template>
  <div v-if="loading">加载中...</div>
  <div v-else-if="user">
    <h2>{{ user.name }}</h2>
    <p>{{ user.email }}</p>
  </div>
</template>

<script setup>
import { useUser } from '@/composables/useUser'

const { user, loading, loadUser } = useUser()

// 在需要时加载用户
loadUser(1)
</script>
```

## 高级响应式 API

### readonly - 创建只读代理

```javascript
import { reactive, readonly } from 'vue'

const original = reactive({ count: 0 })
const copy = readonly(original)

// original.count++ // 可以修改
// copy.count++ // 在开发模式下会警告，生产模式下无效
```

### shallowReactive vs reactive

```javascript
import { reactive, shallowReactive } from 'vue'

// 深层响应式
const deep = reactive({
  nested: {
    count: 0
  }
})

deep.nested.count++ // 触发更新

// 浅层响应式
const shallow = shallowReactive({
  nested: {
    count: 0
  }
})

shallow.nested.count++ // 不触发更新
shallow.nested = { count: 1 } // 触发更新
```

### markRaw - 标记为非响应式

```javascript
import { reactive, markRaw } from 'vue'

const rawObject = markRaw({
  someProperty: 'not reactive'
})

const state = reactive({
  raw: rawObject
})

// 修改 rawObject 不会触发响应式更新
state.raw.someProperty = 'changed' // 不会触发更新
```

## 自定义渲染器

Vue3 允许创建自定义渲染器：

```javascript
import { createRenderer } from 'vue'

// 自定义渲染器，用于渲染到 Canvas
const { render, createApp } = createRenderer({
  // 创建元素
  createElement(type) {
    // 为 Canvas 创建图形元素
    if (type === 'circle') {
      return new Circle()
    } else if (type === 'rect') {
      return new Rectangle()
    }
  },
  
  // 设置元素属性
  setElementAttr(el, key, value) {
    el[key] = value
  },
  
  // 插入元素
  insert(el, parent) {
    parent.addChild(el)
  },
  
  // 删除元素
  remove(el) {
    el.parent.removeChild(el)
  },
  
  // ... 其他平台特定的实现
})
```

## TypeScript 高级用法

### 泛型组件

```vue
<script setup lang="ts" generic="T extends Record<string, any>">
import { ref } from 'vue'

interface Props {
  items: T[]
  getKey?: (item: T) => string | number
}

const props = withDefaults(defineProps<Props>(), {
  getKey: (item: T) => item.id
})

const selectedItem = ref<T | null>(null)
</script>
```

### 类型定义的 Emits

```vue
<script setup lang="ts">
interface User {
  id: number
  name: string
  email: string
}

// 定义带类型的 emits
const emit = defineEmits<{
  'user-selected': [user: User]
  'user-deleted': [id: number]
  'update:users': [users: User[]]
}>()

const selectUser = (user: User) => {
  emit('user-selected', user)
}
</script>
```

## 性能优化技巧

### 1. 使用 v-memo (Vue 3.2+)

```vue
<template>
  <div v-for="item in list" :key="item.id">
    <!-- 只有当 [item.id, selectedId] 变化时才重新渲染 -->
    <div v-memo="[item.id, selectedId]">
      <ExpensiveComponent :item="item" :selected="selectedId === item.id" />
    </div>
  </div>
</template>
```

### 2. 使用 keep-alive 缓存组件

```vue
<template>
  <keep-alive :include="['ComponentA', 'ComponentB']" :exclude="['ComponentC']">
    <component :is="currentView" />
  </keep-alive>
</template>
```

### 3. 使用 v-show vs v-if

- 频繁切换使用 `v-show`
- 条件很少改变使用 `v-if`

### 4. 虚拟滚动

对于大量列表项，使用虚拟滚动：

```vue
<template>
  <div class="virtual-list" @scroll="handleScroll" :style="{ height: containerHeight + 'px' }">
    <div :style="{ height: totalHeight + 'px', position: 'relative' }">
      <div
        v-for="item in visibleItems"
        :key="item.id"
        :style="{ 
          position: 'absolute',
          top: item.top + 'px',
          height: itemHeight + 'px'
        }"
      >
        {{ item.content }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  items: Array,
  itemHeight: {
    type: Number,
    default: 50
  },
  containerHeight: {
    type: Number,
    default: 300
  }
})

const scrollTop = ref(0)

const visibleItems = computed(() => {
  const start = Math.floor(scrollTop.value / props.itemHeight)
  const visibleCount = Math.ceil(props.containerHeight / props.itemHeight)
  const end = Math.min(start + visibleCount, props.items.length)
  
  return props.items.slice(start, end).map((item, index) => ({
    ...item,
    top: (start + index) * props.itemHeight
  }))
})

const totalHeight = computed(() => props.items.length * props.itemHeight)

const handleScroll = (e) => {
  scrollTop.value = e.target.scrollTop
}
</script>
```

## 插件开发

### 创建插件

```javascript
// myPlugin.js
import { ref, computed } from 'vue'

// 插件对象
export default {
  // 插件名称（可选）
  name: 'MyPlugin',
  
  // 安装方法
  install(app, options = {}) {
    // 注册全局组件
    app.component('GlobalComponent', GlobalComponent)
    
    // 注册全局指令
    app.directive('focus', {
      mounted(el) {
        el.focus()
      }
    })
    
    // 添加全局属性
    app.config.globalProperties.$myMethod = function() {
      console.log('Custom method called')
    }
    
    // 提供全局依赖
    app.provide('global-config', options.config)
    
    // 添加全局混入
    app.mixin({
      created() {
        console.log('Component created with myPlugin')
      }
    })
  }
}
```

### 使用插件

```javascript
import { createApp } from 'vue'
import MyPlugin from './plugins/myPlugin.js'

const app = createApp(App)

app.use(MyPlugin, {
  config: {
    apiUrl: 'https://api.example.com'
  }
})
```

## 错误处理

### 全局错误处理器

```javascript
const app = createApp(App)

app.config.errorHandler = (err, instance, info) => {
  // 处理错误
  console.error('Global error:', err)
  console.error('Component instance:', instance)
  console.error('Error info:', info)
  
  // 可以发送错误报告到服务端
  reportError(err, info)
}
```

### 组件级错误处理

```vue
<script setup>
import { onErrorCaptured } from 'vue'

onErrorCaptured((err, instance, info) => {
  console.error('Captured error:', err)
  console.error('Component instance:', instance)
  console.error('Error info:', info)
  
  // 返回 false 可以阻止错误继续向上传播
  return false
})
</script>
```

## 最佳实践

### 1. 合理使用响应式数据

- 避免在响应式对象上添加或删除属性
- 对于大型不可变数据，考虑使用 markRaw
- 合理使用 shallowReactive/shallowRef

### 2. 组件设计原则

- 单一职责原则
- 合理的组件粒度
- 清晰的接口定义

### 3. 性能考虑

- 使用适当的缓存策略
- 避免不必要的重渲染
- 合理使用异步组件

Vue3 的高级特性提供了构建复杂应用所需的各种工具，合理使用这些特性可以创建高性能、可维护的应用。