---
title: 路由守卫
createTime: 2026/02/10 13:10:00
permalink: /frontend/vue2/routing/route-guard/
---

# 路由守卫

路由守卫的主要作用是在导航过程中进行权限控制、数据预加载、页面访问控制等操作。Vue Router 提供了多种类型的路由守卫。

## 路由守卫分类

Vue Router 提供了三种类型的路由守卫：

1. **全局守卫** - 影响所有路由
2. **路由独享守卫** - 只影响特定路由
3. **组件内守卫** - 在组件内部定义

## 全局前置守卫

你可以使用 `router.beforeEach` 注册一个全局前置守卫：

```javascript
const router = new VueRouter({ ... })

router.beforeEach((to, from, next) => {
  // to: Route: 即将要进入的目标路由对象
  // from: Route: 当前导航正要离开的路由
  // next: Function: 一定要调用该方法来 resolve 这个钩子
  
  // 一定要调用 next()
})
```

当一个导航触发时，全局前置守卫按照创建顺序调用。守卫是异步解析执行，此时导航在所有守卫 resolve 完之前一直处于等待状态。

### next 方法的参数

- `next()` : 进行管道中的下一个钩子。如果全部钩子执行完了，则导航的状态就是 confirmed (确认的)。
- `next(false)` : 中断当前的导航。如果浏览器的 URL 改变了 (可能是用户手动或者浏览器后退按钮)，那么 URL 地址会重置到 from 路由对应的地址。
- `next('/')` 或 `next({ path: '/' })` : 跳转到一个不同的地址。当前的导航被中断，然后进行一个新的导航。
- `next(error)` : 如果传入的参数是一个 Error 实例，则导航会被终止且该错误会被传递给 router.onError() 注册过的回调。

### 实际应用示例

```javascript
router.beforeEach((to, from, next) => {
  // 检查用户是否已登录
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // 这个路由需要登录权限，检查是否已登录
    if (!isAuthenticated()) {
      // 没有登录，重定向到登录页
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    } else {
      // 已登录，继续访问
      next()
    }
  } else {
    // 不需要登录，继续访问
    next() // 确保一定要调用 next()
  }
})
```

## 全局解析守卫

在 2.5.0+ 版本中，你可以使用 `router.beforeResolve` 注册一个全局守卫。这和 `router.beforeEach` 类似，区别是在导航被确认之前，同时在所有组件内守卫和异步路由组件被解析之后，解析守卫就被调用。

```javascript
router.beforeResolve((to, from, next) => {
  // 类似 router.beforeEach，但会在所有组件内守卫和异步路由组件被解析之后调用
  next()
})
```

## 全局后置钩子

你也可以注册全局后置钩子，然而和守卫不同的是，这些钩子不会接受 next 函数也不会改变导航本身：

```javascript
router.afterEach((to, from) => {
  // 这里可以做一些全局的事情，比如页面访问统计
  analytics.track(to.fullPath)
})
```

## 路由独享守卫

你可以在路由配置上直接定义 `beforeEnter` 守卫：

```javascript
const router = new VueRouter({
  routes: [
    {
      path: '/foo',
      component: Foo,
      beforeEnter: (to, from, next) => {
        // 在该路由被访问前检查权限
        if (hasPermission(to.params.id)) {
          next()
        } else {
          next('/login')
        }
      }
    }
  ]
})
```

## 组件内守卫

最后，你可以在路由组件内直接定义以下路由守卫：

- `beforeRouteEnter`
- `beforeRouteUpdate` (2.2 新增)
- `beforeRouteLeave`

### beforeRouteEnter

```javascript
const Foo = {
  template: `...`,
  beforeRouteEnter (to, from, next) {
    // 在渲染该组件的对应路由被 confirm 前调用
    // 不！能！获取组件实例 `this`
    // 因为当守卫执行前，组件实例还没被创建
    
    next(vm => {
      // 通过 `vm` 访问组件实例
      vm.setData()
    })
  },
  methods: {
    setData() {
      // 设置数据
    }
  }
}
```

注意 `beforeRouteEnter` 是支持给 `next` 传递回调的唯一守卫。对于 `beforeRouteUpdate` 和 `beforeRouteLeave` 来说，`this` 已经可用了，所以不支持传递回调，因为没有必要了。

### beforeRouteUpdate

```javascript
const Foo = {
  template: `...`,
  beforeRouteUpdate (to, from, next) {
    // 在当前路由改变，但是该组件被复用时调用
    // 举例来说，对于一个带有动态参数的路径 /foo/:id，在 /foo/1 和 /foo/2 之间跳转的时候，
    // 由于会渲染同样的 Foo 组件，这个钩子就会被调用。
    const { id } = to.params
    // 通过路由参数获取新数据
    fetchUserData(id).then(data => {
      this.userData = data
      next()
    })
  }
}
```

### beforeRouteLeave

```javascript
const Foo = {
  template: `...`,
  beforeRouteLeave (to, from, next) {
    // 导航离开该组件的对应路由时调用
    // 可以访问组件实例 `this`
    
    const answer = window.confirm('Do you really want to leave? you have unsaved changes!')
    if (answer) {
      next()
    } else {
      next(false)
    }
  }
}
```

## 完整的导航解析流程

1. 导航被触发。
2. 在失活的组件里调用 `beforeRouteLeave` 守卫。
3. 调用全局的 `beforeEach` 守卫。
4. 在重用的组件里调用 `beforeRouteUpdate` 守卫 (2.2+)。
5. 在路由配置里调用 `beforeEnter`。
6. 解析异步路由组件。
7. 在被激活的组件里调用 `beforeRouteEnter`。
8. 调用全局的 `beforeResolve` 守卫 (2.5+)。
9. 导航被确认。
10. 调用全局的 `afterEach` 钩子。
11. 触发 DOM 更新。
12. 用创建好的实例调用 `beforeRouteEnter` 守卫中传给 next 的回调函数。

## 实际应用案例

### 权限控制

```javascript
// 检查用户角色和权限
router.beforeEach((to, from, next) => {
  const user = getUserInfo()
  const requiresAuth = to.matched.some(r => r.meta.requiresAuth)
  const userRole = user ? user.role : 'guest'
  
  if (requiresAuth && !user) {
    next('/login')
  } else if (to.meta.roles && !to.meta.roles.includes(userRole)) {
    next('/unauthorized') // 用户无权限访问
  } else {
    next()
  }
})
```

### 数据预加载

```javascript
// 在路由组件中
export default {
  data() {
    return {
      userData: null
    }
  },
  async beforeRouteEnter(to, from, next) {
    // 在进入路由前预加载数据
    const userData = await fetchUser(to.params.id)
    next(vm => {
      vm.userData = userData
    })
  },
  async beforeRouteUpdate(to, from, next) {
    // 当路由参数变化时更新数据
    this.userData = await fetchUser(to.params.id)
    next()
  }
}
```

### 页面访问统计

```javascript
// 全局后置钩子用于页面访问统计
router.afterEach((to, from) => {
  // 页面访问统计
  ga('set', 'page', to.fullPath)
  ga('send', 'pageview')
  
  // 设置页面标题
  document.title = to.meta.title || '默认标题'
})
```

路由守卫是 Vue Router 的重要功能，通过合理使用路由守卫，可以实现权限控制、数据预加载、页面访问统计等多种功能，提升用户体验和应用安全性。