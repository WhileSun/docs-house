---
title: npm和pnpm的区别
createTime: 2025/07/17 10:03:23
permalink: /frontend/devtool/npm-with-pnpm/
---

## 概述

由于项目组要求历史项目的包管理由npm改为pnpm，此文记录下遇到的一些问题。

## 介绍

### npm介绍

npm 是 Node.js 的官方包管理器，于 2010 年诞生。它拥有庞大的软件包仓库，收录超过 150 万个开源包，能为各种规模的 JavaScript 项目提供依赖管理支持。开发者可通过 npm 便捷地安装、共享和管理包，但在处理大型项目时，可能存在安装速度慢、磁盘空间占用大等问题。

### pnpm介绍

pnpm 出现于 2016 年，自称是 “高性能的 npm”。它通过创新的依赖存储和链接机制，将所有依赖包存储在全局的内容可寻址存储中，再通过硬链接将项目所需依赖链接到项目的 node_modules 目录，实现了更快的安装速度和更少的磁盘占用，并且对 Monorepo 有很好的支持，在中大型项目中优势明显。


## 区别

以下是npm和pnpm的对比表格：

| **对比维度**       | **npm**                                  | **pnpm**                                  |
|--------------------|------------------------------------------|-------------------------------------------|
| 依赖存储方式       | 嵌套结构，依赖重复安装                   | 内容可寻址存储（CAS），依赖全局共享，通过硬链接/符号链接引用 |
| 安装速度           | 较慢，需重复下载相同依赖                 | 更快，避免重复下载，直接复用已有依赖       |
| 磁盘空间占用       | 较高，同一依赖在不同项目中多次存储       | 较低，依赖仅存储一次，多项目共享           |
| 依赖隔离性         | 嵌套结构天然隔离，不同版本可共存         | 通过`node_modules/.pnpm`虚拟结构实现隔离   |
| 对Monorepo支持     | 较弱，需额外配置                         | 原生支持，通过`workspace`简化多包管理      |
| 兼容性             | 与所有npm包兼容，可能存在深层路径问题    | 绝大多数兼容，极少数依赖目录结构的包需额外配置 |
| 命令行体验         | 命令简单直接，复杂场景需额外参数         | 命令与npm基本兼容，提供更高效的Monorepo命令 |
| 适用场景           | 小型项目，对速度和空间要求不高的场景     | 中大型项目、Monorepo，追求高效管理的场景   |

## 改用pnpm的问题

项目采用的是nodev16+pnpmv8的环境

### 提示webpack版本不统一

此问题是由二个包管理工具的``依赖隔离性``不同导致的，因为pnpm更加==严谨==，强制要求每个依赖版本唯一。

**解决方案**

在package.json中添加``overrides``字段，强制所有依赖使用同一版本的 webpack：

``` json title="package.json"
{
  "pnpm": {
    "overrides": {
      "webpack": "4.47.0" // 指定合理的统一版本
    }
  }
}
```

---

### 安装启动提示缺包

同package.json通过pnpm安装后启动，会报错缺少包。

**幽灵依赖（Ghost Dependencies）问题**

- **npm 的宽松策略：** npm 会将依赖提升（hoist）到根目录的node_modules，导致项目==可以访问未显式声明在package.json中的依赖==（即 “幽灵依赖”）。
- **pnpm 的严格策略：** pnpm 默认不提升依赖，项目==只能访问package.json中明确声明的依赖==。如果代码中引用了未声明的依赖，pnpm 会报错。

**解决方案**

在``package.json``中显式添加缺失的依赖。

::: note 类似npm的依赖提升（非必要不推荐）
- 在项目根目录添加.npmrc文件，启用node-linker=hoisted（类似 npm 的依赖提升）：
``` bash
# .npmrc
node-linker=hoisted
```
- 使用shamefully-hoist=true强制提升所有依赖（不推荐，会破坏 pnpm 的优势） 
``` bash
pnpm install --shamefully-hoist
```
:::

---

### process.env.npm_config_*变量的输入

在项目启动时，会在启动命令上增加一些``npm_config_*``变量,pnpm的使用方式不同。

[pnpm-cli](https://pnpm.nodejs.cn/pnpm-cli)命令参数说明

**命令输入**

``` bash
# npm_config_app_dev值命令输入

pnpm run --config.app_dev=xx dev

npm run dev --app_dev=xx

```



