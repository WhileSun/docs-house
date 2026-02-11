---
title: Props
createTime: 2026/02/10 14:00:00
permalink: /frontend/vue2/components/props/
---

# Props

Props 是组件之间通信的重要机制，用于接收来自父组件的数据。

## 基础用法

### 在组件中声明 Props

```javascript
// 创建一个名为 todo-item 的组件
Vue.component('todo-item', {
  // todo-item 组件现在接受一个 "prop"，
  // 类似于一个自定义 attribute。
  // 这个 prop 名为 todo。
  props: ['todo'],
  template: '<li>{{ todo.text }}</li>'
})
```

### 传递 Props

```html
<div id="app">
  <ol>
    <todo-item
      v-for="item in groceryList"
      v-bind:todo="item"
      v-bind:key="item.id">
    </todo-item>
  </ol>
</div>
```

```javascript
Vue.component('todo-item', {
  props: ['todo'],
  template: '<li>{{ todo.text }}</li>'
})

new Vue({
  el: '#app',
  data: {
    groceryList: [
      { id: 0, text: '蔬菜' },
      { id: 1, text: '奶酪' },
      { id: 2, text: '随便其他什么人吃的东西' }
    ]
  }
})
```

## Prop 类型

当一个值是布尔值时，特殊处理以增强转换行为：

```javascript
props: ['status']
```

```html
<!-- status 为 true -->
<blog-post status></blog-post>

<!-- status 为 false -->
<blog-post :status="false"></blog-post>
```

为了更好的类型检查，可以为 props 指定类型：

```javascript
props: {
  // 基础类型检查 (`null` 和 `undefined` 会通过任何类型验证)
  propA: Number,
  // 多个可能的类型
  propB: [String, Number],
  // 必填的字符串
  propC: {
    type: String,
    required: true
  },
  // 带有默认值的数字
  propD: {
    type: Number,
    default: 100
  },
  // 带有默认值的对象
  propE: {
    type: Object,
    // 对象或数组默认值必须从一个工厂函数返回
    default: function () {
      return { message: 'hello' }
    }
  },
  // 自定义验证函数
  propF: {
    validator: function (value) {
      // 这个值必须匹配下列字符串中的一个
      return ['success', 'warning', 'danger'].indexOf(value) !== -1
    }
  }
}
```

## Prop 验证

Vue 会在浏览器控制台中警告那些不符合类型检查的 prop。这在开发过程中非常有用。

```javascript
Vue.component('my-component', {
  props: {
    // 基础类型检查
    propA: Number,
    // 多个可能的类型
    propB: [String, Number],
    // 必填的字符串
    propC: {
      type: String,
      required: true
    },
    // 带有默认值的数字
    propD: {
      type: Number,
      default: 100
    },
    // 带有默认值的对象
    propE: {
      type: Object,
      default: function () {
        return { message: 'hello' }
      }
    },
    // 自定义验证函数
    propF: {
      validator: function (value) {
        return value > 10
      }
    }
  }
})
```

## 静态和动态 Prop

### 静态 Prop

```html
<blog-post title="My Journey with Vue"></blog-post>
```

### 动态 Prop

```html
<!-- 动态赋予一个变量的值 -->
<blog-post v-bind:title="post.title"></blog-post>

<!-- 动态赋予一个复杂表达式的值 -->
<blog-post
  v-bind:title="post.title + ' by ' + post.author.name"
></blog-post>
```

## 传递数值

```html
<!-- 即便 `42` 是静态的，我们仍需 `v-bind` 来告诉 Vue -->
<!-- 这是一个 JavaScript 表达式而不是一个字符串。 -->
<blog-post v-bind:likes="42"></blog-post>

<!-- 用一个变量进行动态赋值。 -->
<blog-post v-bind:likes="post.likes"></blog-post>
```

## 传递布尔值

```html
<!-- 包含该 prop 没有值，被认为 true -->
<blog-post is-published></blog-post>

<!-- 即便 `false` 是静态的，我们仍需 `v-bind` 来告诉 Vue -->
<!-- 这是一个 JavaScript 表达式而不是一个字符串。 -->
<blog-post v-bind:is-published="false"></blog-post>

<!-- 用一个变量进行动态赋值。 -->
<blog-post v-bind:is-published="post.isPublished"></blog-post>
```

## 传递数组

```html
<!-- 即便数组是静态的，我们仍需 `v-bind` 来告诉 Vue -->
<!-- 这是一个 JavaScript 表达式而不是一个字符串。 -->
<blog-post v-bind:comment-ids="[234, 266, 273]"></blog-post>

<!-- 用一个变量进行动态赋值。 -->
<blog-post v-bind:comment-ids="post.commentIds"></blog-post>
```

## 传递对象

```html
<!-- 即便对象是静态的，我们仍需 `v-bind` 来告诉 Vue -->
<!-- 这是一个 JavaScript 表达式而不是一个字符串。 -->
<blog-post
  v-bind:post="{ id: 1, title: 'My Journey with Vue' }"
></blog-post>

<!-- 用一个变量进行动态赋值。 -->
<blog-post v-bind:post="post"></blog-post>
```

## 传递对象的所有属性

如果你想要将一个对象的所有属性都作为 prop 传递，你可以使用不带参数的 `v-bind` (取代 `v-bind:prop-name`)。例如，对于一个给定的对象 `post`：

```html
<blog-post v-bind="post"></blog-post>
```

这会将 `post` 对象中的每个属性都作为单独的 prop 传入，等价于：

```html
<blog-post
  v-bind:id="post.id"
  v-bind:title="post.title"
  v-bind:content="post.content"
></blog-post>
```

## 单向数据流

所有的 prop 都形成了単向下行绑定，父级 prop 的更新会向下流动到子组件中，但是反过来则不行。这样防止了子组件意外改变父级的状态，导致你的应用的数据流向难以理解。

## Prop 验证详解

### 类型检查

```javascript
props: {
  // 基础类型
  propA: Number,
  // 多个可能的类型
  propB: [String, Number],
  // 必填的字符串
  propC: {
    type: String,
    required: true
  }
}
```

### 默认值

```javascript
props: {
  // 基础的默认值
  propD: {
    type: String,
    default: 'default value'
  },
  // 对象或数组的默认值必须从一个工厂函数返回
  propE: {
    type: Object,
    default: function () {
      return { message: 'hello' }
    }
  }
}
```

### 自定义验证

```javascript
props: {
  propF: {
    validator: function (value) {
      // 这个值必须匹配下列字符串中的一个
      return ['success', 'warning', 'danger'].indexOf(value) !== -1
    }
  },
  // 也可以验证更复杂的条件
  propG: {
    type: Object,
    validator: function (value) {
      return value.name && value.age
    }
  }
}
```

## 非 Prop 特性

一个非 prop 特性是指传向一个组件，却没有被定义为 prop 的特性。因为显式定义的 prop 会作为组件实例的属性，这些特性会自动添加到组件的根元素上。

```html
<bootstrap-input type="email" placeholder="Enter your email"></bootstrap-input>
```

假设 `bootstrap-input` 组件的模板是这样的：

```html
<input type="text" class="form-control">
```

为了能让组件的根元素自动获得这些特性，Vue 会将非 prop 特性添加到根元素上：

```html
<input type="email" placeholder="Enter your email" class="form-control">
```

## 替换/合并已有的特性

默认情况下，组件的根元素上的非 prop 特性会替换或与该元素上同名的特性合并。

例如，假设我们有这样的子组件：

```html
<template>
  <input class="btn" type="submit">
</template>
```

然后在父组件中使用它：

```html
<my-component class="btn-large"></my-component>
```

最终渲染的结果是：

```html
<input class="btn btn-large" type="submit">
```

对于 `style` 和 `class` 特性会智能合并，而对于其他特性会替换。

## 实际应用示例

### 用户卡片组件

```javascript
Vue.component('user-card', {
  props: {
    user: {
      type: Object,
      required: true,
      validator: function (value) {
        return value.name && value.email
      }
    },
    showEmail: {
      type: Boolean,
      default: true
    },
    size: {
      type: String,
      default: 'medium',
      validator: function (value) {
        return ['small', 'medium', 'large'].indexOf(value) !== -1
      }
    }
  },
  template: `
    <div class="user-card" :class="size">
      <h3>{{ user.name }}</h3>
      <p v-if="showEmail">{{ user.email }}</p>
      <p>{{ user.bio }}</p>
    </div>
  `
})
```

使用组件：

```html
<user-card 
  :user="userData" 
  :show-email="true"
  size="large">
</user-card>
```

Props 是 Vue 组件系统的核心概念之一，通过合理使用 Props，可以实现组件之间的有效通信和数据传递。