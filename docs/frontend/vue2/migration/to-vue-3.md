---
title: 迁移到 Vue 3
createTime: 2026/02/10 15:35:00
permalink: /frontend/vue2/migration/to-vue-3/
---

# 迁移到 Vue 3

Vue 3 带来了许多重大改进，包括性能提升、更好的 TypeScript 支持、更灵活的 API 设计等。本章将指导你如何从 Vue 2 迁移到 Vue 3。

## Vue 3 的主要变化

### 1. Composition API

Vue 3 引入了 Composition API，提供了更好的逻辑组织方式。

**Vue 2:**
```javascript
export default {
  name: 'UserProfile',
  data() {
    return {
      user: null,
      loading: false,
      error: null
    }
  },
  computed: {
    fullName() {
      return this.user ? `${this.user.firstName} ${this.user.lastName}` : ''
    }
  },
  methods: {
    async fetchUser() {
      this.loading = true
      try {
        this.user = await api.getUser()
      } catch (err) {
        this.error = err.message
      } finally {
        this.loading = false
      }
    }
  },
  mounted() {
    this.fetchUser()
  }
}
```

**Vue 3:**
```javascript
import { ref, computed, onMounted } from 'vue'

export default {
  name: 'UserProfile',
  setup() {
    const user = ref(null)
    const loading = ref(false)
    const error = ref(null)

    const fullName = computed(() => {
      return user.value ? 
        `${user.value.firstName} ${user.value.lastName}` : ''
    })

    const fetchUser = async () => {
      loading.value = true
      try {
        user.value = await api.getUser()
      } catch (err) {
        error.value = err.message
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      fetchUser()
    })

    return {
      user,
      loading,
      error,
      fullName,
      fetchUser
    }
  }
}
```

### 2. 响应式系统改进

Vue 3 使用 Proxy 替代了 `Object.defineProperty`，解决了 Vue 2 中的许多限制：

**Vue 2 的限制:**
```javascript
// Vue 2 中无法检测到以下变化
vm.items[indexOfItem] = newValue
vm.items.length = newLength
```

**Vue 3 中的改进:**
```javascript
// Vue 3 中这些操作都能被正确检测
items.value[indexOfItem] = newValue
items.value.length = newLength
```

### 3. Fragment

Vue 3 允许组件有多个根节点（Fragment）：

**Vue 2:**
```vue
<template>
  <!-- 必须有一个根元素 -->
  <div>
    <header>Header</header>
    <main>Main content</main>
    <footer>Footer</footer>
  </div>
</template>
```

**Vue 3:**
```vue
<template>
  <!-- 可以有多个根元素 -->
  <header>Header</header>
  <main>Main content</main>
  <footer>Footer</footer>
</template>
```

## 迁移策略

### 1. 渐进式迁移

对于大型应用，建议采用渐进式迁移策略：

1. **保持现有代码**: 不要一次性重写所有代码
2. **新功能使用 Vue 3**: 新开发的功能使用 Vue 3
3. **逐步重构**: 逐步将现有组件迁移到 Composition API
4. **测试验证**: 确保迁移过程中功能正常

### 2. 使用 Vue 2.7

Vue 2.7 包含了许多 Vue 3 的兼容性改进，可以作为迁移到 Vue 3 的中间步骤：

```bash
npm install vue@2.7
```

## 主要 API 变化

### 1. 生命周期钩子

| Vue 2 | Vue 3 |
|-------|-------|
| beforeCreate | setup() |
| created | setup() |
| beforeMount | onBeforeMount |
| mounted | onMounted |
| beforeUpdate | onBeforeUpdate |
| updated | onUpdated |
| beforeDestroy | onBeforeUnmount |
| destroyed | onUnmounted |
| activated | onActivated |
| deactivated | onDeactivated |

### 2. this 指向变化

在 Composition API 中，`this` 不再指向组件实例：

**Vue 2:**
```javascript
export default {
  methods: {
    handleClick() {
      console.log(this.message) // this 指向组件实例
    }
  }
}
```

**Vue 3:**
```javascript
import { getCurrentInstance } from 'vue'

export default {
  setup() {
    const { ctx } = getCurrentInstance() // 获取组件上下文
    
    const handleClick = () => {
      console.log(ctx.message) // 通过 ctx 访问
    }
    
    return {
      handleClick
    }
  }
}
```

### 3. 插件系统

**Vue 2:**
```javascript
Vue.use(MyPlugin)
```

**Vue 3:**
```javascript
const app = createApp({})
app.use(MyPlugin)
```

## 迁移工具

### 1. Vue 3 Migration Build

Vue 3 提供了一个迁移构建版本，包含运行时警告：

```bash
npm install vue@next
```

### 2. ESLint 插件

使用 ESLint 插件来检测需要修改的代码：

```json
{
  "extends": [
    "@vue/next"
  ]
}
```

## 迁移检查清单

### 1. 代码层面

- [ ] 更新 Vue 版本
- [ ] 检查第三方库兼容性
- [ ] 迁移响应式数据（使用 ref/reactive）
- [ ] 迁移生命周期钩子
- [ ] 迁移计算属性和侦听器
- [ ] 更新插件安装方式
- [ ] 检查自定义指令
- [ ] 更新渲染函数

### 2. 构建配置

- [ ] 更新构建工具配置
- [ ] 更新 TypeScript 配置（如果使用）
- [ ] 更新 ESLint 和 Prettier 配置
- [ ] 更新测试配置

### 3. 生态系统

- [ ] 更新 Vue Router 到 4.x
- [ ] 更新 Vuex 到 4.x 或迁移到 Pinia
- [ ] 更新 UI 库（如 Element Plus 替代 Element UI）
- [ ] 更新其他 Vue 相关库

## 实际迁移示例

### 迁移一个复杂组件

**Vue 2 组件:**
```vue
<template>
  <div class="user-list">
    <div class="controls">
      <input v-model="searchTerm" placeholder="搜索用户..." />
      <select v-model="filterRole">
        <option value="">所有角色</option>
        <option value="admin">管理员</option>
        <option value="user">用户</option>
      </select>
    </div>
    
    <div class="user-grid">
      <div 
        v-for="user in filteredUsers" 
        :key="user.id" 
        class="user-card"
        @click="selectUser(user)"
      >
        <h3>{{ user.name }}</h3>
        <p>{{ user.email }}</p>
        <span class="role">{{ user.role }}</span>
      </div>
    </div>
    
    <div class="pagination">
      <button @click="prevPage" :disabled="currentPage === 1">上一页</button>
      <span>第 {{ currentPage }} 页</span>
      <button @click="nextPage" :disabled="currentPage === totalPages">下一页</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserList',
  data() {
    return {
      users: [],
      searchTerm: '',
      filterRole: '',
      currentPage: 1,
      pageSize: 10,
      loading: false,
      selectedUser: null
    }
  },
  computed: {
    filteredUsers() {
      return this.users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                             user.email.toLowerCase().includes(this.searchTerm.toLowerCase())
        const matchesRole = !this.filterRole || user.role === this.filterRole
        return matchesSearch && matchesRole
      })
    },
    totalPages() {
      return Math.ceil(this.filteredUsers.length / this.pageSize)
    },
    paginatedUsers() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.filteredUsers.slice(start, end)
    }
  },
  async created() {
    await this.loadUsers()
  },
  methods: {
    async loadUsers() {
      this.loading = true
      try {
        const response = await api.getUsers()
        this.users = response.data
      } catch (error) {
        console.error('加载用户失败:', error)
      } finally {
        this.loading = false
      }
    },
    selectUser(user) {
      this.selectedUser = user
      this.$emit('user-selected', user)
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++
      }
    }
  },
  watch: {
    searchTerm() {
      this.currentPage = 1 // 搜索时回到第一页
    },
    filterRole() {
      this.currentPage = 1 // 过滤时回到第一页
    }
  }
}
</script>
```

**Vue 3 迁移后:**
```vue
<template>
  <div class="user-list">
    <div class="controls">
      <input v-model="searchTerm" placeholder="搜索用户..." />
      <select v-model="filterRole">
        <option value="">所有角色</option>
        <option value="admin">管理员</option>
        <option value="user">用户</option>
      </select>
    </div>
    
    <div class="user-grid">
      <div 
        v-for="user in paginatedUsers" 
        :key="user.id" 
        class="user-card"
        @click="selectUser(user)"
      >
        <h3>{{ user.name }}</h3>
        <p>{{ user.email }}</p>
        <span class="role">{{ user.role }}</span>
      </div>
    </div>
    
    <div class="pagination">
      <button @click="prevPage" :disabled="currentPage === 1">上一页</button>
      <span>第 {{ currentPage }} 页</span>
      <button @click="nextPage" :disabled="currentPage === totalPages">下一页</button>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import * as api from '@/api/users'

export default {
  name: 'UserList',
  emits: ['user-selected'],
  setup(props, { emit }) {
    const users = ref([])
    const searchTerm = ref('')
    const filterRole = ref('')
    const currentPage = ref(1)
    const pageSize = ref(10)
    const loading = ref(false)
    const selectedUser = ref(null)

    const filteredUsers = computed(() => {
      return users.value.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
                             user.email.toLowerCase().includes(searchTerm.value.toLowerCase())
        const matchesRole = !filterRole.value || user.role === filterRole.value
        return matchesSearch && matchesRole
      })
    })

    const totalPages = computed(() => {
      return Math.ceil(filteredUsers.value.length / pageSize.value)
    })

    const paginatedUsers = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      return filteredUsers.value.slice(start, end)
    })

    const loadUsers = async () => {
      loading.value = true
      try {
        const response = await api.getUsers()
        users.value = response.data
      } catch (error) {
        console.error('加载用户失败:', error)
      } finally {
        loading.value = false
      }
    }

    const selectUser = (user) => {
      selectedUser.value = user
      emit('user-selected', user)
    }

    const prevPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--
      }
    }

    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++
      }
    }

    // 监听搜索和过滤变化
    watch([searchTerm, filterRole], () => {
      currentPage.value = 1 // 搜索或过滤时回到第一页
    })

    onMounted(async () => {
      await loadUsers()
    })

    return {
      users,
      searchTerm,
      filterRole,
      currentPage,
      pageSize,
      loading,
      selectedUser,
      filteredUsers,
      totalPages,
      paginatedUsers,
      loadUsers,
      selectUser,
      prevPage,
      nextPage
    }
  }
}
</script>
```

## 迁移最佳实践

### 1. 使用 Vue 3 的新特性

- **Teleport**: 将内容渲染到 DOM 树的任何位置
- **Suspense**: 处理异步组件和数据获取
- **Fragments**: 多根节点组件
- **Emits 选项**: 显式声明组件事件

### 2. 保持向后兼容

在迁移过程中，可以使用 `@vue/composition-api` 插件在 Vue 2 中使用 Composition API：

```bash
npm install @vue/composition-api
```

```javascript
import Vue from 'vue'
import CompositionAPI from '@vue/composition-api'

Vue.use(CompositionAPI)
```

### 3. 测试策略

- **单元测试**: 更新测试框架和工具
- **集成测试**: 确保组件间交互正常
- **端到端测试**: 验证整体功能

## 常见问题及解决方案

### 1. 插件兼容性

许多 Vue 2 插件需要更新到支持 Vue 3 的版本：

```javascript
// Vue 2
Vue.use(VueRouter)
Vue.use(Vuex)

// Vue 3
import { createApp } from 'vue'
const app = createApp({})
app.use(router)
app.use(store)
```

### 2. TypeScript 支持

Vue 3 提供了更好的 TypeScript 支持：

```typescript
import { defineComponent, ref, computed } from 'vue'

export default defineComponent({
  name: 'UserComponent',
  props: {
    userId: {
      type: Number,
      required: true
    }
  },
  setup(props) {
    const user = ref<User | null>(null)
    
    const userDisplayName = computed(() => {
      return user.value?.name || 'Unknown User'
    })
    
    return {
      user,
      userDisplayName
    }
  }
})
```

### 3. 性能优化

Vue 3 带来了显著的性能提升：

- **更快的虚拟 DOM**: 优化的 diff 算法
- **更小的包体积**: 更好的 tree-shaking
- **更好的内存使用**: 优化的响应式系统

迁移到 Vue 3 是一个渐进的过程，建议根据项目实际情况制定合适的迁移计划，充分利用 Vue 3 的新特性和性能优势。