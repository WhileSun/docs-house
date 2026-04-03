---
title: API变更
createTime: 2026/02/11 22:50:00
permalink: /frontend/vue3/guide/api-changes/
---

# Vue3 API 变更

Vue3 对 Vue2 的 API 进行了多项改进和变更，本指南将详细介绍这些变化。

## 全局 API 变更

### 1. 应用实例创建

**Vue2:**
```javascript
import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
```

**Vue3:**
```javascript
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

app.config.productionTip = false

app.mount('#app')
```

### 2. 全局 API 移植到应用实例

**Vue2:**
```javascript
Vue.component('MyComponent', MyComponent)
Vue.directive('MyDirective', MyDirective)
Vue.mixin(myMixin)
```

**Vue3:**
```javascript
app.component('MyComponent', MyComponent)
app.directive('MyDirective', MyDirective)
app.mixin(myMixin)
```

## 模板指令变更

### 1. v-model 变更

**Vue2:**
```vue
<!-- 等价于 -->
<ChildComponent :value="value" @input="value = $event" />
```

**Vue3:**
```vue
<!-- 等价于 -->
<ChildComponent :modelValue="value" @update:modelValue="value = $event" />
```

**多 v-model:**
```vue
<ChildComponent 
  v-model:title="pageTitle" 
  v-model:content="pageContent" 
/>
```

### 2. 事件系统变更

**Vue2:**
```javascript
// 移除的 API
vm.$on()
vm.$off()
vm.$once()
```

**Vue3:**
```javascript
// 需要使用外部事件总线
import { emitter } from '@/utils/emitter'

// 发送事件
emitter.emit('event-name', data)

// 监听事件
emitter.on('event-name', handler)

// 移除监听
emitter.off('event-name', handler)
```

## 组件变更

### 1. Fragments

Vue3 支持多根节点组件：

**Vue2 (不允许):**
```vue
<template>
  <header>Header</header>
  <main>Main content</main>
  <footer>Footer</footer>
</template>
```

**Vue3 (允许):**
```vue
<template>
  <header>Header</header>
  <main>Main content</main>
  <footer>Footer</footer>
</template>
```

### 2. Emits 校验

**Vue2:**
```javascript
export default {
  methods: {
    handleClick() {
      this.$emit('custom-event', data)
    }
  }
}
```

**Vue3:**
```vue
<script setup>
const emit = defineEmits(['update', 'change'])

// 带校验的 emits
const emitWithValidation = defineEmits({
  'update:modelValue': (value) => {
    if (typeof value !== 'string') {
      console.warn('Invalid value type')
      return false
    }
    return true
  },
  submit: (formData) => {
    if (!formData.email) {
      console.warn('Email is required')
      return false
    }
    return true
  }
})

const handleClick = () => {
  emit('update', data)
}
</script>
```

## 响应式系统变更

### 1. 使用 Proxy 替代 Object.defineProperty

Vue3 使用 Proxy 提供了更强大的响应式能力：

**优势:**
- 支持数组索引变化
- 支持 Map、Set、WeakMap、WeakSet
- 更好的性能表现

**Vue2 限制:**
```javascript
// Vue2 中无法检测到
vm.items[indexOfItem] = newValue
vm.items.length = newLength
```

**Vue3 中可以检测:**
```javascript
// Vue3 中可以检测到
state.items[indexOfItem] = newValue
state.items.length = newLength
```

### 2. ref vs reactive

**Vue2:**
```javascript
export default {
  data() {
    return {
      count: 0,
      user: {
        name: 'Vue',
        age: 3
      }
    }
  }
}
```

**Vue3:**
```javascript
import { ref, reactive, toRefs } from 'vue'

// 基本类型使用 ref
const count = ref(0)

// 对象类型使用 reactive
const user = reactive({
  name: 'Vue',
  age: 3
})

// 或者使用 ref 包装对象
const userRef = ref({
  name: 'Vue',
  age: 3
})
```

## 生命周期钩子变更

### Options API 生命周期

| Vue2 | Vue3 |
|------|------|
| beforeCreate | setup() |
| created | setup() |
| beforeMount | onBeforeMount |
| mounted | onMounted |
| beforeUpdate | onBeforeUpdate |
| updated | onUpdated |
| beforeDestroy | onBeforeUnmount |
| destroyed | onUnmounted |

### Composition API 中使用

```javascript
import { 
  onBeforeMount, 
  onMounted, 
  onBeforeUpdate, 
  onUpdated,
  onBeforeUnmount,
  onUnmounted 
} from 'vue'

export default {
  setup() {
    onBeforeMount(() => {
      console.log('组件即将挂载')
    })
    
    onMounted(() => {
      console.log('组件已挂载')
    })
    
    onBeforeUpdate(() => {
      console.log('组件即将更新')
    })
    
    onUpdated(() => {
      console.log('组件已更新')
    })
    
    onBeforeUnmount(() => {
      console.log('组件即将卸载')
    })
    
    onUnmounted(() => {
      console.log('组件已卸载')
    })
  }
}
```

## Teleport 组件

Vue3 新增了 Teleport 组件，可以将内容渲染到 DOM 树的任何位置：

```vue
<template>
  <div class="component">
    <h1>组件内容</h1>
    <!-- 将模态框内容传送到 body 元素 -->
    <Teleport to="body">
      <div class="modal">
        <p>这个内容实际上会被渲染到 body 下</p>
      </div>
    </Teleport>
  </div>
</template>
```

## Suspense 组件

Vue3 提供了 Suspense 组件来处理异步组件：

```vue
<template>
  <Suspense>
    <template #default>
      <AsyncComponent />
    </template>
    <template #fallback>
      <div>加载中...</div>
    </template>
  </Suspense>
</template>

<script setup>
import { defineAsyncComponent } from 'vue'

const AsyncComponent = defineAsyncComponent(() => 
  import('./AsyncComponent.vue')
)
</script>
```

## TypeScript 支持改进

### 1. 更好的类型推断

```vue
<script setup lang="ts">
import { ref } from 'vue'

// 类型自动推断
const count = ref(0) // 推断为 Ref<number>

// 显式类型声明
const user = ref<User | null>(null)
</script>
```

### 2. defineProps 和 defineEmits 类型支持

```vue
<script setup lang="ts">
interface Props {
  title: string
  count?: number
  onChange?: (value: string) => void
}

const props = withDefaults(defineProps<Props>(), {
  count: 0
})

const emit = defineEmits<{
  submit: [id: number]
  change: [value: string]
}>()
</script>
```

## 性能改进

### 1. 编译时优化

- 静态提升（hoistStatic）
- 预字符串化（cacheHandlers）
- Block Tree 优化

### 2. 运行时优化

- 更快的虚拟DOM算法
- 更小的打包体积
- 更好的 Tree-shaking

## 迁移策略

### 1. 使用 Vue 2.7 作为中间版本

Vue 2.7 包含了部分 Vue 3 的功能，可以作为迁移的中间步骤。

### 2. 逐步迁移

1. 先迁移到 Composition API
2. 更新第三方库到 Vue 3 版本
3. 调整构建工具配置
4. 测试和验证

### 3. 使用兼容包

Vue 3 提供了兼容包来支持大部分 Vue 2 的 API。

## 破坏性变更总结

1. **全局 API**: 从全局方法移到应用实例
2. **v-model**: 语法和实现机制变更
3. **事件系统**: 移除 $on, $off, $once
4. **Fragment**: 支持多根节点
5. **响应式系统**: 使用 Proxy 替代 Object.defineProperty
6. **生命周期**: 钩子函数名称变更
7. **TypeScript**: 更好的类型支持

这些变更使 Vue3 更加强大、高效和类型安全，但也需要在迁移时注意兼容性问题。