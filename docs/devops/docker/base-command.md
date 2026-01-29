---
title: 基础命令
createTime: 2026/01/27 11:13:47
permalink: /devops/docker/base-command
---


## 镜像基础操作

### 拉取镜像

``` bash
# 基础语法
docker pull [OPTIONS] NAME[:TAG|@DIGEST]
# 示例：拉取Ubuntu 16.04指定版本镜像
docker pull ubuntu:16.04
```

### 查看本地镜像

``` bash
docker images
```

### 删除本地镜像

``` bash
# 通过镜像名:标签 或 镜像ID删除
docker image rm NAME:TAG/镜像ID
```

## 容器核心操作

### 启动容器

``` bash
# 基础后台启动
docker run -d ubuntu:16.04
# 后台启动并执行指定命令
docker run -d ubuntu:16.04 /bin/sh -c "echo test"
# 自定义容器名+后台+端口映射（外部端口:容器端口）
docker run --name 容器名 -d -p 80:80 ubuntu:16.04
```

### 交互式运行（测试专用，退出即删除）

``` bash
# -it 交互式终端 | --rm 退出后自动删除容器 | /bin/bash 进入容器终端
docker run -it --rm ubuntu:16.04 /bin/bash
```

### 容器生命周期管理

``` bash
# 启动已停止的容器（支持容器ID/容器名）
docker start 容器ID/容器名
# 重启容器（支持容器ID/容器名）
docker restart 容器ID/容器名
# 停止运行中的容器（支持容器ID/容器名）
docker stop 容器ID/容器名
```

### 查看容器

``` bash
# 查看正在运行的容器
docker ps
# 查看所有容器（运行中+已停止）
docker ps -a
# 等价命令（完整写法）
docker container ls -all
```

### 进入运行中的容器

``` bash
# -it 交互式终端 | 进入后执行bash终端（支持容器ID/容器名）
docker exec -it 容器ID/容器名 /bin/bash
```

### 删除容器

``` bash
# 删除指定容器（支持容器ID/容器名）
docker rm 容器ID/容器名
# 强制删除指定容器（运行中容器需加-f）
docker rm -f 容器ID/容器名
# 强制删除所有容器（ps -qa 列出所有容器ID）
docker rm -f $(docker ps -qa)
```

## 镜像高级操作

### 基于容器生成新镜像（容器快照）

``` bash
# 基础语法：--author 作者 --message 提交信息 源容器ID/名 新镜像名:标签
docker commit --author "作者名" --message "镜像修改说明" 容器ID/容器名 新镜像名:TAG
# 示例：基于webserv容器生成nginx:v2镜像
docker commit --author "ws" --message "修改内容" webserv nginx:v2
```

### 查看镜像构建历史

``` bash
docker history 镜像名:TAG
```

### 镜像保存（离线导出，压缩格式）

``` bash
# 将镜像保存为gzip压缩包，便于离线传输
docker save 镜像名:TAG | gzip > 保存文件名.tar.gz
# 示例：导出nginx:v3为压缩包
docker save nginx:v3 | gzip > nginx.v3.tar.gz
```

### 镜像加载（离线导入）

``` bash
# 从本地压缩包导入镜像到Docker本地仓库
docker load -i 镜像压缩包名.tar.gz
# 示例：导入nginx.v3.tar.gz
docker load -i nginx.v3.tar.gz
```