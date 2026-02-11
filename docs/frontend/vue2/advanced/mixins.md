---
title: Mixins
createTime: 2026/02/10 13:25:00
permalink: /frontend/vue2/advanced/mixins/
---

# Mixins

混入 (mixins) 是一种分发 Vue 组件可复用功能的灵活方式。混入对象可以包含任意组件选项。当组件使用混入对象时，混入对象的选项将被"混合"进入该组件本身的选项。

## 基础用法

创建一个混入对象：

```javascript
// 定义一个混入对象
var myMixin = {
  created: function () {
    this.hello()
  },
  methods: {
    hello: function () {
      console.log('hello from mixin!')
    }
  }
}

// 定义一个使用混入对象的组件
var Component = Vue.extend({
  mixins: [myMixin]
})

var component = new Component() // => "hello from mixin!"
```

## 选项合并

当组件和混入对象含有同名选项时，这些选项将以恰当的方式进行"合并"。

### 数据对象合并

数据对象在内部会进行递归合并，并在发生冲突时以组件数据优先：

```javascript
var mixin = {
  data: function () {
    return {
      message: 'hello',
      foo: 'abc'
    }
  }
}

new Vue({
  mixins: [mixin],
  data: function () {
    return {
      message: 'goodbye',
      bar: 'def'
    }
  },
  created: function () {
    console.log(this.$data) // => { message: "goodbye", foo: "abc", bar: "def" }
  }
})
```

### 钩子函数合并

同名钩子函数将合并为一个数组，因此都将被调用。另外，混入对象的钩子将在组件自身钩子之前调用：

```javascript
var mixin = {
  created: function () {
    console.log('混入对象的钩子被调用')
  }
}

new Vue({
  mixins: [mixin],
  created: function () {
    console.log('组件钩子被调用')
  }
})

// => "混入对象的钩子被调用"
// => "组件钩子被调用"
```

### 值为对象的选项合并

值为对象的选项，例如 `methods`、`components` 和 `directives`，将被合并为同一个对象。两个对象键名冲突时，取组件对象的键值对：

```javascript
var mixin = {
  methods: {
    foo: function () {
      console.log('foo')
    },
    conflicting: function () {
      console.log('from mixin')
    }
  }
}

var vm = new Vue({
  mixins: [mixin],
  methods: {
    bar: function () {
      console.log('bar')
    },
    conflicting: function () {
      console.log('from self')
    }
  }
})

vm.foo() // => "foo"
vm.bar() // => "bar"
vm.conflicting() // => "from self"
```

## 全局混入

一旦使用全局混入，它将影响每一个之后创建的 Vue 实例。使用恰当时，可以为自定义注入带来便利：

```javascript
// 为自定义的 option 'myOption' 注入一个处理器
Vue.mixin({
  created: function () {
    var myOption = this.$options.myOption
    if (myOption) {
      console.log(myOption)
    }
  }
})

new Vue({
  myOption: 'hello!' // => "hello!"
})
```

谨慎使用全局混入，因为它会影响每个单独创建的 Vue 实例 (包括第三方组件)。

## 自定义选项合并策略

自定义选项将使用默认策略，即简单地覆盖已有值。如果想让自定义选项以自定义逻辑合并，可以向 `Vue.config.optionMergeStrategies` 添加一个函数：

```javascript
Vue.config.optionMergeStrategies.myOption = function (toVal, fromVal) {
  // 返回合并后的值
  return fromVal || toVal
}
```

对于多数值为对象的选项，可以使用 `methods` 的合并策略：

```javascript
var strategies = Vue.config.optionMergeStrategies
strategies.myOption = strategies.methods
```

## 实际应用示例

### 通用功能混入

```javascript
// 通用功能混入
const commonMixin = {
  data() {
    return {
      loading: false,
      error: null
    }
  },
  methods: {
    setLoading(status) {
      this.loading = status
    },
    setError(message) {
      this.error = message
    },
    clearError() {
      this.error = null
    }
  },
  created() {
    console.log('通用功能混入已加载')
  }
}

// 在组件中使用
export default {
  mixins: [commonMixin],
  methods: {
    fetchData() {
      this.setLoading(true)
      // 获取数据的逻辑
      this.setLoading(false)
    }
  }
}
```

### 表单验证混入

```javascript
// 表单验证混入
const formValidationMixin = {
  data() {
    return {
      errors: {}
    }
  },
  methods: {
    validateRequired(value, fieldName) {
      if (!value || value.toString().trim() === '') {
        this.errors[fieldName] = `${fieldName} 是必填项`
        return false
      }
      this.clearError(fieldName)
      return true
    },
    validateEmail(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!re.test(email)) {
        this.errors.email = '请输入有效的邮箱地址'
        return false
      }
      this.clearError('email')
      return true
    },
    clearError(field) {
      if (this.errors[field]) {
        delete this.errors[field]
      }
    },
    clearAllErrors() {
      this.errors = {}
    },
    isValid() {
      return Object.keys(this.errors).length === 0
    }
  }
}

// 在表单组件中使用
export default {
  mixins: [formValidationMixin],
  data() {
    return {
      email: '',
      password: ''
    }
  },
  methods: {
    submitForm() {
      this.validateRequired(this.email, 'email')
      this.validateEmail(this.email)
      this.validateRequired(this.password, 'password')
      
      if (this.isValid()) {
        // 提交表单
        console.log('表单验证通过')
      }
    }
  }
}
```

## 混入的优缺点

### 优点

1. **代码复用**：可以在多个组件间复用相同的逻辑
2. **关注点分离**：将通用功能提取到混入中
3. **灵活性**：可以根据需要选择性地使用混入

### 缺点

1. **命名冲突**：可能导致选项名称冲突
2. **隐式依赖**：组件的依赖关系不够明确
3. **调试困难**：混入的逻辑可能分散在多个地方
4. **增加复杂性**：过度使用会使代码难以理解和维护

混入是 Vue 中实现代码复用的强大工具，但在现代 Vue 开发中，Composition API 提供了更灵活和直观的方式来组织和复用逻辑。