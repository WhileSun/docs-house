---
title: 传送门 (Portal)
createTime: 2026/02/10 15:10:00
permalink: /frontend/vue2/advanced/teleport/
---

# 传送门 (Portal)

在 Vue 2 中，虽然没有像 Vue 3 中的 `<teleport>` 组件，但我们可以通过 Portal 相关的第三方库或自定义实现来达到类似的效果。Portal 允许我们将组件的内容渲染到 DOM 树的任何位置，而不是组件的当前位置。

## 什么是 Portal

Portal（传送门）是一种设计模式，它允许我们将组件的内容渲染到 DOM 树的任何位置，而不是组件的当前位置。这在实现模态框、弹窗、工具提示等需要脱离当前 DOM 结构的组件时非常有用。

## 使用 vue-portal

### 安装

```bash
npm install vue-portal
```

### 基础用法

```vue
<template>
  <div>
    <h1>主页面内容</h1>
    
    <!-- 使用 portal 将内容传送到 body -->
    <portal to="modal">
      <div class="modal">
        <h2>模态框内容</h2>
        <button @click="isOpen = false">关闭</button>
      </div>
    </portal>
    
    <!-- Portal target -->
    <div id="modal"></div>
  </div>
</template>

<script>
import { Portal } from 'vue-portal'

export default {
  components: {
    Portal
  },
  data() {
    return {
      isOpen: true
    }
  }
}
</script>
```

### 带条件的 Portal

```vue
<template>
  <div>
    <button @click="showModal = true">打开模态框</button>
    
    <portal to="modal" :disabled="!showModal">
      <div class="modal">
        <h2>模态框</h2>
        <button @click="showModal = false">关闭</button>
      </div>
    </portal>
    
    <div id="modal"></div>
  </div>
</template>

<script>
import { Portal } from 'vue-portal'

export default {
  components: {
    Portal
  },
  data() {
    return {
      showModal: false
    }
  }
}
</script>
```

## 自定义 Portal 实现

如果我们不想使用第三方库，可以创建一个简单的 Portal 组件：

```vue
<!-- Portal.vue -->
<template>
  <div v-if="false"></div> <!-- Portal 不会渲染任何内容 -->
</template>

<script>
export default {
  name: 'Portal',
  props: {
    to: {
      type: String,
      required: true
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  mounted() {
    this.destination = document.querySelector(this.to)
    if (!this.destination) {
      console.error(`Destination ${this.to} not found`)
      return
    }
    this.renderContent()
  },
  updated() {
    if (!this.disabled) {
      this.updateContent()
    }
  },
  beforeDestroy() {
    if (this.destination && this.clone) {
      this.destination.removeChild(this.clone)
    }
  },
  methods: {
    renderContent() {
      if (this.disabled) return
      
      // 克隆插槽内容
      this.clone = this.$slots.default[0].elm.cloneNode(true)
      this.destination.appendChild(this.clone)
    },
    updateContent() {
      if (this.clone) {
        this.destination.removeChild(this.clone)
      }
      this.renderContent()
    }
  }
}
</script>
```

更完善的 Portal 实现：

```vue
<!-- Portal.vue -->
<template>
  <div style="display: none;">
    <slot v-if="false" />
  </div>
</template>

<script>
export default {
  name: 'Portal',
  props: {
    to: {
      type: String,
      required: true
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      wrapper: null
    }
  },
  mounted() {
    this.createWrapper()
    this.renderContent()
  },
  updated() {
    this.updateContent()
  },
  beforeDestroy() {
    this.removeContent()
    this.destroyWrapper()
  },
  methods: {
    createWrapper() {
      if (this.disabled) return
      
      this.wrapper = document.createElement('div')
      this.wrapper.setAttribute('data-portal-wrapper', '')
      
      const destination = document.querySelector(this.to)
      if (destination) {
        destination.appendChild(this.wrapper)
      } else {
        console.error(`Destination element "${this.to}" not found`)
      }
    },
    renderContent() {
      if (this.disabled || !this.wrapper) return
      
      // 清空内容
      this.wrapper.innerHTML = ''
      
      // 渲染插槽内容
      if (this.$slots.default) {
        this.$slots.default.forEach(vnode => {
          if (vnode.elm) {
            this.wrapper.appendChild(vnode.elm)
          }
        })
      }
    },
    updateContent() {
      if (this.disabled) {
        this.removeContent()
      } else {
        this.renderContent()
      }
    },
    removeContent() {
      if (this.wrapper) {
        this.wrapper.innerHTML = ''
      }
    },
    destroyWrapper() {
      if (this.wrapper && this.wrapper.parentNode) {
        this.wrapper.parentNode.removeChild(this.wrapper)
      }
    }
  }
}
</script>
```

## 实际应用示例

### 模态框组件

```vue
<!-- Modal.vue -->
<template>
  <portal :to="portalTarget" :disabled="!usePortal">
    <div class="modal-overlay" @click="handleOverlayClick">
      <div class="modal-content" @click.stop>
        <header class="modal-header">
          <slot name="header">
            <h2>{{ title }}</h2>
          </slot>
          <button class="close-btn" @click="close">×</button>
        </header>
        <div class="modal-body">
          <slot></slot>
        </div>
        <footer class="modal-footer">
          <slot name="footer">
            <button @click="close">关闭</button>
          </slot>
        </footer>
      </div>
    </div>
  </portal>
</template>

<script>
import { Portal } from 'vue-portal'

export default {
  name: 'Modal',
  components: {
    Portal
  },
  props: {
    title: {
      type: String,
      default: 'Modal'
    },
    visible: {
      type: Boolean,
      default: false
    },
    usePortal: {
      type: Boolean,
      default: true
    },
    portalTarget: {
      type: String,
      default: 'body'
    }
  },
  watch: {
    visible(isVisible) {
      if (isVisible) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    }
  },
  methods: {
    close() {
      this.$emit('update:visible', false)
      this.$emit('close')
    },
    handleOverlayClick() {
      if (this.closeOnClickOverlay) {
        this.close()
      }
    }
  }
}
</script>

<style>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 90vw;
  max-height: 90vh;
  overflow: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.modal-body {
  padding: 1rem;
}

.modal-footer {
  padding: 1rem;
  border-top: 1px solid #eee;
  text-align: right;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}
</style>
```

### 工具提示组件

```vue
<!-- Tooltip.vue -->
<template>
  <span class="tooltip-wrapper" @mouseenter="show" @mouseleave="hide">
    <slot />
    
    <portal to="body" v-if="isVisible">
      <div 
        class="tooltip"
        :style="tooltipStyle"
        @mouseenter="onTooltipHover"
        @mouseleave="onTooltipLeave"
      >
        <slot name="content">{{ content }}</slot>
        <div class="tooltip-arrow" :class="placement"></div>
      </div>
    </portal>
  </span>
</template>

<script>
import { Portal } from 'vue-portal'

export default {
  name: 'Tooltip',
  components: {
    Portal
  },
  props: {
    content: {
      type: String,
      default: ''
    },
    placement: {
      type: String,
      default: 'top',
      validator: value => ['top', 'right', 'bottom', 'left'].includes(value)
    },
    delay: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      isVisible: false,
      tooltipStyle: {},
      hoverTimeout: null
    }
  },
  methods: {
    show() {
      if (this.delay) {
        this.hoverTimeout = setTimeout(() => {
          this.calculatePosition()
          this.isVisible = true
        }, this.delay)
      } else {
        this.calculatePosition()
        this.isVisible = true
      }
    },
    hide() {
      if (this.hoverTimeout) {
        clearTimeout(this.hoverTimeout)
        this.hoverTimeout = null
      }
      this.isVisible = false
    },
    onTooltipHover() {
      // 防止工具提示消失
    },
    onTooltipLeave() {
      this.hide()
    },
    calculatePosition() {
      // 计算工具提示的位置
      const rect = this.$el.getBoundingClientRect()
      const tooltipWidth = 200
      const tooltipHeight = 50
      
      let top, left
      
      switch (this.placement) {
        case 'top':
          top = rect.top - tooltipHeight - 10
          left = rect.left + rect.width / 2 - tooltipWidth / 2
          break
        case 'bottom':
          top = rect.bottom + 10
          left = rect.left + rect.width / 2 - tooltipWidth / 2
          break
        case 'left':
          top = rect.top + rect.height / 2 - tooltipHeight / 2
          left = rect.left - tooltipWidth - 10
          break
        case 'right':
          top = rect.top + rect.height / 2 - tooltipHeight / 2
          left = rect.right + 10
          break
      }
      
      this.tooltipStyle = {
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        zIndex: 9999
      }
    }
  }
}
</script>

<style>
.tooltip {
  background: #333;
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
  white-space: nowrap;
  max-width: 200px;
  word-wrap: break-word;
}

.tooltip-arrow {
  position: absolute;
  width: 0;
  height: 0;
  border: 5px solid transparent;
}

.tooltip-arrow.top {
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-top-color: #333;
}

.tooltip-arrow.bottom {
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-bottom-color: #333;
}

.tooltip-arrow.left {
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  border-left-color: #333;
}

.tooltip-arrow.right {
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  border-right-color: #333;
}
</style>
```

## Portal 的优势

1. **样式隔离**：传送的内容不受父组件样式的影响
2. **层级控制**：可以轻松控制元素的 z-index
3. **DOM 结构**：可以将内容放置在 DOM 树的任何位置
4. **事件冒泡**：正确处理事件冒泡

## 注意事项

1. **性能考虑**：频繁的 DOM 操作可能影响性能
2. **事件处理**：注意事件委托和冒泡
3. **内存泄漏**：确保在组件销毁时清理 Portal 内容
4. **SSR 支持**：在服务端渲染时需要特殊处理

Portal 模式在 Vue 2 中虽然没有原生支持，但通过第三方库或自定义实现，我们可以实现类似的功能，这对于构建复杂的 UI 组件非常有用。