---
title: State
createTime: 2026/02/10 14:05:00
permalink: /frontend/vue2/state-management/state/
---

# State

State（状态）是 Vuex 的核心概念之一，它存储着应用的所有状态数据。

## 单一状态树

Vuex 使用単一状态树 - 用一个对象就包含了全部的应用层级状态。至此它便作为一个"唯一数据源 (SSOT)"而存在。这也意味着，每个应用将仅仅包含一个 store 实例。

```javascript
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    count: 0
  }
})
```

在 Vue 组件中获取状态：

```javascript
const Counter = {
  template: `<div>{{ count }}</div>`,
  computed: {
    count () {
      return this.$store.state.count
    }
  }
}
```

## 在组件中获取 Vuex 状态

虽然在组件中获取 `this.$store.state` 很简单，但这会增加组件和全局状态的耦合。为了解决这个问题，我们可以使用计算属性来获取状态：

```javascript
// 在组件中
computed: {
  count () {
    return this.$store.state.count
  }
}
```

## mapState 辅助函数

当一个组件需要获取多个状态时，将这些状态都声明为计算属性会有些重复和冗余。为了解决这个问题，我们可以使用 `mapState` 辅助函数帮助我们生成计算属性：

```javascript
// 在单独构建的版本中辅助函数为 Vuex.mapState
import { mapState } from 'vuex'

export default {
  // ...
  computed: mapState({
    // 箭头函数可使代码更简练
    count: state => state.count,

    // 传字符串参数 'count' 等同于 `state => state.count`
    countAlias: 'count',

    // 为了能够使用 `this` 获取局部状态，必须使用常规函数
    countPlusLocalState (state) {
      return state.count + this.localCount
    }
  })
}
```

当映射的计算属性的名称与 state 的子节点名称相同时，我们也可以给 `mapState` 传一个字符串数组：

```javascript
computed: mapState([
  // 映射 this.count 为 store.state.count
  'count'
])
```

## 对象展开运算符

为了将局部计算属性与 `mapState` 混合使用，我们可以使用对象展开运算符：

```javascript
computed: {
  localComputed () { /* ... */ },
  // 将 this.$store.state.count 映射为计算属性
  ...mapState({
    count: 'count'
  })
}
```

## 组件结构化状态

在大型应用中，我们通常会将状态按模块组织：

```javascript
const store = new Vuex.Store({
  state: {
    user: {
      name: '',
      email: '',
      isLoggedIn: false
    },
    posts: [],
    ui: {
      loading: false,
      error: null
    }
  }
})
```

访问嵌套状态：

```javascript
computed: {
  userName () {
    return this.$store.state.user.name
  },
  isLoading () {
    return this.$store.state.ui.loading
  }
}
```

## 组件本地状态 vs 全局状态

并非所有状态都应该放在 Vuex 中。以下是一些判断准则：

### 全局状态适用于：

- 多个组件共享的状态
- 需要在组件间传递的复杂数据
- 需要持久化的状态
- 需要跨组件通信的状态

### 本地状态适用于：

- 组件私有的状态
- 不会被其他组件访问的状态
- 临时的 UI 状态（如表单输入、展开/收起状态等）

```javascript
// 全局状态 - 适合放在 Vuex 中
const globalState = {
  user: { /* 用户信息 */ },
  cart: { /* 购物车 */ },
  notifications: [ /* 通知列表 */ ]
}

// 本地状态 - 适合放在组件中
const localState = {
  showModal: false,
  dropdownOpen: false,
  formInput: ''
}
```

## 实际应用示例

### 用户信息状态管理

```javascript
// store/modules/user.js
const state = {
  profile: null,
  isAuthenticated: false,
  permissions: []
}

export default {
  namespaced: true,
  state
}
```

在组件中使用：

```javascript
import { mapState } from 'vuex'

export default {
  computed: {
    ...mapState('user', ['profile', 'isAuthenticated', 'permissions']),
    displayName() {
      return this.profile ? this.profile.name : 'Guest'
    }
  },
  methods: {
    checkPermission(permission) {
      return this.permissions.includes(permission)
    }
  }
}
```

### 列表数据状态管理

```javascript
// store/modules/list.js
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

export default {
  namespaced: true,
  state
}
```

在组件中使用：

```javascript
import { mapState } from 'vuex'

export default {
  computed: {
    ...mapState('list', ['items', 'loading', 'error', 'pagination'])
  },
  created() {
    this.fetchItems()
  },
  methods: {
    async fetchItems() {
      this.$store.commit('list/SET_LOADING', true)
      try {
        const response = await api.getItems()
        this.$store.commit('list/SET_ITEMS', response.data)
      } catch (error) {
        this.$store.commit('list/SET_ERROR', error.message)
      } finally {
        this.$store.commit('list/SET_LOADING', false)
      }
    }
  }
}
```

State 是 Vuex 的核心，通过合理组织和管理状态，可以让应用的数据流更加清晰和可维护。