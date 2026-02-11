---
title: Actions
createTime: 2026/02/10 14:40:00
permalink: /frontend/vue2/state-management/actions/
---

# Actions

Action 类似于 mutation，不同在于：

- Action 提交的是 mutation，而不是直接变更状态。
- Action 可以包含任意异步操作。

## 基础用法

### 定义和分发 Action

```javascript
const store = new Vuex.Store({
  state: {
    count: 0
  },
  mutations: {
    increment (state) {
      state.count++
    }
  },
  actions: {
    increment (context) {
      context.commit('increment')
    }
  }
})
```

Action 函数接受一个与 store 实例具有相同方法和属性的 context 对象，因此你可以调用 `context.commit` 提交一个 mutation，或者通过 `context.state` 和 `context.getters` 来获取 state 和 getters。

实践中，我们经常用到 ES2015 的参数解构来简化代码（特别是我们需要调用 `commit` 很多次的时候）：

```javascript
actions: {
  increment ({ commit }) {
    commit('increment')
  }
}
```

### 分发 Action

Action 通过 `store.dispatch` 方法触发：

```javascript
store.dispatch('increment')
```

乍一眼看上去感觉多此一举，我们直接分发 mutation 岂不更方便？实际上并非如此，还记得 mutation 必须同步执行这个限制吗？Action 就不受约束！我们可以在 action 内部执行异步操作：

```javascript
actions: {
  incrementAsync ({ commit }) {
    setTimeout(() => {
      commit('increment')
    }, 1000)
  }
}
```

## 在组件中使用 Actions

### 通过 this.$store.dispatch 使用

```javascript
export default {
  methods: {
    increment() {
      this.$store.dispatch('increment')
    },
    incrementAsync() {
      this.$store.dispatch('incrementAsync')
    }
  }
}
```

### 使用 mapActions 辅助函数

```javascript
import { mapActions } from 'vuex'

export default {
  // ...
  methods: {
    ...mapActions([
      'increment', // 将 `this.increment()` 映射为 `this.$store.dispatch('increment')`
      'incrementAsync' // 将 `this.incrementAsync()` 映射为 `this.$store.dispatch('incrementAsync')`
    ]),
    ...mapActions({
      add: 'increment' // 将 `this.add()` 映射为 `this.$store.dispatch('increment')`
    })
  }
}
```

## 定义载荷的 Action

分发带有载荷的 action：

```javascript
// 以载荷形式分发
store.dispatch('incrementAsync', {
  amount: 10
})

// 或以对象形式分发
store.dispatch({
  type: 'incrementAsync',
  amount: 10
})
```

对应的 action 定义：

```javascript
actions: {
  incrementAsync ({ commit }, payload) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        commit('increment')
        resolve()
      }, 1000)
    })
  }
}
```

## 组合 Action

Action 通常是异步的，那么如何知道 action 什么时候结束呢？更重要的是，我们如何组合多个 action，以处理更复杂的异步流程？

首先，你需要明白 `store.dispatch` 可以处理被触发的 action 的返回值。当这个值是一个 Promise 时或是返回一个 Promise 的函数时，`store.dispatch` 会等待这个 Promise 完成。

```javascript
actions: {
  async actionA ({ commit }) {
    commit('gotData', await api.getData())
  },
  
  async actionB ({ dispatch, commit }) {
    await dispatch('actionA') // 等待 actionA 完成
    commit('gotOtherData', await api.getOtherData())
  }
}
```

## 模块中的 Actions

在模块中使用 actions 时，可以使用命名空间：

```javascript
const moduleA = {
  namespaced: true,
  
  state: { ... },
  mutations: { ... },
  actions: {
    increment ({ commit, rootState }) {
      if (rootState.count >= 10) {
        return
      }
      commit('increment')
    },
    
    async incrementAsync ({ commit }, payload) {
      const result = await api.increment(payload)
      commit('increment', result)
    }
  }
}

const store = new Vuex.Store({
  modules: {
    a: moduleA
  }
})

// 分发模块中的 action
store.dispatch('a/increment')
store.dispatch('a/incrementAsync', { amount: 10 })
```

在组件中使用命名空间的 actions：

```javascript
import { mapActions } from 'vuex'

export default {
  methods: {
    ...mapActions('a', [
      'increment', // 将 `this.increment()` 映射为 `this.$store.dispatch('a/increment')`
      'incrementAsync'
    ]),
    ...mapActions('a', {
      add: 'increment' // 将 `this.add()` 映射为 `this.$store.dispatch('a/increment')`
    })
  }
}
```

## 实际应用示例

### API 调用

```javascript
// store/modules/user.js
import * as api from '@/api/user'

const actions = {
  async fetchUser({ commit }, userId) {
    commit('SET_LOADING', true)
    try {
      const response = await api.getUser(userId)
      commit('SET_USER', response.data)
      return response.data
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  async updateUser({ commit }, { userId, userData }) {
    try {
      const response = await api.updateUser(userId, userData)
      commit('UPDATE_USER', response.data)
      return response.data
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    }
  },
  
  async deleteUser({ commit }, userId) {
    try {
      await api.deleteUser(userId)
      commit('REMOVE_USER', userId)
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    }
  }
}

export default {
  namespaced: true,
  state: {
    user: null,
    loading: false,
    error: null
  },
  mutations: {
    SET_USER(state, user) {
      state.user = user
    },
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    SET_ERROR(state, error) {
      state.error = error
    },
    UPDATE_USER(state, user) {
      if (state.user && state.user.id === user.id) {
        state.user = { ...state.user, ...user }
      }
    },
    REMOVE_USER(state, userId) {
      if (state.user && state.user.id === userId) {
        state.user = null
      }
    }
  },
  actions
}
```

### 购物车操作

```javascript
// store/modules/cart.js
import * as api from '@/api/cart'

const actions = {
  async addToCart({ commit, state }, product) {
    commit('SET_LOADING', true)
    try {
      // 检查库存
      const stock = await api.checkStock(product.id)
      if (stock < product.quantity) {
        throw new Error('库存不足')
      }
      
      // 添加到购物车
      commit('ADD_TO_CART', product)
      
      // 保存到服务器
      await api.saveCart(state.items)
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  async removeFromCart({ commit }, productId) {
    commit('SET_LOADING', true)
    try {
      commit('REMOVE_FROM_CART', productId)
      await api.removeFromCart(productId)
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  async checkout({ commit, state }) {
    commit('SET_CHECKOUT_LOADING', true)
    try {
      const order = await api.placeOrder(state.items)
      commit('CLEAR_CART')
      return order
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_CHECKOUT_LOADING', false)
    }
  }
}
```

### 列表数据获取

```javascript
// store/modules/list.js
import * as api from '@/api/list'

const actions = {
  async fetchItems({ commit, state }, { page = 1, limit = 10, filters = {} }) {
    commit('SET_LOADING', true)
    try {
      const response = await api.getItems({
        page,
        limit,
        ...filters
      })
      
      commit('SET_ITEMS', response.data.items)
      commit('SET_PAGINATION', {
        page: response.data.page,
        total: response.data.total,
        limit: response.data.limit
      })
      
      return response.data
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  async refreshItems({ dispatch, state }) {
    return dispatch('fetchItems', {
      page: state.pagination.page,
      limit: state.pagination.limit,
      filters: state.filters
    })
  },
  
  async searchItems({ dispatch }, searchTerm) {
    return dispatch('fetchItems', {
      page: 1,
      limit: 10,
      filters: { search: searchTerm }
    })
  }
}
```

## 最佳实践

### 1. 异步操作的处理

```javascript
// ✅ 正确：在 action 中处理异步操作
actions: {
  async fetchData({ commit }) {
    try {
      commit('SET_LOADING', true)
      const data = await api.fetchData()
      commit('SET_DATA', data)
    } catch (error) {
      commit('SET_ERROR', error.message)
    } finally {
      commit('SET_LOADING', false)
    }
  }
}

// ❌ 错误：在 mutation 中处理异步操作
mutations: {
  async SET_DATA(state) { // mutation 不应该包含异步操作
    state.data = await api.fetchData()
  }
}
```

### 2. 错误处理

```javascript
actions: {
  async apiCall({ commit }, payload) {
    try {
      commit('REQUEST_START')
      const result = await api.call(payload)
      commit('REQUEST_SUCCESS', result)
      return result
    } catch (error) {
      commit('REQUEST_FAILURE', error.message)
      throw error // 重新抛出错误，让调用者处理
    } finally {
      commit('REQUEST_END')
    }
  }
}
```

### 3. Action 组合

```javascript
actions: {
  async refreshAll({ dispatch }) {
    // 并行执行
    await Promise.all([
      dispatch('fetchUsers'),
      dispatch('fetchPosts'),
      dispatch('fetchComments')
    ])
  },
  
  async initializeApp({ dispatch }) {
    // 串行执行
    await dispatch('fetchUser')
    await dispatch('fetchSettings')
    await dispatch('fetchNotifications')
  }
}
```

Actions 是 Vuex 中处理异步操作和业务逻辑的重要机制，通过合理使用 actions，可以让状态管理更加有序和可维护。