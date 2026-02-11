---
title: Getters
createTime: 2026/02/10 14:30:00
permalink: /frontend/vue2/state-management/getters/
---

# Getters

有时候，我们需要从 store 中的 state 中派生出一些状态，例如对列表进行过滤并计数。如果在组件中做这些事情，会有一些问题：

- 多个组件使用相同逻辑时会产生重复代码
- 过滤逻辑难以复用

Vuex 允许我们在 store 中定义"getters"（可以认为是 store 的计算属性）。就像计算属性一样，getters 的返回值会根据它的依赖被缓存起来，且只有当它的依赖值发生了改变才会被重新计算。

## 基础用法

### 定义 Getters

```javascript
const store = new Vuex.Store({
  state: {
    todos: [
      { id: 1, text: '...', done: true },
      { id: 2, text: '...', done: false },
      { id: 3, text: '...', done: true }
    ]
  },
  getters: {
    doneTodos: state => {
      return state.todos.filter(todo => todo.done)
    },
    doneTodosCount: (state, getters) => {
      return getters.doneTodos.length
    },
    getTodoById: (state) => (id) => {
      return state.todos.find(todo => todo.id === id)
    }
  }
})
```

### 访问 Getters

Getters 会暴露为 `store.getters` 对象：

```javascript
store.getters.doneTodos // -> [{ id: 1, text: '...', done: true }, { id: 3, text: '...', done: true }]
store.getters.doneTodosCount // -> 2
store.getters.getTodoById(2) // -> { id: 2, text: '...', done: false }
```

## 在组件中使用 Getters

### 通过计算属性使用

```javascript
computed: {
  doneTodosCount () {
    return this.$store.getters.doneTodosCount
  }
}
```

### 通过 mapGetters 辅助函数

```javascript
import { mapGetters } from 'vuex'

export default {
  // ...
  computed: {
    // 使用对象展开运算符将 getter 混入 computed 对象中
    ...mapGetters([
      'doneTodosCount',
      'anotherGetter',
      // ...
    ])
  }
}
```

如果想将一个 getter 属性另取一个名字，使用对象形式：

```javascript
...mapGetters({
  // 把 this.doneCount 映射为 this.$store.getters.doneTodosCount
  doneCount: 'doneTodosCount'
})
```

## 高级用法

### 带参数的 Getters

```javascript
getters: {
  // 返回一个函数，使其可以接受参数
  getTodoById: (state) => (id) => {
    return state.todos.find(todo => todo.id === id)
  }
}
```

使用：

```javascript
store.getters.getTodoById(2) // -> { id: 2, text: '...', done: false }
```

### 组合 Getters

```javascript
getters: {
  doneTodos: state => {
    return state.todos.filter(todo => todo.done)
  },
  doneTodosCount: (state, getters) => {
    return getters.doneTodos.length
  },
  completedPercentage: (state, getters) => {
    return (getters.doneTodosCount / state.todos.length) * 100
  }
}
```

## 模块中的 Getters

当在模块中使用 getters 时，可以通过命名空间访问：

```javascript
const moduleA = {
  state: { ... },
  getters: {
    // 注意：这里的 getter 只接收本模块的 state
    someGetter: (state) => {
      return state.property
    },
    // 接收其他 getter 作为第二个参数
    someOtherGetter: (state, getters) => {
      return getters.someGetter
    },
    // 接收根节点状态和根节点 getter
    someOtherGetter2: (state, getters, rootState, rootGetters) => {
      return state.property + rootState.otherProperty
    }
  }
}

const store = new Vuex.Store({
  modules: {
    a: moduleA
  }
})

store.getters['a/someGetter'] // -> moduleA 的 someGetter
```

## 实际应用示例

### 用户权限检查

```javascript
// store/modules/user.js
const getters = {
  isLoggedIn: state => !!state.token,
  userRole: state => state.profile ? state.profile.role : 'guest',
  isAdmin: (state, getters) => {
    return getters.userRole === 'admin'
  },
  canEditPost: (state, getters) => (postId) => {
    const post = state.posts.find(p => p.id === postId)
    return post && (getters.isAdmin || post.authorId === state.profile.id)
  }
}

export default {
  namespaced: true,
  state: {
    token: null,
    profile: null,
    posts: []
  },
  getters
}
```

在组件中使用：

```javascript
import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters('user', ['isLoggedIn', 'isAdmin']),
    ...mapGetters({
      canEditCurrentPost: 'user/canEditPost'
    })
  },
  methods: {
    checkEditPermission(postId) {
      // 传递参数给 getter
      return this.canEditCurrentPost(postId)
    }
  }
}
```

### 列表过滤和搜索

```javascript
// store/modules/products.js
const getters = {
  // 所有产品
  allProducts: state => state.products,
  
  // 已上架的产品
  availableProducts: state => {
    return state.products.filter(product => product.available)
  },
  
  // 按价格排序的产品
  sortedProducts: (state, getters) => {
    return [...getters.availableProducts].sort((a, b) => a.price - b.price)
  },
  
  // 搜索结果
  searchResults: (state, getters) => {
    if (!state.searchTerm) {
      return getters.sortedProducts
    }
    
    return getters.sortedProducts.filter(product =>
      product.name.toLowerCase().includes(state.searchTerm.toLowerCase())
    )
  },
  
  // 价格范围筛选
  filteredByPrice: (state, getters) => (minPrice, maxPrice) => {
    return getters.searchResults.filter(product =>
      product.price >= minPrice && product.price <= maxPrice
    )
  }
}
```

### 统计信息

```javascript
// store/modules/analytics.js
const getters = {
  totalUsers: state => state.users.length,
  activeUsers: state => state.users.filter(u => u.active).length,
  inactiveUsers: (state, getters) => getters.totalUsers - getters.activeUsers,
  
  userStatusDistribution: (state, getters) => {
    const distribution = {}
    state.users.forEach(user => {
      distribution[user.status] = (distribution[user.status] || 0) + 1
    })
    return distribution
  },
  
  averageUserAge: state => {
    if (state.users.length === 0) return 0
    const totalAge = state.users.reduce((sum, user) => sum + user.age, 0)
    return totalAge / state.users.length
  }
}
```

## 性能考虑

### 缓存机制

Getters 的计算结果会被缓存，只有当其依赖的状态发生变化时才会重新计算。这使得在多个组件中使用相同的 getter 时非常高效。

### 遵活性与性能的平衡

对于简单的计算，直接在组件中使用计算属性可能更合适。对于复杂的、需要在多个组件间共享的逻辑，使用 getters 更好。

Getters 是 Vuex 中非常强大的功能，通过合理使用 getters，可以让状态管理更加高效和可维护。