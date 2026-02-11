import { defineCollection } from 'vuepress-theme-plume'

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