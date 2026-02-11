import { defineCollection } from 'vuepress-theme-plume'

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