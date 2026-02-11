import { defineCollections } from 'vuepress-theme-plume'
import { frontend } from './frontend';
import { devops } from './devops';
import { backend } from './backend';

export const collections = defineCollections([frontend, devops, backend])