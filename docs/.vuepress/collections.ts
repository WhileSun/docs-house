import { defineCollection, defineCollections } from 'vuepress-theme-plume'

export const blog = defineCollection({
  type: 'doc',
  dir: 'devops',
  title: '博客',
  sidebar: 'auto',
})

export const typescript = defineCollection({
  type: 'doc',
  dir: 'frontend',
  title: '前端',
  sidebar: 'auto'
})

export const collections = defineCollections([
  blog,
  typescript
])