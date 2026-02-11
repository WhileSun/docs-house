---
title: 源码概览
createTime: 2026/02/11 10:00:00
permalink: /frontend/vue2/source-code/overview/
---

# Vue2 源码概览

Vue.js 2.x 是一个渐进式 JavaScript 框架，其源码结构清晰，模块化程度高。本文将带你了解 Vue2 的整体架构和源码组织方式。

## 源码目录结构

Vue2 的源码主要存放在 `src` 目录下，主要包括以下几个部分：

- `compiler`: 模板编译器，负责将模板编译成渲染函数
- `core`: Vue 的核心代码，包括响应式系统、虚拟DOM等
- `platforms`: 平台相关的入口文件
- `server`: 服务端渲染相关代码
- `sfc`: 单文件组件解析器
- `shared`: 全局共享的工具函数

## 构建配置

Vue2 使用 Rollup 进行打包构建，不同的构建目标对应不同的入口文件和功能模块。

## 核心概念

Vue2 的核心概念包括：

1. 数据响应系统
2. 虚拟DOM
3. 组件系统
4. 生命周期
5. 插件机制

## Vue构造函数

Vue.js 的核心是 Vue 构造函数，其定义如下：

```javascript
function Vue (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  this._init(options)
}
```

在 `_init` 方法中，Vue 会执行一系列初始化操作：

```javascript
Vue.prototype._init = function (options?: Object) {
  const vm: Component = this
  // a uid
  vm._uid = uid++

  let startTag, endTag
  /* istanbul ignore if */
  if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
    startTag = `vue-perf-start:${vm._uid}`
    endTag = `vue-perf-end:${vm._uid}`
    mark(startTag)
  }

  // a flag to avoid this being observed
  vm._isVue = true
  // merge options
  if (options && options._isComponent) {
    // optimize internal component instantiation
    // since dynamic options merging is pretty slow, and none of the
    // internal component options needs special treatment.
    initInternalComponent(vm, options)
  } else {
    vm.$options = mergeOptions(
      resolveConstructorOptions(vm.constructor),
      options || {},
      vm
    )
  }
  /* istanbul ignore else */
  if (process.env.NODE_ENV !== 'production') {
    initProxy(vm)
  } else {
    vm._renderProxy = vm
  }
  // expose real self
  vm._self = vm
  initLifecycle(vm)
  initEvents(vm)
  initRender(vm)
  callHook(vm, 'beforeCreate')
  initInjections(vm) // resolve injections before data/props
  initState(vm)
  initProvide(vm) // resolve provide after data/props
  callHook(vm, 'created')

  /* istanbul ignore if */
  if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
    vm._name = formatComponentName(vm, false)
    mark(endTag)
    measure(`vue ${vm._name} init`, startTag, endTag)
  }

  if (vm.$options.el) {
    vm.$mount(vm.$options.el)
  }
}
```

这些概念在后续章节中会详细讲解。