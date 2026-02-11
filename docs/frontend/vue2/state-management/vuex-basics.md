---
title: Vuex 基础
createTime: 2026/02/10 13:00:00
permalink: /frontend/vue2/state-management/vuex-basics/
---

# Vuex 基础

Vuex 是一个专为 Vue.js 应用程序开发的状态管理模式。它采用集中式存储管理应用的所有组件的状态，并以相应的规则保证状态以一种可预测的方式发生变化。

## 什么是 Vuex?

Vuex 可以帮助我们管理共享状态，并附带了更多的概念和框架。这需要对短期和长期效益进行权衡。

如果你不打算开发大型单页应用，使用 Vuex 可能是繁琐和浪费的。如果是中小型项目，您可能不需要 Vuex。但是，如果您需要构建一个中大型单页应用，您很可能会考虑如何更好地在组件外部管理状态，Vuex 将会成为自然而然的选择。

## 安装

通过 NPM 安装：

```bash
npm install vuex
```

## Hello World

每一个 Vuex 应用的核心就是 store（仓库）。"store" 基本上就是一个容器，它包含着你的应用中大部分的状态 (state)。

```javascript
// 如果在模块化构建系统中
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

// 创建一个 store
const store = new Vuex.Store({
  state: {
    count: 0
  },
  mutations: {
    increment (state) {
      state.count++
    }
  }
})

// 现在，你可以通过 store.state 来获取状态对象，并通过 store.commit 方法触发状态变更
store.commit('increment')
console.log(store.state.count) // -> 1
```

## State

### 单一状态树

Vuex 使用单一状态树 - 是的，用一个对象就包含了全部的应用层级状态。至此它便作为一个"唯一数据源 (SSOT)"而存在。这也意味着，每个应用将仅仅包含一个 store 实例。

### 在 Vue 组件中获得 Vuex 状态

```javascript
// 创建一个 Counter 组件
const Counter = {
  template: `<div>{{ count }}</div>`,
  computed: {
    count () {
      return store.state.count
    }
  }
}
```

然而，这种模式导致组件依赖全局状态单例。在模块化系统中使用时，这会增加测试的难度。

Vuex 通过 `store` 选项，提供了一种机制将状态从根组件"注入"到每一个子组件中（需调用 `Vue.use(Vuex)`）：

```javascript
const app = new Vue({
  el: '#app',
  // 把 store 对象提供给 "store" 选项，这可以把 store 的实例注入所有的子组件
  store,
  components: { Counter },
  template: `
    <div class="app">
      <counter></counter>
    </div>
  `
})
```

通过在根实例中注册 `store` 选项，该 store 实例会注入到根组件下的所有子组件中，且子组件能通过 `this.$store` 访问到。

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

### mapState 辅助函数

当一个组件需要获取多个状态时候，将这些状态都声明为计算属性会有些重复和冗余。为了解决这个问题，我们可以使用 `mapState` 辅助函数帮助我们生成计算属性：

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

## Getter

有时候我们需要从 store 中的 state 中派生出一些状态，例如对列表进行过滤并计数：

```javascript
computed: {
  doneTodosCount () {
    return this.$store.state.todos.filter(todo => todo.done).length
  }
}
```

如果有多个组件需要用到此属性，我们要么复制这个函数，或者抽取到一个共享函数然后在多处导入它 - 无论哪种方式都不是很理想。

Vuex 允许我们在 store 中定义"getter"（可以认为是 store 的计算属性）。就像计算属性一样，getter 的返回值会根据它的依赖被缓存起来，且只有当它的依赖值发生了改变才会被重新计算。

```javascript
const store = new Vuex.Store({
  state: {
    todos: [
      { id: 1, text: '...', done: true },
      { id: 2, text: '...', done: false }
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

Getter 会暴露为 `store.getters` 对象：

```javascript
store.getters.doneTodos // -> [{ id: 1, text: '...', done: true }]
store.getters.doneTodosCount // -> 1
store.getters.getTodoById(2) // -> { id: 2, text: '...', done: false }
```

在组件中使用：

```javascript
computed: {
  doneTodosCount () {
    return this.$store.getters.doneTodosCount
  }
}
```

### mapGetters 辅助函数

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

## Mutation

更改 Vuex 的 store 中的状态的唯一方法是提交 mutation。Vuex 中的 mutation 非常类似于事件：每个 mutation 都有一个字符串的 事件类型 (type) 和 一个 回调函数 (handler)。

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
```

你不能直接调用一个 mutation handler。这个选项更像是事件注册："当触发一个类型为 `increment` 的 mutation 时，调用此函数。"要唤醒一个 mutation handler，你需要以相应的 type 调用 `store.commit` 方法：

```javascript
store.commit('increment')
```

### 提交载荷（Payload）

你可以向 `store.commit` 传入额外的参数，即 mutation 的 载荷（payload）：

```javascript
mutations: {
  increment (state, n) {
    state.count += n
  }
}
```

```javascript
store.commit('increment', 10)
```

在大多数情况下，载荷应该是一个对象，这样可以包含多个字段并且记录的 mutation 会更易读：

```javascript
mutations: {
  increment (state, payload) {
    state.count += payload.amount
  }
}
```

```javascript
store.commit('increment', {
  amount: 10
})
```

### mapMutations 辅助函数

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

## Action

Action 类似于 mutation，不同在于：

- Action 提交的是 mutation，而不是直接变更状态。
- Action 可以包含任意异步操作。

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

实践中，我们会经常用到 ES2015 的参数解构来简化代码（特别是我们需要调用 `commit` 很多次的时候）：

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

### mapActions 辅助函数

```javascript
import { mapActions } from 'vuex'

export default {
  // ...
  methods: {
    ...mapActions([
      'increment', // 将 `this.increment()` 映射为 `this.$store.dispatch('increment')`
      'incrementBy' // 将 `this.incrementBy(amount)` 映射为 `this.$store.dispatch('incrementBy', amount)`
    ]),
    ...mapActions({
      add: 'increment' // 将 `this.add()` 映射为 `this.$store.dispatch('increment')`
    })
  }
}
```

## Module

由于使用单一状态树，应用的所有状态会集中到一个比较大的对象。当应用变得非常复杂时，store 对象就有可能变得相当臃肿。

为了解决以上问题，Vuex 允许我们将 store 分割成模块（module）。每个模块拥有自己的 state、mutation、action、getter、甚至是嵌套子模块——从上至下进行同样方式的分割：

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

## 完整示例

```javascript
// store/index.js
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    todos: [
      { id: 1, text: 'Learn Vue', done: true },
      { id: 2, text: 'Learn Vuex', done: false }
    ]
  },
  getters: {
    doneTodos: state => {
      return state.todos.filter(todo => todo.done)
    },
    todoCount: state => {
      return state.todos.length
    }
  },
  mutations: {
    ADD_TODO (state, todo) {
      state.todos.push(todo)
    },
    TOGGLE_TODO (state, todo) {
      todo.done = !todo.done
    }
  },
  actions: {
    addTodo ({ commit }, text) {
      const todo = {
        id: Date.now(),
        text,
        done: false
      }
      commit('ADD_TODO', todo)
    },
    toggleTodo ({ commit }, todo) {
      commit('TOGGLE_TODO', todo)
    }
  }
})
```

```javascript
// main.js
import Vue from 'vue'
import App from './App.vue'
import store from './store'

new Vue({
  store,
  render: h => h(App)
}).$mount('#app')
```

```vue
<!-- component/TodoList.vue -->
<template>
  <div>
    <ul>
      <li v-for="todo in todos" :key="todo.id">
        <input 
          type="checkbox" 
          :checked="todo.done" 
          @change="toggleTodo(todo)"
        >
        <span :class="{ done: todo.done }">{{ todo.text }}</span>
      </li>
    </ul>
    <form @submit.prevent="addTodo">
      <input v-model="newTodo" placeholder="Add new todo">
      <button>Add</button>
    </form>
    <p>Done: {{ doneTodos.length }} / Total: {{ todoCount }}</p>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'

export default {
  computed: {
    ...mapState(['todos']),
    ...mapGetters(['doneTodos', 'todoCount'])
  },
  data() {
    return {
      newTodo: ''
    }
  },
  methods: {
    ...mapMutations(['TOGGLE_TODO']),
    ...mapActions(['addTodo']),
    
    toggleTodo(todo) {
      this.TOGGLE_TODO(todo)
    }
  }
}
</script>

<style>
.done {
  text-decoration: line-through;
}
</style>
```

Vuex 是 Vue.js 应用状态管理的标准解决方案，通过合理使用 Vuex，可以让应用的状态管理变得更加可预测和可维护。