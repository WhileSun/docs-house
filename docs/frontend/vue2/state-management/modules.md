---
title: Modules
createTime: 2026/02/10 14:45:00
permalink: /frontend/vue2/state-management/modules/
---

# Modules

由于使用単一状态树，应用的所有状态会集中到一个比较大的对象。当应用变得非常复杂时，store 对象就有可能变得相当臃肿。

为了解决以上问题，Vuex 允许我们将 store 分割成模块（module）。每个模块拥有自己的 state、mutation、action、getter、甚至是嵌套子模块——从上至下进行同样方式的分割：

## 基础用法

```javascript
const moduleA = {
  state: () => ({
    count: 0
  }),
  mutations: {
    increment (state) {
      // 这里的 `state` 对象是模块的局部状态
      state.count++
    }
  },
  actions: {
    increment (context) {
      context.commit('increment')
    }
  },
  getters: {
    doubleCount (state) {
      return state.count * 2
    }
  }
}

const moduleB = {
  state: () => ({
    list: []
  }),
  actions: {
    fetchList ({ commit }) {
      return api.getList().then(list => {
        commit('setList', list)
      })
    }
  },
  mutations: {
    setList (state, list) {
      state.list = list
    }
  }
}

const store = new Vuex.Store({
  modules: {
    a: moduleA,
    b: moduleB
  }
})

store.state.a // -> moduleA 的状态
store.state.b // -> moduleB 的状态
```

## 模块的局部状态

在模块内部，可以访问模块的局部状态：

```javascript
const moduleA = {
  state: () => ({
    count: 0
  }),
  // mutations 接收模块的局部状态作为第一个参数
  mutations: {
    increment (state) {
      state.count++
    }
  },
  // actions 接收 { state, commit, rootState, ... } 对象
  actions: {
    increment ({ state, commit, rootState }) {
      if (state.count % 2 === 0) {
        commit('increment')
      }
      if (rootState.count > 10) {
        commit('increment')
      }
    }
  },
  // getters 接收 state, getters, rootState, rootGetters
  getters: {
    doubleCount (state, getters, rootState, rootGetters) {
      return state.count * 2
    },
    sumWithRootCount (state, getters, rootState, rootGetters) {
      return state.count + rootState.count
    }
  }
}
```

## 命名空间

默认情况下，模块内部的 action、mutation 和 getter 仍然是注册在全局命名空间的——这样使得多个模块能够对同一 mutation 或 action 作出响应。

如果希望你的模块具有更高的封装度和复用性，你可以通过添加 `namespaced: true` 的方式使其成为带命名空间的模块：

```javascript
const moduleA = {
  namespaced: true,
  
  // 局部状态
  state: () => ({
    count: 0
  }),
  
  // 局部 mutations
  mutations: {
    increment (state) {
      state.count++
    }
  },
  
  // 局部 actions
  actions: {
    increment ({ commit }) {
      commit('increment')
    },
    incrementIfOdd ({ state, commit }) {
      if (state.count % 2 === 1) {
        commit('increment')
      }
    },
    incrementAsync ({ commit }) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          commit('increment')
          resolve()
        }, 1000)
      })
    }
  },
  
  // 局部 getters
  getters: {
    doubleCount (state) {
      return state.count * 2
    },
    tripleCount (state, getters, rootState) {
      return state.count * 3
    }
  }
}
```

当你使用带命名空间的模块时，dispatch、commit、state 和 getters 都会自动限定在模块的命名空间内：

```javascript
const store = new Vuex.Store({
  modules: {
    a: moduleA
  }
})

// 分发 action
store.dispatch('a/increment') // -> 调用 moduleA 中的 increment action

// 提交 mutation
store.commit('a/increment') // -> 调用 moduleA 中的 increment mutation

// 访问 state
store.state.a // -> moduleA 的状态

// 访问 getter
store.getters['a/doubleCount'] // -> moduleA 的 doubleCount getter
```

## 在组件中使用命名空间模块

### 通过 mapState、mapGetters、mapMutations、mapActions

```javascript
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'

export default {
  computed: {
    // 映射 this.count 为 store.state.a.count
    ...mapState('a', ['count']),
    
    // 或者使用函数形式
    ...mapState('a', {
      count: state => state.count
    }),
    
    // 映射 this.doubleCount 为 store.getters['a/doubleCount']
    ...mapGetters('a', ['doubleCount'])
  },
  methods: {
    // 映射 this.increment() 为 store.commit('a/increment')
    ...mapMutations('a', ['increment']),
    
    // 映射 this.incrementAsync() 为 store.dispatch('a/incrementAsync')
    ...mapActions('a', ['incrementAsync'])
  }
}
```

### 在 actions 中访问其他模块

```javascript
const moduleA = {
  namespaced: true,
  actions: {
    someAction ({ dispatch }) {
      // 分发同一模块中的 action
      dispatch('someOtherAction')
      
      // 分发根级别的 action
      dispatch('someOtherAction', null, { root: true })
    },
    anotherAction ({ dispatch }) {
      // 分发其他命名空间模块的 action
      dispatch('b/someAction', null, { root: true })
    }
  }
}
```

## 嵌套模块

模块可以嵌套，创建更深的模块结构：

```javascript
const moduleA = {
  namespaced: true,
  state: { ... },
  mutations: { ... },
  actions: { ... },
  modules: {
    // 嵵套模块
    moduleB: {
      namespaced: true,
      state: { ... },
      mutations: { ... },
      actions: { ... },
      modules: {
        // 更深的嵌套
        moduleC: {
          namespaced: true,
          state: { ... },
          mutations: { ... },
          actions: { ... }
        }
      }
    }
  }
}

const store = new Vuex.Store({
  modules: {
    a: moduleA
  }
})

// 访问嵌套模块的状态
store.state.a.moduleB.moduleC // -> moduleC 的状态

// 分发嵌套模块的 action
store.dispatch('a/moduleB/moduleC/actionName')
```

## 实际应用示例

### 用户模块

```javascript
// store/modules/user.js
const state = {
  profile: null,
  isAuthenticated: false,
  permissions: []
}

const mutations = {
  SET_PROFILE(state, profile) {
    state.profile = profile
    state.isAuthenticated = !!profile
  },
  SET_PERMISSIONS(state, permissions) {
    state.permissions = permissions
  },
  LOGOUT(state) {
    state.profile = null
    state.isAuthenticated = false
    state.permissions = []
  }
}

const actions = {
  async login({ commit }, credentials) {
    try {
      const response = await api.login(credentials)
      commit('SET_PROFILE', response.data.user)
      commit('SET_PERMISSIONS', response.data.permissions)
      return response
    } catch (error) {
      throw error
    }
  },
  
  async fetchProfile({ commit }) {
    try {
      const response = await api.getProfile()
      commit('SET_PROFILE', response.data)
      return response
    } catch (error) {
      commit('SET_PROFILE', null)
      throw error
    }
  },
  
  logout({ commit }) {
    api.logout()
    commit('LOGOUT')
  }
}

const getters = {
  isLoggedIn: state => state.isAuthenticated,
  userRole: state => state.profile?.role || 'guest',
  hasPermission: state => permission => {
    return state.permissions.includes(permission)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
```

### 产品模块

```javascript
// store/modules/products.js
const state = {
  items: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    total: 0,
    limit: 10
  }
}

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
  SET_PAGINATION(state, pagination) {
    state.pagination = { ...state.pagination, ...pagination }
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
  }
}

const actions = {
  async fetchProducts({ commit }, { page = 1, limit = 10, filters = {} }) {
    commit('SET_LOADING', true)
    try {
      const response = await api.getProducts({ page, limit, ...filters })
      commit('SET_ITEMS', response.data.items)
      commit('SET_PAGINATION', {
        page: response.data.page,
        total: response.data.total,
        limit: response.data.limit
      })
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  async createProduct({ commit }, productData) {
    try {
      const response = await api.createProduct(productData)
      commit('ADD_ITEM', response.data)
      return response
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    }
  }
}

const getters = {
  productsByCategory: state => category => {
    return state.items.filter(item => item.category === category)
  },
  featuredProducts: state => {
    return state.items.filter(item => item.featured)
  },
  totalPages: state => Math.ceil(state.pagination.total / state.pagination.limit)
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
```

### 购物车模块

```javascript
// store/modules/cart.js
const state = {
  items: [],
  coupon: null
}

const mutations = {
  ADD_TO_CART(state, { product, quantity = 1 }) {
    const existingItem = state.items.find(item => item.id === product.id)
    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      state.items.push({ ...product, quantity })
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
  APPLY_COUPON(state, coupon) {
    state.coupon = coupon
  },
  CLEAR_CART(state) {
    state.items = []
    state.coupon = null
  }
}

const getters = {
  subtotal: state => {
    return state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  },
  discount: (state, getters) => {
    if (!state.coupon) return 0
    if (state.coupon.type === 'percentage') {
      return getters.subtotal * (state.coupon.value / 100)
    }
    return Math.min(getters.subtotal, state.coupon.value)
  },
  total: (state, getters) => {
    return getters.subtotal - getters.discount
  },
  itemCount: state => {
    return state.items.reduce((count, item) => count + item.quantity, 0)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  getters
}
```

## 根级别的访问

在命名空间模块中，如果需要访问根级别的状态、getters 或提交根级别的 mutation，可以使用以下方式：

```javascript
const moduleA = {
  namespaced: true,
  actions: {
    someAction ({ state, commit, rootState, rootGetters }) {
      // 访问模块局部状态
      console.log(state.someData)
      
      // 访问根状态
      console.log(rootState.count)
      
      // 访问根 getters
      console.log(rootGetters.someGetter)
      
      // 提交根级别的 mutation
      commit('someRootMutation', payload, { root: true })
      
      // 分发根级别的 action
      dispatch('someRootAction', payload, { root: true })
    }
  }
}
```

Modules 是 Vuex 中组织和管理复杂状态的重要机制，通过合理使用模块，可以让应用的状态管理更加清晰和可维护。