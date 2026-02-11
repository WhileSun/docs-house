---
title: 自定义指令
createTime: 2026/02/10 15:55:00
permalink: /frontend/vue2/advanced/custom-directives/
---

# 自定义指令

除了 Vue 提供的内置指令（如 `v-model` 和 `v-show`），Vue 还允许注册自定义指令。自定义指令提供了一种机制来处理 DOM 的底层操作。

## 注册自定义指令

### 全局注册

```javascript
// 注册一个全局自定义指令 `v-focus`
Vue.directive('focus', {
  // 当被绑定的元素插入到 DOM 中时……
  inserted: function (el) {
    // 聚焦元素
    el.focus()
  }
})

// 带有函数简写的自定义指令
Vue.directive('color', function (el, binding) {
  el.style.color = binding.value
})
```

### 局部注册

```javascript
export default {
  directives: {
    // 注册一个局部自定义指令 `v-focus`
    focus: {
      // 指令的定义
      inserted: function (el) {
        el.focus()
      }
    },
    // 带有函数简写的指令
    color: function (el, binding) {
      el.style.backgroundColor = binding.value
    }
  }
}
```

## 指令钩子函数

一个指令定义对象可以提供以下几种钩子函数（均为可选）：

- `bind`：只调用一次，指令第一次绑定到元素时调用。在这里可以进行一次性的初始化设置。
- `inserted`：被绑定元素插入父节点时调用（仅保证父节点存在，但不一定已被插入文档中）。
- `update`：所在组件的 VNode 更新时调用，但是可能发生在其子 VNode 更新之前。指令的值可能发生了改变，也可能没有。但是你可以通过比较更新前后的值来忽略不必要的模板更新。
- `componentUpdated`：指令所在组件的 VNode 及其子 VNode 全部更新后调用。
- `unbind`：只调用一次，指令与元素解绑时调用。

## 钎子函数参数

指令钩子函数会被传入以下参数：

- `el`：指令所绑定的元素，可以用来直接操作 DOM。
- `binding`：一个对象，包含以下属性：
  - `name`：指令名，不包括 `v-` 前缀。
  - `value`：指令的绑定值，例如：`v-my-directive="1 + 1"` 中，绑定值为 `2`。
  - `oldValue`：指令绑定的前一个值，仅在 `update` 和 `componentUpdated` 钎子中可用。无论值是否改变都可用。
  - `expression`：字符串形式的指令表达式。例如 `v-my-directive="1 + 1"` 中，表达式为 `"1 + 1"`。
  - `arg`：传给指令的参数，可选。例如 `v-my-directive:foo` 中，参数为 `"foo"`。
  - `modifiers`：一个包含修饰符的对象。例如：`v-my-directive.foo.bar` 中，修饰符对象为 `{ foo: true, bar: true }`。
- `vnode`：Vue 编译生成的虚拟节点。
- `oldVnode`：上一个虚拟节点，仅在 `update` 和 `componentUpdated` 钎子中可用。

## 基础示例

### 焦点指令

```vue
<template>
  <input v-focus>
</template>

<script>
export default {
  directives: {
    focus: {
      // 指令的定义
      inserted: function (el) {
        el.focus()
      }
    }
  }
}
</script>
```

### 颜色指令

```vue
<template>
  <p v-color="'red'">这段文字是红色的</p>
</template>

<script>
export default {
  directives: {
    color: {
      bind: function (el, binding) {
        el.style.color = binding.value
      }
    }
  }
}
</script>
```

### 参数指令

```vue
<template>
  <div>
    <p v-demo:foo.a.b="message">hello</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      message: 'hi!'
    }
  },
  directives: {
    demo: {
      bind: function (el, binding, vnode) {
        var s = JSON.stringify
        el.innerHTML =
          'name: '       + s(binding.name) + '<br>' +
          'value: '      + s(binding.value) + '<br>' +
          'expression: ' + s(binding.expression) + '<br>' +
          'argument: '   + s(binding.arg) + '<br>' +
          'modifiers: '  + s(binding.modifiers) + '<br>' +
          'vnode keys: ' + Object.keys(vnode).join(', ')
      }
    }
  }
}
</script>
```

## 函数简写

在很多情况下，你可能想在 `bind` 和 `update` 时触发相同行为，而不关心其它的钩子。可以这样写：

```javascript
Vue.directive('color-swatch', function (el, binding) {
  el.style.backgroundColor = binding.value
})
```

这会创建一个指令，它的 `bind` 和 `update` 钎子函数都用这个函数。

## 实际应用示例

### 1. 防抖指令

```javascript
// 防抖指令
Vue.directive('debounce', {
  bind: function (el, binding, vnode) {
    let delay = parseInt(binding.arg) || 300
    let handler = binding.value
    let timerId
    
    const debounceHandler = function (...args) {
      if (timerId) {
        clearTimeout(timerId)
      }
      timerId = setTimeout(() => {
        handler.apply(this, args)
      }, delay)
    }
    
    el.addEventListener('input', debounceHandler)
    
    // 保存引用以便后续清理
    el._debounceHandler = debounceHandler
  },
  unbind: function (el) {
    if (el._debounceHandler) {
      el.removeEventListener('input', el._debounceHandler)
      clearTimeout(el._debounceHandler.timerId)
      delete el._debounceHandler
    }
  }
})
```

使用防抖指令：

```vue
<template>
  <input 
    v-debounce:500="handleInput" 
    placeholder="输入防抖500ms"
  >
</template>

<script>
export default {
  methods: {
    handleInput(event) {
      console.log('输入值:', event.target.value)
    }
  }
}
</script>
```

### 2. 权限指令

```javascript
// 权限指令
Vue.directive('permission', {
  bind: function (el, binding) {
    const permissions = binding.value
    const userPermissions = this.$store.state.user.permissions || []
    
    if (!userPermissions.includes(permissions)) {
      el.style.display = 'none'
      // 或者移除元素
      // el.parentNode && el.parentNode.removeChild(el)
    }
  },
  update: function (el, binding) {
    const permissions = binding.value
    const userPermissions = this.$store.state.user.permissions || []
    
    if (!userPermissions.includes(permissions)) {
      el.style.display = 'none'
    } else {
      el.style.display = ''
    }
  }
})
```

使用权限指令：

```vue
<template>
  <div>
    <button v-permission="'admin'">管理员按钮</button>
    <button v-permission="'user'">用户按钮</button>
  </div>
</template>
```

### 3. 滚动加载指令

```javascript
// 滚动加载指令
Vue.directive('scroll-load', {
  bind: function (el, binding) {
    let handler = binding.value
    let scrollContainer = el.parentElement || window
    
    const scrollHandler = function () {
      const scrollTop = scrollContainer.scrollTop || document.documentElement.scrollTop
      const clientHeight = scrollContainer.clientHeight || document.documentElement.clientHeight
      const scrollHeight = scrollContainer.scrollHeight || document.documentElement.scrollHeight
      
      if (scrollTop + clientHeight >= scrollHeight - 5) {
        handler()
      }
    }
    
    scrollContainer.addEventListener('scroll', scrollHandler)
    
    // 保存引用
    el._scrollHandler = scrollHandler
    el._scrollContainer = scrollContainer
  },
  unbind: function (el) {
    if (el._scrollHandler && el._scrollContainer) {
      el._scrollContainer.removeEventListener('scroll', el._scrollHandler)
      delete el._scrollHandler
      delete el._scrollContainer
    }
  }
})
```

使用滚动加载指令：

```vue
<template>
  <div v-scroll-load="loadMoreData" class="scroll-container">
    <div v-for="item in items" :key="item.id">{{ item.name }}</div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      items: [],
      page: 1
    }
  },
  methods: {
    async loadMoreData() {
      const newData = await this.fetchData(this.page++)
      this.items = this.items.concat(newData)
    }
  }
}
</script>
```

### 4. 工具提示指令

```javascript
// 工具提示指令
Vue.directive('tooltip', {
  bind: function (el, binding) {
    el.style.position = 'relative'
    
    const tooltip = document.createElement('div')
    tooltip.textContent = binding.value
    tooltip.style.cssText = `
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      white-space: nowrap;
      z-index: 9999;
      display: none;
      margin-bottom: 5px;
    `
    
    el.appendChild(tooltip)
    
    const showTooltip = () => {
      tooltip.style.display = 'block'
    }
    
    const hideTooltip = () => {
      tooltip.style.display = 'none'
    }
    
    const mouseEnterHandler = () => {
      showTooltip()
      tooltip.textContent = binding.value
    }
    
    const mouseLeaveHandler = hideTooltip
    
    el.addEventListener('mouseenter', mouseEnterHandler)
    el.addEventListener('mouseleave', mouseLeaveHandler)
    
    // 保存引用
    el._tooltip = tooltip
    el._showTooltip = showTooltip
    el._hideTooltip = hideTooltip
    el._mouseEnterHandler = mouseEnterHandler
    el._mouseLeaveHandler = mouseLeaveHandler
  },
  update: function (el, binding) {
    if (el._tooltip) {
      el._tooltip.textContent = binding.value
    }
  },
  unbind: function (el) {
    if (el._tooltip) {
      el.removeEventListener('mouseenter', el._mouseEnterHandler)
      el.removeEventListener('mouseleave', el._mouseLeaveHandler)
      el.removeChild(el._tooltip)
      delete el._tooltip
      delete el._showTooltip
      delete el._hideTooltip
      delete el._mouseEnterHandler
      delete el._mouseLeaveHandler
    }
  }
})
```

使用工具提示指令：

```vue
<template>
  <div>
    <button v-tooltip="'这是一个工具提示'">悬停查看</button>
    <input v-tooltip="errorMessage" :class="{ error: hasError }" />
  </div>
</template>

<script>
export default {
  data() {
    return {
      errorMessage: '请输入有效的值',
      hasError: true
    }
  }
}
</script>
```

### 5. 点击外部关闭指令

```javascript
// 点击外部关闭指令
Vue.directive('click-outside', {
  bind: function (el, binding, vnode) {
    el.event = function (e) {
      if (!(el === e.target || el.contains(e.target))) {
        binding.value(e)
      }
    }
    document.body.addEventListener('click', el.event)
  },
  unbind: function (el) {
    document.body.removeEventListener('click', el.event)
  }
})
```

使用点击外部关闭指令：

```vue
<template>
  <div class="dropdown" v-click-outside="closeDropdown">
    <button @click="toggleDropdown">下拉菜单</button>
    <div v-show="dropdownOpen" class="dropdown-menu">
      <a href="#">选项 1</a>
      <a href="#">选项 2</a>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      dropdownOpen: false
    }
  },
  methods: {
    toggleDropdown() {
      this.dropdownOpen = !this.dropdownOpen
    },
    closeDropdown() {
      this.dropdownOpen = false
    }
  }
}
</script>
```

## 最佳实践

### 1. 遵活使用指令

- 只在需要直接操作 DOM 时才使用自定义指令
- 对于组件间通信，优先使用 props 和 events
- 对于状态管理，优先使用 Vuex

### 2. 记得清理资源

在 `unbind` 钎子中清理事件监听器、定时器等资源：

```javascript
Vue.directive('interval', {
  bind: function (el, binding) {
    el.intervalId = setInterval(() => {
      binding.value()
    }, binding.arg || 1000)
  },
  unbind: function (el) {
    clearInterval(el.intervalId)
  }
})
```

### 3. 遵活使用修饰符

```javascript
Vue.directive('keydown', {
  bind: function (el, binding) {
    const keys = Object.keys(binding.modifiers)
    const keyHandler = function (e) {
      if (keys.length === 0 || keys.includes(e.key)) {
        binding.value(e)
      }
    }
    el.addEventListener('keydown', keyHandler)
    el._keyHandler = keyHandler
  },
  unbind: function (el) {
    el.removeEventListener('keydown', el._keyHandler)
  }
})
```

使用修饰符：

```vue
<template>
  <input 
    v-keydown.enter="submitForm"
    v-keydown.escape="closeModal"
    v-keydown="handleAnyKey"
  >
</template>
```

自定义指令是 Vue 提供的强大功能，通过合理使用自定义指令，可以实现复杂的 DOM 操作和交互效果。