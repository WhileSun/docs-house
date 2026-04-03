---
title: 错误处理
createTime: 2026/02/11 23:30:00
permalink: /frontend/vue3/guide/error-handling/
---

# Vue3 错误处理指南

Vue3 提供了完善的错误处理机制，帮助开发者构建更健壮的应用。

## 全局错误处理

### 1. 全局错误处理器

Vue3 提供了全局错误处理器，可以捕获所有未被处理的错误：

```javascript
import { createApp } from 'vue'

const app = createApp(App)

// 设置全局错误处理器
app.config.errorHandler = (err, instance, info) => {
  console.error('全局错误:', err)
  console.error('组件实例:', instance)
  console.error('错误信息:', info)
  
  // 上报错误到监控服务
  reportError(err, instance, info)
}

// 错误上报函数
function reportError(err, instance, info) {
  // 发送到错误监控服务
  fetch('/api/errors', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: err.message,
      stack: err.stack,
      component: instance?.$options.name,
      info: info,
      url: window.location.href,
      timestamp: new Date().toISOString()
    })
  }).catch(console.error)
}
```

### 2. 全局未捕获的 Promise 错误

```javascript
// 处理未捕获的 Promise 错误
window.addEventListener('unhandledrejection', event => {
  console.error('未捕获的 Promise 错误:', event.reason)
  reportError(event.reason, null, 'unhandled promise rejection')
  
  // 阻止默认行为（控制台错误）
  // event.preventDefault() // 通常不建议这样做
})
```

## 组件级错误处理

### 1. 使用 onErrorCaptured

```vue
<script setup>
import { onErrorCaptured } from 'vue'

// 捕获子组件错误
onErrorCaptured((err, instance, info) => {
  console.error('捕获到子组件错误:', err)
  console.error('错误组件:', instance)
  console.error('错误信息:', info)
  
  // 返回 false 可以阻止错误继续向上传播
  return false
})
</script>
```

### 2. Options API 中的 errorCaptured

```javascript
export default {
  name: 'ParentComponent',
  
  errorCaptured(err, instance, info) {
    console.error('捕获到子组件错误:', err)
    console.error('错误组件:', instance)
    console.error('错误信息:', info)
    
    // 返回 false 可以阻止错误继续向上传播
    return false
  }
}
```

## 异步错误处理

### 1. 处理异步操作错误

```vue
<script setup>
import { ref } from 'vue'

const data = ref(null)
const error = ref(null)
const loading = ref(false)

const fetchData = async () => {
  loading.value = true
  error.value = null
  
  try {
    const response = await fetch('/api/data')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    data.value = await response.json()
  } catch (err) {
    error.value = err.message
    console.error('数据获取失败:', err)
  } finally {
    loading.value = false
  }
}
</script>
```

### 2. 在 Composables 中处理错误

```javascript
// composables/useApi.js
import { ref } from 'vue'

export function useApi() {
  const data = ref(null)
  const error = ref(null)
  const loading = ref(false)

  const request = async (url, options = {}) => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(url, options)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      data.value = await response.json()
      return data.value
    } catch (err) {
      error.value = err.message
      console.error('API请求失败:', err)
      throw err // 重新抛出错误，让调用者处理
    } finally {
      loading.value = false
    }
  }

  return {
    data,
    error,
    loading,
    request
  }
}
```

## 错误边界组件

创建一个错误边界组件来包裹可能出错的组件：

```vue
<!-- ErrorBoundary.vue -->
<template>
  <div v-if="hasError" class="error-boundary">
    <h2>出错了</h2>
    <p>{{ errorMessage }}</p>
    <button @click="resetError">重试</button>
  </div>
  <slot v-else />
</template>

<script setup>
import { ref, onErrorCaptured } from 'vue'

const hasError = ref(false)
const errorMessage = ref('')

onErrorCaptured((err, instance, info) => {
  hasError.value = true
  errorMessage.value = err.message
  
  console.error('ErrorBoundary 捕获错误:', err)
  console.error('组件实例:', instance)
  console.error('错误信息:', info)
  
  // 阻止错误继续向上传播
  return false
})

const resetError = () => {
  hasError.value = false
  errorMessage.value = ''
}
</script>

<style scoped>
.error-boundary {
  padding: 20px;
  background-color: #ffebee;
  border: 1px solid #f44336;
  border-radius: 4px;
  text-align: center;
}
</style>
```

使用错误边界：

```vue
<template>
  <ErrorBoundary>
    <PotentiallyErroneousComponent />
  </ErrorBoundary>
</template>
```

## TypeScript 中的错误处理

### 1. 类型安全的错误处理

```typescript
// types/error.ts
export interface ApiError {
  message: string
  code?: number
  status?: number
  details?: Record<string, any>
}

// composables/useTypedApi.ts
import { ref } from 'vue'

export function useTypedApi<T = any>() {
  const data = ref<T | null>(null)
  const error = ref<ApiError | null>(null)
  const loading = ref(false)

  const request = async (url: string, options?: RequestInit): Promise<T | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(url, options)
      if (!response.ok) {
        const errorData: ApiError = {
          message: `HTTP error! status: ${response.status}`,
          status: response.status,
          code: response.status
        }
        error.value = errorData
        throw errorData
      }
      data.value = await response.json() as T
      return data.value
    } catch (err: any) {
      error.value = {
        message: err.message || '未知错误',
        code: err.code
      }
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    data,
    error,
    loading,
    request
  }
}
```

### 2. 安全的类型转换

```typescript
// utils/typeGuards.ts
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  )
}

// 在组件中使用
const handleError = (err: unknown) => {
  if (isApiError(err)) {
    console.error('API错误:', err.message)
  } else {
    console.error('未知错误:', err)
  }
}
```

## 特定场景的错误处理

### 1. 组件生命周期错误

```vue
<script setup>
import { onMounted, onUnmounted } from 'vue'

onMounted(async () => {
  try {
    // 可能出错的初始化逻辑
    await initializeComponent()
  } catch (err) {
    console.error('组件初始化失败:', err)
    // 处理初始化错误
  }
})

const initializeComponent = async () => {
  // 初始化逻辑
}
</script>
```

### 2. 事件处理器错误

```vue
<template>
  <button @click="handleClick">点击我</button>
</template>

<script setup>
const handleClick = async () => {
  try {
    await performAction()
  } catch (err) {
    console.error('操作失败:', err)
    // 显示用户友好的错误消息
    showErrorMessage('操作失败，请重试')
  }
}

const performAction = async () => {
  // 执行操作
}

const showErrorMessage = (message) => {
  // 显示错误消息的逻辑
}
</script>
```

### 3. 表单验证错误

```vue
<template>
  <form @submit.prevent="handleSubmit">
    <input 
      v-model="form.email" 
      type="email" 
      placeholder="邮箱"
      :class="{ error: errors.email }"
    >
    <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
    
    <button type="submit" :disabled="loading">提交</button>
  </form>
</template>

<script setup>
import { reactive } from 'vue'

const form = reactive({
  email: ''
})

const errors = reactive({})
const loading = ref(false)

const validateForm = () => {
  let isValid = true
  
  // 清除之前的错误
  Object.keys(errors).forEach(key => delete errors[key])
  
  // 验证邮箱
  if (!form.email) {
    errors.email = '邮箱不能为空'
    isValid = false
  } else if (!isValidEmail(form.email)) {
    errors.email = '邮箱格式不正确'
    isValid = false
  }
  
  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }
  
  loading.value = true
  
  try {
    await submitForm(form)
    // 成功处理
  } catch (err) {
    if (err.response?.status === 400) {
      // 处理验证错误
      const validationErrors = err.response.data.errors
      Object.assign(errors, validationErrors)
    } else {
      // 处理其他错误
      console.error('提交失败:', err)
    }
  } finally {
    loading.value = false
  }
}

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const submitForm = async (formData) => {
  // 提交表单的逻辑
}
</script>
```

## 错误分类和处理策略

### 1. 按错误类型分类

```javascript
// utils/errorClassifier.js
export const ErrorType = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  CLIENT_ERROR: 'CLIENT_ERROR',
  BUSINESS_ERROR: 'BUSINESS_ERROR'
}

export function classifyError(error) {
  if (error.message.includes('Network Error')) {
    return ErrorType.NETWORK_ERROR
  }
  
  if (error.status >= 400 && error.status < 500) {
    return ErrorType.CLIENT_ERROR
  }
  
  if (error.status >= 500) {
    return ErrorType.SERVER_ERROR
  }
  
  // 其他业务逻辑错误
  return ErrorType.BUSINESS_ERROR
}
```

### 2. 根据错误类型采取不同策略

```javascript
// composables/useErrorHandler.js
import { ref } from 'vue'
import { ErrorType, classifyError } from '@/utils/errorClassifier'

export function useErrorHandler() {
  const error = ref(null)
  const showError = ref(false)
  
  const handleError = (err, context = {}) => {
    const errorType = classifyError(err)
    
    switch (errorType) {
      case ErrorType.NETWORK_ERROR:
        handleNetworkError(err, context)
        break
      case ErrorType.VALIDATION_ERROR:
        handleValidationError(err, context)
        break
      case ErrorType.SERVER_ERROR:
        handleServerError(err, context)
        break
      default:
        handleGenericError(err, context)
    }
    
    error.value = err
    showError.value = true
  }
  
  const handleNetworkError = (err, context) => {
    console.error('网络错误:', err)
    // 可能尝试重连或提示用户检查网络
  }
  
  const handleValidationError = (err, context) => {
    console.error('验证错误:', err)
    // 在界面上显示验证错误
  }
  
  const handleServerError = (err, context) => {
    console.error('服务器错误:', err)
    // 上报错误到监控系统
  }
  
  const handleGenericError = (err, context) => {
    console.error('通用错误:', err)
    // 通用错误处理逻辑
  }
  
  const clearError = () => {
    error.value = null
    showError.value = false
  }
  
  return {
    error,
    showError,
    handleError,
    clearError
  }
}
```

## 错误恢复策略

### 1. 重试机制

```javascript
// utils/retry.js
export async function retry(fn, options = {}) {
  const {
    retries = 3,
    delay = 1000,
    backoff = false // 是否使用指数退避
  } = options
  
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn()
    } catch (error) {
      if (i === retries) {
        throw error // 最后一次重试失败，抛出错误
      }
      
      // 计算延迟时间
      const waitTime = backoff ? delay * Math.pow(2, i) : delay
      await sleep(waitTime)
    }
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// 使用示例
const fetchData = async () => {
  return await retry(async () => {
    const response = await fetch('/api/data')
    if (!response.ok) throw new Error('Request failed')
    return response.json()
  }, {
    retries: 3,
    delay: 1000,
    backoff: true
  })
}
```

### 2. 降级策略

```javascript
// composables/useFallback.js
import { ref, onMounted } from 'vue'

export function useFallback(primaryAction, fallbackAction) {
  const data = ref(null)
  const error = ref(null)
  const isFallback = ref(false)
  
  const execute = async () => {
    try {
      data.value = await primaryAction()
      isFallback.value = false
    } catch (err) {
      console.warn('Primary action failed, trying fallback:', err)
      try {
        data.value = await fallbackAction()
        isFallback.value = true
      } catch (fallbackErr) {
        error.value = fallbackErr
        throw fallbackErr
      }
    }
  }
  
  return {
    data,
    error,
    isFallback,
    execute
  }
}
```

## 用户体验优化

### 1. 友好的错误消息

```javascript
// utils/userFriendlyError.js
export function getUserFriendlyMessage(error, context = {}) {
  if (error.name === 'NetworkError') {
    return '网络连接失败，请检查网络设置'
  }
  
  if (error.status === 401) {
    return '登录已过期，请重新登录'
  }
  
  if (error.status === 403) {
    return '权限不足，无法执行此操作'
  }
  
  if (error.status === 404) {
    return '请求的资源不存在'
  }
  
  if (error.status === 500) {
    return '服务器内部错误，请稍后再试'
  }
  
  if (error.message.includes('timeout')) {
    return '请求超时，请稍后再试'
  }
  
  // 默认错误消息
  return context.defaultMessage || '操作失败，请稍后再试'
}
```

### 2. 错误状态组件

```vue
<!-- ErrorState.vue -->
<template>
  <div class="error-state">
    <div class="error-icon">⚠️</div>
    <h3>{{ title }}</h3>
    <p>{{ message }}</p>
    <div class="error-actions">
      <button v-if="canRetry" @click="handleRetry" class="retry-btn">
        重试
      </button>
      <button v-if="canGoBack" @click="goBack" class="back-btn">
        返回
      </button>
      <button v-if="canContactSupport" @click="contactSupport" class="support-btn">
        联系支持
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  error: Object,
  title: {
    type: String,
    default: '出现问题'
  },
  message: String,
  canRetry: {
    type: Boolean,
    default: true
  },
  canGoBack: {
    type: Boolean,
    default: true
  },
  canContactSupport: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['retry'])

const router = useRouter()

const handleRetry = () => {
  emit('retry')
}

const goBack = () => {
  router.go(-1)
}

const contactSupport = () => {
  // 联系支持的逻辑
  window.open('mailto:support@example.com')
}
</script>
```

## 最佳实践

### 1. 错误处理原则

- **尽早捕获**: 在可能出现错误的地方及时捕获
- **适当处理**: 根据错误类型采取合适的处理策略
- **用户友好**: 提供清晰、有用的错误信息
- **记录日志**: 记录错误信息用于调试和监控
- **优雅降级**: 在错误发生时提供备选方案

### 2. 避免常见错误处理陷阱

- 不要忽略错误
- 不要重复处理同一错误
- 不要在错误处理中引入新的错误
- 不要向用户显示技术性错误信息

### 3. 错误监控

```javascript
// utils/errorMonitoring.js
class ErrorMonitor {
  constructor(options = {}) {
    this.reporters = options.reporters || []
    this.filters = options.filters || []
  }
  
  addReporter(reporter) {
    this.reporters.push(reporter)
  }
  
  addFilter(filter) {
    this.filters.push(filter)
  }
  
  async report(error, context = {}) {
    // 应用过滤器
    for (const filter of this.filters) {
      if (filter(error, context)) {
        return // 过滤掉这个错误
      }
    }
    
    // 发送到所有报告器
    const promises = this.reporters.map(reporter => 
      reporter.report(error, context).catch(console.error)
    )
    
    await Promise.all(promises)
  }
}

// 使用示例
const monitor = new ErrorMonitor({
  filters: [
    // 过滤掉特定错误
    (error) => error.message.includes('ResizeObserver loop limit exceeded')
  ]
})

monitor.addReporter({
  async report(error, context) {
    // 发送到监控服务
    await fetch('/api/errors', {
      method: 'POST',
      body: JSON.stringify({ error, context })
    })
  }
})
```

通过合理的错误处理策略，可以构建出更加健壮和用户友好的 Vue3 应用。