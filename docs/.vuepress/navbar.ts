/**
 * @see https://theme-plume.vuejs.press/config/navigation/ 查看文档了解配置详情
 *
 * Navbar 配置文件，它在 `.vuepress/plume.config.ts` 中被导入。
 */

import { defineNavbarConfig } from 'vuepress-theme-plume'

export default defineNavbarConfig([
  { text: '前端', link: '/frontend/vue3/script/lifecycle/', icon: 'codicon:code-oss' },
  { text: '后端', link: '/backend/python/base-install/', icon: 'codicon:terminal' },
  { text: '运维', link: '/devops/server/domain-auto-renewal/', icon: 'codicon:debug' }
])
