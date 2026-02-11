---
title: 路由参数
createTime: 2026/02/10 14:55:00
permalink: /frontend/vue2/routing/route-params/
---

# 路由参数

在 Vue Router 中，我们可以使用路由参数来传递动态数据。路由参数是 URL 中动态的部分，用于匹配不同的路由。

## 动态路由匹配

### 基础参数

在路由路径中使用冒号 `:` 来定义参数：

```javascript
const router = new VueRouter({
  routes: [
    // 动态路径参数以冒号开头
    { path: '/user/:id', component: User }
  ]
})
```

现在像 `/user/foo` 和 `/user/bar` 都将映射到相同的路由。

一个"路径参数"使用冒号 `:` 标记。当匹配到一个路由时，参数值会被设置到 `this.$route.params`，可以在每个组件内使用。

```javascript
const User = {
  template: '<div>User {{ $route.params.id }}</div>'
}
```

你可以有多个参数，例如：

```javascript
const router = new VueRouter({
  routes: [
    // /users/foo/profile/bar 会匹配下面的路由
    { path: '/users/:username/profile/:section', component: UserProfile }
  ]
})
```

然后分别通过 `$route.params.username` 和 `$route.params.section` 获取参数值。

## 响应路由参数的变化

当使用路由参数时，例如从 `/user/foo` 导航到 `/user/bar`，原来的组件实例会被复用。因为两个路由都渲染同个组件，比起销毁再创建，复用则显得更加高效。

不过，这也意味着组件的生命周期钩子不会再被调用。复用组件时，想对路由参数的变化作出响应的话，你可以简单地 watch（监测变化） `$route` 对象：

```javascript
const User = {
  template: '...',
  watch: {
    '$route' (to, from) {
      // 对路由变化作出响应...
      this.fetchUserData(to.params.id)
    }
  }
}
```

或者使用 `beforeRouteUpdate` 导航守卫：

```javascript
const User = {
  template: '...',
  beforeRouteUpdate (to, from, next) {
    // react to route changes...
    // don't forget to call next()
    this.fetchUserData(to.params.id)
    next()
  }
}
```

## 高级参数模式

### 可选参数

有时候，同一个路径可以匹配多个路由，例如 `/user` 和 `/user/:id`。这时可以使用可选参数：

```javascript
const router = new VueRouter({
  routes: [
    { path: '/user/:id?', component: User } // id 参数是可选的
  ]
})
```

### 带有验证的参数

你可以在路由中使用正则表达式来验证参数：

```javascript
const router = new VueRouter({
  routes: [
    // 只匹配数字参数
    { path: '/user/:id(\\d+)', component: User }
  ]
})
```

### 通配符参数

使用 `*` 可以匹配任意路径：

```javascript
const router = new VueRouter({
  routes: [
    // 匹配任何路径
    { path: '*', component: NotFound },
    // 匹配以 /user- 开头的任意路径
    { path: '/user-*', component: User }
  ]
})
```

## 查询参数

除了路由参数，你还可以使用查询参数。查询参数不需要在路由配置中定义：

```javascript
// 访问 /user?id=123&name=foo
const User = {
  template: `
    <div>
      <p>ID: {{ $route.query.id }}</p>
      <p>Name: {{ $route.query.name }}</p>
    </div>
  `
}
```

## 在组件中使用参数

### 通过 $route 对象

```javascript
export default {
  computed: {
    userId() {
      return this.$route.params.id
    },
    searchTerm() {
      return this.$route.query.q
    }
  },
  watch: {
    '$route'(to, from) {
      // 当路由参数变化时执行
      this.loadData(to.params.id)
    }
  }
}
```

### 通过 props

将路由参数作为 props 传递给组件：

```javascript
// 在路由配置中
const routes = [
  {
    path: '/user/:id',
    component: User,
    props: true // 将路由参数作为 props 传递
  }
]

// 或者使用函数模式
const routes = [
  {
    path: '/user/:id',
    component: User,
    props: (route) => ({
      id: Number(route.params.id),
      query: route.query.q
    })
  }
]

// 在组件中
export default {
  props: ['id'], // 现在可以从 props 中获取 id
  template: '<div>User ID: {{ id }}</div>'
}
```

## 实际应用示例

### 用户详情页

```javascript
// 路由配置
const routes = [
  {
    path: '/user/:userId',
    name: 'UserProfile',
    component: UserProfile,
    props: true
  },
  {
    path: '/user/:userId/post/:postId',
    name: 'UserPost',
    component: UserPost,
    props: true
  }
]

// 用户详情组件
const UserProfile = {
  props: ['userId'],
  template: `
    <div class="user-profile">
      <h1>用户详情</h1>
      <p>用户ID: {{ userId }}</p>
      <div class="user-nav">
        <router-link :to="{ name: 'UserPost', params: { userId: userId, postId: 1 }}">文章1</router-link>
        <router-link :to="{ name: 'UserPost', params: { userId: userId, postId: 2 }}">文章2</router-link>
      </div>
      <router-view></router-view>
    </div>
  `,
  created() {
    this.fetchUser(this.userId)
  },
  watch: {
    userId(newId) {
      this.fetchUser(newId)
    }
  },
  methods: {
    async fetchUser(id) {
      // 获取用户数据
      this.user = await api.getUser(id)
    }
  }
}

// 用户文章组件
const UserPost = {
  props: ['userId', 'postId'],
  template: `
    <div class="user-post">
      <h2>文章详情</h2>
      <p>用户ID: {{ userId }}</p>
      <p>文章ID: {{ postId }}</p>
      <div v-if="post">
        <h3>{{ post.title }}</h3>
        <div>{{ post.content }}</div>
      </div>
    </div>
  `,
  data() {
    return {
      post: null
    }
  },
  created() {
    this.fetchPost(this.userId, this.postId)
  },
  watch: {
    postId() {
      this.fetchPost(this.userId, this.postId)
    }
  },
  methods: {
    async fetchPost(userId, postId) {
      this.post = await api.getPost(userId, postId)
    }
  }
}
```

### 电商产品页

```javascript
// 路由配置
const routes = [
  {
    path: '/category/:categoryId/product/:productId',
    name: 'ProductDetail',
    component: ProductDetail,
    props: true
  },
  {
    path: '/category/:categoryId',
    name: 'Category',
    component: Category,
    props: true
  }
]

// 产品详情组件
const ProductDetail = {
  props: ['categoryId', 'productId'],
  template: `
    <div class="product-detail">
      <h1>{{ product.name }}</h1>
      <div class="product-info">
        <p>分类: {{ categoryId }}</p>
        <p>价格: ¥{{ product.price }}</p>
        <p>库存: {{ product.stock }}</p>
      </div>
      <div class="product-actions">
        <button @click="addToCart">加入购物车</button>
        <button @click="buyNow">立即购买</button>
      </div>
    </div>
  `,
  data() {
    return {
      product: null
    }
  },
  created() {
    this.fetchProduct()
  },
  watch: {
    '$route': 'fetchProduct' // 当路由参数变化时重新获取数据
  },
  methods: {
    async fetchProduct() {
      this.product = await api.getProduct(this.productId)
    },
    addToCart() {
      // 添加到购物车逻辑
    },
    buyNow() {
      // 立即购买逻辑
    }
  }
}
```

### 搜索页面

```javascript
// 路由配置
const routes = [
  {
    path: '/search',
    name: 'Search',
    component: Search,
    props: (route) => ({
      query: route.query.q,
      page: parseInt(route.query.page) || 1,
      category: route.query.category
    })
  }
]

// 搜索组件
const Search = {
  props: ['query', 'page', 'category'],
  template: `
    <div class="search-page">
      <div class="search-form">
        <input v-model="searchQuery" @keyup.enter="performSearch" placeholder="搜索...">
        <select v-model="searchCategory" @change="performSearch">
          <option value="">所有分类</option>
          <option value="electronics">电子产品</option>
          <option value="books">图书</option>
          <option value="clothing">服装</option>
        </select>
        <button @click="performSearch">搜索</button>
      </div>
      
      <div class="search-results">
        <div v-for="result in results" :key="result.id" class="result-item">
          <h3>{{ result.title }}</h3>
          <p>{{ result.description }}</p>
        </div>
      </div>
      
      <div class="pagination">
        <button 
          v-for="pageNum in totalPages" 
          :key="pageNum"
          :class="{ active: pageNum === currentPage }"
          @click="changePage(pageNum)"
        >
          {{ pageNum }}
        </button>
      </div>
    </div>
  `,
  data() {
    return {
      results: [],
      totalPages: 0,
      searchQuery: this.query || '',
      searchCategory: this.category || ''
    }
  },
  computed: {
    currentPage() {
      return this.page
    }
  },
  created() {
    this.performSearch()
  },
  watch: {
    '$route'() {
      this.searchQuery = this.query || ''
      this.searchCategory = this.category || ''
      this.performSearch()
    }
  },
  methods: {
    async performSearch() {
      const results = await api.search({
        q: this.searchQuery,
        page: this.currentPage,
        category: this.searchCategory
      })
      
      this.results = results.items
      this.totalPages = results.totalPages
    },
    changePage(pageNum) {
      this.$router.push({
        name: 'Search',
        query: {
          q: this.searchQuery,
          page: pageNum,
          category: this.searchCategory
        }
      })
    }
  }
}
```

## 最佳实践

### 1. 参数验证

在使用路由参数之前，确保验证参数的有效性：

```javascript
beforeRouteUpdate(to, from, next) {
  if (!to.params.id || isNaN(to.params.id)) {
    // 参数无效，重定向到错误页面
    next('/error')
  } else {
    // 参数有效，继续
    next()
  }
}
```

### 2. 错误处理

为无效的参数提供错误处理：

```javascript
watch: {
  '$route'(to, from) {
    if (to.params.id) {
      this.fetchData(to.params.id)
    } else {
      this.showError('无效的参数')
    }
  }
}
```

路由参数是 Vue Router 中传递数据的重要机制，通过合理使用路由参数，可以创建动态、灵活的单页应用。