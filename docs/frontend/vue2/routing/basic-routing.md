---
title: 基础路由
createTime: 2026/02/10 12:55:00
permalink: /frontend/vue2/routing/basic-routing/
---

# 基础路由

Vue.js 是单页应用框架，路由管理是其重要组成部分。Vue Router 是 Vue.js 官方的路由管理器。

## 安装

通过 NPM 安装：

```bash
npm install vue-router
```

## 基本用法

### 1. 引入并使用 Vue Router

```javascript
import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)
```

### 2. 定义路由组件

```javascript
const Home = { template: '<div>首页</div>' }
const About = { template: '<div>关于</div>' }
```

### 3. 定义路由

```javascript
const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About }
]
```

### 4. 创建路由器实例

```javascript
const router = new VueRouter({
  routes // (缩写) 相当于 routes: routes
})
```

### 5. 创建和挂载根实例

```javascript
const app = new Vue({
  router
}).$mount('#app')
```

### 6. 在模板中使用 router-link 和 router-view

```html
<div id="app">
  <router-link to="/">首页</router-link>
  <router-link to="/about">关于</router-link>
  <router-view></router-view>
</div>
```

## 动态路由匹配

Vue Router 允许将路由路径中的参数映射到组件的 props 中：

```javascript
const User = {
  template: '<div>用户ID: {{$route.params.id}}</div>'
}

const routes = [
  { path: '/user/:id', component: User }
]
```

### 响应路由参数的变化

当路由参数改变时，组件实例会被复用，因此生命周期钩子不会被调用。可以监听 `$route` 对象：

```javascript
const User = {
  template: '...',
  watch: {
    '$route' (to, from) {
      // 对路由变化作出响应...
    }
  }
}
```

或者使用 `beforeRouteUpdate` 导航守卫：

```javascript
const User = {
  template: '...',
  beforeRouteUpdate (to, from, next) {
    // 对路由变化作出响应...
    // 一定要调用 next()
  }
}
```

## 嵌套路由

使用嵌套路由创建更复杂的 UI：

```javascript
const routes = [
  {
    path: '/user/:id',
    component: User,
    children: [
      {
        path: 'profile',
        component: UserProfile
      },
      {
        path: 'posts',
        component: UserPosts
      }
    ]
  }
]
```

嵌套的路径无需以 `/` 开头，会被当作相对路径处理。

## 编程式导航

除了使用 `<router-link>` 创建 a 标签来定义导航链接，还可以使用 router 的实例方法：

```javascript
// 字符串路径
router.push('/user')

// 对象
router.push({ path: '/user' })

// 命名的路由
router.push({ name: 'user', params: { userId: 123 }})

// 带查询参数，变成 /register?plan=private
router.push({ path: '/register', query: { plan: 'private' }})
```

## 命名路由

有时候，通过一个名称来标识一个路由显得更方便一些：

```javascript
const routes = [
  {
    path: '/user/:userId',
    name: 'user',
    component: User
  }
]

// 在使用时
router.push({ name: 'user', params: { userId: 123 }})
```

## 命名视图

有时候想同时 (同级) 展示多个视图，而不是嵌套展示：

```html
<router-view class="view one"></router-view>
<router-view class="view two" name="a"></router-view>
<router-view class="view three" name="b"></router-view>
```

一个路由出口对应一个组件，一个路由出口对应一个名字：

```javascript
const routes = [
  {
    path: '/',
    components: {
      default: Foo,
      a: Bar,
      b: Baz
    }
  }
]
```

## 重定向和别名

### 重定向

重定向也是通过 `routes` 配置来完成：

```javascript
const routes = [
  { path: '/a', redirect: '/b' },
  // 或者重定向到命名路由
  { path: '/c', redirect: { name: 'd' }},
  // 或者通过方法动态返回重定向目标
  { path: '/e', redirect: to => {
    // 方法接收目标路由作为参数
    // return 重定向的字符串路径/路径对象
  }}
]
```

### 别名

重定向是指当用户访问 `/a` 时，URL 会被替换成 `/b`，然后匹配路由为 `/b`。而别名是 `/a` 的别名是 `/b`，意味着当用户访问 `/b` 时，URL 会保持为 `/b`，但是路由匹配则为 `/a`：

```javascript
const routes = [
  { path: '/a', component: A, alias: '/b' }
]
```

## 路由模式

Vue Router 提供了三种模式：

### Hash 模式（默认）

使用 URL hash 来模拟一个完整的 URL，于是当 URL 改变时，页面不会重新加载。

```javascript
const router = new VueRouter({
  mode: 'hash',
  routes: [...]
})
```

### History 模式

利用 History API，在 URL 改变时，页面不会重新加载。

```javascript
const router = new VueRouter({
  mode: 'history',
  routes: [...]
})
```

### Abstract 模式

支持所有 JavaScript 环境，如 Node.js 服务器端。

```javascript
const router = new VueRouter({
  mode: 'abstract',
  routes: [...]
})
```

## 完整的路由示例

```javascript
import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

// 定义路由组件
const Home = { template: '<div>首页</div>' }
const About = { template: '<div>关于我们</div>' }
const User = {
  template: `
    <div>
      <h2>用户: {{$route.params.id}}</h2>
      <router-link :to="\`/user/${$route.params.id}/profile\`">资料</router-link>
      <router-link :to="\`/user/${$route.params.id}/posts\`">文章</router-link>
      <router-view></router-view>
    </div>
  `
}
const UserProfile = { template: '<div>用户资料</div>' }
const UserPosts = { template: '<div>用户文章</div>' }

// 定义路由
const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About },
  {
    path: '/user/:id',
    component: User,
    children: [
      { path: 'profile', component: UserProfile },
      { path: 'posts', component: UserPosts }
    ]
  }
]

// 创建路由器实例
const router = new VueRouter({
  mode: 'history',
  base: __dirname,
  routes
})

// 创建和挂载根实例
new Vue({
  router,
  template: `
    <div id="app">
      <nav>
        <router-link to="/">首页</router-link>
        <router-link to="/about">关于</router-link>
        <router-link to="/user/123">用户</router-link>
      </nav>
      <router-view></router-view>
    </div>
  `
}).$mount('#app')
```

Vue Router 是构建单页面应用(SPA)不可或缺的工具，掌握路由的基本概念和用法对于开发 Vue 应用非常重要。