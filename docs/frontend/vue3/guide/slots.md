---
title: 插槽
createTime: 2026/02/11 22:40:00
permalink: /frontend/vue3/guide/slots/
---

# Vue3 插槽

插槽（Slots）是Vue实现内容分发的强大机制，允许父组件向子组件传递内容。

## 默认插槽

最简单的插槽形式，允许父组件向子组件传递内容：

```vue
<!-- 子组件：ButtonWrapper.vue -->
<template>
  <button class="wrapper-button">
    <slot></slot>
  </button>
</template>
```

```vue
<!-- 父组件使用 -->
<template>
  <ButtonWrapper>
    <span>点击我</span>
  </ButtonWrapper>
</template>
```

## 具名插槽

当需要多个插槽时，可以使用具名插槽：

```vue
<!-- 子组件：Layout.vue -->
<template>
  <div class="layout">
    <header>
      <slot name="header"></slot>
    </header>
    <main>
      <slot></slot>
    </main>
    <footer>
      <slot name="footer"></slot>
    </footer>
  </div>
</template>
```

```vue
<!-- 父组件使用 -->
<template>
  <Layout>
    <template #header>
      <h1>页面标题</h1>
    </template>
    
    <p>主要内容</p>
    
    <template #footer>
      <p>&copy; 2023 版权信息</p>
    </template>
  </Layout>
</template>
```

## 作用域插槽

作用域插槽允许子组件向父组件传递数据：

```vue
<!-- 子组件：UserCard.vue -->
<template>
  <div class="user-card">
    <slot 
      :user="user" 
      :isLoggedIn="isLoggedIn"
      :loginTime="loginTime"
    >
      <!-- 默认内容 -->
      <p>访客用户</p>
    </slot>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const user = ref({
  name: '张三',
  email: 'zhangsan@example.com',
  role: 'user'
})

const loginTime = ref(new Date())

const isLoggedIn = computed(() => {
  return user.value && user.value.name !== ''
})
</script>
```

```vue
<!-- 父组件使用 -->
<template>
  <UserCard v-slot="slotProps">
    <div class="user-info">
      <h3 v-if="slotProps.isLoggedIn">
        欢迎, {{ slotProps.user.name }}!
      </h3>
      <p v-if="slotProps.isLoggedIn">
        登录时间: {{ slotProps.loginTime.toLocaleString() }}
      </p>
      <p v-else>
        请登录
      </p>
    </div>
  </UserCard>
</template>
```

## 动态插槽名

Vue3 支持动态插槽名：

```vue
<template>
  <ComponentWithSlots>
    <template #[dynamicSlotName]>
      动态插槽内容
    </template>
  </ComponentWithSlots>
</template>

<script setup>
import { ref } from 'vue'

const dynamicSlotName = ref('header')
</script>
```

## 插槽 Props 解构与默认值

Vue3 支持对插槽 props 进行解构，并可设置默认值：

```vue
<!-- 子组件：ListItem.vue -->
<template>
  <li>
    <slot 
      :item="item" 
      :index="index"
      :isSelected="isSelected"
    ></slot>
  </li>
</template>

<script setup>
defineProps(['item', 'index', 'isSelected'])
</script>
```

```vue
<!-- 父组件使用 -->
<template>
  <ul>
    <ListItem
      v-for="(item, index) in items"
      :key="item.id"
      :item="item"
      :index="index"
      :isSelected="item.id === selectedId"
      v-slot="{ item: listItem, index: itemIndex = 0, isSelected = false }"
    >
      <div 
        :class="{ selected: isSelected }"
        @click="selectItem(listItem.id)"
      >
        <span>{{ itemIndex + 1 }} - {{ listItem.name }}</span>
        <span v-if="isSelected">✓</span>
      </div>
    </ListItem>
  </ul>
</template>
```

## 插槽回退内容

可以为插槽提供默认内容，当父组件没有提供内容时显示：

```vue
<!-- 子组件：Avatar.vue -->
<template>
  <div class="avatar-wrapper">
    <img 
      v-if="image" 
      :src="image" 
      :alt="name" 
      class="avatar-image"
    >
    <div v-else class="avatar-placeholder">
      <slot name="placeholder">
        <div class="default-avatar">
          <span>{{ initials }}</span>
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps(['image', 'name'])

const initials = computed(() => {
  if (!props.name) return '?'
  return props.name.split(' ').map(n => n[0]).join('').toUpperCase()
})
</script>
```

## 高级插槽用法

### 透传属性到插槽

```vue
<!-- 子组件：FocusableDiv.vue -->
<template>
  <div 
    :tabindex="tabIndex"
    :class="['focusable', { focused }]"
    v-bind="$attrs"
    @focus="focused = true"
    @blur="focused = false"
  >
    <slot 
      :focus="focus"
      :blur="blur"
      :isFocused="focused"
    ></slot>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const focused = ref(false)
const props = defineProps({
  tabIndex: {
    type: Number,
    default: 0
  }
})

const focus = () => {
  focused.value = true
}
const blur = () => {
  focused.value = false
}
</script>
```

### 插槽与 Teleport 结合

```vue
<!-- 子组件：Modal.vue -->
<template>
  <Teleport to="body">
    <div class="modal-overlay" @click="close">
      <div class="modal-content" @click.stop>
        <header class="modal-header">
          <slot name="header">
            <h2>模态框标题</h2>
          </slot>
          <button class="close-btn" @click="close">×</button>
        </header>
        <div class="modal-body">
          <slot></slot>
        </div>
        <footer class="modal-footer">
          <slot name="footer">
            <button @click="close">关闭</button>
          </slot>
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
const emit = defineEmits(['close'])

const close = () => {
  emit('close')
}
</script>
```

## 插槽的类型定义（TypeScript）

在 TypeScript 中，可以为插槽定义类型：

```vue
<script setup lang="ts">
import { type VNode } from 'vue'

interface User {
  name: string
  email: string
  role: string
}

interface SlotProps {
  user: User
  isLoggedIn: boolean
  loginTime: Date
}

// 定义插槽类型
const slots = defineSlots<{
  default: (props: SlotProps) => VNode[]
  header: () => VNode[]
  footer: () => VNode[]
}>()

defineProps<{
  user: User
}>()
</script>
```

## 插槽最佳实践

### 1. 清晰的插槽命名

使用有意义的插槽名称，便于理解组件结构：

```vue
<!-- 好的做法 -->
<template>
  <Card>
    <template #header>
      <!-- 标题内容 -->
    </template>
    <template #content>
      <!-- 主要内容 -->
    </template>
    <template #actions>
      <!-- 操作按钮 -->
    </template>
  </Card>
</template>
```

### 2. 提供回退内容

为插槽提供有意义的默认内容：

```vue
<template>
  <div class="button-wrapper">
    <slot name="icon">
      <!-- 默认图标 -->
      <svg class="default-icon" viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    </slot>
    <slot></slot>
  </div>
</template>
```

### 3. 合理使用作用域插槽

当需要从子组件向父组件传递数据时使用作用域插槽：

```vue
<!-- 数据列表组件 -->
<template>
  <div class="data-list">
    <div 
      v-for="(item, index) in items" 
      :key="item.id"
      class="list-item"
    >
      <slot 
        :item="item" 
        :index="index"
        :isEven="index % 2 === 0"
        :isSelected="selection.includes(item.id)"
      >
        <!-- 默认显示 -->
        <span>{{ item.name }}</span>
      </slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  items: {
    type: Array,
    default: () => []
  },
  selection: {
    type: Array,
    default: () => []
  }
})
</script>
```

### 4. 靠活的插槽设计

设计插槽时考虑多种使用场景：

```vue
<!-- 表格组件 -->
<template>
  <table class="data-table">
    <thead>
      <tr>
        <th 
          v-for="column in columns" 
          :key="column.key"
          :class="column.headerClass"
        >
          <slot 
            :name="`header-${column.key}`" 
            :column="column"
          >
            {{ column.title }}
          </slot>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr 
        v-for="(row, rowIndex) in data" 
        :key="row.id || rowIndex"
        :class="getRowClass(row, rowIndex)"
      >
        <td 
          v-for="column in columns" 
          :key="column.key"
          :class="column.cellClass"
        >
          <slot 
            :name="`cell-${column.key}`" 
            :row="row" 
            :column="column" 
            :value="getValue(row, column)"
            :rowIndex="rowIndex"
          >
            {{ getValue(row, column) }}
          </slot>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  columns: Array,
  data: Array
})

const getValue = (row, column) => {
  if (typeof column.value === 'function') {
    return column.value(row)
  }
  return row[column.key]
}

const getRowClass = (row, index) => {
  return {
    'even-row': index % 2 === 0,
    'odd-row': index % 2 !== 0
  }
}
</script>
```

插槽是Vue组件系统中非常强大的功能，合理使用可以创建高度可复用和灵活的组件。