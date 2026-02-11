---
title: 插槽
createTime: 2026/02/10 15:50:00
permalink: /frontend/vue2/components/slots/
---

# 插槽

插槽（Slots）是 Vue 实现内容分发的 API，它允许你像使用原生 HTML 元素一样组合组件。

## 单一插槽（默认插槽）

### 基础用法

当一个组件中只有一个插槽时，它是默认插槽：

```vue
<!-- base-layout.vue -->
<template>
  <div class="container">
    <header>
      <slot></slot>
    </header>
    <main>
      <slot></slot>
    </main>
    <footer>
      <slot></slot>
    </footer>
  </div>
</template>
```

等等，上面的例子有问题。一个组件只能有一个默认插槽。让我重新写：

```vue
<!-- base-layout.vue -->
<template>
  <div class="container">
    <header>
      <slot name="header"></slot>
    </header>
    <main>
      <slot></slot> <!-- 默认插槽 -->
    </main>
    <footer>
      <slot name="footer"></slot>
    </footer>
  </div>
</template>
```

```vue
<!-- 使用组件 -->
<template>
  <base-layout>
    <template v-slot:header>
      <h1>这里是标题</h1>
    </template>
    
    <p>这是主要内容。</p>
    <p>这是更多内容。</p>
    
    <template v-slot:footer>
      <p>这里是页脚</p>
    </template>
  </base-layout>
</template>
```

### 默认内容

插槽可以包含默认内容，当父组件没有提供内容时会显示：

```vue
<!-- navigation-link.vue -->
<template>
  <a 
    :href="url" 
    class="nav-link"
  >
    <slot>{{ linkText }}</slot>
  </a>
</template>

<script>
export default {
  props: ['url'],
  computed: {
    linkText() {
      return '默认链接文本'
    }
  }
}
</script>
```

```vue
<!-- 使用组件 -->
<template>
  <div>
    <!-- 显示默认内容 -->
    <navigation-link url="/about"></navigation-link>
    
    <!-- 覆盖默认内容 -->
    <navigation-link url="/home">
      首页
    </navigation-link>
  </div>
</template>
```

## 具名插槽

### 基础用法

使用 `v-slot` 指令的参数来指定插槽名称：

```vue
<!-- base-layout.vue -->
<template>
  <div class="container">
    <header>
      <slot name="header"></slot>
    </header>
    <main>
      <slot name="main"></slot>
    </main>
    <footer>
      <slot name="footer"></slot>
    </footer>
  </div>
</template>
```

```vue
<!-- 使用组件 -->
<template>
  <base-layout>
    <template v-slot:header>
      <h1>网站标题</h1>
    </template>
    
    <template v-slot:main>
      <p>主要内容的一个段落。</p>
      <p>另一个主要段落。</p>
    </template>
    
    <template v-slot:footer>
      <p>版权信息</p>
    </template>
  </base-layout>
</template>
```

### 缩写语法

`v-slot:header` 可以缩写为 `#header`：

```vue
<template>
  <base-layout>
    <template #header>
      <h1>网站标题</h1>
    </template>
    
    <template #main>
      <p>主要内容</p>
    </template>
    
    <template #footer>
      <p>版权信息</p>
    </template>
  </base-layout>
</template>
```

### 默认插槽的缩写语法

默认插槽也有缩写语法，但只有当组件中只有默认插槽时才能使用：

```vue
<!-- 当组件中只有默认插槽时 -->
<template>
  <base-layout #default="{ user }">
    {{ user.name }}
  </base-layout>
</template>

<!-- 或者更简洁 -->
<template>
  <base-layout v-slot="{ user }">
    {{ user.name }}
  </base-layout>
</template>
```

## 作用域插槽

### 基础用法

作用域插槽允许子组件向父组件传递数据：

```vue
<!-- current-user.vue -->
<template>
  <span>
    <slot :user="user">{{ user.lastName }}</slot>
  </span>
</template>

<script>
export default {
  data() {
    return {
      user: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com'
      }
    }
  }
}
</script>
```

```vue
<!-- 使用组件 -->
<template>
  <div>
    <!-- 父组件可以访问 user -->
    <current-user v-slot="slotProps">
      {{ slotProps.user.firstName }}
    </current-user>
    
    <!-- 或者解构 -->
    <current-user v-slot="{ user }">
      {{ user.firstName }} {{ user.lastName }}
    </current-user>
    
    <!-- 使用默认内容 -->
    <current-user></current-user>
  </div>
</template>
```

### 动态插槽名

从 Vue 2.6.0 开始，可以使用动态插槽名：

```vue
<base-layout>
  <template v-slot:[dynamicSlotName]>
    <h1>标题内容</h1>
  </template>
</base-layout>
```

### 高级作用域插槽示例

```vue
<!-- todo-list.vue -->
<template>
  <ul>
    <li
      v-for="item in items"
      :key="item.id"
      :class="item.state"
      @click="item.completed = !item.completed"
    >
      <slot 
        name="item" 
        :item="item" 
        :index="index" 
        :isComplete="item.completed"
      >
        {{ item.name }}
      </slot>
    </li>
  </ul>
</template>

<script>
export default {
  name: 'TodoList',
  props: {
    items: {
      type: Array,
      default: () => []
    }
  }
}
</script>
```

```vue
<!-- 使用组件 -->
<template>
  <todo-list :items="todoItems">
    <template #item="{ item, index, isComplete }">
      <div class="todo-item">
        <input 
          type="checkbox" 
          :checked="isComplete"
          @change="toggleCompletion(item)"
        >
        <span 
          :class="{ completed: isComplete }"
          class="todo-text"
        >
          {{ index + 1 }}. {{ item.name }}
        </span>
        <button @click="removeItem(item)">删除</button>
      </div>
    </template>
  </todo-list>
</template>

<script>
import TodoList from '@/components/TodoList.vue'

export default {
  components: {
    TodoList
  },
  data() {
    return {
      todoItems: [
        { id: 1, name: '学习 Vue', completed: false },
        { id: 2, name: '写代码', completed: true },
        { id: 3, name: '休息', completed: false }
      ]
    }
  },
  methods: {
    toggleCompletion(item) {
      item.completed = !item.completed
    },
    removeItem(item) {
      this.todoItems = this.todoItems.filter(i => i.id !== item.id)
    }
  }
}
</script>

<style>
.completed {
  text-decoration: line-through;
  color: #999;
}
</style>
```

## 插槽的编译作用域

### 数据访问规则

父组件模板中的内容不能访问子组件的数据：

```vue
<!-- 子组件 -->
<template>
  <div>
    <slot :childMessage="childMessage"></slot>
  </div>
</template>

<script>
export default {
  data() {
    return {
      childMessage: '来自子组件的消息'
    }
  }
}
</script>
```

```vue
<!-- 错误的用法 -->
<template>
  <child-component>
    <!-- 这样是错误的，因为 childMessage 是子组件的数据 -->
    {{ childMessage }}
  </child-component>
</template>

<!-- 正确的用法 -->
<template>
  <child-component v-slot="slotProps">
    <!-- 通过作用域插槽访问子组件数据 -->
    {{ slotProps.childMessage }}
  </child-component>
</template>
```

## 插槽的高级用法

### 列表渲染中的插槽

```vue
<!-- list-component.vue -->
<template>
  <div>
    <div 
      v-for="(item, index) in items" 
      :key="item.id"
      class="list-item"
    >
      <slot 
        :item="item" 
        :index="index"
        :isEven="index % 2 === 0"
      >
        {{ item.name }}
      </slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ListComponent',
  props: {
    items: Array
  }
}
</script>
```

```vue
<!-- 使用组件 -->
<template>
  <list-component :items="items">
    <template #default="{ item, index, isEven }">
      <div :class="{ even: isEven, odd: !isEven }">
        <strong>{{ index + 1 }}.</strong> {{ item.name }}
      </div>
    </template>
  </list-component>
</template>
```

### 带有默认值的作用域插槽

```vue
<!-- user-card.vue -->
<template>
  <div class="user-card">
    <h3>{{ user.displayName || user.name }}</h3>
    <slot 
      name="bio" 
      :bio="user.bio || '暂无简介'"
      :hasBio="!!user.bio"
    >
      <p v-if="user.bio">{{ user.bio }}</p>
      <p v-else>暂无简介</p>
    </slot>
    <slot 
      name="contact" 
      :email="user.email"
      :phone="user.phone"
    >
      <p v-if="user.email">Email: {{ user.email }}</p>
    </slot>
  </div>
</template>

<script>
export default {
  name: 'UserCard',
  props: {
    user: Object
  }
}
</script>
```

### 插槽与条件渲染

```vue
<!-- conditional-slot.vue -->
<template>
  <div class="conditional-slot">
    <slot 
      v-if="hasData" 
      name="with-data" 
      :data="processedData"
    ></slot>
    <slot 
      v-else 
      name="no-data"
    >
      <p>暂无数据</p>
    </slot>
  </div>
</template>

<script>
export default {
  name: 'ConditionalSlot',
  props: {
    rawData: [Array, Object]
  },
  computed: {
    hasData() {
      if (Array.isArray(this.rawData)) {
        return this.rawData.length > 0
      }
      return this.rawData !== null && Object.keys(this.rawData).length > 0
    },
    processedData() {
      // 处理数据的逻辑
      return this.rawData
    }
  }
}
</script>
```

## 插槽的性能考虑

### 插槽内容的渲染时机

插槽内容在父组件中编译，这意味着插槽内容可以访问父组件的作用域，但也会受到父组件响应式系统的影响。

### 遵活使用插槽

```vue
<!-- 在不需要复杂插槽时，使用 props 传递内容 -->
<template>
  <!-- 简单情况 -->
  <simple-card :title="cardTitle" :content="cardContent" />
  
  <!-- 复杂情况，需要灵活布局时使用插槽 -->
  <complex-card>
    <template #header>
      <h2>{{ cardTitle }}</h2>
      <button>操作按钮</button>
    </template>
    <template #content>
      <div class="content-wrapper">
        <p>{{ cardContent }}</p>
        <aside>侧边内容</aside>
      </div>
    </template>
  </complex-card>
</template>
```

## 实际应用示例

### 表格组件

```vue
<!-- data-table.vue -->
<template>
  <table class="data-table">
    <thead>
      <tr>
        <th v-for="column in columns" :key="column.key">
          {{ column.title }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(row, rowIndex) in data" :key="rowIndex">
        <td v-for="column in columns" :key="column.key">
          <slot 
            :name="column.key" 
            :row="row" 
            :value="row[column.key]" 
            :index="rowIndex"
          >
            {{ row[column.key] }}
          </slot>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
export default {
  name: 'DataTable',
  props: {
    data: Array,
    columns: Array
  }
}
</script>
```

```vue
<!-- 使用表格组件 -->
<template>
  <data-table :data="users" :columns="columns">
    <template #name="{ value, row }">
      <strong>{{ value }}</strong>
    </template>
    <template #actions="{ row }">
      <button @click="editUser(row)">编辑</button>
      <button @click="deleteUser(row)">删除</button>
    </template>
  </data-table>
</template>

<script>
export default {
  data() {
    return {
      users: [
        { id: 1, name: '张三', email: 'zhang@example.com' },
        { id: 2, name: '李四', email: 'li@example.com' }
      ],
      columns: [
        { key: 'name', title: '姓名' },
        { key: 'email', title: '邮箱' },
        { key: 'actions', title: '操作' }
      ]
    }
  },
  methods: {
    editUser(user) {
      // 编辑用户
    },
    deleteUser(user) {
      // 删除用户
    }
  }
}
</script>
```

插槽是 Vue 组件系统中非常强大的功能，通过合理使用插槽，可以创建高度可复用和灵活的组件。