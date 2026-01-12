---
title: 响应式：监听
createTime: 2026/01/12 10:35:31
permalink: /frontend/vue3/reactivity-listen/
---

## computed()
接受一个 `getter` 函数，返回一个==只读的响应式 ref 对象==。该 ref 通过 `.value` 暴露 getter 函数的返回值。它也可以接受一个带有 `get` 和 `set` 函数的对象来创建一个可写的 ref 对象。

- 示例

创建一个**只读**的计算属性 ref：

``` javascript
const count = ref(1)
const plusOne = computed(() => count.value + 1)

console.log(plusOne.value) // 2

plusOne.value++ // 错误
```

创建一个**可写**的计算属性 ref：

``` javascript
const count = ref(1)
const plusOne = computed({
  get: () => count.value + 1,
  set: (val) => {
    count.value = val - 1
  }
})

plusOne.value = 1
console.log(count.value) // 0
```

调试：

``` javascript
const plusOne = computed(() => count.value + 1, {
  onTrack(e) {
    debugger
  },
  onTrigger(e) {
    debugger
  }
})
```

## watchEffect()
==立即运行==一个函数，同时响应式地追踪其依赖，并在依赖更改时重新执行。

- 详细信息

第一个参数就是要运行的**副作用函数**。这个副作用函数的参数也是一个函数，用来注册清理回调。清理回调会在该副作用下一次执行前被调用，可以用来清理无效的副作用，例如等待中的异步请求 (参见下面的示例)。

第二个参数是一个**可选的选项**，可以用来调整副作用的刷新时机或调试副作用的依赖。

默认情况下，侦听器将在组件渲染之前执行。设置 ==flush: 'post' 将会使侦听器延迟到组件渲染之后再执行==。详见回调的触发时机。在某些特殊情况下 (例如要使缓存失效)，可能有必要在响应式依赖发生改变时立即触发侦听器。这可以通过设置 flush: 'sync' 来实现。然而，该设置应谨慎使用，因为如果有多个属性同时更新，这将导致一些性能和数据一致性的问题。

返回值是一个用来停止该副作用的函数。

- 示例

``` javascript
const count = ref(0)

watchEffect(() => console.log(count.value))
// -> 输出 0

count.value++
// -> 输出 1
```

停止侦听器：

``` javascript
const stop = watchEffect(() => {})

// 当不再需要此侦听器时:
stop()
```

暂停/恢复侦听器：<Badge type="tip" text="3.5+"/>

``` javascript
const { stop, pause, resume } = watchEffect(() => {})

// 暂停侦听器
pause()

// 稍后恢复
resume()

// 停止
stop()
```

副作用清理：

``` javascript
watchEffect(async (onCleanup) => {
  const { response, cancel } = doAsyncWork(newId)
  // 如果 `id` 变化，则调用 `cancel`，
  // 如果之前的请求未完成，则取消该请求
  onCleanup(cancel)
  data.value = await response
})
```

3.5+ 中的副作用清理：

``` javascript
import { onWatcherCleanup } from 'vue'

watchEffect(async () => {
  const { response, cancel } = doAsyncWork(newId)
  // 如果 `id` 变化，则调用 `cancel`，
  // 如果之前的请求未完成，则取消该请求
  onWatcherCleanup(cancel)
  data.value = await response
})
```

选项：

``` javascript
watchEffect(() => {}, {
  flush: 'post',
  onTrack(e) {
    debugger
  },
  onTrigger(e) {
    debugger
  }
})
```

## watchPostEffect()
`watchEffect()` 使用 `flush: 'post'` 选项时的别名。

## watchSyncEffect()
`watchEffect()` 使用 `flush: 'sync'` 选项时的别名。

## watch()
侦听一个或多个响应式数据源，并在数据源变化时调用所给的回调函数。

- 详细信息

`watch()` 默认是懒侦听的，即仅在侦听源发生变化时才执行回调函数。

第一个参数是侦听器的**源**。这个来源可以是以下几种：

- 一个函数，返回一个值
- 一个 ref
- 一个响应式对象
- ...或是由以上类型的值组成的数组

第二个参数是在发生变化时要调用的回调函数。这个回调函数接受三个参数：==新值、旧值，以及一个用于注册副作用清理的回调函数==。该回调函数会在副作用下一次重新执行前调用，可以用来清除无效的副作用，例如等待中的异步请求。

当==侦听多个来源时，回调函数接受两个数组==，分别对应来源数组中的新值和旧值。

第三个可选的参数是一个对象，支持以下这些选项：

- `immediate`：在侦听器创建时立即触发回调。第一次调用时旧值是 `undefined`。
- `deep`：如果源是对象，强制深度遍历，以便在深层级变更时触发回调。在 3.5+ 中，此参数还可以是指示最大遍历深度的数字。
- `flush`：调整回调函数的刷新时机。参考回调的刷新时机及 watchEffect()。
- `onTrack / onTrigger`：调试侦听器的依赖。参考调试侦听器。
- `once`：(3.4+) 动停回调函数只会运行一次。侦听器将在回调函数首次运行后自止。

与 `watchEffect()` 相比，watch() 使我们可以：

- 懒执行副作用；
- 更加明确是应该由哪个状态触发侦听器重新执行；
- 可以访问所侦听状态的前一个值和当前值。

- 示例

侦听一个 getter 函数：

``` javascript
const state = reactive({ count: 0 })
watch(
  () => state.count,
  (count, prevCount) => {
    /* ... */
  }
)
```

侦听一个 ref：

``` javascript
const count = ref(0)
watch(count, (count, prevCount) => {
  /* ... */
})
```

当侦听多个来源时，回调函数接受两个数组，分别对应来源数组中的新值和旧值：

``` javascript
watch([fooRef, barRef], ([foo, bar], [prevFoo, prevBar]) => {
  /* ... */
})
```

当使用 getter 函数作为源时，回调只在此函数的返回值变化时才会触发。如果你想让回调在深层级变更时也能触发，你需要使用 `{ deep: true }` 强制侦听器进入深层级模式。在深层级模式时，如果==回调函数由于深层级的变更而被触发，那么**新值**和**旧值**将是同一个对象==。

``` javascript
const state = reactive({ count: 0 })
watch(
  () => state,
  (newValue, oldValue) => {
    // newValue === oldValue
  },
  { deep: true }
)
```

当**直接**侦听一个响应式对象时，侦听器会==自动启用深层模式==：

``` javascript
const state = reactive({ count: 0 })
watch(state, () => {
  /* 深层级变更状态所触发的回调 */
})
```

`watch()` 和 `watchEffect()` 享有相同的刷新时机和调试选项：

``` javascript
watch(source, callback, {
  flush: 'post',
  onTrack(e) {
    debugger
  },
  onTrigger(e) {
    debugger
  }
})
```

停止侦听器：

``` javascript
const stop = watch(source, callback)

// 当已不再需要该侦听器时：
stop()
```

暂停/恢复侦听器：<Badge type="tip" text="3.5+"/>

``` javascript
const { stop, pause, resume } = watch(() => {})

// 暂停侦听器
pause()

// 稍后恢复
resume()

// 停止
stop()
```

副作用清理：

``` javascript
watch(id, async (newId, oldId, onCleanup) => {
  const { response, cancel } = doAsyncWork(newId)
  // 当 `id` 变化时，`cancel` 将被调用，
  // 取消之前的未完成的请求
  onCleanup(cancel)
  data.value = await response
})
```

3.5+ 中的副作用清理：

``` javascript
import { onWatcherCleanup } from 'vue'

watch(id, async (newId) => {
  const { response, cancel } = doAsyncWork(newId)
  onWatcherCleanup(cancel)
  data.value = await response
})
```

## onWatcherCleanup() <Badge type="tip" text="3.5+"/>

注册一个清理函数，在当前侦听器即将重新运行时执行。只能在 `watchEffect` 作用函数或 `watch` 回调函数的同步执行期间调用 (即不能在异步函数的 `await` 语句之后调用)。

- 示例

``` javascript
import { watch, onWatcherCleanup } from 'vue'

watch(id, (newId) => {
  const { response, cancel } = doAsyncWork(newId)
  // 如果 `id` 变化，则调用 `cancel`，
  // 如果之前的请求未完成，则取消该请求
  onWatcherCleanup(cancel)
})
```

## effectScope()
创建一个 effect 作用域，可以捕获其中所创建的响应式副作用 (即计算属性和侦听器)，这样捕获到的副作用可以一起处理。

- 示例

``` javascript
const scope = effectScope()

scope.run(() => {
  const doubled = computed(() => counter.value * 2)

  watch(doubled, () => console.log(doubled.value))

  watchEffect(() => console.log('Count: ', doubled.value))
})

// 处理掉当前作用域内的所有 effect
scope.stop()
```

## getCurrentScope()
如果有的话，返回当前活跃的 effect 作用域。

- 类型

``` typescript
function getCurrentScope(): EffectScope | undefined
```

## onScopeDispose()
在当前活跃的 effect 作用域上注册一个处理回调函数。当相关的 effect 作用域停止时会调用这个回调函数。

这个方法可以作为可复用的组合式函数中 `onUnmounted` 的替代品，它并不与组件耦合，因为每一个 Vue 组件的 `setup()` 函数也是在一个 effect 作用域中调用的。

如果在没有活跃的 effect 作用域的情况下调用此函数，将会抛出警告。在 3.5+ 版本中，可以通过将第二个参数设为 true 来消除此警告。

- 类型

``` typescript
function onScopeDispose(fn: () => void, failSilently?: boolean): void
```