---
title: 安装
createTime: 2026/02/04 09:44:58
permalink: /backend/python/base-install/
---

## Python 特点

- 跨平台：支持 Windows、macOS、Linux 等系统；
- 简洁易读：语法接近自然语言，代码可读性高，开发效率快；
- 解释型：无需编译，逐行执行，适合快速开发和调试；
- 面向对象：原生支持面向对象编程，万物皆对象；
- 丰富的库：内置大量标准库，第三方库（如 NumPy、Pandas、Django）生态完善。


## 环境搭建（全平台）

Python 官方下载地址：[https://www.python.org/downloads/](https://www.python.org/downloads/)，建议下载**3.8 及以上稳定版本**（Python2 已停止维护，不推荐使用）。

### Windows 系统

1. 下载对应版本的 exe 安装包，双击运行；
2. 勾选**Add Python.exe to PATH**（自动配置环境变量，关键步骤）；
3. 选择**Install Now**（默认安装）或自定义安装路径，等待安装完成。

### macOS 系统

- 方式 1：下载 dmg 安装包，双击安装，自动配置环境变量；
- 方式 2：通过 Homebrew 安装（推荐），终端执行：**brew install python3**。

### Linux 系统

Linux 系统一般自带 Python3，终端执行`python3 --version`验证；若未安装，执行对应命令：

- Ubuntu/Debian：`sudo apt-get install python3`
- CentOS/RHEL：`sudo yum install python3`

## 验证安装成功

打开终端`（macOS/Linux）`或命令提示符`（CMD）/PowerShell（Windows）`，执行以下命令，显示版本号即安装成功：

``` bash
# Windows 一般直接用python，部分系统需用python3
python --version
# macOS/Linux 推荐用python3（区分系统自带Python2）
python3 --version
# 对应pip包管理器验证
pip --version 或 pip3 --version
```