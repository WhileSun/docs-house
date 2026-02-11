---
title: 表单输入绑定
createTime: 2026/02/10 13:55:00
permalink: /frontend/vue2/basics/form-input-bindings/
---

# 表单输入绑定

我们可以使用 `v-model` 指令在表单 `<input>`、`<textarea>` 及 `<select>` 元素上创建双向数据绑定。它会根据控件类型自动选取正确的方法来更新元素。尽管有些神奇，但 `v-model` 本质上不过是语法糖。它负责监听用户的输入事件以更新数据，并对一些极端场景进行一些特殊处理。

## 基础用法

### 文本输入

```html
<input v-model="message" placeholder="edit me">
<p>Message is: {{ message }}</p>
```

### 多行文本

```html
<span>Multiline message is:</span>
<p style="white-space: pre-line;">{{ message }}</p>
<br>
<textarea v-model="message" placeholder="add multiple lines"></textarea>
```

`<textarea>` 的内容通过 `v-model` 绑定，因此不需要使用 `<textarea>{{text}}</textarea>` 插值。

## 复选框

### 单个复选框，绑定到布尔值

```html
<input type="checkbox" id="checkbox" v-model="checked">
<label for="checkbox">{{ checked }}</label>
```

```javascript
new Vue({
  el: '#example-1',
  data: {
    checked: false
  }
})
```

### 多个复选框，绑定到同一个数组

```html
<div id="example-2">
  <input type="checkbox" id="jack" value="Jack" v-model="checkedNames">
  <label for="jack">Jack</label>
  <input type="checkbox" id="john" value="John" v-model="checkedNames">
  <label for="john">John</label>
  <input type="checkbox" id="mike" value="Mike" v-model="checkedNames">
  <label for="mike">Mike</label>
  <br>
  <span>Checked names: {{ checkedNames }}</span>
</div>
```

```javascript
new Vue({
  el: '#example-2',
  data: {
    checkedNames: []
  }
})
```

## 单选按钮

```html
<div id="example-3">
  <input type="radio" id="one" value="One" v-model="picked">
  <label for="one">One</label>
  <input type="radio" id="two" value="Two" v-model="picked">
  <label for="two">Two</label>
  <br>
  <span>Picked: {{ picked }}</span>
</div>
```

```javascript
new Vue({
  el: '#example-3',
  data: {
    picked: ''
  }
})
```

## 选择框

### 单选

```html
<div id="example-4">
  <select v-model="selected">
    <option disabled value="">请选择</option>
    <option>A</option>
    <option>B</option>
    <option>C</option>
  </select>
  <span>Selected: {{ selected }}</span>
</div>
```

```javascript
new Vue({
  el: '#example-4',
  data: {
    selected: ''
  }
})
```

如果 `v-model` 表达式的初始值未能匹配任何选项，`<select>` 元素将被渲染为"未选中"状态。在 iOS 中，这会使用户无法选择第一项。因为这样的原因，建议提供一个值为空的禁用选项。

### 多选（绑定到一个数组）

```html
<div id="example-5">
  <select v-model="selected" multiple>
    <option>A</option>
    <option>B</option>
    <option>C</option>
  </select>
  <br>
  <span>Selected: {{ selected }}</span>
</div>
```

```javascript
new Vue({
  el: '#example-5',
  data: {
    selected: []
  }
})
```

### 用 v-for 渲染的动态选项

```html
<select v-model="selected">
  <option v-for="option in options" :value="option.value" :key="option.value">
    {{ option.text }}
  </option>
</select>
```

```javascript
new Vue({
  el: '...',
  data: {
    selected: 'A',
    options: [
      { text: 'One', value: 'A' },
      { text: 'Two', value: 'B' },
      { text: 'Three', value: 'C' }
    ]
  }
})
```

## 值绑定

对于单选按钮、复选框和选择框的选项，`v-model` 绑定的值通常是静态字符串（对于复选框是布尔值）：

```html
<!-- 当选中时，`picked` 为字符串 "a" -->
<input type="radio" v-model="picked" value="a">
```

但是，有时我们想绑定值到 Vue 实例上的一个动态属性上。这时可以用 `v-bind` 实现，并且这个属性的值可以是任何类型：

```html
<!-- `toggle` 为 true 或 false -->
<input type="checkbox" v-model="toggle" true-value="yes" false-value="no">
```

```javascript
// 当选中时
vm.toggle === 'yes'
// 当未选中时
vm.toggle === 'no'
```

同样的，这也可以用于复选框：

```html
<input
  type="checkbox"
  v-model="a"
  :true-value="b"
  :false-value="c"
>
```

```javascript
// 当选中时
vm.a === vm.b
// 当未选中时
vm.a === vm.c
```

对于选择框的选项：

```html
<option :value="someObject">...</option>
```

```javascript
vm.selected // 为 someObject
```

## 修饰符

### .lazy

在默认情况下，`v-model` 在每次 `input` 事件触发后将输入框的值与数据进行同步 (除了上述输入法组合文字时)。你可以添加 `lazy` 修饰符，从而转为在 `change` 事件之后进行同步：

```html
<!-- 在 "change" 时而非 "input" 时更新 -->
<input v-model.lazy="msg">
```

### .number

如果想自动将用户的输入值转为数字类型（如果原值的转换结果为 NaN 则返回原值），可以给 `v-model` 添加 `number` 修饰符：

```html
<input v-model.number="age" type="number">
```

这通常很有用，因为即使在 `type="number"` 时，HTML 表单元素的值也总会返回字符串。如果这个值无法被 `parseFloat()` 解析，则会返回原始的值。

### .trim

如果要自动过滤用户输入的首尾空白字符，可以给 `v-model` 添加 `trim` 修饰符：

```html
<input v-model.trim="msg">
```

## 在组件上使用 v-model

`v-model` 也可以在自定义组件上使用，但需要组件正确实现 `value` prop 和 `input` 事件：

```javascript
Vue.component('base-input', {
  props: ['value'],
  template: `
    <input
      v-bind:value="value"
      v-on:input="$emit('input', $event.target.value)"
    >
  `
})
```

然后像使用内置表单控件一样使用组件：

```html
<base-input v-model="searchText"></base-input>
```

## 实际应用示例

### 用户注册表单

```html
<div id="form-example">
  <form @submit.prevent="submitForm">
    <div>
      <label>姓名：</label>
      <input type="text" v-model.trim="form.name" required>
    </div>
    
    <div>
      <label>邮箱：</label>
      <input type="email" v-model.trim="form.email" required>
    </div>
    
    <div>
      <label>年龄：</label>
      <input type="number" v-model.number="form.age" min="0" max="120">
    </div>
    
    <div>
      <label>性别：</label>
      <input type="radio" id="male" value="male" v-model="form.gender">
      <label for="male">男</label>
      <input type="radio" id="female" value="female" v-model="form.gender">
      <label for="female">女</label>
    </div>
    
    <div>
      <label>兴趣爱好：</label>
      <input type="checkbox" id="reading" value="reading" v-model="form.hobbies">
      <label for="reading">阅读</label>
      <input type="checkbox" id="sports" value="sports" v-model="form.hobbies">
      <label for="sports">运动</label>
      <input type="checkbox" id="music" value="music" v-model="form.hobbies">
      <label for="music">音乐</label>
    </div>
    
    <div>
      <label>城市：</label>
      <select v-model="form.city">
        <option value="">请选择</option>
        <option value="beijing">北京</option>
        <option value="shanghai">上海</option>
        <option value="guangzhou">广州</option>
      </select>
    </div>
    
    <div>
      <label>个人简介：</label>
      <textarea v-model="form.bio" rows="4" maxlength="200"></textarea>
    </div>
    
    <div>
      <input type="checkbox" id="agreement" v-model="form.agreement" required>
      <label for="agreement">我同意用户协议</label>
    </div>
    
    <button type="submit">提交</button>
  </form>
  
  <div>
    <h3>表单数据：</h3>
    <pre>{{ form }}</pre>
  </div>
</div>
```

```javascript
new Vue({
  el: '#form-example',
  data: {
    form: {
      name: '',
      email: '',
      age: null,
      gender: '',
      hobbies: [],
      city: '',
      bio: '',
      agreement: false
    }
  },
  methods: {
    submitForm() {
      if (!this.form.agreement) {
        alert('请同意用户协议')
        return
      }
      
      console.log('提交表单:', this.form)
      // 这里可以发送数据到服务器
    }
  }
})
```

表单输入绑定是 Vue.js 中处理用户输入的重要功能，通过 `v-model` 可以轻松实现双向数据绑定，大大简化了表单处理的复杂度。