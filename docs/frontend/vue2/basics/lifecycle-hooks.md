---
title: 生命周期钩子
createTime: 2026/02/10 13:05:00
permalink: /frontend/vue2/basics/lifecycle-hooks/
---

# 生命周期钩子

每个 Vue 实例在被创建时都要经过一系列的初始化过程——例如，需要设置数据监听、编译模板、将实例挂载到 DOM 并在数据变化时更新 DOM 等。同时在这个过程中也会运行一些叫做生命周期钩子的函数，这给了用户在不同阶段添加自己的代码的机会。

## 生命周期图示

Vue 实例的生命周期包含以下几个主要阶段：

- **创建前后**: 在实例初始化之后，数据观测 (data observer) 和 event/watcher 事件配置之前调用
- **挂载前后**: 在挂载开始之前被调用，相关的 render 函数首次被调用
- **更新前后**: 数据更新时调用，发生在虚拟 DOM 打补丁之前
- **销毁前后**: 实例销毁之前调用

## 生命周期钩子详解

### beforeCreate

在实例初始化之后，数据观测 (data observer) 和 event/watcher 事件配置之前被调用。

```javascript
new Vue({
  data: {
    a: 1
  },
  beforeCreate: function () {
    console.log('实例创建前', this.a) // undefined
    console.log(this.$data) // undefined
  }
})
```

### created

在实例创建完成后被立即调用。在这一步，实例已完成以下的配置：数据观测 (data observer)，属性和方法的运算，watch/event 事件回调。然而，挂载阶段还没开始，$el 属性目前不可见。

```javascript
new Vue({
  data: {
    a: 1
  },
  created: function () {
    console.log('实例创建完成', this.a) // 1
    console.log(this.$data) // { a: 1 }
    
    // 可以访问数据和方法
    this.fetchData()
  },
  methods: {
    fetchData() {
      // 在这里可以访问 this.a
    }
  }
})
```

### beforeMount

在挂载开始之前被调用：相关的 render 函数首次被调用。

```javascript
new Vue({
  el: '#app',
  template: '<div>{{ message }}</div>',
  data: {
    message: 'Hello Vue!'
  },
  beforeMount: function () {
    console.log('挂载前')
    console.log(this.$el) // 还未创建，但可以访问
  }
})
```

### mounted

实例被挂载后调用，这时 el 被新创建的 vm.$el 替换了。如果根实例挂载到了一个文档内的元素上，当 mounted 被调用时 vm.$el 也在文档内。

```javascript
new Vue({
  el: '#app',
  data: {
    message: 'Hello Vue!'
  },
  mounted: function () {
    console.log('实例已挂载')
    console.log(this.$el) // 已创建并挂载到DOM
    console.log(document.querySelector('#app').innerHTML)
    
    // 在这里可以访问DOM元素
    this.initThirdPartyLib()
  },
  methods: {
    initThirdPartyLib() {
      // 初始化第三方库，如图表库、地图等
    }
  }
})
```

### beforeUpdate

数据更新时调用，发生在虚拟 DOM 打补丁之前。这里适合在更新之前访问现有的 DOM，比如手动移除已添加的事件监听器。

```javascript
new Vue({
  el: '#app',
  data: {
    message: 'Hello Vue!'
  },
  beforeUpdate: function () {
    console.log('数据更新前')
    // 可以访问更新前的DOM状态
    console.log(this.$el.textContent) // 旧的文本内容
  }
})
```

### updated

由于数据更改导致的虚拟 DOM 重新渲染和打补丁，在这之后会调用该钩子。

```javascript
new Vue({
  el: '#app',
  data: {
    message: 'Hello Vue!',
    list: [1, 2, 3]
  },
  updated: function () {
    console.log('数据更新后')
    // DOM 已更新，可以执行依赖于DOM的操作
    console.log(this.$el.textContent) // 新的文本内容
    
    // 注意：避免在此钩子中更改数据，这会再次触发更新
  }
})
```

### activated

被 keep-alive 缓存的组件激活时调用。

```javascript
export default {
  activated: function () {
    console.log('组件被激活')
    // 重新激活定时器、重新连接WebSocket等
    this.resumeTimer()
  },
  methods: {
    resumeTimer() {
      // 恢复定时器
    }
  }
}
```

### deactivated

被 keep-alive 缓存的组件停用时调用。

```javascript
export default {
  deactivated: function () {
    console.log('组件被停用')
    // 暂停定时器、断开WebSocket连接等
    this.pauseTimer()
  },
  methods: {
    pauseTimer() {
      // 暂停定时器
    }
  }
}
```

### beforeDestroy

实例销毁之前调用。在这一步，实例仍然完全可用。

```javascript
new Vue({
  data: {
    timer: null
  },
  beforeDestroy: function () {
    console.log('实例销毁前')
    // 清理定时器
    if (this.timer) {
      clearInterval(this.timer)
    }
    
    // 解绑自定义事件监听器
    this.$off('custom-event')
    
    // 解绑DOM事件监听器
    document.removeEventListener('click', this.handleClick)
  }
})
```

### destroyed

Vue 实例销毁后调用。调用后，Vue 实例指示的所有东西都会解绑定，所有的事件监听器会被移除，所有的子实例也会被销毁。

```javascript
new Vue({
  destroyed: function () {
    console.log('实例已销毁')
    // 实例已被销毁，不能再访问实例上的属性和方法
  }
})
```

## 实际应用示例

```javascript
export default {
  name: 'MyComponent',
  data() {
    return {
      timer: null,
      socket: null
    }
  },
  created() {
    // 在这里进行数据初始化
    this.loadData()
  },
  mounted() {
    // 在这里进行DOM操作和第三方库初始化
    this.initChart()
    this.startTimer()
    this.connectWebSocket()
  },
  beforeUpdate() {
    // 在这里可以进行更新前的准备工作
  },
  updated() {
    // 在这里可以进行更新后的操作
    this.updateChart()
  },
  beforeDestroy() {
    // 在这里进行清理工作
    this.clearTimer()
    this.disconnectWebSocket()
  },
  methods: {
    loadData() {
      // 加载数据
    },
    initChart() {
      // 初始化图表
    },
    startTimer() {
      this.timer = setInterval(() => {
        // 定时任务
      }, 1000)
    },
    connectWebSocket() {
      this.socket = new WebSocket('ws://example.com')
    },
    clearTimer() {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
    },
    disconnectWebSocket() {
      if (this.socket) {
        this.socket.close()
      }
    },
    updateChart() {
      // 更新图表
    }
  }
}
```

## 注意事项

1. **不要在选项属性或回调上使用箭头函数**，因为箭头函数没有自己的 this，this 会作为变量一直向上级词法作用域查找，导致找不到 Vue 实例。

2. **避免在 updated 钩子中更改数据**，这会再次触发更新，可能导致无限循环。

3. **在 beforeDestroy 中清理资源**，避免内存泄漏。

生命周期钩子是 Vue.js 的核心概念之一，合理使用它们可以让组件在不同阶段执行相应的逻辑，提高应用的性能和用户体验。