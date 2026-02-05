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
    // 次级 items 自动读取 typescript/guide 目录
    { text: 'Vue2', collapsed: false, prefix: 'vue2', items: 'auto' },
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