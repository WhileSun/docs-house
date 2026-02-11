import { defineCollection } from 'vuepress-theme-plume';

export const frontend = defineCollection({
  type: 'doc',
  dir: 'frontend',
  title: '前端',
  sidebar: [
    {
      text: 'Vue2', collapsed: false, prefix: 'vue2', items: [
        {
          text: '介绍', collapsed: true, prefix: 'introduction', items: [
            'getting-started', 'installation'
          ]
        },
        {
          text: '基础知识', collapsed: true, prefix: 'basics', items: [
            'template-syntax', 'computed-and-watchers', 'conditional-rendering',
            'list-rendering', 'form-input-bindings', 'lifecycle-hooks'
          ]
        },
        {
          text: '组件系统', collapsed: true, prefix: 'components', items: [
            'components-basics', 'component-registration', 'props', 'custom-events',
            'slots', 'dynamic-components', 'async-components', 'component-edge-cases'
          ]
        },
        {
          text: '路由', collapsed: true, prefix: 'routing', items: [
            'basic-routing', 'nested-routes', 'route-params', 'programmatic-navigation',
            'route-guard', 'lazy-loading'
          ]
        },
        {
          text: '状态管理', collapsed: true, prefix: 'state-management', items: [
            'vuex-basics', 'state', 'getters', 'mutations', 'actions', 'modules'
          ]
        },
        {
          text: '高级特性', collapsed: true, prefix: 'advanced', items: [
            'reactivity', 'custom-directives', 'mixins', 'plugins', 'filters', 'teleport'
          ]
        },
        {
          text: '测试', collapsed: true, prefix: 'testing', items: [
            'unit-testing', 'e2e-testing', 'testing-best-practices'
          ]
        },
        {
          text: '性能优化', collapsed: true, prefix: 'performance', items: [
            'rendering-performance', 'bundle-optimization', 'runtime-optimization'
          ]
        },
        {
          text: '生态系统', collapsed: true, prefix: 'ecosystem', items: [
            'vue-cli', 'vue-devtools', 'related-libraries'
          ]
        },
        {
          text: '迁移指南', collapsed: true, prefix: 'migration', items: [
            'from-vue-1', 'to-vue-3'
          ]
        },
        {
          text: '源码解析', collapsed: true, prefix: 'source-code', items: [
            'overview', 'reactivity-system', 'vdom-render', 'lifecycle', 'component-system', 'compiler', 'global-api', 'error-handling', 'performance-optimization'
          ]
        }
      ]
    },
    {
      text: 'Vue3', collapsed: false, prefix: 'vue3', items: 'auto'
    },
    {
      text: 'Vite', collapsed: false, prefix: 'vite', items: 'auto'
    },
    {
      text: 'Webpack', collapsed: false, prefix: 'webpack', items: 'auto'
    },
    {
      text: '开发工具', collapsed: false, prefix: 'devtool', items: 'auto'
    },
    {
      text: '小程序', collapsed: false, prefix: 'miniprogram', items: 'auto'
    }
  ]
});