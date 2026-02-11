---
title: 懒加载
createTime: 2026/02/10 15:20:00
permalink: /frontend/vue2/routing/lazy-loading/
---

# 懒加载

懒加载（Lazy Loading）是 Vue Router 中的一项重要功能，它允许我们将应用的不同部分分割成独立的代码块，只在需要时才加载这些代码块，从而减少初始加载时间。

## 为什么需要懒加载

在大型应用中，如果将所有代码打包成一个文件，会导致初始加载时间过长。通过懒加载，我们可以：

- 减少初始包大小
- 提升首屏加载速度
- 按需加载功能模块
- 优化用户体验

## 基础懒加载

### 使用动态导入

在 Vue Router 中，可以通过动态导入（Dynamic Import）实现懒加载：

```javascript
// router/index.js
import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const routes = [
  {
    path: '/',
    name: 'Home',
    // 懒加载 Home 组件
    component: () => import(/* webpackChunkName: "home" */ '@/views/Home.vue')
  },
  {
    path: '/about',
    name: 'About',
    // 懒加载 About 组件
    component: () => import(/* webpackChunkName: "about" */ '@/views/About.vue')
  }
]

export default new Router({
  mode: 'history',
  routes
})
```

### Webpack Chunk Name 注释

使用 `webpackChunkName` 注释可以为生成的代码块指定名称，便于识别和调试：

```javascript
// 带有 chunk name 的懒加载
const Dashboard = () => import(
  /* webpackChunkName: "dashboard" */
  '@/views/Dashboard.vue'
)

const Profile = () => import(
  /* webpackChunkName: "profile" */
  '@/views/Profile.vue'
)
```

## 高级懒加载策略

### 路由分组懒加载

将相关的路由组件打包到同一个代码块中：

```javascript
// 用户相关路由打包到同一个 chunk
const UserDashboard = () => import(
  /* webpackChunkName: "user" */
  '@/views/user/Dashboard.vue'
)

const UserProfile = () => import(
  /* webpackChunkName: "user" */
  '@/views/user/Profile.vue'
)

const UserSettings = () => import(
  /* webpackChunkName: "user" */
  '@/views/user/Settings.vue'
)

// 管理员相关路由打包到同一个 chunk
const AdminDashboard = () => import(
  /* webpackChunkName: "admin" */
  '@/views/admin/Dashboard.vue'
)

const AdminUsers = () => import(
  /* webpackChunkName: "admin" */
  '@/views/admin/Users.vue'
)
```

### 基于角色的懒加载

根据不同用户角色加载不同的组件：

```javascript
// router/index.js
import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const routes = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => {
      // 根据用户角色动态选择组件
      const userRole = localStorage.getItem('userRole') || 'guest'
      
      switch (userRole) {
        case 'admin':
          return import(
            /* webpackChunkName: "admin-dashboard" */
            '@/views/admin/Dashboard.vue'
          )
        case 'user':
          return import(
            /* webpackChunkName: "user-dashboard" */
            '@/views/user/Dashboard.vue'
          )
        default:
          return import(
            /* webpackChunkName: "guest-dashboard" */
            '@/views/guest/Dashboard.vue'
          )
      }
    }
  }
]

export default new Router({
  mode: 'history',
  routes
})
```

## 带有加载状态的懒加载

### 基础加载状态

```javascript
// router/index.js
const Home = () => ({
  component: () => import('@/views/Home.vue'),
  loading: () => import('@/components/Loading.vue'),
  error: () => import('@/components/Error.vue'),
  delay: 200, // 200ms 后显示 loading 组件
  timeout: 30000 // 30s 后显示 error 组件
})
```

### 自定义加载组件

```vue
<!-- components/Loading.vue -->
<template>
  <div class="lazy-loading">
    <div class="spinner">
      <div class="spinner-circle"></div>
    </div>
    <p>正在加载页面...</p>
  </div>
</template>

<style scoped>
.lazy-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.spinner {
  width: 40px;
  height: 40px;
  position: relative;
}

.spinner-circle {
  width: 100%;
  height: 100%;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-left-color: #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
```

### 错误处理组件

```vue
<!-- components/Error.vue -->
<template>
  <div class="lazy-error">
    <div class="error-icon">⚠️</div>
    <h3>页面加载失败</h3>
    <p>{{ error ? error.message : '未知错误' }}</p>
    <button @click="retry" class="retry-btn">重试</button>
  </div>
</template>

<script>
export default {
  name: 'LazyError',
  props: {
    error: {
      type: Object,
      default: null
    }
  },
  methods: {
    retry() {
      // 重新加载页面
      window.location.reload()
    }
  }
}
</script>

<style scoped>
.lazy-error {
  text-align: center;
  padding: 40px;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.retry-btn {
  margin-top: 16px;
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.retry-btn:hover {
  background-color: #0056b3;
}
</style>
```

## 嵌套路由的懒加载

### 懒加载嵌套路由

```javascript
const routes = [
  {
    path: '/user',
    component: () => import('@/layouts/UserLayout.vue'),
    children: [
      {
        path: 'dashboard',
        name: 'UserDashboard',
        component: () => import(
          /* webpackChunkName: "user" */
          '@/views/user/Dashboard.vue'
        )
      },
      {
        path: 'profile',
        name: 'UserProfile',
        component: () => import(
          /* webpackChunkName: "user" */
          '@/views/user/Profile.vue'
        )
      },
      {
        path: 'settings',
        name: 'UserSettings',
        component: () => import(
          /* webpackChunkName: "user" */
          '@/views/user/Settings.vue'
        )
      }
    ]
  }
]
```

### 懒加载布局组件

```javascript
const routes = [
  {
    path: '/admin',
    // 懒加载布局组件
    component: () => import(
      /* webpackChunkName: "admin-layout" */
      '@/layouts/AdminLayout.vue'
    ),
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import(
          /* webpackChunkName: "admin" */
          '@/views/admin/Dashboard.vue'
        )
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import(
          /* webpackChunkName: "admin" */
          '@/views/admin/Users.vue'
        )
      }
    ]
  }
]
```

## 实际应用示例

### 电商网站路由配置

```javascript
// router/index.js
import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const routes = [
  // 首页 - 保持同步加载以优化首屏性能
  {
    path: '/',
    name: 'Home',
    component: () => import(
      /* webpackChunkName: "home" */
      '@/views/Home.vue'
    )
  },
  
  // 产品相关页面
  {
    path: '/products',
    name: 'Products',
    component: () => import(
      /* webpackChunkName: "products" */
      '@/views/Products.vue'
    )
  },
  {
    path: '/product/:id',
    name: 'ProductDetail',
    component: () => import(
      /* webpackChunkName: "product-detail" */
      '@/views/ProductDetail.vue'
    ),
    props: true
  },
  
  // 购物车和结算
  {
    path: '/cart',
    name: 'Cart',
    component: () => import(
      /* webpackChunkName: "cart" */
      '@/views/Cart.vue'
    )
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: () => import(
      /* webpackChunkName: "checkout" */
      '@/views/Checkout.vue'
    )
  },
  
  // 用户相关页面
  {
    path: '/login',
    name: 'Login',
    component: () => import(
      /* webpackChunkName: "auth" */
      '@/views/auth/Login.vue'
    )
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import(
      /* webpackChunkName: "auth" */
      '@/views/auth/Register.vue'
    )
  },
  {
    path: '/account',
    name: 'Account',
    component: () => import(
      /* webpackChunkName: "account" */
      '@/views/account/Account.vue'
    ),
    children: [
      {
        path: 'profile',
        name: 'Profile',
        component: () => import(
          /* webpackChunkName: "account" */
          '@/views/account/Profile.vue'
        )
      },
      {
        path: 'orders',
        name: 'Orders',
        component: () => import(
          /* webpackChunkName: "account" */
          '@/views/account/Orders.vue'
        )
      }
    ]
  },
  
  // 管理员页面
  {
    path: '/admin',
    name: 'Admin',
    component: () => import(
      /* webpackChunkName: "admin" */
      '@/views/admin/AdminLayout.vue'
    ),
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import(
          /* webpackChunkName: "admin" */
          '@/views/admin/Dashboard.vue'
        )
      },
      {
        path: 'products',
        name: 'AdminProducts',
        component: () => import(
          /* webpackChunkName: "admin" */
          '@/views/admin/Products.vue'
        )
      },
      {
        path: 'orders',
        name: 'AdminOrders',
        component: () => import(
          /* webpackChunkName: "admin" */
          '@/views/admin/Orders.vue'
        )
      }
    ]
  },
  
  // 404 页面
  {
    path: '*',
    name: 'NotFound',
    component: () => import(
      /* webpackChunkName: "error" */
      '@/views/NotFound.vue'
    )
  }
]

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})
```

### 模块化懒加载

```javascript
// router/modules/user.js
export default [
  {
    path: '/user/dashboard',
    name: 'UserDashboard',
    component: () => import(
      /* webpackChunkName: "user" */
      '@/views/user/Dashboard.vue'
    )
  },
  {
    path: '/user/profile',
    name: 'UserProfile',
    component: () => import(
      /* webpackChunkName: "user" */
      '@/views/user/Profile.vue'
    )
  }
]

// router/modules/admin.js
export default [
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: () => import(
      /* webpackChunkName: "admin" */
      '@/views/admin/Dashboard.vue'
    )
  },
  {
    path: '/admin/users',
    name: 'AdminUsers',
    component: () => import(
      /* webpackChunkName: "admin" */
      '@/views/admin/Users.vue'
    )
  }
]

// router/index.js
import Vue from 'vue'
import Router from 'vue-router'
import userRoutes from './modules/user'
import adminRoutes from './modules/admin'

Vue.use(Router)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue')
  },
  ...userRoutes,
  ...adminRoutes
]

export default new Router({
  mode: 'history',
  routes
})
```

## 性能优化建议

### 预加载策略

```javascript
// 预加载关键路由
const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import(
      /* webpackChunkName: "home" */
      /* webpackPreload: true */  // 预加载
      '@/views/Home.vue'
    )
  },
  {
    path: '/about',
    name: 'About',
    component: () => import(
      /* webpackChunkName: "about" */
      /* webpackPrefetch: true */ // 预获取（空闲时加载）
      '@/views/About.vue'
    )
  }
]
```

### 路由级别缓存

```javascript
// 使用 keep-alive 缓存懒加载组件
<template>
  <div id="app">
    <keep-alive>
      <router-view v-if="$route.meta.keepAlive"></router-view>
    </keep-alive>
    <router-view v-if="!$route.meta.keepAlive"></router-view>
  </div>
</template>

// 在路由配置中添加 meta 信息
const routes = [
  {
    path: '/frequently-used',
    name: 'FrequentlyUsed',
    component: () => import('@/views/FrequentlyUsed.vue'),
    meta: { keepAlive: true } // 需要缓存
  },
  {
    path: '/one-time-view',
    name: 'OneTimeView',
    component: () => import('@/views/OneTimeView.vue'),
    meta: { keepAlive: false } // 不需要缓存
  }
]
```

## 调试和监控

### 监控懒加载性能

```javascript
// utils/lazy-load-monitor.js
class LazyLoadMonitor {
  constructor() {
    this.loadTimes = new Map()
  }

  startTracking(chunkName) {
    this.loadTimes.set(chunkName, performance.now())
  }

  endTracking(chunkName) {
    const startTime = this.loadTimes.get(chunkName)
    if (startTime) {
      const loadTime = performance.now() - startTime
      console.log(`Chunk ${chunkName} loaded in ${loadTime}ms`)
      
      // 可以发送到监控服务
      this.reportLoadTime(chunkName, loadTime)
      
      this.loadTimes.delete(chunkName)
    }
  }

  reportLoadTime(chunkName, loadTime) {
    // 发送到监控服务
    if (loadTime > 1000) { // 超过1秒的加载时间
      console.warn(`Slow chunk load: ${chunkName} took ${loadTime}ms`)
    }
  }
}

export const lazyLoadMonitor = new LazyLoadMonitor()
```

懒加载是优化 Vue 应用性能的重要技术，通过合理使用懒加载，可以显著提升应用的加载速度和用户体验。