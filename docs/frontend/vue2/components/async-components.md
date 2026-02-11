---
title: 异步组件
createTime: 2026/02/10 15:15:00
permalink: /frontend/vue2/components/async-components/
---

# 异步组件

在大型应用中，我们可能需要将应用分割成更小的块，并且只在需要的时候才从服务器加载一个模块。为了实现这一点，Vue 允许你定义一个组件为异步组件。

## 基础用法

### 工厂函数

在 Vue 2.3 中，异步组件的工厂函数可以返回一个如下格式的对象：

```javascript
Vue.component('async-example', function (resolve, reject) {
  // 这个函数执行时，才会开始请求
  setTimeout(function () {
    // 传递组件定义
    resolve({
      template: '<div>I am async!</div>'
    })
  }, 1000)
})
```

### Promise

工厂函数接收一个 resolve 回调，并在收到从服务器下载的组件定义时调用。也可以返回一个 Promise：

```javascript
Vue.component(
  'async-webpack-example',
  // 该 `import` 函数返回一个 `Promise` 对象。
  () => import('./MyComponent.vue')
)
```

### 高级异步组件

```javascript
const AsyncComponent = () => ({
  // 需要加载的组件 (应该是一个 `Promise` 对象)
  component: import('./MyComponent.vue'),
  // 异步组件加载时使用的组件
  loading: LoadingComponent,
  // 加载失败时使用的组件
  error: ErrorComponent,
  // 展示加载时组件的延时时间。默认值是 200 (毫秒)
  delay: 200,
  // 如果提供了超时时间且组件加载也超时了，
  // 则使用加载失败时使用的组件。默认值是：`Infinity`
  timeout: 3000
})
```

## 在单文件组件中使用

### 路由级别异步组件

```javascript
// router/index.js
import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import(/* webpackChunkName: "home" */ '@/views/Home.vue')
    },
    {
      path: '/about',
      name: 'About',
      component: () => import(/* webpackChunkName: "about" */ '@/views/About.vue')
    },
    {
      path: '/user',
      name: 'User',
      component: () => import(/* webpackChunkName: "user" */ '@/views/User.vue'),
      children: [
        {
          path: 'profile',
          name: 'UserProfile',
          component: () => import(/* webpackChunkName: "user" */ '@/views/UserProfile.vue')
        }
      ]
    }
  ]
})
```

### 组件级别异步组件

```vue
<template>
  <div>
    <h1>主页</h1>
    <heavy-component v-if="showHeavyComponent" />
    <button @click="loadHeavyComponent">加载重型组件</button>
  </div>
</template>

<script>
export default {
  name: 'Home',
  components: {
    // 异步组件定义
    HeavyComponent: () => import('@/components/HeavyComponent.vue')
  },
  data() {
    return {
      showHeavyComponent: false
    }
  },
  methods: {
    loadHeavyComponent() {
      this.showHeavyComponent = true
    }
  }
}
</script>
```

## 带加载状态的异步组件

### 自定义加载和错误组件

```vue
<template>
  <div>
    <h1>仪表板</h1>
    <async-chart />
  </div>
</template>

<script>
// 加载组件
const LoadingComponent = {
  template: '<div>加载中...</div>'
}

// 错误组件
const ErrorComponent = {
  props: ['error'],
  template: '<div>加载失败: {{ error }}</div>'
}

export default {
  name: 'Dashboard',
  components: {
    AsyncChart: () => ({
      component: import('@/components/Chart.vue'),
      loading: LoadingComponent,
      error: ErrorComponent,
      delay: 200,
      timeout: 5000
    })
  }
}
</script>
```

### 使用函数式组件作为加载状态

```javascript
// utils/async-component-helpers.js
export const AsyncComponentLoader = {
  functional: true,
  render(h, { data, children }) {
    return h('div', {
      staticClass: 'async-component-loader',
      style: { textAlign: 'center', padding: '20px' }
    }, [
      h('div', { staticClass: 'spinner' }, '🔄'),
      h('p', '正在加载组件...')
    ])
  }
}

export const AsyncComponentError = {
  functional: true,
  props: ['error'],
  render(h, { props }) {
    return h('div', {
      staticClass: 'async-component-error',
      style: { color: 'red', padding: '20px' }
    }, [
      h('h3', '加载失败'),
      h('p', props.error ? props.error.toString() : '未知错误'),
      h('button', {
        on: {
          click: () => window.location.reload()
        }
      }, '重试')
    ])
  }
}
```

使用自定义加载和错误组件：

```javascript
import { AsyncComponentLoader, AsyncComponentError } from '@/utils/async-component-helpers'

export default {
  components: {
    HeavyChart: () => ({
      component: () => import(
        /* webpackChunkName: "charts" */ 
        '@/components/HeavyChart.vue'
      ),
      loading: AsyncComponentLoader,
      error: AsyncComponentError,
      delay: 0, // 立即显示加载状态
      timeout: 10000 // 10秒超时
    })
  }
}
```

## 高级异步组件模式

### 条件异步组件

```javascript
export default {
  components: {
    HeavyComponent: () => {
      if (window.innerWidth > 768) {
        // 在桌面端加载完整版
        return import('@/components/HeavyDesktopComponent.vue')
      } else {
        // 在移动端加载轻量版
        return import('@/components/LightMobileComponent.vue')
      }
    }
  }
}
```

### 带有缓存的异步组件

```javascript
// utils/async-component-cache.js
const componentCache = new Map()

export function cachedAsyncComponent(importFunc, cacheKey) {
  if (componentCache.has(cacheKey)) {
    return componentCache.get(cacheKey)
  }
  
  const promise = importFunc().then(component => {
    componentCache.set(cacheKey, component)
    return component
  })
  
  componentCache.set(cacheKey, promise)
  return promise
}

// 在组件中使用
export default {
  components: {
    CachedChart: () => cachedAsyncComponent(
      () => import('@/components/Chart.vue'),
      'chart-component'
    )
  }
}
```

## 实际应用示例

### 编辑器组件

```vue
<template>
  <div class="editor-page">
    <h1>内容编辑器</h1>
    
    <!-- 主要内容区域 -->
    <div class="content">
      <textarea v-model="content" placeholder="输入内容..."></textarea>
    </div>
    
    <!-- 可选的富文本编辑器 -->
    <div class="editor-toggle">
      <button @click="enableRichEditor = true" :disabled="richEditorEnabled">
        启用富文本编辑器
      </button>
    </div>
    
    <!-- 异步加载的富文本编辑器 -->
    <div v-if="richEditorEnabled" class="rich-editor-container">
      <async-rich-editor 
        v-model="content"
        @ready="onEditorReady"
        @error="onEditorError"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'EditorPage',
  components: {
    AsyncRichEditor: () => ({
      component: () => import(
        /* webpackChunkName: "rich-editor" */ 
        '@/components/RichTextEditor.vue'
      ),
      loading: () => import('@/components/LoadingSpinner.vue'),
      error: () => import('@/components/ComponentError.vue'),
      delay: 0,
      timeout: 10000
    })
  },
  data() {
    return {
      content: '',
      enableRichEditor: false
    }
  },
  computed: {
    richEditorEnabled() {
      return this.enableRichEditor
    }
  },
  methods: {
    onEditorReady() {
      console.log('富文本编辑器已准备就绪')
    },
    onEditorError(error) {
      console.error('富文本编辑器加载失败:', error)
      this.enableRichEditor = false
    }
  }
}
</script>
```

### 数据可视化组件

```vue
<template>
  <div class="analytics-dashboard">
    <h1>数据分析仪表板</h1>
    
    <!-- 基础统计信息 -->
    <div class="basic-stats">
      <div class="stat-card">
        <h3>总用户数</h3>
        <p>{{ stats.totalUsers }}</p>
      </div>
      <div class="stat-card">
        <h3>活跃用户</h3>
        <p>{{ stats.activeUsers }}</p>
      </div>
    </div>
    
    <!-- 可选的图表组件 -->
    <div class="chart-section">
      <h2>用户增长趋势</h2>
      <button @click="loadChart" :disabled="chartLoaded">
        {{ chartLoaded ? '图表已加载' : '加载图表' }}
      </button>
      
      <div v-if="chartLoaded" class="chart-container">
        <async-user-growth-chart 
          :data="chartData"
          :loading="chartLoading"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AnalyticsDashboard',
  components: {
    AsyncUserGrowthChart: () => ({
      component: () => import(
        /* webpackChunkName: "charts" */ 
        '@/components/charts/UserGrowthChart.vue'
      ),
      loading: {
        template: '<div class="chart-placeholder">加载图表中...</div>'
      },
      error: {
        props: ['error'],
        template: '<div class="chart-error">图表加载失败: {{ error }}</div>'
      },
      delay: 200,
      timeout: 5000
    })
  },
  data() {
    return {
      stats: {
        totalUsers: 0,
        activeUsers: 0
      },
      chartData: [],
      chartLoaded: false,
      chartLoading: false
    }
  },
  async created() {
    // 加载基础统计数据
    await this.loadStats()
  },
  methods: {
    async loadStats() {
      const response = await api.getStats()
      this.stats = response.data
    },
    async loadChart() {
      this.chartLoading = true
      try {
        this.chartLoaded = true
        // 加载图表数据
        const response = await api.getChartData()
        this.chartData = response.data
      } catch (error) {
        console.error('加载图表数据失败:', error)
      } finally {
        this.chartLoading = false
      }
    }
  }
}
</script>
```

## Webpack 优化

### 代码分割配置

```javascript
// vue.config.js
module.exports = {
  configureWebpack: {
    optimization: {
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          // 异步组件的公共依赖
          asyncCommon: {
            name: 'async-common',
            test: /[\\/]node_modules[\\/]/,
            minChunks: 2,
            chunks: 'async',
            priority: 10
          }
        }
      }
    }
  }
}
```

### 动态导入注释

```javascript
// 为代码分割命名
const AsyncComponent = () => import(
  /* webpackChunkName: "async-component" */
  './AsyncComponent.vue'
)

// 设置预加载
const PreloadedComponent = () => import(
  /* webpackChunkName: "preloaded" */
  /* webpackPreload: true */
  './PreloadedComponent.vue'
)

// 设置预获取
const PrefetchedComponent = () => import(
  /* webpackChunkName: "prefetched" */
  /* webpackPrefetch: true */
  './PrefetchedComponent.vue'
)
```

## 性能考虑

### 预加载策略

```javascript
// 预测性加载
export default {
  methods: {
    async preloadComponents() {
      // 预加载可能需要的组件
      await Promise.all([
        import('@/components/PossibleComponent1.vue'),
        import('@/components/PossibleComponent2.vue')
      ])
    }
  },
  mounted() {
    // 在空闲时间预加载
    if ('requestIdleCallback' in window) {
      requestIdleCallback(this.preloadComponents)
    } else {
      setTimeout(this.preloadComponents, 1000)
    }
  }
}
```

### 错误处理和回退

```javascript
export default {
  components: {
    AsyncComponent: () => ({
      component: () => import('@/components/HeavyComponent.vue'),
      loading: () => import('@/components/SimpleFallback.vue'),
      error: () => import('@/components/ErrorFallback.vue'),
      delay: 200,
      timeout: 5000,
      // 自定义加载失败处理
      loader: () => {
        return import('@/components/HeavyComponent.vue')
          .catch(() => import('@/components/LightweightFallback.vue'))
      }
    })
  }
}
```

异步组件是优化 Vue 应用性能的重要工具，通过合理使用异步组件，可以显著减少初始加载时间，提升用户体验。