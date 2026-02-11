---
title: 过滤器
createTime: 2026/02/10 16:05:00
permalink: /frontend/vue2/advanced/filters/
---

# 过滤器

Vue.js 允允许你自定义过滤器，可被用于一些常见的文本格式化。过滤器可以用在两个地方：双花括号插值和 `v-bind` 表达式。

## 基础用法

### 在双花括号中使用

```html
<!-- 在双花括号中 -->
{{ message | capitalize }}

<!-- 在 `v-bind` 中 -->
<div v-bind:id="rawId | formatId"></div>
```

## 注册过滤器

### 全局注册

```javascript
// 全局注册一个过滤器
Vue.filter('capitalize', function (value) {
  if (!value) return ''
  value = value.toString()
  return value.charAt(0).toUpperCase() + value.slice(1)
})

// 使用
new Vue({
  data: {
    message: 'hello'
  }
})
```

```html
{{ message | capitalize }} <!-- 输出: Hello -->
```

### 局部注册

```javascript
export default {
  filters: {
    capitalize: function (value) {
      if (!value) return ''
      value = value.toString()
      return value.charAt(0).toUpperCase() + value.slice(1)
    }
  }
}
```

在模板中使用：

```html
{{ message | capitalize }}
```

## 多个过滤器串联

```html
{{ message | filterA | filterB }}
```

在这个例子中，`filterA` 被定义为接收单个参数的过滤器函数，表达式 `message` 的值将作为参数传入到函数中。然后继续调用同样被定义为接收单个参数的过滤器函数 `filterB`，将 `filterA` 的结果传递到 `filterB` 中。

## 过滤器函数接收参数

```html
{{ message | filterA('arg1', arg2) }}
```

这里，定义名为 `filterA` 的过滤器函数接收三个参数：普通字符串 `'arg1'`、表达式 `arg2` 的值（它会被计算出来）和表达式 `message` 的值（`message` 会首先被传入到函数中）。

## 常见过滤器示例

### 大写转换

```javascript
Vue.filter('uppercase', function (value) {
  return value ? value.toUpperCase() : ''
})
```

### 小写转换

```javascript
Vue.filter('lowercase', function (value) {
  return value ? value.toLowerCase() : ''
})
```

### 首字母大写

```javascript
Vue.filter('capitalize', function (value) {
  if (!value) return ''
  value = value.toString()
  return value.charAt(0).toUpperCase() + value.slice(1)
})
```

### 截取字符串

```javascript
Vue.filter('truncate', function (value, length) {
  if (!value) return ''
  length = length || 20
  return value.length > length ? value.substring(0, length) + '...' : value
})
```

### 金额格式化

```javascript
Vue.filter('currency', function (value, symbol) {
  if (!value) return (symbol || '$') + '0.00'
  symbol = symbol || '$'
  return symbol + parseFloat(value).toFixed(2)
})
```

### 日期格式化

```javascript
Vue.filter('date', function (value, format) {
  if (!value) return ''
  
  const date = new Date(value)
  const year = date.getFullYear()
  const month = ('0' + (date.getMonth() + 1)).slice(-2)
  const day = ('0' + date.getDate()).slice(-2)
  
  format = format || 'YYYY-MM-DD'
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
})
```

### 数字格式化

```javascript
Vue.filter('numberFormat', function (value, decimals = 2) {
  if (!value) return '0'
  
  const num = parseFloat(value)
  if (isNaN(num)) return '0'
  
  return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
})
```

## 在组件中使用过滤器

```vue
<template>
  <div>
    <p>{{ message | capitalize }}</p>
    <p>{{ price | currency('¥') }}</p>
    <p>{{ longText | truncate(10) }}</p>
    <p>{{ timestamp | date('YYYY-MM-DD HH:mm:ss') }}</p>
    <p>{{ largeNumber | numberFormat(2) }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      message: 'hello world',
      price: 123.45,
      longText: 'This is a very long text that needs to be truncated',
      timestamp: Date.now(),
      largeNumber: 1234567.89
    }
  },
  filters: {
    capitalize(value) {
      if (!value) return ''
      return value.toString().charAt(0).toUpperCase() + value.slice(1)
    },
    currency(value, symbol) {
      if (!value) return (symbol || '$') + '0.00'
      return (symbol || '$') + parseFloat(value).toFixed(2)
    },
    truncate(value, length) {
      if (!value) return ''
      length = length || 20
      return value.length > length ? value.substring(0, length) + '...' : value
    },
    date(value, format) {
      if (!value) return ''
      
      const date = new Date(value)
      const year = date.getFullYear()
      const month = ('0' + (date.getMonth() + 1)).slice(-2)
      const day = ('0' + date.getDate()).slice(-2)
      const hours = ('0' + date.getHours()).slice(-2)
      const minutes = ('0' + date.getMinutes()).slice(-2)
      const seconds = ('0' + date.getSeconds()).slice(-2)
      
      return format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds)
    },
    numberFormat(value, decimals) {
      if (!value) return '0'
      decimals = decimals || 2
      
      const num = parseFloat(value)
      if (isNaN(num)) return '0'
      
      return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    }
  }
}
</script>
```

## 高级过滤器示例

### 数组过滤

```javascript
// 在组件中使用
export default {
  data() {
    return {
      users: [
        { id: 1, name: 'John', active: true },
        { id: 2, name: 'Jane', active: false },
        { id: 3, name: 'Bob', active: true }
      ]
    }
  },
  computed: {
    activeUsers() {
      return this.users.filter(user => user.active)
    }
  },
  filters: {
    // 过滤数组中的活动用户
    activeUsersFilter(users) {
      return users.filter(user => user.active)
    },
    // 按名称排序
    sortBy(users, field) {
      return users.sort((a, b) => {
        if (a[field] < b[field]) return -1
        if (a[field] > b[field]) return 1
        return 0
      })
    }
  }
}
```

在模板中使用：

```html
<div v-for="user in users | activeUsersFilter | sortBy('name')" :key="user.id">
  {{ user.name }}
</div>
```

### 对象属性过滤

```javascript
export default {
  filters: {
    // 获取对象的特定属性
    pluck(array, property) {
      return array.map(item => item[property])
    },
    // 按属性值过滤
    where(array, property, value) {
      return array.filter(item => item[property] === value)
    },
    // 搜索过滤
    search(array, searchTerm, fields) {
      if (!searchTerm) return array
      
      return array.filter(item => {
        return fields.some(field => {
          const fieldValue = item[field]
          return fieldValue && fieldValue.toString().toLowerCase().includes(searchTerm.toLowerCase())
        })
      })
    }
  }
}
```

使用示例：

```html
<!-- 获取用户的名字 -->
<p>{{ users | pluck('name') | join(', ') }}</p>

<!-- 按状态过滤 -->
<div v-for="user in users | where('status', 'active')" :key="user.id">
  {{ user.name }}
</div>

<!-- 搜索过滤 -->
<div v-for="user in users | search(searchTerm, ['name', 'email'])" :key="user.id">
  {{ user.name }}
</div>
```

## 过滤器链

可以将多个过滤器串联使用：

```html
{{ message | trim | lowercase | capitalize }}

<!-- 或者带参数 -->
{{ price | currency('¥') | truncate(10) }}
```

## 性能考虑

### 过滤器的执行时机

过滤器在每次重新渲染时都会执行，因此对于复杂的计算，应该考虑使用计算属性：

```javascript
// 不推荐：复杂计算使用过滤器
{{ expensiveValue | complexFilter }}

// 推荐：使用计算属性
{{ processedValue }}

// 在组件中
computed: {
  processedValue() {
    // 复杂计算，会被缓存
    return this.complexProcessing(this.expensiveValue)
  }
}
```

### 遵活使用过滤器

对于简单的格式化操作，过滤器是很好的选择：

```javascript
// 适合使用过滤器的场景
{{ date | formatDate }}
{{ price | currency }}
{{ text | truncate(50) }}
```

## 过滤器与计算属性的对比

### 过滤器的优势

- 语法简洁，易于使用
- 可以在模板中串联使用
- 适合简单的格式化操作

### 计算属性的优势

- 有缓存，性能更好
- 适合复杂的计算逻辑
- 更容易测试和调试

## 实际应用示例

### 用户列表过滤

```vue
<template>
  <div>
    <input v-model="searchTerm" placeholder="搜索用户...">
    <select v-model="statusFilter">
      <option value="">所有状态</option>
      <option value="active">活跃</option>
      <option value="inactive">非活跃</option>
    </select>
    
    <ul>
      <li v-for="user in filteredUsers" :key="user.id">
        {{ user.name | capitalize }} - 
        {{ user.email | truncate(20) }} - 
        <span :class="user.status">{{ user.status | capitalize }}</span>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  data() {
    return {
      searchTerm: '',
      statusFilter: '',
      users: [
        { id: 1, name: 'john doe', email: 'john@example.com', status: 'active' },
        { id: 2, name: 'jane smith', email: 'jane@example.com', status: 'inactive' },
        { id: 3, name: 'bob johnson', email: 'bob@example.com', status: 'active' }
      ]
    }
  },
  computed: {
    filteredUsers() {
      let result = this.users
      
      // 搜索过滤
      if (this.searchTerm) {
        result = result.filter(user => 
          user.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(this.searchTerm.toLowerCase())
        )
      }
      
      // 状态过滤
      if (this.statusFilter) {
        result = result.filter(user => user.status === this.statusFilter)
      }
      
      return result
    }
  },
  filters: {
    capitalize(value) {
      if (!value) return ''
      return value.toString().split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
    },
    truncate(value, length = 20) {
      if (!value) return ''
      return value.length > length ? value.substring(0, length) + '...' : value
    }
  }
}
</script>

<style>
.active { color: green; }
.inactive { color: red; }
</style>
```

### 商品列表格式化

```vue
<template>
  <div class="product-list">
    <div v-for="product in products" :key="product.id" class="product-card">
      <h3>{{ product.name | truncate(25) }}</h3>
      <p class="price">{{ product.price | currency('¥') }}</p>
      <p class="rating">评分: {{ product.rating | decimal(1) }}</p>
      <p class="stock">库存: 
        <span :class="{'in-stock': product.stock > 10, 'low-stock': product.stock <= 10}">
          {{ product.stock | stockStatus }}
        </span>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      products: [
        { id: 1, name: '高性能笔记本电脑', price: 8999.99, rating: 4.7, stock: 15 },
        { id: 2, name: '无线蓝牙耳机', price: 299.50, rating: 4.3, stock: 3 },
        { id: 3, name: '机械键盘', price: 599.00, rating: 4.8, stock: 0 }
      ]
    }
  },
  filters: {
    currency(value, symbol = '¥') {
      if (value == null || value === '') return symbol + '0.00'
      const num = parseFloat(value)
      if (isNaN(num)) return symbol + '0.00'
      return symbol + num.toFixed(2)
    },
    decimal(value, decimals = 2) {
      if (value == null || value === '') return '0.' + '0'.repeat(decimals)
      const num = parseFloat(value)
      if (isNaN(num)) return '0.' + '0'.repeat(decimals)
      return num.toFixed(decimals)
    },
    stockStatus(stock) {
      if (stock > 10) return '充足'
      if (stock > 0) return '紧张'
      return '缺货'
    },
    truncate(value, length) {
      if (!value) return ''
      return value.length > length ? value.substring(0, length) + '...' : value
    }
  }
}
</script>

<style>
.product-card {
  border: 1px solid #ddd;
  padding: 1rem;
  margin: 1rem 0;
  border-radius: 4px;
}

.price {
  color: #e74c3c;
  font-weight: bold;
}

.in-stock {
  color: green;
}

.low-stock {
  color: orange;
}
</style>
```

## 注意事项

1. **Vue 3 中已移除**：过滤器在 Vue 3 中已被移除，建议使用计算属性或方法替代
2. **性能考虑**：对于复杂计算，建议使用计算属性而不是过滤器
3. **可读性**：过度使用过滤器可能降低代码可读性
4. **调试困难**：过滤器中的错误可能难以调试

过滤器是 Vue.js 中用于文本格式化的便捷工具，虽然在 Vue 3 中已被移除，但在 Vue 2 中仍然是一个有用的功能。