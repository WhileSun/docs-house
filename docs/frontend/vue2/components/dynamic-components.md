---
title: 动态组件
createTime: 2026/02/10 14:50:00
permalink: /frontend/vue2/components/dynamic-components/
---

# 动态组件

在 Vue.js 中，我们可以使用 `<component>` 元素加一个特殊的 `is` 特性来实现动态组件。

## 基础用法

```html
<!-- 动态组件 -->
<component :is="currentView"></component>
```

```javascript
const Home = { /* ... */ }
const Posts = { /* ... */ }
const Archive = { /* ... */ }

new Vue({
  el: '#app',
  data: {
    currentView: 'home'
  },
  components: {
    'home': Home,
    'posts': Posts,
    'archive': Archive
  }
})
```

或者直接绑定到组件选项：

```javascript
const Home = { /* ... */ }
const Posts = { /* ... */ }
const Archive = { /* ... */ }

new Vue({
  el: '#app',
  data: {
    currentView: Home
  }
})
```

## keep-alive 与动态组件

当在动态组件之间切换时，你可能想保持这些组件的状态以避免反复重渲染。为了解决这个问题，我们可以用一个 `<keep-alive>` 元素将其动态组件包裹起来：

```html
<!-- 失态组件在第一次被创建时，实例会被缓存起来 -->
<keep-alive>
  <component :is="currentView">
    <!-- 非活动组件将被缓存！ -->
  </component>
</keep-alive>
```

这会将切换出去的组件保留在内存中，防止多次渲染。

### keep-alive 的属性

`<keep-alive>` 接受两个属性：

- `include` - 字符串或正则表达式，只有匹配的组件会被缓存
- `exclude` - 字符串或正则表达式，任何匹配的组件都不会被缓存

```html
<!-- 逗号分隔字符串 -->
<keep-alive include="a,b">
  <component :is="view"></component>
</keep-alive>

<!-- 正则表达式 (使用 v-bind) -->
<keep-alive :include="/a|b/">
  <component :is="view"></component>
</keep-alive>

<!-- 数组 (使用 v-bind) -->
<keep-alive :include="['a', 'b']">
  <component :is="view"></component>
</keep-alive>
```

匹配首先检查组件自身的 `name` 选项，如果 `name` 选项不可用，则匹配它的局部注册名称（父组件 `components` 选项的键值）。匿名组件不能被匹配。

## 实际应用示例

### 选项卡组件

```vue
<template>
  <div class="tabs">
    <div class="tab-nav">
      <button
        v-for="tab in tabs"
        :key="tab.name"
        :class="{ active: currentTab === tab.name }"
        @click="currentTab = tab.name"
      >
        {{ tab.label }}
      </button>
    </div>
    
    <div class="tab-content">
      <keep-alive>
        <component :is="currentTabComponent" :key="currentTab"></component>
      </keep-alive>
    </div>
  </div>
</template>

<script>
import UserList from './UserList.vue'
import UserStats from './UserStats.vue'
import UserSettings from './UserSettings.vue'

export default {
  name: 'TabContainer',
  components: {
    UserList,
    UserStats,
    UserSettings
  },
  data() {
    return {
      currentTab: 'user-list',
      tabs: [
        { name: 'user-list', label: '用户列表', component: UserList },
        { name: 'user-stats', label: '统计数据', component: UserStats },
        { name: 'user-settings', label: '设置', component: UserSettings }
      ]
    }
  },
  computed: {
    currentTabComponent() {
      return this.tabs.find(tab => tab.name === this.currentTab)?.component || null
    }
  }
}
</script>
```

### 表单向导

```vue
<template>
  <div class="wizard">
    <div class="wizard-steps">
      <div
        v-for="(step, index) in steps"
        :key="index"
        :class="{ active: currentStep === index, completed: index < currentStep }"
      >
        {{ step.title }}
      </div>
    </div>
    
    <div class="wizard-content">
      <keep-alive>
        <component
          :is="currentStepComponent"
          :formData="formData"
          @update="updateFormData"
          @next="nextStep"
          @prev="prevStep"
        ></component>
      </keep-alive>
    </div>
    
    <div class="wizard-controls">
      <button @click="prevStep" :disabled="currentStep === 0">上一步</button>
      <button @click="nextStep" :disabled="currentStep === steps.length - 1">下一步</button>
    </div>
  </div>
</template>

<script>
import PersonalInfo from './steps/PersonalInfo.vue'
import ContactInfo from './steps/ContactInfo.vue'
import Confirmation from './steps/Confirmation.vue'

export default {
  name: 'FormWizard',
  components: {
    PersonalInfo,
    ContactInfo,
    Confirmation
  },
  data() {
    return {
      currentStep: 0,
      formData: {},
      steps: [
        { title: '个人信息', component: 'personal-info' },
        { title: '联系方式', component: 'contact-info' },
        { title: '确认信息', component: 'confirmation' }
      ]
    }
  },
  computed: {
    currentStepComponent() {
      return this.steps[this.currentStep]?.component
    }
  },
  methods: {
    nextStep() {
      if (this.currentStep < this.steps.length - 1) {
        this.currentStep++
      }
    },
    prevStep() {
      if (this.currentStep > 0) {
        this.currentStep--
      }
    },
    updateFormData(data) {
      this.formData = { ...this.formData, ...data }
    }
  }
}
</script>
```

### 模态框内容

```vue
<template>
  <div>
    <button @click="openModal('login')">登录</button>
    <button @click="openModal('register')">注册</button>
    <button @click="openModal('forgot-password')">忘记密码</button>
    
    <div v-if="modalOpen" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <keep-alive>
          <component :is="currentModalComponent" @close="closeModal"></component>
        </keep-alive>
      </div>
    </div>
  </div>
</template>

<script>
import LoginModal from './modals/LoginModal.vue'
import RegisterModal from './modals/RegisterModal.vue'
import ForgotPasswordModal from './modals/ForgotPasswordModal.vue'

export default {
  name: 'ModalManager',
  components: {
    LoginModal,
    RegisterModal,
    ForgotPasswordModal
  },
  data() {
    return {
      modalOpen: false,
      currentModal: null
    }
  },
  computed: {
    currentModalComponent() {
      return this.currentModal
    }
  },
  methods: {
    openModal(modalType) {
      this.currentModal = modalType
      this.modalOpen = true
    },
    closeModal() {
      this.modalOpen = false
      this.currentModal = null
    }
  }
}
</script>
```

## 高级用法

### 条件动态组件

```vue
<template>
  <div>
    <component
      v-if="componentType === 'form'"
      :is="currentFormComponent"
      :data="formData"
    ></component>
    
    <component
      v-else-if="componentType === 'display'"
      :is="currentDisplayComponent"
      :data="displayData"
    ></component>
    
    <component
      v-else
      :is="fallbackComponent"
    ></component>
  </div>
</template>
```

### 带参数的动态组件

```vue
<template>
  <component
    :is="dynamicComponent"
    :prop1="value1"
    :prop2="value2"
    @event1="handleEvent1"
    @event2="handleEvent2"
  ></component>
</template>
```

## 注意事项

### 1. 组件名称与组件选项

当动态组件绑定到组件选项时，确保组件已正确注册：

```javascript
// 正确的方式
export default {
  components: {
    MyComponent: MyComponent
  },
  data() {
    return {
      currentView: 'my-component' // 使用注册的名称
    }
  }
}

// 或者
export default {
  data() {
    return {
      currentView: MyComponent // 直接使用组件构造器
    }
  }
}
```

### 2. key 的使用

在某些情况下，你可能需要使用 `key` 来强制重新渲染组件：

```html
<component :is="currentView" :key="componentKey"></component>
```

### 3. 生命周期钩子

当使用 `<keep-alive>` 时，组件会被缓存，因此会触发额外的生命周期钩子：

- `activated` - 被 keep-alive 缓存的组件激活时调用
- `deactivated` - 被 keep-alive 缓存的组件停用时调用

动态组件是 Vue.js 中非常强大的功能，通过合理使用动态组件，可以创建灵活、可复用的界面组件。