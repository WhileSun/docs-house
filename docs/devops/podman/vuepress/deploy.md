---
title: 部署
createTime: 2026/01/30 14:03:06
permalink: /devops/podman/vuepress-deploy/
---

搭建轻量 Nginx 运行环境，将配置 / 页面目录映射到宿主机，方便文件管理和部署。

## 部署流程

``` bash
# 1. 拉取轻量Nginx镜像
podman pull nginx:alpine3.19

# 2. 启动临时容器（用于复制默认配置/页面）
podman run -d --name web-nginx nginx:alpine3.19

# 3. 宿主机创建目录（提前建目录避免权限问题）
mkdir -p /home/nginx/{conf,html}

# 4. 复制容器内Nginx配置、默认页面到宿主机
podman cp web-nginx:/etc/nginx/. /home/nginx/conf
podman cp web-nginx:/usr/share/nginx/html/. /home/nginx/html

# 5. 删除临时容器
podman rm -f web-nginx

# 6. 重新创建容器（目录/端口映射，后台运行）
# -p 宿主机8001:容器80 | -v 目录映射 | --name 容器名
podman run -d --name web-nginx \
-p 8001:80 \
-v /home/nginx/conf:/etc/nginx \
-v /home/nginx/html:/usr/share/nginx/html \
nginx:alpine3.19
```


## 测试服务

浏览器打开网址`http://IP:8001`

