---
title: 测试最佳实践
createTime: 2026/02/10 15:40:00
permalink: /frontend/vue2/testing/testing-best-practices/
---

# 测试最佳实践

在 Vue.js 应用开发中，测试是确保代码质量和功能正确性的关键环节。本章将介绍 Vue.js 应用测试的最佳实践。

## 测试策略

### 测试金字塔

```
    [E2E 测试]    - 少量，高价值，高成本
       |
    [集成测试]    - 中等数量
       |
    [単元测试]    - 大量，快速，低成本
```

### 测试类型

1. **単元测试**: 测试单个函数、组件或模块
2. **集成测试**: 测试多个组件或模块之间的交互
3. **端到端测试**: 测试整个应用的工作流程

## 単元测试最佳实践

### 1. 测试命名约定

```javascript
// 好的测试命名
test('displays user name when user is provided', () => { ... })
test('shows error message when API call fails', () => { ... })
test('emits event when button is clicked', () => { ... })

// 不好的测试命名
test('test 1', () => { ... })
test('it works', () => { ... })
```

### 2. AAA 模式 (Arrange, Act, Assert)

```javascript
test('adds item to cart', () => {
  // Arrange - 设置测试环境
  const wrapper = mount(ShoppingCart)
  const item = { id: 1, name: 'Product', price: 100 }
  
  // Act - 执行操作
  wrapper.vm.addItem(item)
  
  // Assert - 验证结果
  expect(wrapper.vm.cartItems).toContainEqual(item)
  expect(wrapper.vm.totalPrice).toBe(100)
})
```

### 3. 组件测试结构

```javascript
import { mount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import Cart from '@/components/Cart.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

describe('Cart', () => {
  let wrapper
  let store
  
  beforeEach(() => {
    store = new Vuex.Store({
      state: {
        cart: {
          items: [],
          total: 0
        }
      }
    })
    
    wrapper = mount(Cart, {
      store,
      localVue
    })
  })
  
  afterEach(() => {
    wrapper.destroy()
  })
  
  test('displays empty cart message when no items', () => {
    expect(wrapper.text()).toContain('购物车为空')
  })
  
  test('displays items when cart has items', async () => {
    store.state.cart.items = [{ id: 1, name: 'Product', price: 100 }]
    await wrapper.vm.$nextTick()
    
    expect(wrapper.find('.cart-item').exists()).toBe(true)
  })
})
```

## 组件测试最佳实践

### 1. Props 测试

```javascript
import { mount } from '@vue/test-utils'
import UserProfile from '@/components/UserProfile.vue'

describe('UserProfile', () => {
  test('displays user name', () => {
    const wrapper = mount(UserProfile, {
      propsData: {
        user: { name: 'John Doe', email: 'john@example.com' }
      }
    })
    
    expect(wrapper.text()).toContain('John Doe')
  })
  
  test('handles missing user gracefully', () => {
    const wrapper = mount(UserProfile)
    
    expect(wrapper.text()).toContain('No user provided')
  })
  
  test('updates when props change', async () => {
    const wrapper = mount(UserProfile, {
      propsData: { user: { name: 'Old Name' } }
    })
    
    expect(wrapper.text()).toContain('Old Name')
    
    await wrapper.setProps({ user: { name: 'New Name' } })
    
    expect(wrapper.text()).toContain('New Name')
  })
})
```

### 2. Events 测试

```javascript
import { mount } from '@vue/test-utils'
import Button from '@/components/Button.vue'

describe('Button', () => {
  test('emits click event', async () => {
    const wrapper = mount(Button)
    
    await wrapper.trigger('click')
    
    expect(wrapper.emitted('click')).toBeTruthy()
    expect(wrapper.emitted('click')).toHaveLength(1)
  })
  
  test('emits event with payload', async () => {
    const wrapper = mount(Button)
    const testData = { id: 1, name: 'test' }
    
    wrapper.vm.$emit('custom-event', testData)
    
    const emitted = wrapper.emitted('custom-event')
    expect(emitted).toBeTruthy()
    expect(emitted[0]).toEqual([testData])
  })
})
```

### 3. Slots 测试

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
  
  test('renders named slots', () => {
    const wrapper = mount(Card, {
      slots: {
        header: '<h1>Header</h1>',
        footer: '<footer>Footer</footer>'
      }
    })
    
    expect(wrapper.find('h1').exists()).toBe(true)
    expect(wrapper.find('footer').exists()).toBe(true)
  })
})
```

## Vuex 测试

### 1. Store 测试

```javascript
import { createStore } from 'vuex'
import { userModule } from '@/store/modules/user'

describe('User Store', () => {
  let store
  
  beforeEach(() => {
    store = createStore({
      modules: {
        user: userModule
      }
    })
  })
  
  test('sets user on login', async () => {
    const user = { id: 1, name: 'John' }
    
    await store.dispatch('user/login', user)
    
    expect(store.getters['user/isLoggedIn']).toBe(true)
    expect(store.state.user.profile).toEqual(user)
  })
  
  test('clears user on logout', async () => {
    const user = { id: 1, name: 'John' }
    await store.dispatch('user/login', user)
    
    await store.dispatch('user/logout')
    
    expect(store.getters['user/isLoggedIn']).toBe(false)
    expect(store.state.user.profile).toBeNull()
  })
})
```

### 2. 组件中 Vuex 测试

```javascript
import { mount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import UserProfile from '@/components/UserProfile.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

describe('UserProfile with Vuex', () => {
  let store
  let actions
  let state
  
  beforeEach(() => {
    actions = {
      'user/updateProfile': jest.fn()
    }
    state = {
      user: { profile: { name: 'John', email: 'john@example.com' } }
    }
    
    store = new Vuex.Store({
      state,
      actions
    })
  })
  
  test('dispatches updateProfile action when form is submitted', async () => {
    const wrapper = mount(UserProfile, {
      store,
      localVue
    })
    
    const newName = 'Jane'
    wrapper.find('input[name="name"]').setValue(newName)
    await wrapper.find('form').trigger('submit')
    
    expect(actions['user/updateProfile']).toHaveBeenCalledWith(
      expect.any(Object),
      { name: newName, email: 'john@example.com' },
      expect.any(Object)
    )
  })
})
```

## Vue Router 测试

### 1. 路由组件测试

```javascript
import { mount, createLocalVue } from '@vue/test-utils'
import VueRouter from 'vue-router'
import UserProfile from '@/components/UserProfile.vue'

const localVue = createLocalVue()
localVue.use(VueRouter)

describe('UserProfile with Router', () => {
  let router
  let wrapper
  
  beforeEach(() => {
    router = new VueRouter({
      routes: [
        { path: '/user/:id', name: 'UserProfile', component: UserProfile }
      ]
    })
    
    router.push('/user/123')
    
    wrapper = mount(UserProfile, {
      localVue,
      router
    })
  })
  
  test('displays user ID from route params', () => {
    expect(wrapper.vm.$route.params.id).toBe('123')
  })
  
  test('navigates to user settings', async () => {
    const routerPushSpy = jest.spyOn(wrapper.vm.$router, 'push')
    
    await wrapper.find('.settings-link').trigger('click')
    
    expect(routerPushSpy).toHaveBeenCalledWith('/user/123/settings')
  })
})
```

## Mocking 和 Stubbing

### 1. API 调用 Mock

```javascript
import { mount } from '@vue/test-utils'
import axios from 'axios'
import UserList from '@/components/UserList.vue'

// Mock axios
jest.mock('axios')

describe('UserList', () => {
  test('fetches and displays users', async () => {
    const mockUsers = [
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' }
    ]
    
    axios.get.mockResolvedValue({ data: mockUsers })
    
    const wrapper = mount(UserList)
    
    // 等待异步操作完成
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    
    expect(wrapper.findAll('.user-item')).toHaveLength(2)
    expect(wrapper.text()).toContain('John')
    expect(wrapper.text()).toContain('Jane')
  })
  
  test('shows error message when API fails', async () => {
    axios.get.mockRejectedValue(new Error('API Error'))
    
    const wrapper = mount(UserList)
    
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    
    expect(wrapper.text()).toContain('Error loading users')
  })
})
```

### 2. 全局属性 Mock

```javascript
import { mount } from '@vue/test-utils'
import MyComponent from '@/components/MyComponent.vue'

describe('MyComponent', () => {
  test('uses global property', () => {
    const $http = {
      get: jest.fn().mockResolvedValue({ data: 'response' })
    }
    
    const wrapper = mount(MyComponent, {
      mocks: {
        $http
      }
    })
    
    wrapper.vm.fetchData()
    
    expect($http.get).toHaveBeenCalledWith('/api/data')
  })
})
```

## 测试工具函数

### 1. 测试辅助函数

```javascript
// test-utils.js
import { mount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import VueRouter from 'vue-router'

export const createComponent = (component, options = {}) => {
  const localVue = createLocalVue()
  localVue.use(Vuex)
  localVue.use(VueRouter)
  
  const store = new Vuex.Store(options.store || { state: {} })
  const router = new VueRouter(options.router || { routes: [] })
  
  return mount(component, {
    localVue,
    store,
    router,
    ...options
  })
}

// 在测试中使用
test('component works correctly', async () => {
  const wrapper = createComponent(MyComponent, {
    propsData: { value: 'test' },
    store: {
      state: { user: { name: 'John' } }
    }
  })
  
  expect(wrapper.exists()).toBe(true)
})
```

### 2. 工厂函数

```javascript
// factories/user-factory.js
export const createUser = (overrides = {}) => ({
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  ...overrides
})

// 在测试中使用
test('displays user information', () => {
  const user = createUser({ name: 'Jane Doe' })
  const wrapper = mount(UserProfile, {
    propsData: { user }
  })
  
  expect(wrapper.text()).toContain('Jane Doe')
})
```

## 测试覆盖率

### 1. 配置覆盖率

```javascript
// jest.config.js
module.exports = {
  collectCoverageFrom: [
    'src/**/*.{js,vue}',
    '!src/main.js',
    '!src/registerServiceWorker.js',
    '!src/**/*.stories.js', // Storybook 文件
    '!**/node_modules/**'
  ],
  coverageDirectory: '<rootDir>/coverage',
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
}
```

### 2. 覆盖率报告

```bash
# 生成覆盖率报告
npm run test:unit -- --coverage

# 查看详细报告
open coverage/lcov-report/index.html
```

## E2E 测试最佳实践

### 1. 使用 Cypress

```javascript
// cypress/integration/user-profile.spec.js
describe('User Profile Page', () => {
  beforeEach(() => {
    cy.visit('/profile')
  })
  
  it('allows user to update profile', () => {
    // 模拟 API 调用
    cy.server()
    cy.route('PUT', '/api/profile', { success: true }).as('updateProfile')
    
    // 交互
    cy.get('[data-testid="name-input"]').type('New Name')
    cy.get('[data-testid="save-button"]').click()
    
    // 验证
    cy.wait('@updateProfile')
    cy.get('[data-testid="success-message"]').should('be.visible')
  })
})
```

### 2. 页面对象模式

```javascript
// cypress/support/pages/UserProfilePage.js
class UserProfilePage {
  constructor() {
    this.nameInput = '[data-testid="name-input"]'
    this.emailInput = '[data-testid="email-input"]'
    this.saveButton = '[data-testid="save-button"]'
    this.successMessage = '[data-testid="success-message"]'
  }
  
  visit() {
    cy.visit('/profile')
    return this
  }
  
  fillName(name) {
    cy.get(this.nameInput).type(name)
    return this
  }
  
  fillEmail(email) {
    cy.get(this.emailInput).type(email)
    return this
  }
  
  save() {
    cy.get(this.saveButton).click()
    return this
  }
  
  assertSuccessMessageVisible() {
    cy.get(this.successMessage).should('be.visible')
    return this
  }
}

// 在测试中使用
it('updates user profile', () => {
  new UserProfilePage()
    .visit()
    .fillName('John Doe')
    .fillEmail('john@example.com')
    .save()
    .assertSuccessMessageVisible()
})
```

## CI/CD 集成

### 1. GitHub Actions 配置

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [14.x, 16.x]
    
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: ${{ matrix.node-version }}
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:unit -- --coverage
      
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          CYPRESS_baseUrl: http://localhost:3000
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v1
```

### 2. 并行测试

```javascript
// jest.config.js
module.exports = {
  // 并行运行测试
  maxWorkers: '50%',
  
  // 随机化测试顺序
  testSequencer: '<rootDir>/test/sequencer.js'
}
```

## 性能测试

### 1. 渲染性能测试

```javascript
// performance.test.js
import { mount } from '@vue/test-utils'
import LargeList from '@/components/LargeList.vue'

test('renders large list efficiently', async () => {
  const startTime = performance.now()
  
  const wrapper = mount(LargeList, {
    propsData: {
      items: Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        name: `Item ${i}`
      }))
    }
  })
  
  const endTime = performance.now()
  const renderTime = endTime - startTime
  
  // 渲染时间应该少于 100ms
  expect(renderTime).toBeLessThan(100)
})
```

## 测试维护

### 1. 测试重构

```javascript
// 重构前
test('user can login with valid credentials', async () => {
  const wrapper = mount(LoginForm)
  const emailInput = wrapper.find('input[type="email"]')
  const passwordInput = wrapper.find('input[type="password"]')
  const submitButton = wrapper.find('button[type="submit"]')
  
  emailInput.setValue('user@example.com')
  passwordInput.setValue('password123')
  await submitButton.trigger('click')
  
  expect(wrapper.emitted('login-success')).toBeTruthy()
})

// 重构后 - 使用更清晰的结构
test('user can login with valid credentials', async () => {
  const { wrapper, inputs, buttons } = setupLoginForm()
  
  await fillLoginForm(inputs, {
    email: 'user@example.com',
    password: 'password123'
  })
  
  await buttons.submit.trigger('click')
  
  expect(wrapper.emitted('login-success')).toBeTruthy()
})

function setupLoginForm() {
  const wrapper = mount(LoginForm)
  return {
    wrapper,
    inputs: {
      email: wrapper.find('input[type="email"]'),
      password: wrapper.find('input[type="password"]')
    },
    buttons: {
      submit: wrapper.find('button[type="submit"]')
    }
  }
}

async function fillLoginForm(inputs, credentials) {
  inputs.email.setValue(credentials.email)
  inputs.password.setValue(credentials.password)
  await inputs.password.trigger('input')
}
```

### 2. 测试文档

```javascript
/**
 * 测试用户登录功能
 * 
 * 场景: 用户使用有效凭据登录
 * 步骤:
 * 1. 输入有效的邮箱和密码
 * 2. 点击登录按钮
 * 3. 验证登录成功事件被触发
 * 
 * 预期结果: 登录成功事件被触发，用户被重定向到仪表板
 */
test('user can login with valid credentials', async () => {
  // 测试实现
})
```

通过遵循这些测试最佳实践，可以确保 Vue.js 应用的质量和稳定性，同时提高开发效率和代码可维护性。