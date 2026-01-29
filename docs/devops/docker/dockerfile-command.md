---
title: Dockerfile 基础用法
createTime: 2026/01/29 09:44:56
permalink: /devops/docker/dockerfile-command
---

## Dockerfile 基础示例

### Nginx 基础镜像示例

``` dockerfile
# 基础镜像：基于官方nginx镜像构建
FROM nginx

# 声明容器监听端口（文档说明，非强制映射）
EXPOSE 80

# 可选：直接在镜像内生成首页文件（注释备用）
# RUN echo "<h1>Hello,World 3!</h1>" > /usr/share/nginx/html/index.html

# 设置工作目录（后续命令默认在此目录执行）
WORKDIR /usr/share/nginx/html

# 复制本地index.html到容器当前工作目录
COPY index.html index.html
```

### Python 项目镜像示例

``` dockerfile
# 基础镜像：轻量版Python3.6（alpine为精简Linux发行版）
FROM python:3.6-alpine

# 声明容器端口（Flask默认5000/Django默认8000，按需修改）
EXPOSE 5000


# 将本地当前目录所有文件复制到容器/code目录
ADD . /code  

# 设置容器工作目录为/code（后续命令基于此目录）
WORKDIR /code 

# 安装项目依赖包（redis、flask）
RUN pip install redis flask

# 容器启动时执行的命令（启动Python应用）
CMD ["python","app.py"]
```

## Docker 镜像构建命令

### 基础语法

``` bash
# 构建镜像核心命令
# -t：指定镜像名:标签  |  -f：指定Dockerfile文件名  |  .：指定构建上下文（当前目录）
docker build -t NAME:TAG -f 文件名 .
```

### 实操示例

``` bash
# 示例1：构建Nginx自定义镜像（指定标签v3，使用默认Dockerfile）
docker build -t nginx:v3 -f Dockerfile .

# 简化写法（默认使用当前目录Dockerfile，可省略-f参数）
docker build -t nginx:v3 .
```

**关键参数说明**
- `-t NAME:TAG`：为构建的镜像标记**名称和版本标签**，便于后续识别和使用
- `-f 文件名`：指定自定义名称的 Dockerfile（如`Dockerfile.dev`），==默认使用Dockerfile可省略==
- `.`：构建上下文，表示 Docker 会将当前目录下所有文件 / 目录发送给 Docker 守护进程，供COPY/ADD等命令使用