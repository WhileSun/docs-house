---
title: 私有仓库
createTime: 2026/01/30 09:31:25
permalink: /devops/docker/private-repository
---

## Docker 公共私有仓库

### 登录私有仓库

``` bash
# 执行后按提示输入私有仓库账号、密码
docker login
```

### 搜索仓库镜像

``` bash
# repo 替换为实际要搜索的镜像名称
docker search repo
```

### 镜像标记（关联私有仓库账号，与原镜像共享 ID）

``` bash
# 格式：docker tag 原镜像名:版本 私有仓库账号/目标镜像名:版本
docker tag nginx:v3 whilesun/nginx:v3
```

### 推送镜像到私有仓库

``` bash
# 推送标记好的镜像（账号名/镜像名:版本 格式）
docker push whilesun/nginx:v3
```


## Docker Registry 本地私有仓库（自建本地仓库）

### 启动本地 Registry 仓库容器

``` bash
# --name 容器名  -d 后台运行  -p 端口映射  registry:2.6.2 仓库镜像版本
docker run --name myregistry -d -p 5000:5000 registry:2.6.2
```

### 镜像标记（关联本地仓库地址）

``` bash
# 格式：docker tag 原镜像名:版本 本地仓库IP:端口/目标镜像名:版本
docker tag nginx:v3 127.0.0.1:5000/nginx:v3
```

### 推送镜像到本地仓库

``` bash
# 推送标记好的本地仓库镜像（可省略版本，默认推送latest）
docker push 127.0.0.1:5000/nginx:v3
# 简化版（推送latest版本）
# docker push 127.0.0.1:5000/nginx
```

### 查看本地仓库已上传镜像

通过浏览器访问 Registry 内置接口，查看仓库中所有镜像列表：

``` plaintext
http://127.0.0.1:5000/v2/_catalog
```

### 拉取本地仓库镜像

``` bash
# 格式：docker pull 本地仓库IP:端口/镜像名:版本
docker pull 127.0.0.1:5000/nginx:v3
```