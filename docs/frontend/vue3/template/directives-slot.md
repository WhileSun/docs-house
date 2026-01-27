---
title: 指令：插槽
createTime: 2026/01/16 10:32:08
permalink: /frontend/vue3/template/directives-slot/
---

## v-slot
用于声明具名插槽或是期望接收 props 的作用域插槽。

- 缩写：`#`

- 参数：插槽名 (可选，默认是 `default`)

- 仅限：
  - `<template>`
  - components (用于带有 prop 的单个默认插槽)

- 示例
  ``` vue
  <template>
    <!-- 具名插槽 -->
    <BaseLayout>
      <template v-slot:header>
        Header content
      </template>

      <template v-slot:default>
        Default slot content
      </template>

      <template v-slot:footer>
        Footer content
      </template>
    </BaseLayout>

    <!-- 接收 prop 的具名插槽 -->
    <InfiniteScroll>
      <template v-slot:item="slotProps">
        <div class="item">
          {{ slotProps.item.text }}
        </div>
      </template>
    </InfiniteScroll>

    <!-- 接收 prop 的默认插槽，并解构 -->
    <Mouse v-slot="{ x, y }">
      Mouse position: {{ x }}, {{ y }}
    </Mouse>
  </template>
  ```

## 插槽 Slots
在之前的章节中，我们已经了解到组件能够接收任意类型的 JavaScript 值作为 props，但组件要如何接收模板内容呢？在某些场景中，我们可能想要为子组件传递一些模板片段，让子组件在它们的组件中渲染这些片段。

举例来说，这里有一个 `<FancyButton>` 组件，可以像这样使用：

``` vue
<template>
  <FancyButton>
    Click me! <!-- 插槽内容 -->
  </FancyButton>
</template>
```

而 `<FancyButton>` 的模板是这样的：

``` vue
<template>
  <button class="fancy-btn">
    <slot></slot> <!-- 插槽出口 -->
  </button>
</template>
```

`<slot>` 元素是一个**插槽出口** (slot outlet)，标示了父元素提供的**插槽内容** (slot content) 将在哪里被渲染。

最终渲染出的 DOM 是这样：

``` vue
<button class="fancy-btn">Click me!</button>
```

### **渲染作用域**
插槽内容可以访问到父组件的数据作用域，因为插槽内容本身是在父组件模板中定义的。举例来说：

``` vue
<span>{{ message }}</span>
<FancyButton>{{ message }}</FancyButton>
```

这里的两个 `{{ message }}` 插值表达式渲染的内容都是一样的。

插槽内容`无法访问`子组件的数据。Vue 模板中的表达式只能访问其定义时所处的作用域，这和 JavaScript 的词法作用域规则是一致的。换言之：

::: tip
父组件模板中的表达式只能访问父组件的作用域；子组件模板中的表达式只能访问子组件的作用域。
:::


### **默认内容**
在==外部没有提供任何内容的情况下==，可以为插槽**指定默认内容**。比如有这样一个 `<SubmitButton>` 组件：

``` vue
<template>
  <button type="submit">
    <slot></slot>
  </button>
</template>
```

如果我们想在父组件==没有提供任何插槽内容==时在 `<button>` 内渲染“Submit”，只需要将“Submit”写在 `<slot>` 标签之间来作为默认内容：

``` vue
<template>
  <button type="submit">
    <slot>
      Submit <!-- 默认内容 -->
    </slot>
  </button>
</template>
```

“Submit”将会被作为默认内容渲染：

``` vue
<button type="submit">Submit</button>
```

但如果我们提供了插槽内容：

``` vue
<SubmitButton>Save</SubmitButton>
``` 

那么被显式提供的内容会取代默认内容：

``` vue
<button type="submit">Save</button>
```

### **具名插槽**
有时在一个组件中包含多个插槽出口是很有用的。举例来说，在一个 `<BaseLayout>` 组件中，有如下模板：

``` vue
<template>
<div class="container">
  <header>
    <!-- 标题内容放这里 -->
  </header>
  <main>
    <!-- 主要内容放这里 -->
  </main>
  <footer>
    <!-- 底部内容放这里 -->
  </footer>
</div>
</template>
```

对于这种场景，`<slot>` 元素可以有一个特殊的 attribute `name`，用来给各个==插槽分配唯一的 ID==，以确定每一处要渲染的内容：

``` vue
<template>
  <div class="container">
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

这类带 `name` 的插槽被称为具名插槽 (named slots)。没有提供 `name` 的 `<slot>` 出口会隐式地命名为“default”。


在父组件中使用 `<BaseLayout>` 时，我们需要一种方式将多个插槽内容传入到各自目标插槽的出口。此时就需要用到**具名插槽**了：

要为具名插槽传入内容，我们需要使用一个含 `v-slot` 指令的 `<template>` 元素，并将目标插槽的名字传给该指令：

``` vue
<template>
  <BaseLayout>
    <template v-slot:header>
      <!-- header 插槽的内容放这里 -->
    </template>
  </BaseLayout>
</template>
```

v-slot 有对应的简写 `#`，因此 `<template v-slot:header>` 可以简写为 `<template #header>`。其意思就是“将这部分模板片段传入子组件的 header 插槽中”。


当一个组件同时接收默认插槽和具名插槽时，所有位于顶级的非 `<template>` 节点都被隐式地视为默认插槽的内容。

``` vue
<template>
  <BaseLayout>
    <template #header>
      <h1>Here might be a page title</h1>
    </template>

    <!-- 隐式的默认插槽 -->
    <p>A paragraph for the main content.</p>
    <p>And another one.</p>

    <template #footer>
      <p>Here's some contact info</p>
    </template>
  </BaseLayout>
</template>
```

现在 `<template>` 元素中的所有内容都将被传递到相应的插槽。最终渲染出的 HTML 如下：

``` vue
<template>
  <div class="container">
    <header>
      <h1>Here might be a page title</h1>
    </header>
    <main>
      <p>A paragraph for the main content.</p>
      <p>And another one.</p>
    </main>
    <footer>
      <p>Here's some contact info</p>
    </footer>
  </div>
</template>
```

### **条件插槽**
有时你需要根据内容是否被传入了插槽来渲染某些内容

你可以结合使用 `$slots` 属性与 v-if 来实现。

在下面的示例中，我们定义了一个卡片组件，它拥有三个条件插槽：`header`、`footer` 和 `default`。 当 `header`、`footer` 或 `default` 的内容存在时，我们希望包装它以提供额外的样式：

``` vue
<template>
  <div class="card">
    <div v-if="$slots.header" class="card-header">
      <slot name="header" />
    </div>
    
    <div v-if="$slots.default" class="card-content">
      <slot />
    </div>
    
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </div>
  </div>
</template>
```

### **动态插槽名**
动态指令参数在 v-slot 上也是有效的，即可以定义下面这样的动态插槽名：

``` vue
<template>
  <base-layout>
    <template v-slot:[dynamicSlotName]>
      ...
    </template>

    <!-- 缩写为 -->
    <template #[dynamicSlotName]>
      ...
    </template>
  </base-layout>
</template>
```

### **作用域插槽**
在上面的渲染作用域中我们讨论到，==插槽的内容无法访问到子组件的状态==。

然而在某些场景下插槽的内容可能想要同时使用==父组件域内和子组件域内的数据==。要做到这一点，我们需要一种方法来让子组件在渲染时将一部分数据提供给插槽。

我们也确实有办法这么做！可以像对组件传递 `props` 那样，向一个插槽的出口上传递 attributes：

``` vue
<template>
  <!-- <MyComponent> 的模板 -->
  <div>
    <slot :text="greetingMessage" :count="1"></slot>
  </div>
</template>
```

当需要接收插槽 `props` 时，默认插槽和具名插槽的使用方式有一些小区别。下面我们将先展示默认插槽如何接受 props，通过子组件标签上的 `v-slot` 指令，直接接收到了一个插槽 `props` 对象：

``` vue
<template>
  <MyComponent v-slot="slotProps">
    {{ slotProps.text }} {{ slotProps.count }}
  </MyComponent>
</template>
```

你可以将作用域插槽类比为一个传入子组件的函数。==子组件会将相应的 props ==作为参数传给它：

``` js
MyComponent({
  // 类比默认插槽，将其想成一个函数
  default: (slotProps) => {
    return `${slotProps.text} ${slotProps.count}`
  }
})

function MyComponent(slots) {
  const greetingMessage = 'hello'
  return `<div>${
    // 在插槽函数调用时传入 props
    slots.default({ text: greetingMessage, count: 1 })
  }</div>`
}
```

#### **具名作用域插槽**
具名作用域插槽的工作方式也是类似的，插槽 props 可以作为 `v-slot` 指令的值被访问到：`v-slot:name="slotProps"`。当使用缩写时是这样：

``` vue
<template>
  <MyComponent>
    <template #header="headerProps">
      {{ headerProps }}
    </template>

    <template #default="defaultProps">
      {{ defaultProps }}
    </template>

    <template #footer="footerProps">
      {{ footerProps }}
    </template>
  </MyComponent>
</template>
```

### **高级列表组件示例**
你可能想问==什么样的场景才适合用到作用域插槽==，这里我们来看一个 `<FancyList>` 组件的例子。它会渲染一个列表，并同时会封装一些加载远端数据的逻辑、使用数据进行列表渲染、或者是像分页或无限滚动这样更进阶的功能。然而我们希望它能够保留足够的灵活性，==将对单个列表元素内容和样式的**控制权**留给使用它的**父组件**==。我们期望的用法可能是这样的：

``` vue
<template>
  <FancyList :api-url="url" :per-page="10">
    <template #item="{ body, username, likes }">
      <div class="item">
        <p>{{ body }}</p>
        <p>by {{ username }} | {{ likes }} likes</p>
      </div>
    </template>
  </FancyList>
</template>
```

在 `<FancyList>` 之中，我们可以多次渲染 `<slot>` 并每次都提供不同的数据 (注意我们这里使用了 v-bind 来传递插槽的 props)：

``` vue
<template>
  <ul>
    <li v-for="item in items">
      <slot name="item" v-bind="item"></slot>
    </li>
  </ul>
</template>
```
