---
title: github工作流程
createTime: 2026/01/30 14:09:01
permalink: /devops/podman/vuepress-github-actions/
---

实现 `main` 分支 `push/pull_request`触发自动打包，通过 SCP 推送到服务器指定目录。


## 创建 Actions 配置文件

进入 VuePress 项目 GitHub 仓库 → 点击Actions → 新建工作流 → 自定义编写 yml 文件，命名为`vuepress-deploy.yml`（路径：`.github/workflows/`）。

## 编写自动化部署配置

``` yaml title="vuepress-deploy.yml"
name: VuePress Auto Deploy
# 触发条件：main分支推送/拉取请求
on:
  push:
    branches: [ "main" ]
  pull_request:
    branches: [ "main" ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest # 运行环境：Ubuntu最新版
    steps:
      # 步骤1：拉取仓库代码
      - name: Checkout Code
        uses: actions/checkout@v4

      # 步骤2：配置Node.js环境（18.x稳定版）
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18.x
          cache: 'pnpm' # 缓存pnpm依赖，提升打包速度

      # 步骤3：安装pnpm包管理工具
      - name: Install pnpm
        uses: pnpm/action-setup@v4.0.0
        with:
          version: 9.4.0

      # 步骤4：安装依赖并打包VuePress
      - name: Install Dependencies & Build
        run: |
          pnpm install --frozen-lockfile # 锁定依赖版本
          pnpm run docs:build # 执行VuePress打包命令，输出到docs/.vuepress/dist

      # 步骤5：SCP推送到服务器（覆盖旧文件）
      - name: Deploy to Server
        uses: appleboy/scp-action@master
        with:
          host: ${{ secrets.REMOTE_HOST }}        # 服务器公网IP
          username: ${{ secrets.REMOTE_USERNAME }}# 服务器登录用户名
          key: ${{ secrets.REMOTE_PRIVATE_KEY }}  # 服务器SSH私钥
          source: "docs/.vuepress/dist/*"         # 本地打包后的文件目录
          target: "/home/nginx/html/vuepress"     # 服务器目标目录（Nginx可访问）
          strip_components: 3                     # 移除前导路径，直接复制dist内文件
          rm: true                                # 推送前删除目标目录旧文件
```

## SSH 密钥签发

``` bash
# 生成RSA密钥对（一路回车，无需设置密码）
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# 将公钥添加到服务器授权列表（实现本地免密登录）
cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys # 配置权限，避免密钥失效
```

- 公钥路径：`~/.ssh/id_rsa.pub`（无需上传）
- 私钥路径：`~/.ssh/id_rsa`（复制内容，用于 GitHub 配置）

## GitHub 仓库 Secrets 配置

进入项目仓库==→ Settings → Secrets and variables → Actions → New repository secret==，添加 3 个秘钥：

| 秘钥名称          | 秘钥值            | 说明                          |
|-------------------|-------------------|-------------------------------|
| REMOTE_HOST       | 服务器公网 IP     | 如 47.xxx.xxx.xxx             |
| REMOTE_USERNAME   | 服务器登录用户名  | 如 root/ubuntu                |
| REMOTE_PRIVATE_KEY| 服务器 SSH 私钥内容 | 复制 ~/.ssh/id_rsa 全部内容 |

