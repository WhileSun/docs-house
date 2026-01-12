import { defineCollection, defineCollections } from 'vuepress-theme-plume'

export const devops = defineCollection({
  type: 'doc',
  dir: 'devops',
  title: '运维',
  sidebar: [
    { text: '服务器', prefix: 'server', items: 'auto' },
    { text: 'podman', prefix: 'podman', items: 'auto' },
  ]
})

export const frontend = defineCollection({
  type: 'doc',
  dir: 'frontend',
  title: '前端',
  sidebar: [
    // 次级 items 自动读取 typescript/guide 目录
    { text: 'vue2', collapsed: false, prefix: 'vue2', items: 'auto' },
    { text: 'vue3', collapsed: false, prefix: 'vue3', items: 'auto' },
    { text: 'vite', collapsed: false, prefix: 'vite', items: 'auto' },
    { text: '小程序', prefix: 'miniprogram', items: 'auto' },
    { text: '开发工具', prefix: 'devtool', items: 'auto' },
  ],
})

export const collections = defineCollections([
  devops,
  frontend
])