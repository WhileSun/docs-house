---
title: 性能优化
createTime: 2026/02/11 23:20:00
permalink: /frontend/vue3/guide/performance/
---

# Vue3 性能优化指南

Vue3 在性能方面相比 Vue2 有了显著提升，同时也提供了多种优化手段。

## Vue3 性能改进

### 1. 编译时优化

Vue3 在编译时进行了多项优化：

- 静态提升（hoistStatic）
- 预字符串化（cacheHandlers）
- Block Tree 优化

### 2. 运行时优化

- 更快的虚拟DOM算法
- 更小的打包体积
- 更好的 Tree-shaking

## 组件级优化

### 1. 组件懒加载

```javascript
import { defineAsyncComponent } from 'vue'

// 基本用法
const AsyncComponent = defineAsyncComponent(() => import('./AsyncComponent.vue'))

// 高级配置
const AdvancedAsyncComponent = defineAsyncComponent({
  loader: () => import('./AsyncComponent.vue'),
  loadingComponent: LoadingComponent,
  errorComponent: ErrorComponent,
  delay: 200,
  timeout: 3000
})
```

### 2. 使用 keep-alive 缓存组件

```vue
<template>
  <keep-alive :include="['ComponentA', 'ComponentB']" :exclude="['ComponentC']" :max="10">
    <component :is="currentView" />
  </keep-alive>
</template>
```

### 3. 合理使用 v-show 和 v-if

```vue
<template>
  <!-- 频繁切换使用 v-show -->
  <div v-show="isVisible">内容</div>
  
  <!-- 条件很少改变使用 v-if -->
  <div v-if="isReady">内容</div>
</template>
```

## 渲染优化

### 1. 使用 v-memo (Vue 3.2+)

```vue
<template>
  <div v-for="item in list" :key="item.id">
    <!-- 只有当依赖项变化时才重新渲染 -->
    <div v-memo="[item.id, selectedId]">
      <ExpensiveComponent :item="item" :selected="selectedId === item.id" />
    </div>
  </div>
</template>
```

### 2. 优化列表渲染

```vue
<template>
  <!-- 使用唯一 key 値 -->
  <div v-for="item in items" :key="item.id">
    {{ item.name }}
  </div>
</template>
```

### 3. 避免不必要的响应式

对于大型不可变数据，使用 `markRaw` 或 `shallowReactive`：

```javascript
import { markRaw, shallowReactive } from 'vue'

// 标记为非响应式
const largeImmutableData = markRaw(largeObject)

// 浅层响应式
const shallowState = shallowReactive({
  deep: {
    nested: 'object' // 这个不会变成响应式
  }
})
```

## 组合式API 优化

### 1. 合理使用计算属性

```javascript
import { ref, computed } from 'vue'

export default {
  setup() {
    const items = ref([])
    
    // 复杂计算使用计算属性
    const expensiveValue = computed(() => {
      return items.value
        .filter(item => item.active)
        .map(item => item.processedValue)
        .reduce((sum, value) => sum + value, 0)
    })
    
    return { expensiveValue }
  }
}
```

### 2. 优化侦听器

```javascript
import { ref, watch, watchEffect } from 'vue'

export default {
  setup() {
    const count = ref(0)
    
    // 仅在需要时触发
    watch(count, (newVal, oldVal) => {
      console.log(`Count changed from ${oldVal} to ${newVal}`)
    }, { immediate: false })
    
    // 避免不必要的副作用
    watchEffect(() => {
      if (count.value > 10) {
        console.log('Count is greater than 10')
      }
    })
  }
}
```

## 事件优化

### 1. 避免内联事件处理器

```vue
<template>
  <!-- 不推荐 -->
  <button @click="() => doSomething(param)">Click</button>
  
  <!-- 推荐 -->
  <button @click="handleClick">Click</button>
</template>

<script setup>
const handleClick = () => {
  doSomething(param)
}
</script>
```

### 2. 使用事件委托

对于大量相似元素，使用事件委托：

```vue
<template>
  <ul @click="handleItemClick">
    <li v-for="item in items" :data-id="item.id">{{ item.name }}</li>
  </ul>
</template>

<script setup>
const handleItemClick = (event) => {
  const id = event.target.dataset.id
  if (id) {
    // 处理点击事件
    console.log('Item clicked:', id)
  }
}
</script>
```

## 组件通信优化

### 1. 合理使用 provide/inject

对于跨层级通信，使用 provide/inject 比 props drilling 更高效：

```vue
<!-- 祖先组件 -->
<script setup>
import { provide, reactive } from 'vue'

const state = reactive({
  theme: 'dark',
  user: null
})

provide('app-state', state)
</script>
```

```vue
<!-- 后代组件 -->
<script setup>
import { inject } from 'vue'

const state = inject('app-state')
</script>
```

### 2. 避免不必要的事件传递

```vue
<!-- 不推荐：多层事件传递 -->
<!-- 父组件 -->
<ChildComponent @custom-event="handleCustomEvent" />

<!-- 子组件 -->
<GrandChildComponent @custom-event="$emit('custom-event')" />

<!-- 孙组件 -->
<button @click="$emit('custom-event')">触发事件</button>

<!-- 推荐：使用 provide/inject 或全局状态管理 -->
```

## 虚拟滚动

对于大量数据的列表，使用虚拟滚动：

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
          height: itemHeight + 'px',
          width: '100%'
        }"
      >
        {{ item.content }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  items: Array,
  itemHeight: {
    type: Number,
    default: 50
  },
  containerHeight: {
    type: Number,
    default: 400
  }
})

const scrollTop = ref(0)

const visibleItems = computed(() => {
  const start = Math.floor(scrollTop.value / props.itemHeight)
  const visibleCount = Math.ceil(props.containerHeight / props.itemHeight)
  const end = Math.min(start + visibleCount + 5, props.items.length) // 添加缓冲
  const startIndex = Math.max(0, start - 5) // 添加缓冲
  
  return props.items.slice(startIndex, end).map((item, index) => ({
    ...item,
    top: (startIndex + index) * props.itemHeight
  }))
})

const totalHeight = computed(() => props.items.length * props.itemHeight)

const handleScroll = (e) => {
  scrollTop.value = e.target.scrollTop
}
</script>
```

## 图片优化

### 1. 懒加载图片

```vue
<template>
  <img 
    v-for="image in images" 
    :key="image.id"
    :data-src="image.src"
    :alt="image.alt"
    class="lazy-image"
    @load="onImageLoad"
  />
</template>

<script setup>
import { onMounted } from 'vue'

const onImageLoad = (event) => {
  event.target.classList.add('loaded')
}

onMounted(() => {
  // 实现 Intersection Observer 懒加载
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target
        img.src = img.dataset.src
        observer.unobserve(img)
      }
    })
  })
  
  document.querySelectorAll('.lazy-image').forEach(img => {
    observer.observe(img)
  })
})
</script>
```

### 2. 使用 WebP 格式

```vue
<template>
  <picture>
    <source :srcset="webpUrl" type="image/webp">
    <img :src="fallbackUrl" :alt="alt">
  </picture>
</template>
```

## 代码分割和懒加载

### 1. 路由级别的代码分割

```javascript
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue') // 懒加载
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/About.vue') // 懒加载
  }
]
```

### 2. 组件级别的代码分割

```vue
<script setup>
import { defineAsyncComponent, ref } from 'vue'

// 懒加载重型组件
const HeavyComponent = defineAsyncComponent(() => 
  import('./HeavyComponent.vue')
)

const showComponent = ref(false)
</script>
```

## 状态管理优化

### 1. 使用 Pinia

```javascript
// stores/user.js
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    profile: null,
    preferences: {}
  }),
  
  getters: {
    isLoggedIn: (state) => !!state.profile,
    displayName: (state) => state.profile?.name || 'Guest'
  },
  
  actions: {
    async fetchProfile() {
      if (!this.profile) {
        this.profile = await api.getUserProfile()
      }
    }
  },
  
  // 持久化
  persist: {
    key: 'user-store',
    storage: localStorage
  }
})
```

### 2. 合理使用 storeToRefs

```javascript
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user'

export default {
  setup() {
    const userStore = useUserStore()
    // 只解构需要的响应式引用
    const { profile, isLoggedIn } = storeToRefs(userStore)
    
    return {
      profile,
      isLoggedIn
    }
  }
}
```

## 性能监测

### 1. 使用 Vue DevTools

安装 Vue DevTools 来监测组件性能和响应式数据变化。

### 2. 性能标记

```javascript
// 在组件中添加性能监测
export default {
  setup() {
    onMounted(() => {
      performance.mark('component-mount-start')
      
      // 组件初始化逻辑
      
      performance.mark('component-mount-end')
      performance.measure('component-mount', 'component-mount-start', 'component-mount-end')
    })
  }
}
```

### 3. 使用 Performance API

```javascript
// 监测渲染性能
const startRender = performance.now()
// 渲染逻辑
const endRender = performance.now()
console.log(`渲染耗时: ${endRender - startRender}ms`)
```

## 构建优化

### 1. Tree Shaking

确保使用 ES Module 语法，以便实现更好的 Tree Shaking：

```javascript
// 好的做法 - 可以被 Tree Shaking
import { ref, computed } from 'vue'

// 避免 - 整个模块都会被打包
import Vue from 'vue'
```

### 2. 第三方库优化

```javascript
// 按需导入，而不是导入整个库
import debounce from 'lodash-es/debounce' // 而不是 import { debounce } from 'lodash'
```

## 内存管理

### 1. 清理定时器和事件监听器

```vue
<script setup>
import { onMounted, onUnmounted } from 'vue'

let timer

onMounted(() => {
  timer = setInterval(() => {
    // 定时任务
  }, 1000)
})

onUnmounted(() => {
  clearInterval(timer) // 清理定时器
})
</script>
```

### 2. 清理全局事件监听器

```vue
<script setup>
import { onMounted, onUnmounted } from 'vue'

const handleResize = () => {
  // 处理窗口大小变化
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>
```

## 最佳实践总结

1. **组件设计**: 保持组件的单一职责
2. **响应式数据**: 避免不必要的响应式转换
3. **列表渲染**: 使用唯一 key 値
4. **事件处理**: 避免内联处理器和及时清理监听器
5. **代码分割**: 合理使用懒加载
6. **状态管理**: 使用 Pinia 进行状态管理
7. **性能监测**: 定期监测应用性能
8. **构建优化**: 配置适当的构建选项

通过遵循这些性能优化策略，可以显著提升 Vue3 应用的性能和用户体验。