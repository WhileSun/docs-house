---
title: 自定义事件
createTime: 2026/02/10 16:15:00
permalink: /frontend/vue2/components/custom-events/
---

# 自定义事件

在 Vue.js 中，组件之间可以通过自定义事件进行通信。自定义事件是 Vue 组件系统的核心功能之一，允许子组件向父组件传递数据。

## 基础用法

### 子组件触发事件

在子组件中使用 `$emit` 方法触发自定义事件：

```javascript
// 子组件
export default {
  methods: {
    handleClick() {
      // 触发 'custom-event' 事件并传递数据
      this.$emit('custom-event', { message: 'Hello from child' })
    }
  }
}
```

### 父组件监听事件

在父组件中使用 `v-on` 监听子组件触发的事件：

```vue
<template>
  <child-component @custom-event="handleCustomEvent"></child-component>
</template>

<script>
import ChildComponent from './ChildComponent.vue'

export default {
  components: {
    ChildComponent
  },
  methods: {
    handleCustomEvent(payload) {
      console.log('Received from child:', payload)
    }
  }
}
</script>
```

## 事件参数

可以传递多个参数给事件：

```javascript
// 子组件
this.$emit('multiple-params', param1, param2, param3)

// 父组件
methods: {
  handleMultipleParams(param1, param2, param3) {
    // 处理多个参数
  }
}
```

## 事件修饰符

Vue 提供了一些事件修饰符来处理常见场景：

```html
<!-- 防止事件冒泡 -->
<child-component @custom-event.stop="handleEvent"></child-component>

<!-- 只运行一次 -->
<child-component @custom-event.once="handleEvent"></child-component>
```

## 使用 v-model 在组件上

自定义事件可以与 `v-model` 配合使用：

```javascript
// 子组件
export default {
  props: ['value'],
  methods: {
    updateValue(newValue) {
      // 通过 'input' 事件更新 v-model
      this.$emit('input', newValue)
    }
  }
}
```

```vue
<!-- 父组件 -->
<template>
  <custom-input v-model="inputValue"></custom-input>
</template>
```

## 事件验证

可以验证事件参数：

```javascript
// 子组件
export default {
  methods: {
    validateAndEmit(data) {
      if (this.isValidData(data)) {
        this.$emit('validated-data', data)
      } else {
        console.error('Invalid data provided')
      }
    },
    isValidData(data) {
      return data && typeof data === 'object'
    }
  }
}
```

## 实际应用示例

### 表单组件事件

```vue
<!-- FormField.vue -->
<template>
  <div class="form-field">
    <label>{{ label }}</label>
    <input 
      :value="value" 
      @input="handleInput"
      @blur="handleBlur"
      :type="type"
    >
  </div>
</template>

<script>
export default {
  name: 'FormField',
  props: {
    value: [String, Number],
    label: String,
    type: {
      type: String,
      default: 'text'
    }
  },
  methods: {
    handleInput(event) {
      // 同步输入值到父组件
      this.$emit('input', event.target.value)
    },
    handleBlur() {
      // 验证完成后触发事件
      this.$emit('blur', this.value)
    }
  }
}
</script>
```

### 按钮组件事件

```vue
<!-- ActionButton.vue -->
<template>
  <button 
    @click="handleClick"
    :disabled="loading"
    class="action-button"
  >
    <span v-if="!loading">{{ text }}</span>
    <span v-else>加载中...</span>
  </button>
</template>

<script>
export default {
  name: 'ActionButton',
  props: {
    text: {
      type: String,
      default: '按钮'
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    async handleClick() {
      if (this.loading) return
      
      // 触发点击事件
      this.$emit('click')
      
      // 可以添加防抖逻辑
      this.$emit('start-loading')
      
      try {
        // 执行异步操作
        await this.performAction()
        this.$emit('success')
      } catch (error) {
        this.$emit('error', error)
      } finally {
        this.$emit('stop-loading')
      }
    },
    async performAction() {
      // 具体的业务逻辑
    }
  }
}
</script>
```

## 事件总线模式

对于非父子组件间的通信，可以使用事件总线：

```javascript
// eventBus.js
import Vue from 'vue'
export const EventBus = new Vue()

// 组件 A
EventBus.$emit('custom-event', data)

// 组件 B
EventBus.$on('custom-event', callback)
```

## 最佳实践

1. **事件命名**：使用 kebab-case 命名事件
2. **参数传递**：传递对象而不是多个参数
3. **错误处理**：验证事件参数的有效性
4. **文档化**：在组件中明确声明触发的事件

自定义事件是 Vue 组件通信的重要机制，通过合理使用自定义事件，可以构建松耦合、可维护的组件系统。