---
title: 编程式导航
createTime: 2026/02/10 16:00:00
permalink: /frontend/vue2/routing/programmatic-navigation/
---

# 编程式导航

除了使用 `<router-link>` 创建 a 标签来定义导航链接，我们还可以借助 router 的实例方法，通过编写代码来实现导航。

## router.push(location, onComplete?, onAbort?)

想要导航到不同的 URL，则使用 `router.push` 方法。这个方法会向 history 栈添加一个新的记录，所以当用户点击浏览器后退按钮时，则会回到之前的 URL。

该方法的参数可以是一个字符串路径，或者一个描述地址的对象：

```javascript
// 字符串路径
router.push('/users/123')

// 对象
router.push({ path: '/users/123' })

// 带查询参数，变成 /register?plan=private
router.push({ path: '/register', query: { plan: 'private' }})

// 命名的路由
router.push({ name: 'user', params: { userId: 123 }})

// 带查询参数，变成 /user/123?plan=private
router.push({ name: 'user', params: { userId: 123 }, query: { plan: 'private' }})

// 带 hash，变成 /user/123#main
router.push({ path: '/user/123', hash: '#main' })
```

**注意：** 如果提供了 `path`，`params` 会被忽略，上述例子中的 `query` 并不属于这种情况。取而代之的是以下方式：

```javascript
const userId = 123
router.push({ name: 'user', params: { userId }}) // -> /user/123
router.push({ path: `/user/${userId}` }) // -> /user/123
router.push({ path: '/user', params: { userId }}) // -> /user (params 被忽略)
```

## router.replace(location, onComplete?, onAbort?)

跟 `router.push` 很像，唯一的不同就是，它不会向 history 添加新记录，而是跟它的方法名一样 —— 替换掉当前的 history 记录。

```javascript
router.replace('/users/123')
router.replace({ path: '/users/123' })
router.replace({ name: 'user', params: { userId: 123 }})
```

## router.go(n)

这个方法的参数是一个整数，意思是在 history 记录中向前或者后退多少步，类似 `window.history.go(n)`。

```javascript
// 在浏览器记录中前进一步，等同于 history.forward()
router.go(1)

// 在浏览器记录中后退一步，等同于 history.back()
router.go(-1)

// 在浏览器记录中前进 3 步记录
router.go(3)

// 如果记录不够用，静默失败
router.go(-100)
router.go(100)
```

## 操作历史记录

你也许注意到 `router.push`、`router.replace` 和 `router.go` 跟 `window.history.pushState`、`window.history.replaceState` 和 `window.history.go` 比较像，实际上它们确实是效仿 `window.history` API 的。

因此，如果你已经熟悉 Browser History APIs，那么在 Vue Router 中操作 history 记录就会很简单。

## 在组件中使用

在组件中，可以通过 `this.$router` 访问路由器实例：

```vue
<template>
  <div>
    <button @click="goHome">返回首页</button>
    <button @click="goToUser">跳转到用户页面</button>
    <button @click="goBack">返回上一页</button>
    <button @click="goForward">前进一页</button>
  </div>
</template>

<script>
export default {
  methods: {
    goHome() {
      this.$router.push('/')
    },
    goToUser() {
      this.$router.push({ name: 'user', params: { id: 123 }})
    },
    goBack() {
      this.$router.go(-1)
    },
    goForward() {
      this.$router.go(1)
    }
  }
}
</script>
```

## 带参数的导航

### 路由参数

```javascript
// 使用 params
this.$router.push({ 
  name: 'UserProfile', 
  params: { userId: 123, section: 'posts' } 
}) // -> /user/123/posts

// 使用 query
this.$router.push({ 
  path: '/search', 
  query: { q: 'vue', category: 'tutorials' } 
}) // -> /search?q=vue&category=tutorials
```

### 复杂参数

```javascript
// 传递复杂对象（会被序列化）
this.$router.push({
  name: 'ProductDetail',
  params: {
    id: 123,
    filters: JSON.stringify({ color: 'red', size: 'M' })
  }
})

// 或者使用 query 传递复杂参数
this.$router.push({
  path: '/results',
  query: {
    filters: encodeURIComponent(JSON.stringify(complexFilters)),
    sort: 'price',
    page: 1
  }
})
```

## 导航守卫

### 导航完成回调

`router.push`、`router.replace` 和 `router.go` 方法都会返回一个 Promise：

```javascript
// 使用 Promise
this.$router.push('/home').then(() => {
  // 导航完成
  console.log('导航成功')
}).catch(err => {
  // 导航被中断
  if (err.name === 'NavigationDuplicated') {
    // 处于相同路由
    console.log('已在当前路由')
  } else {
    console.error('导航失败:', err)
  }
})

// 使用 async/await
async goToHome() {
  try {
    await this.$router.push('/home')
    console.log('导航成功')
  } catch (err) {
    if (err.name !== 'NavigationDuplicated') {
      console.error('导航失败:', err)
    }
  }
}
```

### 在组件中使用导航守卫

```vue
<template>
  <div>
    <button @click="navigateToProfile">前往个人资料</button>
  </div>
</template>

<script>
export default {
  methods: {
    async navigateToProfile() {
      // 检查用户是否已登录
      if (!this.isLoggedIn) {
        // 重定向到登录页
        await this.$router.push('/login')
        return
      }
      
      // 检查用户权限
      if (!this.hasProfileAccess) {
        await this.$router.push('/unauthorized')
        return
      }
      
      // 正常导航
      await this.$router.push(`/profile/${this.userId}`)
    }
  },
  computed: {
    isLoggedIn() {
      return this.$store.getters.isLoggedIn
    },
    hasProfileAccess() {
      return this.$store.getters.hasProfileAccess
    },
    userId() {
      return this.$store.getters.userId
    }
  }
}
</script>
```

## 高级导航模式

### 条件导航

```javascript
methods: {
  conditionalNavigate(path) {
    // 根据条件决定导航目标
    const targetPath = this.shouldRedirect ? '/redirect-target' : path
    this.$router.push(targetPath)
  },
  
  async safeNavigate(path) {
    try {
      // 验证路径是否有效
      const route = this.$router.resolve(path)
      if (route.route.name) {
        await this.$router.push(path)
      } else {
        console.warn('无效的路由路径:', path)
      }
    } catch (error) {
      console.error('导航失败:', error)
    }
  }
}
```

### 带有确认对话框的导航

```javascript
methods: {
  async navigateWithConfirmation(path, message = '确定要离开当前页面吗？') {
    if (this.hasUnsavedChanges) {
      const confirmed = confirm(message)
      if (!confirmed) return
    }
    
    await this.$router.push(path)
  },
  
  // 使用自定义确认对话框
  async navigateWithCustomConfirm(path) {
    if (this.hasUnsavedChanges) {
      const result = await this.$confirm('离开确认', '您有未保存的更改，确定要离开吗？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      
      if (!result) return
    }
    
    await this.$router.push(path)
  }
}
```

## 实际应用示例

### 表单提交后导航

```vue
<template>
  <form @submit.prevent="submitForm">
    <input v-model="formData.name" placeholder="姓名">
    <input v-model="formData.email" placeholder="邮箱">
    <button type="submit" :disabled="loading">
      {{ loading ? '提交中...' : '提交' }}
    </button>
  </form>
</template>

<script>
export default {
  data() {
    return {
      formData: {
        name: '',
        email: ''
      },
      loading: false
    }
  },
  methods: {
    async submitForm() {
      this.loading = true
      try {
        // 提交表单数据
        await this.saveFormData(this.formData)
        
        // 成功后导航到成功页面
        await this.$router.push({
          name: 'FormSuccess',
          query: { 
            message: '表单提交成功',
            redirect: this.$route.query.redirect || '/dashboard'
          }
        })
      } catch (error) {
        console.error('提交失败:', error)
        // 可以选择留在当前页面或导航到错误页面
        this.$message.error('提交失败，请重试')
      } finally {
        this.loading = false
      }
    },
    
    async saveFormData(data) {
      // 模拟 API 调用
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() > 0.2) { // 80% 成功率
            resolve({ success: true })
          } else {
            reject(new Error('网络错误'))
          }
        }, 1000)
      })
    }
  }
}
</script>
```

### 分页导航

```vue
<template>
  <div>
    <div class="items-list">
      <div v-for="item in items" :key="item.id" class="item">
        {{ item.name }}
      </div>
    </div>
    
    <div class="pagination">
      <button 
        @click="goToPage(currentPage - 1)" 
        :disabled="currentPage <= 1"
      >
        上一页
      </button>
      
      <span>第 {{ currentPage }} 页，共 {{ totalPages }} 页</span>
      
      <button 
        @click="goToPage(currentPage + 1)" 
        :disabled="currentPage >= totalPages"
      >
        下一页
      </button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      items: [],
      currentPage: 1,
      totalPages: 1,
      itemsPerPage: 10
    }
  },
  watch: {
    // 监听路由参数变化
    '$route.query.page': {
      handler(newPage) {
        const page = parseInt(newPage) || 1
        if (page !== this.currentPage) {
          this.currentPage = page
          this.fetchItems()
        }
      },
      immediate: true
    }
  },
  methods: {
    async goToPage(page) {
      if (page < 1 || page > this.totalPages) return
      
      // 更新 URL 参数
      await this.$router.push({
        query: {
          ...this.$route.query,
          page: page
        }
      })
      
      // 重新获取数据
      this.fetchItems()
    },
    
    async fetchItems() {
      try {
        const response = await api.getItems({
          page: this.currentPage,
          limit: this.itemsPerPage,
          ...this.$route.query
        })
        
        this.items = response.data.items
        this.totalPages = response.data.totalPages
      } catch (error) {
        console.error('获取数据失败:', error)
      }
    }
  }
}
</script>
```

### 多步骤向导导航

```vue
<template>
  <div class="wizard">
    <div class="wizard-steps">
      <div 
        v-for="(step, index) in steps" 
        :key="index"
        :class="{
          'step': true,
          'active': index === currentStep,
          'completed': index < currentStep
        }"
        @click="goToStep(index)"
      >
        {{ step.title }}
      </div>
    </div>
    
    <div class="wizard-content">
      <component 
        :is="currentStepComponent" 
        :formData="formData"
        @update="updateFormData"
        @next="nextStep"
        @prev="prevStep"
      />
    </div>
    
    <div class="wizard-navigation">
      <button 
        @click="prevStep" 
        :disabled="currentStep === 0"
      >
        上一步
      </button>
      <button 
        @click="nextStep" 
        :disabled="!isCurrentStepValid"
      >
        {{ currentStep === steps.length - 1 ? '完成' : '下一步' }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      currentStep: 0,
      formData: {},
      steps: [
        { title: '基本信息', component: 'BasicInfoStep', validate: this.validateBasicInfo },
        { title: '联系信息', component: 'ContactInfoStep', validate: this.validateContactInfo },
        { title: '确认信息', component: 'ConfirmationStep', validate: this.validateConfirmation }
      ]
    }
  },
  computed: {
    currentStepComponent() {
      return this.steps[this.currentStep]?.component
    },
    isCurrentStepValid() {
      const validator = this.steps[this.currentStep]?.validate
      return validator ? validator() : true
    }
  },
  methods: {
    async nextStep() {
      if (!this.isCurrentStepValid) return
      
      if (this.currentStep < this.steps.length - 1) {
        this.currentStep++
        await this.updateRoute()
      } else {
        // 完成向导，提交数据
        await this.submitWizard()
      }
    },
    
    async prevStep() {
      if (this.currentStep > 0) {
        this.currentStep--
        await this.updateRoute()
      }
    },
    
    async goToStep(stepIndex) {
      if (stepIndex < this.currentStep) {
        // 允许返回之前的步骤
        this.currentStep = stepIndex
        await this.updateRoute()
      }
    },
    
    async updateRoute() {
      await this.$router.push({
        name: 'wizard',
        params: { step: this.currentStep + 1 },
        query: { ...this.$route.query }
      })
    },
    
    async submitWizard() {
      try {
        await api.submitWizard(this.formData)
        
        // 导航到成功页面
        await this.$router.push({
          name: 'WizardSuccess',
          params: { wizardId: this.wizardId }
        })
      } catch (error) {
        console.error('提交失败:', error)
        this.$message.error('提交失败，请重试')
      }
    },
    
    updateFormData(data) {
      this.formData = { ...this.formData, ...data }
    },
    
    // 验证方法
    validateBasicInfo() {
      return this.formData.name && this.formData.email
    },
    validateContactInfo() {
      return this.formData.phone && this.formData.address
    },
    validateConfirmation() {
      return this.formData.termsAccepted
    }
  }
}
</script>
```

## 性能考虑

### 避免不必要的导航

```javascript
methods: {
  async safeNavigate(to) {
    // 避免导航到当前路由
    if (this.$route.path === to) {
      return
    }
    
    try {
      await this.$router.push(to)
    } catch (err) {
      // 处理导航重复错误
      if (err.name !== 'NavigationDuplicated') {
        throw err
      }
    }
  }
}
```

### 导航前的数据保存

```javascript
methods: {
  async navigateWithSave(targetPath) {
    // 如果有未保存的更改，先保存
    if (this.hasUnsavedChanges) {
      try {
        await this.saveChanges()
      } catch (error) {
        const shouldContinue = confirm('保存失败，是否继续导航？')
        if (!shouldContinue) return
      }
    }
    
    await this.$router.push(targetPath)
  }
}
```

编程式导航是 Vue Router 的重要功能，通过合理使用编程式导航，可以实现复杂的导航逻辑和用户体验。