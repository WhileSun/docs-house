---
title: Mutations
createTime: 2026/02/10 14:35:00
permalink: /frontend/vue2/state-management/mutations/
---

# Mutations

更改 Vuex 的 store 中的状态的唯一方法是提交 mutation。Vuex 中的 mutation 非常类似于事件：每个 mutation 都有一个字符串的 事件类型 (type) 和 一个 回调函数 (handler)。这个回调函数就是我们实际进行状态更改的地方，并且它会接受 state 作为第一个参数：

## 基础用法

### 定义和提交 Mutation

```javascript
const store = new Vuex.Store({
  state: {
    count: 1
  },
  mutations: {
    increment (state) {
      // 变更状态
      state.count++
    }
  }
})

// 提交 mutation
store.commit('increment')
```

你不能直接调用一个 mutation handler。这个选项更像是事件注册："当触发一个类型为 `increment` 的 mutation 时，调用此函数。"要唤醒一个 mutation handler，你需要以相应的 type 调用 `store.commit` 方法。

### 传递载荷（Payload）

你可以向 `store.commit` 传入额外的参数，即 mutation 的 载荷（payload）：

```javascript
const store = new Vuex.Store({
  state: {
    count: 1
  },
  mutations: {
    increment (state, n) {
      state.count += n
    }
  }
})

store.commit('increment', 10)
```

在大多数情况下，载荷应该是一个对象，这样可以包含多个字段并且记录的 mutation 会更易读：

```javascript
const store = new Vuex.Store({
  state: {
    count: 1
  },
  mutations: {
    increment (state, payload) {
      state.count += payload.amount
    }
  }
})

store.commit('increment', {
  amount: 10
})
```

## 使用常量替代 Mutation 事件类型

使用常量替代 mutation 事件类型是一个普遍的惯例：

```javascript
// mutation-types.js
export const SOME_MUTATION = 'SOME_MUTATION'
```

```javascript
// store.js
import { SOME_MUTATION } from './mutation-types'

const store = new Vuex.Store({
  state: { ... },
  mutations: {
    // 使用 ES2015 风格的计算属性命名功能来使用一个常量作为函数名
    [SOME_MUTATION] (state) {
      // mutate state
    }
  }
})
```

## Mutation 必须是同步函数

一条重要的原则就是要记住 mutation 必须是同步函数。看下面这个例子：

```javascript
mutations: {
  someMutation (state) {
    api.callAsyncMethod(() => {
      state.count++
    })
  }
}
```

现在想象，我们正在 debug 一个 app 并且观察 devtool 中的 mutation 日志。每一条 mutation 被记录，devtools 都需要捕捉到前一状态和后一状态的快照。然而，在上面的例子中 mutation 中的异步函数中的回调让这不可能完成：因为当 mutation 触发的时候，回调函数还没有被调用，devtools 不知道什么时候回调函数实际上被调用——实质上任何在回调函数中进行的状态的改变都是不可追踪的。

## 在组件中提交 Mutations

你可以在组件中使用 `this.$store.commit('xxx')` 提交 mutation，或者使用 `mapMutations` 辅助函数将组件中的 methods 映射为 `store.commit` 调用（需要在根节点注入 `store`）。

```javascript
import { mapMutations } from 'vuex'

export default {
  // ...
  methods: {
    ...mapMutations([
      'increment', // 将 `this.increment()` 映射为 `this.$store.commit('increment')`
      
      // `mapMutations` 也支持载荷：
      'incrementBy' // 将 `this.incrementBy(amount)` 映射为 `this.$store.commit('incrementBy', amount)`
    ]),
    ...mapMutations({
      add: 'increment' // 将 `this.add()` 映射为 `this.$store.commit('increment')`
    })
  }
}
```

## 模块中的 Mutations

当使用模块时，你可以使用命名空间来提交 mutations：

```javascript
const moduleA = {
  namespaced: true,
  
  state: { ... },
  mutations: {
    increment (state, payload) {
      state.count += payload.amount
    }
  }
}

const store = new Vuex.Store({
  modules: {
    a: moduleA
  }
})

// 提交模块中的 mutation
store.commit('a/increment', {
  amount: 10
})
```

在组件中使用命名空间的 mutations：

```javascript
import { mapMutations } from 'vuex'

export default {
  methods: {
    ...mapMutations('a', [
      'increment' // 将 `this.increment()` 映射为 `this.$store.commit('a/increment')`
    ]),
    ...mapMutations('a', {
      add: 'increment' // 将 `this.add()` 映射为 `this.$store.commit('a/increment')`
    })
  }
}
```

## 实际应用示例

### 用户信息更新

```javascript
// store/modules/user.js
const mutations = {
  SET_USER_INFO(state, userInfo) {
    state.userInfo = { ...state.userInfo, ...userInfo }
  },
  
  UPDATE_USER_PROFILE(state, profile) {
    state.userInfo.profile = { ...state.userInfo.profile, ...profile }
  },
  
  SET_USER_PERMISSIONS(state, permissions) {
    state.userInfo.permissions = permissions
  },
  
  LOGOUT(state) {
    state.userInfo = null
  }
}

export default {
  namespaced: true,
  state: {
    userInfo: null
  },
  mutations
}
```

在组件中使用：

```javascript
import { mapMutations } from 'vuex'

export default {
  methods: {
    ...mapMutations('user', [
      'SET_USER_INFO',
      'UPDATE_USER_PROFILE',
      'SET_USER_PERMISSIONS',
      'LOGOUT'
    ]),
    
    async login(credentials) {
      try {
        const response = await api.login(credentials)
        // 更新用户信息
        this.SET_USER_INFO(response.data.user)
        this.SET_USER_PERMISSIONS(response.data.permissions)
      } catch (error) {
        console.error('Login failed:', error)
      }
    },
    
    logout() {
      this.LOGOUT()
    }
  }
}
```

### 购物车操作

```javascript
// store/modules/cart.js
const mutations = {
  ADD_TO_CART(state, product) {
    const existingItem = state.items.find(item => item.id === product.id)
    if (existingItem) {
      existingItem.quantity += 1
    } else {
      state.items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1
      })
    }
  },
  
  REMOVE_FROM_CART(state, productId) {
    state.items = state.items.filter(item => item.id !== productId)
  },
  
  UPDATE_QUANTITY(state, { productId, quantity }) {
    const item = state.items.find(item => item.id === productId)
    if (item) {
      item.quantity = quantity
    }
  },
  
  CLEAR_CART(state) {
    state.items = []
  }
}

export default {
  namespaced: true,
  state: {
    items: []
  },
  mutations
}
```

### 列表数据管理

```javascript
// store/modules/list.js
const mutations = {
  SET_LOADING(state, loading) {
    state.loading = loading
  },
  
  SET_ERROR(state, error) {
    state.error = error
  },
  
  SET_ITEMS(state, items) {
    state.items = items
  },
  
  ADD_ITEM(state, item) {
    state.items.push(item)
  },
  
  UPDATE_ITEM(state, updatedItem) {
    const index = state.items.findIndex(item => item.id === updatedItem.id)
    if (index !== -1) {
      state.items.splice(index, 1, updatedItem)
    }
  },
  
  DELETE_ITEM(state, itemId) {
    state.items = state.items.filter(item => item.id !== itemId)
  },
  
  SET_PAGINATION(state, { page, total }) {
    state.pagination.page = page
    state.pagination.total = total
  }
}

export default {
  namespaced: true,
  state: {
    items: [],
    loading: false,
    error: null,
    pagination: {
      page: 1,
      total: 0
    }
  },
  mutations
}
```

## 最佳实践

### 1. 使用常量定义 Mutation 类型

```javascript
// store/mutation-types.js
export const SET_USER_INFO = 'SET_USER_INFO'
export const UPDATE_USER_PROFILE = 'UPDATE_USER_PROFILE'
export const ADD_TO_CART = 'ADD_TO_CART'
export const REMOVE_FROM_CART = 'REMOVE_FROM_CART'
```

### 2. 保持 Mutation 的纯净性

Mutation 应该是同步的、纯净的函数，不应该包含异步操作：

```javascript
// ❌ 错误：包含异步操作
mutations: {
  async fetchUser(state) {
    const response = await api.getUser()
    state.user = response.data
  }
}

// ✅ 正确：只处理状态变更
mutations: {
  SET_USER(state, user) {
    state.user = user
  }
}
```

### 3. 使用载荷对象

当需要传递多个参数时，使用对象作为载荷：

```javascript
// ❌ 不推荐
store.commit('updateUser', id, name, email, age)

// ✅ 推荐
store.commit('updateUser', {
  id,
  name,
  email,
  age
})
```

Mutations 是 Vuex 中处理状态变更的核心机制，通过合理使用 mutations，可以确保状态变更的可预测性和可追踪性。