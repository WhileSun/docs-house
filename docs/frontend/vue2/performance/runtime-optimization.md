---
title: 运行时优化
createTime: 2026/02/10 15:00:00
permalink: /frontend/vue2/performance/runtime-optimization/
---

# 运行时优化

运行时优化是指在应用运行过程中提升性能的技术和策略。这些优化直接影响用户体验，包括渲染性能、内存使用和响应速度等方面。

## 渲染性能优化

### 使用 key 属性

在使用 v-for 时，始终为每个元素提供一个唯一的 key 属性，以便 Vue 能够高效地跟踪每个节点的身份：

```html
<!-- 不推荐 -->
<div v-for="item in items">{{ item.name }}</div>

<!-- 推荐 -->
<div v-for="item in items" :key="item.id">{{ item.name }}</div>
```

### 避免在 v-for 中使用复杂表达式

```html
<!-- 不推荐 -->
<div v-for="item in items" :style="{ backgroundColor: item.colors.bg }">
  {{ item.name.toUpperCase() }}
</div>

<!-- 推荐 -->
<div v-for="item in items" :style="getItemStyle(item)" :key="item.id">
  {{ getItemName(item) }}
</div>
```

```javascript
methods: {
  getItemStyle(item) {
    return {
      backgroundColor: item.colors.bg
    }
  },
  getItemName(item) {
    return item.name.toUpperCase()
  }
}
```

### 使用计算属性缓存

计算属性是基于它们的响应式依赖进行缓存的，只在相关响应式依赖发生改变时它们才会重新求值：

```javascript
computed: {
  expensiveValue() {
    // 这个计算属性会基于其依赖进行缓存
    return this.items.filter(item => item.active).map(item => item.name).join(', ')
  }
}
```

## 组件优化

### 使用 v-show 和 v-if 的正确时机

- `v-if` 有更高的切换开销，适用于条件很少改变的情况
- `v-show` 有更高的初始渲染开销，适用于频繁切换的情况

```html
<!-- 频繁切换使用 v-show -->
<button @click="toggleSidebar">切换侧边栏</button>
<sidebar v-show="showSidebar" />

<!-- 很少改变的条件使用 v-if -->
<admin-panel v-if="isAdmin" />
```

### 使用 Object.freeze() 阻止响应式转换

对于大型的静态数据列表，使用 Object.freeze() 可以避免将其转换为响应式数据：

```javascript
export default {
  data() {
    return {
      staticList: []
    }
  },
  async created() {
    const largeStaticList = await api.getLargeList()
    // 对于不会改变的大型列表，使用 freeze 遞免响应式转换
    this.staticList = Object.freeze(largeStaticList)
  }
}
```

## 事件优化

### 事件节流和防抖

```javascript
// 防抖
export default {
  methods: {
    handleInput: _.debounce(function (e) {
      // 处理输入事件
      this.search(e.target.value)
    }, 500)
  }
}

// 节流
export default {
  methods: {
    handleScroll: _.throttle(function () {
      // 处理滚动事件
      this.updatePosition()
    }, 16)
  }
}
```

### 移除未使用的事件监听器

```javascript
export default {
  mounted() {
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    // 记得移除事件监听器
    window.removeEventListener('resize', this.handleResize)
  }
}
```

## 列表渲染优化

### 大列表虚拟滚动

对于大量数据的列表，考虑使用虚拟滚动：

```vue
<template>
  <div class="virtual-list" @scroll="handleScroll">
    <div :style="{ height: totalHeight + 'px' }" class="scroll-area">
      <div :style="{ transform: translateY }" class="list-content">
        <div
          v-for="item in visibleItems"
          :key="item.id"
          class="list-item"
          :style="{ height: itemHeight + 'px' }"
        >
          {{ item.content }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      items: [], // 所有数据
      visibleItems: [], // 可见的项目
      scrollTop: 0,
      containerHeight: 400,
      itemHeight: 50
    }
  },
  computed: {
    totalHeight() {
      return this.items.length * this.itemHeight
    },
    visibleCount() {
      return Math.ceil(this.containerHeight / this.itemHeight) + 1
    },
    startIndex() {
      return Math.floor(this.scrollTop / this.itemHeight)
    },
    endIndex() {
      return Math.min(this.startIndex + this.visibleCount, this.items.length)
    },
    translateY() {
      return this.startIndex * this.itemHeight
    }
  },
  watch: {
    scrollTop() {
      this.updateVisibleItems()
    }
  },
  methods: {
    handleScroll(event) {
      this.scrollTop = event.target.scrollTop
    },
    updateVisibleItems() {
      this.visibleItems = this.items.slice(this.startIndex, this.endIndex)
    }
  }
}
</script>
```

### 分页加载

```javascript
export default {
  data() {
    return {
      items: [],
      currentPage: 1,
      pageSize: 20,
      loading: false
    }
  },
  methods: {
    async loadMore() {
      if (this.loading) return
      
      this.loading = true
      try {
        const newItems = await api.getItems({
          page: this.currentPage,
          size: this.pageSize
        })
        this.items = this.items.concat(newItems)
        this.currentPage++
      } finally {
        this.loading = false
      }
    }
  }
}
```

## 组件缓存

### 使用 keep-alive 优化组件缓存

对于需要频繁切换但内容不变的组件，使用 keep-alive 缓存：

```html
<keep-alive>
  <component :is="currentView">
    <!-- 非活动组件将被缓存 -->
  </component>
</keep-alive>

<!-- 或者有条件地缓存 -->
<keep-alive include="a,b">
  <component :is="currentView">
    <!-- 将缓存 name 为 a 或 b 的组件 -->
  </component>
</keep-alive>

<keep-alive exclude="c">
  <component :is="currentView">
    <!-- c 组件将不会被缓存 -->
  </component>
</keep-alive>
```

## 内存优化

### 及时清理大型数据结构

```javascript
export default {
  data() {
    return {
      largeDataStructure: null
    }
  },
  beforeDestroy() {
    // 清理大型数据结构
    this.largeDataStructure = null
    
    // 清理定时器
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }
}
```

### 遵活使用 v-if 和 v-show

- 使用 `v-if` 移除不需要的 DOM 元素，释放内存
- 使用 `v-show` 保持 DOM 结构，适用于频繁切换

## 异步组件优化

### 组件懒加载

使用动态导入实现组件懒加载：

```javascript
// 路由级别的懒加载
const routes = [
  {
    path: '/home',
    component: () => import('../views/Home.vue') // 懒加载
  },
  {
    path: '/about',
    component: () => import('../views/About.vue') // 懒加载
  }
]

// 组件级别的懒加载
export default {
  components: {
    HeavyComponent: () => import('@/components/HeavyComponent.vue')
  }
}
```

### 带有加载状态的懒加载

```javascript
const AsyncComponent = () => ({
  // 需要加载的组件 (应该是一个 Promise 对象)
  component: import('./MyComponent.vue'),
  // 异步组件加载时使用的组件
  loading: import('./LoadingComponent.vue'),
  // 加载失败时使用的组件
  error: import('./ErrorComponent.vue'),
  // 展示加载时组件的延时时间。默认值是 200 (毫秒)
  delay: 200,
  // 如果提供了超时时间且组件加载也超时了，
  // 则使用加载失败时使用的组件。默认值是：Infinity
  timeout: 3000
})
```

## Vue 特定优化

### 使用函数式组件

对于无状态、只负责渲染的组件，可以使用函数式组件：

```javascript
// functional-list-item.vue
export default {
  functional: true,
  props: ['item'],
  render(h, { props }) {
    return h('div', { class: 'list-item' }, [
      h('span', { class: 'item-name' }, props.item.name),
      h('span', { class: 'item-desc' }, props.item.description)
    ])
  }
}
```

### 遵活使用 v-memo (Vue 3.2+)

虽然这是 Vue 3 的功能，但提及以作对比：

在 Vue 2 中，我们使用计算属性来达到类似效果：

```javascript
computed: {
  memoizedValue() {
    // 只在依赖变化时重新计算
    return this.expensiveCalculation()
  }
}
```

## 实际优化示例

### 优化前的组件

```javascript
// 未优化的组件
export default {
  data() {
    return {
      items: [],
      searchTerm: ''
    }
  },
  computed: {
    filteredItems() {
      // 每次都执行过滤操作
      return this.items.filter(item => 
        item.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      ).map(item => ({
        ...item,
        processed: this.processComplexData(item)
      }))
    }
  },
  methods: {
    processComplexData(item) {
      // 复杂的处理逻辑
      return item.data.reduce((sum, val) => sum + val.value, 0)
    }
  }
}
```

### 优化后的组件

```javascript
// 优化后的组件
export default {
  data() {
    return {
      items: [],
      searchTerm: ''
    }
  },
  computed: {
    filteredItems() {
      const lowerSearchTerm = this.searchTerm.toLowerCase()
      return this.items.filter(item => 
        item.name.toLowerCase().includes(lowerSearchTerm)
      )
    },
    processedItems() {
      // 只在 filteredItems 变化时才处理
      return this.filteredItems.map(item => ({
        ...item,
        processed: this.getCachedProcessedData(item.id, item)
      }))
    }
  },
  methods: {
    // 使用缓存避免重复计算
    getCachedProcessedData(id, item) {
      if (!this.processedCache) {
        this.processedCache = new Map()
      }
      
      if (!this.processedCache.has(id)) {
        const result = this.processComplexData(item)
        this.processedCache.set(id, result)
      }
      
      return this.processedCache.get(id)
    },
    
    processComplexData(item) {
      // 复杂的处理逻辑
      return item.data.reduce((sum, val) => sum + val.value, 0)
    }
  }
}
```

## 性能监控

### 监控组件渲染时间

```javascript
export default {
  beforeUpdate() {
    this.startTime = performance.now()
  },
  updated() {
    const renderTime = performance.now() - this.startTime
    if (renderTime > 16) { // 超过一帧的时间
      console.warn(`Slow component render: ${renderTime}ms`)
    }
  }
}
```

### 使用 Vue DevTools

Vue DevTools 提供了性能面板，可以监控组件的渲染性能和更新频率。

运行时优化是提升 Vue 应用用户体验的关键，通过实施这些优化策略，可以显著提升应用的性能表现。