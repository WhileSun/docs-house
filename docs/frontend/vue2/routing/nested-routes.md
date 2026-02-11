---
title: 嵌套路由
createTime: 2026/02/10 14:10:00
permalink: /frontend/vue2/routing/nested-routes/
---

# 嵌套路由

实际生活中的应用界面，通常由多层嵌套的组件组合而成。同样地，URL 中各段动态参数之间也按某种结构对应嵌套的关系。

## 基础嵌套路由

在 Vue Router 中，要实现嵌套路由，需要在路由配置中使用 `children` 选项：

```javascript
const router = new VueRouter({
  routes: [
    {
      path: '/user/:id', 
      component: User,
      children: [
        {
          // 当 /user/:id/profile 匹配成功时，
          // UserProfile 会被渲染在 User 的 <router-view> 中
          path: 'profile',
          component: UserProfile
        },
        {
          // 当 /user/:id/posts 匹配成功时，
          // UserPosts 会被渲染在 User 的 <router-view> 中
          path: 'posts',
          component: UserPosts
        }
      ]
    }
  ]
})
```

## 完整示例

### HTML 模板

```html
<div id="app">
  <router-view></router-view>
</div>
```

### 组件定义

```javascript
const User = {
  template: `
    <div class="user">
      <h2>User {{ $route.params.id }}</h2>
      <router-view></router-view>
    </div>
  `
}

const UserProfile = {
  template: '<div>用户资料</div>'
}

const UserPosts = {
  template: '<div>用户文章</div>'
}
```

### 路由配置

```javascript
const router = new VueRouter({
  routes: [
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
})
```

## 嵌套路径写法

在嵌套的 `children` 数组中，路径配置有以下特点：

- 以 `/` 开头的嵌套路径会被当作根路径，这允许我们利用组件树构建更有趣的用户界面。
- 不以 `/` 开头的路径会与父路径形成嵌套关系。

```javascript
const router = new VueRouter({
  routes: [
    {
      path: '/user/:id',
      component: User,
      children: [
        // 匹配 /user/:id/profile
        { path: 'profile', component: UserProfile },
        // 匹配 /user/:id/posts
        { path: 'posts', component: UserPosts },
        // 匹配 /user/:id/setting (以 / 开头，会忽略父路径)
        { path: '/setting', component: UserSetting },
        // 匹配 /user/:id/profile/edit
        { 
          path: 'profile/edit', 
          component: UserProfileEdit 
        }
      ]
    }
  ]
})
```

## 嵌套路由的路由配置

### 带参数的嵌套路由

```javascript
const router = new VueRouter({
  routes: [
    {
      path: '/user/:id',
      component: User,
      children: [
        {
          // 匹配 /user/:id/profile/:postId
          path: 'profile/:postId',
          component: UserProfileDetail
        }
      ]
    }
  ]
})
```

### 嵌套命名视图

```javascript
const router = new VueRouter({
  routes: [
    {
      path: '/user/:id',
      components: {
        default: User,
        sidebar: UserSidebar
      },
      children: [
        {
          path: 'profile',
          components: {
            default: UserProfile,
            help: ProfileHelp
          }
        }
      ]
    }
  ]
})
```

## 实际应用示例

### 用户管理系统

```javascript
const UserLayout = {
  template: `
    <div class="user-layout">
      <h1>用户管理系统</h1>
      <nav>
        <router-link to="/user/profile">个人资料</router-link>
        <router-link to="/user/settings">设置</router-link>
        <router-link to="/user/security">安全</router-link>
      </nav>
      <main>
        <router-view></router-view>
      </main>
    </div>
  `
}

const UserProfile = {
  template: `
    <div class="user-profile">
      <h2>个人资料</h2>
      <p>这里是用户的基本信息</p>
    </div>
  `
}

const UserSettings = {
  template: `
    <div class="user-settings">
      <h2>设置</h2>
      <p>这里是用户的设置选项</p>
    </div>
  `
}

const UserSecurity = {
  template: `
    <div class="user-security">
      <h2>安全</h2>
      <p>这里是用户的安全设置</p>
    </div>
  `
}

const UserPassword = {
  template: `
    <div class="user-password">
      <h3>修改密码</h3>
      <form>
        <input type="password" placeholder="当前密码">
        <input type="password" placeholder="新密码">
        <button type="submit">保存</button>
      </form>
    </div>
  `
}

const router = new VueRouter({
  routes: [
    {
      path: '/user',
      component: UserLayout,
      children: [
        {
          path: 'profile',
          component: UserProfile
        },
        {
          path: 'settings',
          component: UserSettings
        },
        {
          path: 'security',
          component: UserSecurity,
          children: [
            {
              path: 'password',
              component: UserPassword
            }
          ]
        }
      ]
    }
  ]
})
```

### 电商网站商品详情页

```javascript
const ProductLayout = {
  template: `
    <div class="product-layout">
      <div class="product-header">
        <h1>{{ product.name }}</h1>
      </div>
      <div class="product-nav">
        <router-link :to="{ name: 'product.overview' }">商品概述</router-link>
        <router-link :to="{ name: 'product.reviews' }">用户评价</router-link>
        <router-link :to="{ name: 'product.specifications' }">规格参数</router-link>
      </div>
      <div class="product-content">
        <router-view></router-view>
      </div>
    </div>
  `,
  data() {
    return {
      product: {
        id: 1,
        name: 'iPhone 13'
      }
    }
  }
}

const ProductOverview = {
  template: '<div><h3>商品概述</h3><p>这里是商品的详细描述</p></div>'
}

const ProductReviews = {
  template: '<div><h3>用户评价</h3><p>这里是用户评价内容</p></div>'
}

const ProductSpecs = {
  template: '<div><h3>规格参数</h3><p>这里是商品的规格参数</p></div>'
}

const router = new VueRouter({
  routes: [
    {
      path: '/product/:id',
      component: ProductLayout,
      children: [
        {
          path: '',
          name: 'product.overview',
          component: ProductOverview
        },
        {
          path: 'reviews',
          name: 'product.reviews',
          component: ProductReviews
        },
        {
          path: 'specifications',
          name: 'product.specifications',
          component: ProductSpecs
        }
      ]
    }
  ]
})
```

## 嵌套路由的注意事项

### 1. 空路径路由

当用户访问 `/user/:id` 时，渲染哪个组件？答案是，什么都不渲染。为了改变这一状况，我们需要在路由配置中添加一个空路径路由：

```javascript
const router = new VueRouter({
  routes: [
    {
      path: '/user/:id',
      component: User,
      children: [
        // 当 /user/:id 匹配成功时，
        // UserHome 会被渲染在 User 的 <router-view> 中
        { path: '', component: UserHome },
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
})
```

### 2. 嵌套的深度

理论上，嵌套可以无限深入，但在实际应用中，建议嵌套层级不要超过 3-4 层，以保持 URL 的简洁和可读性。

嵌套路由是构建复杂应用界面的重要功能，通过合理使用嵌套路由，可以创建结构清晰、易于维护的应用。