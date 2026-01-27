---
title: 指令：数据绑定
createTime: 2026/01/16 10:12:43
permalink: /frontend/vue3/template/directives-bind/
---

## v-text
更新元素的文本内容。

- **详细信息**
  `v-text` 通过设置元素的 `textContent` 属性来工作，因此它将==覆盖元素中所有现有的内容==。如果你需要更新 textContent 的部分，应该使用 mustache interpolations 代替。

- **示例**
  ``` vue
  <span v-text="msg"></span>
  <!-- 等同于 -->
  <span>{{msg}}</span>
  ```

## v-html
更新元素的 innerHTML。

- **详细信息**
`v-html` 的内容直接作为==**普通 HTML** 插入—— Vue 模板语法是不会被解析的==。如果你发现自己正打算用 v-html 来编写模板，不如重新想想怎么使用组件来代替。

``` vue
<div v-html="html"></div>
```

## v-bind
动态的绑定一个或多个 attribute，也可以是组件的 prop。

- **缩写**
  - `:` 或者 `.` (当使用 .prop 修饰符)
  - 值可以省略 (当 attribute 和绑定的值同名时，需要 3.4+ 版本)

- **修饰符**
  - `.camel` - 将短横线命名的 attribute 转变为驼峰式命名。
  - `.prop` - 强制绑定为 DOM property (3.2+)。
  - `.attr` - 强制绑定为 DOM attribute (3.2+)。

- **用途**

  当用于绑定 `class` 或 `style attribute`，`v-bind` 支持额外的值类型如数组或对象。

  在处理绑定时，Vue 默认会利用 `in` 操作符来检查该元素上是否定义了和绑定的 `key` 同名的 `DOM property`。如果存在同名的 property，则 Vue 会将它作为 `DOM property` 赋值，而不是作为 `attribute` 设置。这个行为在大多数情况都符合期望的绑定值类型，但是你也可以显式用 `.prop` 和 `.attr` 修饰符来强制绑定方式。有时这是必要的，特别是在和自定义元素打交道时。

  当用于组件 `props` 绑定时，所绑定的 `props` 必须在子组件中已被正确声明。

  不带参数使用时，可以用于绑定一个包含了多个 attribute 名称-绑定值对的对象。

- **示例**

``` vue
<!-- 绑定 attribute -->
<img v-bind:src="imageSrc" />

<!-- 动态 attribute 名 -->
<button v-bind:[key]="value"></button>

<!-- 缩写 -->
<img :src="imageSrc" />

<!-- 缩写形式的动态 attribute 名 (3.4+)，扩展为 :src="src" -->
<img :src />

<!-- 动态 attribute 名的缩写 -->
<button :[key]="value"></button>

<!-- 内联字符串拼接 -->
<img :src="'/path/to/images/' + fileName" />

<!-- class 绑定 -->
<div :class="{ red: isRed }"></div>
<div :class="[classA, classB]"></div>
<div :class="[classA, { classB: isB, classC: isC }]"></div>

<!-- style 绑定 -->
<div :style="{ fontSize: size + 'px' }"></div>
<div :style="[styleObjectA, styleObjectB]"></div>

<!-- 绑定对象形式的 attribute -->
<div v-bind="{ id: someProp, 'other-attr': otherProp }"></div>

<!-- prop 绑定。“prop” 必须在子组件中已声明。 -->
<MyComponent :prop="someThing" />

<!-- 传递子父组件共有的 prop -->
<MyComponent v-bind="$props" />

<!-- XLink -->
<a :xlink:special="foo"></a>
```

`.prop` 修饰符也有专门的缩写，`.`：

``` vue
<div :someProperty.prop="someObject"></div>

<!-- 等同于 -->
<div .someProperty="someObject"></div>
```

## v-model
在表单输入元素或组件上创建双向绑定。

- **期望的绑定值类型：**根据表单输入元素或组件输出的值而变化
- **仅限**：
  - `<input>`
  - `<select>`
  - `<textarea>`
  - components

- **修饰符**
  - `.lazy` - 监听 `change` 事件而不是 `input`
  - `.number` - 将输入的合法字符串转为数字
  - `.trim` - 移除输入内容两端空格

### 表单输入绑定
在前端处理表单时，我们常常需要将表单输入框的内容同步给 `JavaScript` 中相应的变量。==手动连接值绑定和更改事件监听器可能会很麻烦==：

``` vue
<template>
  <input
    :value="text"
    @input="event => {text = event.target.value}">
</template>
```

`v-model` 指令帮我们简化了这一步骤：

``` vue
<template>
  <input v-model="text">
</template>
```

另外，v-model 还可以用于各种不同类型的输入，`<textarea>`、`<select>` 元素。它会==根据所使用的元素自动使用对应的 DOM 属性和事件组合==：

- 文本类型的 `<input>` 和 `<textarea>` 元素会绑定 value `property` 并侦听 `input` 事件；
- `<input type="checkbox">` 和 `<input type="radio">` 会绑定 checked `property` 并侦听 `change` 事件；
- `<select>` 会绑定 value `property` 并侦听 `change` 事件。


