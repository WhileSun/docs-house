---
title: 错误处理
createTime: 2026/02/11 11:30:00
permalink: /frontend/vue2/source-code/error-handling/
---

# Vue2 错误处理源码解析

Vue2 提供了一套完善的错误处理机制，用于捕获和处理运行时错误。本文将深入探讨Vue2错误处理的实现原理和内部机制。

## 错误处理概述

Vue2 的错误处理机制主要包括：

- 生命周期钩子错误处理
- 事件处理器错误处理
- 渲染错误处理
- 异步错误处理
- 全局错误处理

## 错误处理函数

Vue2 的错误处理核心函数是 `handleError`：

```javascript
// src/core/util/error.js
import config from '../config'
import { warn } from './debug'
import { inBrowser, inWeex } from './env'
import { isPromise } from 'shared/util'

export function handleError (err, vm, info) {
  // 递归错误处理保护
  if (vm) {
    let cur = vm
    while ((cur = cur.$parent)) {
      if (cur._hasHookEvent) {
        config.errorHandler.call(null, err, vm, info)
        return
      }
    }
  }
  // 调用全局错误处理器
  logError(err, vm, info)
}

function logError (err, vm, info) {
  if (process.env.NODE_ENV !== 'production') {
    warn(`Error in ${info}: "${err.toString()}"`, vm)
  }
  /* istanbul ignore else */
  if ((inBrowser || inWeex) && typeof console !== 'undefined') {
    console.error(err)
  } else {
    throw err
  }
}
```

## 安全调用函数

Vue2 提供了 `invokeWithErrorHandling` 函数来安全地调用可能抛出错误的函数：

```javascript
// src/core/util/error.js
export function invokeWithErrorHandling (
  handler,
  context,
  args,
  vm,
  info
) {
  let res
  try {
    res = args ? handler.apply(context, args) : handler.call(context)
    if (res && !res._isVue && isPromise(res) && !res._handled) {
      res.catch(e => handleError(e, vm, info + ` (Promise/async)`))
      // issue #9511
      // avoid catch triggering multiple times when nested calls
      res._handled = true
    }
  } catch (e) {
    handleError(e, vm, info)
  }
  return res
}
```

## 生命周期钩子错误处理

在调用生命周期钩子时，Vue 使用 `invokeWithErrorHandling` 来确保错误被捕获：

```javascript
// src/core/instance/lifecycle.js
export function callHook (vm, hook) {
  // #7573 disable dep collection when invoking lifecycle hooks
  pushTarget()
  const handlers = vm.$options[hook]
  const info = `${hook} hook`
  if (handlers) {
    for (let i = 0, j = handlers.length; i < j; i++) {
      invokeWithErrorHandling(handlers[i], vm, null, vm, info)
    }
  }
  if (vm._hasHookEvent) {
    vm.$emit('hook:' + hook)
  }
  popTarget()
}
```

## 事件处理器错误处理

在处理事件时，Vue 同样使用 `invokeWithErrorHandling` 来捕获错误：

```javascript
// src/core/vdom/helpers/update-listeners.js
export function createOnceHandler (event, handler, capture) {
  const _target = target // save current target element in closure
  return function onceHandler () {
    const res = handler.apply(null, arguments)
    if (res !== null) {
      remove(event, onceHandler, capture, _target)
    }
  }
}

// 在事件绑定和触发时使用 invokeWithErrorHandling
Vue.prototype.$emit = function (event) {
  const vm = this
  if (process.env.NODE_ENV !== 'production') {
    const lowerCaseEvent = event.toLowerCase()
    if (lowerCaseEvent !== event && vm._events[lowerCaseEvent]) {
      tip(
        `Event "${lowerCaseEvent}" is emitted in component ` +
        `${formatComponentName(vm)} but the handler is registered for "${event}". ` +
        `Note that HTML attributes are case-insensitive and you cannot use ` +
        `v-on to listen to camelCase events when using in-DOM templates. ` +
        `You should probably use "${hyphenate(event)}" instead of "${event}".`
      )
    }
  }
  let cbs = vm._events[event]
  if (cbs) {
    cbs = cbs.length > 1 ? toArray(cbs) : cbs
    const args = toArray(arguments, 1)
    const info = `event handler for "${event}"`
    for (let i = 0, l = cbs.length; i < l; i++) {
      invokeWithErrorHandling(cbs[i], vm, args, vm, info)
    }
  }
  return vm
}
```

## 渲染错误处理

在渲染过程中，Vue 也使用错误处理机制来捕获渲染错误：

```javascript
// src/core/instance/render.js
Vue.prototype._render = function () {
  const vm = this
  const { render, _parentVnode } = vm.$options

  if (_parentVnode) {
    vm.$scopedSlots = normalizeScopedSlots(
      vm.$parent,
      _parentVnode.data.scopedSlots,
      vm.$slots,
      vm.$scopedSlots
    )
  }

  vm.$vnode = _parentVnode
  let vnode
  try {
    currentRenderingInstance = vm
    vnode = render.call(vm._renderProxy, vm.$createElement)
  } catch (e) {
    handleError(e, vm, `render`)
    // 返回错误渲染结果，
    // 或者之前的 vnode 以防止渲染错误导致空白组件
    /* istanbul ignore else */
    if (process.env.NODE_ENV !== 'production' && vm.$options.renderError) {
      try {
        vnode = vm.$options.renderError.call(vm._renderProxy, vm.$createElement, e)
      } catch (e) {
        handleError(e, vm, `renderError`)
        vnode = vm._vnode
      }
    } else {
      vnode = vm._vnode
    }
  } finally {
    currentRenderingInstance = null
  }
  // ...
  return vnode
}
```

## Watcher 错误处理

在 Watcher 中，Vue 也使用错误处理机制来捕获依赖计算和更新过程中的错误：

```javascript
// src/core/observer/watcher.js
export default class Watcher {
  // ...
  
  get () {
    pushTarget(this)
    let value
    const vm = this.vm
    try {
      value = this.getter.call(vm, vm)
    } catch (e) {
      if (this.user) {
        handleError(e, vm, `getter for watcher "${this.expression}"`)
      } else {
        throw e
      }
    } finally {
      // "touch" every property so they are all tracked as
      // dependencies for deep watching
      if (this.deep) {
        traverse(value)
      }
      popTarget()
      this.cleanupDeps()
    }
    return value
  }

  run () {
    if (this.active) {
      const value = this.get()
      if (
        value !== this.value ||
        // Deep watchers and watchers on Object/Arrays should fire even
        // when the value is the same, because the value may
        // have mutated.
        isObject(value) ||
        this.deep
      ) {
        // set new value
        const oldValue = this.value
        this.value = value
        if (this.user) {
          try {
            this.cb.call(this.vm, this.value, oldValue)
          } catch (e) {
            handleError(e, this.vm, `callback for watcher "${this.expression}"`)
          }
        } else {
          this.cb.call(this.vm, value, oldValue)
        }
      }
    }
  }
}
```

## 异步错误处理

Vue2 对异步操作中的错误也有专门的处理机制：

```javascript
// 在 Promise 的 catch 中处理错误
if (res && !res._isVue && isPromise(res) && !res._handled) {
  res.catch(e => handleError(e, vm, info + ` (Promise/async)`))
  // 避免嵌套调用时多次触发 catch
  res._handled = true
}
```

## 全局错误处理器配置

Vue 允许开发者配置全局错误处理器：

```javascript
// src/core/config.js
const config = ({
  // ...
  errorHandler: null,
  // ...
}: Config)
```

当设置了全局错误处理器时，Vue 会优先使用它来处理错误：

```javascript
// 在 handleError 函数中
if (config.errorHandler) {
  try {
    return config.errorHandler.call(null, err, vm, info)
  } catch (e) {
    // 如果错误处理器本身抛出错误，则将这两个错误都打印出来
    if (e !== err) {
      logError(e, null, 'config.errorHandler')
    }
    logError(err, vm, info)
  }
}
```

## 错误处理最佳实践

Vue2 的错误处理机制遵循以下原则：

1. **分层处理**: 不同类型的错误在不同层级进行处理
2. **错误传播**: 错误会向上传播直到被处理
3. **错误隔离**: 防止一个组件的错误影响其他组件
4. **开发者友好**: 提供详细的错误信息和上下文

## 总结

Vue2 的错误处理机制是一个多层次、全方位的系统，它确保了即使在发生错误的情况下，应用程序也能保持稳定运行。通过全局错误处理器、安全的函数调用、渲染错误恢复等功能，Vue2 为开发者提供了强大而灵活的错误处理能力。

理解 Vue2 的错误处理机制有助于我们更好地处理应用程序中的异常情况，并编写更健壮的代码。