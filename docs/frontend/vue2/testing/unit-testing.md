---
title: 单元测试
createTime: 2026/02/10 15:05:00
permalink: /frontend/vue2/testing/unit-testing/
---

# 单元测试

单元测试是软件开发中的重要环节，它用于测试应用中最小可测试单元（通常是函数或组件）的行为。在 Vue.js 应用中，単元测试主要用于测试组件、工具函数和 Vuex 模块。

## 测试工具

### Vue Test Utils

Vue Test Utils 是 Vue.js 官方的测试工具库，用于测试 Vue 组件。

安装：

```bash
npm install --save-dev @vue/test-utils
```

### Jest

Jest 是一个流行的 JavaScript 测试框架，与 Vue Test Utils 配合使用。

安装：

```bash
npm install --save-dev jest
```

## 基础测试示例

### 测试简单组件

```vue
<!-- Button.vue -->
<template>
  <button class="btn" :class="btnType" @click="handleClick">
    <slot></slot>
  </button>
</template>

<script>
export default {
  name: 'Button',
  props: {
    type: {
      type: String,
      default: 'default',
      validator: (value) => ['default', 'primary', 'danger'].includes(value)
    }
  },
  computed: {
    btnType() {
      return `btn-${this.type}`
    }
  },
  methods: {
    handleClick(event) {
      this.$emit('click', event)
    }
  }
}
</script>
```

```javascript
// Button.test.js
import { mount } from '@vue/test-utils'
import Button from '@/components/Button.vue'

describe('Button', () => {
  test('renders correctly with default props', () => {
    const wrapper = mount(Button, {
      slots: {
        default: 'Click me'
      }
    })

    expect(wrapper.classes()).toContain('btn-default')
    expect(wrapper.text()).toBe('Click me')
  })

  test('applies correct class based on type prop', () => {
    const wrapper = mount(Button, {
      propsData: {
        type: 'primary'
      }
    })

    expect(wrapper.classes()).toContain('btn-primary')
  })

  test('emits click event when clicked', async () => {
    const wrapper = mount(Button)
    
    await wrapper.trigger('click')
    
    expect(wrapper.emitted('click')).toBeTruthy()
  })

  test('passes event object to click handler', async () => {
    const wrapper = mount(Button)
    
    await wrapper.trigger('click', { button: 0 })
    
    const emitted = wrapper.emitted('click')
    expect(emitted).toHaveLength(1)
    expect(emitted[0][0]).toHaveProperty('button', 0)
  })

  test('validates type prop', () => {
    const { validator } = Button.props.type
    expect(validator('primary')).toBe(true)
    expect(validator('invalid')).toBe(false)
  })
})
```

## 测试 Props

### 基础 Props 测试

```javascript
import { mount } from '@vue/test-utils'
import UserProfile from '@/components/UserProfile.vue'

describe('UserProfile', () => {
  test('displays user name', () => {
    const wrapper = mount(UserProfile, {
      propsData: {
        user: {
          name: 'John Doe',
          email: 'john@example.com'
        }
      }
    })

    expect(wrapper.text()).toContain('John Doe')
  })

  test('displays default message when user is not provided', () => {
    const wrapper = mount(UserProfile)
    
    expect(wrapper.text()).toContain('No user provided')
  })

  test('updates when props change', async () => {
    const wrapper = mount(UserProfile, {
      propsData: {
        user: { name: 'Old Name' }
      }
    })

    expect(wrapper.text()).toContain('Old Name')

    await wrapper.setProps({
      user: { name: 'New Name' }
    })

    expect(wrapper.text()).toContain('New Name')
  })
})
```

## 测试 Events

### 测试自定义事件

```javascript
import { mount } from '@vue/test-utils'
import SearchInput from '@/components/SearchInput.vue'

describe('SearchInput', () => {
  test('emits input event when text is entered', async () => {
    const wrapper = mount(SearchInput)
    const input = wrapper.find('input')

    await input.setValue('test')
    
    expect(wrapper.emitted('input')).toBeTruthy()
    expect(wrapper.emitted('input')[0]).toEqual(['test'])
  })

  test('emits search event when Enter is pressed', async () => {
    const wrapper = mount(SearchInput)
    const input = wrapper.find('input')

    await input.setValue('search term')
    await input.trigger('keydown.enter')

    const emitted = wrapper.emitted('search')
    expect(emitted).toBeTruthy()
    expect(emitted[0]).toEqual(['search term'])
  })
})
```

## 测试 Slots

### 默认 Slot

```javascript
import { mount } from '@vue/test-utils'
import Card from '@/components/Card.vue'

describe('Card', () => {
  test('renders default slot content', () => {
    const wrapper = mount(Card, {
      slots: {
        default: '<p>Card content</p>'
      }
    })

    expect(wrapper.contains('p')).toBe(true)
    expect(wrapper.text()).toContain('Card content')
  })
})
```

### 具名 Slot

```javascript
import { mount } from '@vue/test-utils'
import Layout from '@/components/Layout.vue'

describe('Layout', () => {
  test('renders named slots correctly', () => {
    const wrapper = mount(Layout, {
      slots: {
        header: '<h1>Header</h1>',
        main: '<p>Main content</p>',
        footer: '<footer>Footer</footer>'
      }
    })

    expect(wrapper.find('header').exists()).toBe(true)
    expect(wrapper.find('main').exists()).toBe(true)
    expect(wrapper.find('footer').exists()).toBe(true)
  })
})
```

## 测试 Vuex

### 测试组件中的 Vuex 集成

```javascript
// UserProfile.test.js
import { mount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import UserProfile from '@/components/UserProfile.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

describe('UserProfile with Vuex', () => {
  let store

  beforeEach(() => {
    store = new Vuex.Store({
      state: {
        user: {
          name: 'John Doe',
          email: 'john@example.com'
        }
      },
      getters: {
        isLoggedIn: state => !!state.user
      },
      mutations: {
        SET_USER(state, user) {
          state.user = user
        }
      },
      actions: {
        updateUser({ commit }, user) {
          commit('SET_USER', user)
        }
      }
    })
  })

  test('displays user from store', () => {
    const wrapper = mount(UserProfile, {
      store,
      localVue
    })

    expect(wrapper.text()).toContain('John Doe')
    expect(wrapper.text()).toContain('john@example.com')
  })

  test('dispatches action when button is clicked', async () => {
    const wrapper = mount(UserProfile, {
      store,
      localVue
    })

    const button = wrapper.find('button.update')
    await button.trigger('click')

    // 检查 action 是否被调用
    expect(store.state.user.name).toBe('Updated Name')
  })
})
```

## 测试 Vue Router

### 测试路由相关功能

```javascript
// Navigation.test.js
import { mount, createLocalVue } from '@vue/test-utils'
import VueRouter from 'vue-router'
import Navigation from '@/components/Navigation.vue'

const localVue = createLocalVue()
localVue.use(VueRouter)

describe('Navigation', () => {
  let router

  beforeEach(() => {
    router = new VueRouter({
      routes: [
        { path: '/', name: 'home' },
        { path: '/about', name: 'about' },
        { path: '/contact', name: 'contact' }
      ]
    })
  })

  test('renders navigation links', () => {
    const wrapper = mount(Navigation, {
      router,
      localVue
    })

    expect(wrapper.findAll('router-link-stub').length).toBe(3)
  })

  test('highlights current route', async () => {
    const wrapper = mount(Navigation, {
      router,
      localVue
    })

    router.push('/about')
    await wrapper.vm.$nextTick()

    const activeLink = wrapper.find('.router-link-exact-active')
    expect(activeLink.text()).toBe('About')
  })
})
```

## Mocking 依赖

### Mock API 调用

```javascript
// UserList.test.js
import { mount, createLocalVue } from '@vue/test-utils'
import axios from 'axios'
import UserList from '@/components/UserList.vue'

// Mock axios
jest.mock('axios')

const localVue = createLocalVue()

describe('UserList', () => {
  test('fetches and displays users', async () => {
    const mockUsers = [
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' }
    ]

    axios.get.mockResolvedValue({ data: mockUsers })

    const wrapper = mount(UserList, {
      localVue
    })

    // 等待异步操作完成
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    expect(wrapper.findAll('.user-item')).toHaveLength(2)
    expect(wrapper.text()).toContain('John')
    expect(wrapper.text()).toContain('Jane')
  })

  test('shows error message when API fails', async () => {
    axios.get.mockRejectedValue(new Error('API Error'))

    const wrapper = mount(UserList, {
      localVue
    })

    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Error loading users')
  })
})
```

## 测试 Mixins

### 测试混入的功能

```javascript
// component-with-mixin.test.js
import { mount } from '@vue/test-utils'
import MyMixin from '@/mixins/my-mixin'
import ComponentWithMixin from '@/components/ComponentWithMixin.vue'

describe('ComponentWithMixin', () => {
  test('uses mixin properties', () => {
    const wrapper = mount(ComponentWithMixin)

    // 测试混入的计算属性
    expect(wrapper.vm.mixinComputed).toBe('computed from mixin')

    // 测试混入的方法
    wrapper.vm.mixinMethod()
    expect(wrapper.emitted('mixin-event')).toBeTruthy()
  })
})
```

## 高级测试技巧

### 测试异步组件

```javascript
// AsyncComponent.test.js
import { mount } from '@vue/test-utils'
import AsyncComponent from '@/components/AsyncComponent.vue'

describe('AsyncComponent', () => {
  test('loads and renders async component', async () => {
    const wrapper = mount(AsyncComponent)

    // 等待异步组件加载
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.async-content').exists()).toBe(true)
  })
})
```

### 测试组件生命周期

```javascript
// LifecycleComponent.test.js
import { mount } from '@vue/test-utils'
import LifecycleComponent from '@/components/LifecycleComponent.vue'

describe('LifecycleComponent', () => {
  test('calls created hook', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation()

    mount(LifecycleComponent)

    expect(spy).toHaveBeenCalledWith('Component created')
    
    spy.mockRestore()
  })

  test('cleans up on destroy', () => {
    const wrapper = mount(LifecycleComponent)
    const cleanupSpy = jest.spyOn(wrapper.vm, 'cleanup')

    wrapper.destroy()

    expect(cleanupSpy).toHaveBeenCalled()
  })
})
```

## 测试最佳实践

### 1. 测试命名约定

```javascript
// Good test names
test('displays user name when user is provided', () => { ... })
test('shows error message when API call fails', () => { ... })
test('emits event when button is clicked', () => { ... })
```

### 2. 测试组织结构

```javascript
describe('UserProfile', () => {
  describe('when user is authenticated', () => {
    test('displays user information', () => { ... })
    test('shows edit button', () => { ... })
  })

  describe('when user is not authenticated', () => {
    test('shows login prompt', () => { ... })
    test('hides edit button', () => { ... })
  })
})
```

### 3. 使用测试工具函数

```javascript
// test-utils.js
import { mount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import VueRouter from 'vue-router'

export const createComponent = (component, options = {}) => {
  const localVue = createLocalVue()
  localVue.use(Vuex)
  localVue.use(VueRouter)

  const store = new Vuex.Store(options.store || {})
  const router = new VueRouter(options.router || {})

  return mount(component, {
    localVue,
    store,
    router,
    ...options
  })
}

// 在测试中使用
test('component works correctly', () => {
  const wrapper = createComponent(MyComponent, {
    propsData: { value: 'test' }
  })

  expect(wrapper.exists()).toBe(true)
})
```

## 覆盖率配置

在 `package.json` 中配置测试覆盖率：

```json
{
  "jest": {
    "collectCoverageFrom": [
      "src/**/*.{js,vue}",
      "!src/main.js",
      "!src/registerServiceWorker.js"
    ],
    "coverageReporters": ["html", "text-summary"]
  }
}
```

単元测试是确保 Vue.js 应用质量的重要手段，通过编写全面的测试，可以提高代码的可靠性和可维护性。