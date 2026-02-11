import { defineCollection, defineCollections } from 'vuepress-theme-plume'

export const devops = defineCollection({
  type: 'doc',
  dir: 'devops',
  title: '运维',
  sidebar: [
    { text: '服务器', prefix: 'server', items: 'auto' },
    {
      text: 'Docker', collapsed: false, prefix: 'docker', items: [
        'install', 'base-command', 'data-persistence', 'network-mode', 'private-repository', 'dockerfile-command', 'dockerfile-build', 'compose-command'
      ]
    },
    {
      text: 'Podman', collapsed: false, prefix: 'podman', items: [
        'install',
        {
          text: 'VuePress', prefix: 'vuepress', items: [
            'deploy', 'github-actions'
          ],
        },
      ]
    },
  ]
})

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
        }
      ]
    },
    {
      text: 'Vue3', collapsed: false, prefix: 'vue3', items: [
        {
          text: '基础setup', collapsed: false, prefix: 'script', items: [
            'lifecycle', 'reactivity-create', 'reactivity-listen', 'reactivity-utils', 'use-function', 'define-function'
          ],
        },
        {
          text: '模板', collapsed: false, prefix: 'template', items: 'auto'
        }
      ]
    },
    { text: 'Vite', collapsed: false, prefix: 'vite', items: 'auto' },
    { text: '小程序', prefix: 'miniprogram', items: 'auto' },
    { text: '开发工具', prefix: 'devtool', items: 'auto' },
  ],
})

export const backend = defineCollection({
  type: 'doc',
  dir: 'backend',
  title: '后端',
  sidebar: [
    {
      text: 'Python', collapsed: false, prefix: 'python', items: [
        {
          text: '基础', collapsed: false, prefix: 'base', items: [
            'install', 'data-types', 'data-structures', 'use-operators', 'condition-loop', 'function', 'class', 'file', 'error', 'run', 'pep8'
          ],
        },
        {
          text: '进阶', collapsed: false, prefix: 'advance', items: [
            {
              text: '核心语法', collapsed: true, prefix: 'core-grammar', items: ['unpack', 'generator', 'decorator', 'context-manager']
            },
            {
              text: '高级数据结构', collapsed: true, prefix: 'data-structure', items: 'auto'
            },
            {
              text: '面对对象高级特性', collapsed: true, prefix: 'object-oriented', items: ['special-methods', 'property', 'abstract-class', 'mro-extend']
            },
            {
              text: '函数式编程核心', collapsed: true, prefix: 'core-func', items: 'auto'
            },
            {
              text: '工程化开发规范', collapsed: true, prefix: 'engineering-dev', items: 'auto'
            },
            {
              text: '核心实战', collapsed: true, prefix: 'core-combat', items: 'auto'
            },
            {
              text: '调试与测试', collapsed: true, prefix: 'core-debug', items: 'auto'
            }
          ],
        },
      ]
    }
  ]
})

export const collections = defineCollections([
  devops,
  frontend,
  backend
])