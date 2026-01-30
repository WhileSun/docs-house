---
title: 安装
createTime: 2025/07/20 15:43:00
permalink: /devops/podman/install/
---

## Podman 安装（Ubuntu 20.10+）

直接通过系统包管理器安装，简单高效：

``` bash 
sudo apt-get update && sudo apt-get -y install podman
```


## 国内镜像源配置（解决拉取慢问题）

**打开配置文件**

``` bash
sudo vim /etc/containers/registries.conf
```

**替换配置内容**

``` conf title="registries.conf"
# 取消默认仓库域名限制，仅搜索docker.io
unqualified-search-registries = ["docker.io"]

# 配置docker.io国内加速器
[[registry]]
prefix = "docker.io"    # 镜像前缀匹配
location = "dockerpull.com"  # 国内可用加速器地址
insecure = true         # 允许HTTP协议拉取镜像
```

**其他镜像源**

目前国内还可以使用的[镜像源](https://www.jianshu.com/p/ce25edea73f5)。


## 生效配置

修改后重启 Podman 使镜像源配置生效：

``` bash
sudo systemctl restart podman
```


## 官方文档

[podman](https://podman.io/docs/installation)官网安装文档参考。