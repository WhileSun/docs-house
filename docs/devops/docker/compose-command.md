---
title: Compose
createTime: 2026/01/30 10:22:56
permalink: /devops/docker/compose-command
badge: 编排
---

`Docker Compose` 是 Docker 官方的==多容器编排工具==，通过单一 `docker-compose.yml` 配置文件定义多服务依赖关系，实现一键启动 / 停止 / 管理多个关联容器，以下是标准化配置示例和高频实操命令整理。

## Flask + Redis 计数器应用

本文基于==Flask Web 服务 + Redis 计数存储场景==，整理 Docker Compose 从代码编写、镜像构建到服务编排的完整实操流程，包含核心代码文件、配置文件及标准化操作命令，实现多服务一键编排与运行。

### 项目文件结构

所有文件置于同一目录下，结构如下（无额外子目录，方便 Compose 自动构建）：

``` plaintext
./
├── app.py          # Flask 主应用代码（计数器核心逻辑）
├── Dockerfile      # Web 服务镜像构建配置
└── docker-compose.yml  # Compose 多服务编排配置
```

### Flask 应用代码：app.py

实现基础的访问计数器功能，通过 Redis 存储计数，包含 Redis 连接重试机制（解决服务启动顺序导致的连接失败问题）。

``` python title="app.py"
import redis
import time
from flask import Flask

# 初始化Flask应用
app = Flask(__name__)
# 连接Redis服务（host为Compose中Redis服务名，自动解析，无需IP）
cache = redis.Redis(host='redis', port=6379)

# 封装Redis计数方法，添加连接重试机制
def get_count():
    retries = 5  # 最大重试次数
    while True:
        try:
            return cache.incr("hits")  # Redis自增计数，key为hits
        except redis.exceptions.ConnectionError as exc:
            if retries == 0:
                raise exc  # 重试耗尽，抛出异常
            retries -= 1
            time.sleep(0.3)  # 重试间隔0.3秒

# 根路由，返回计数结果
@app.route('/')
def hello():
    cnt = get_count()
    return 'Hello World! cnt={}\n'.format(cnt)

# 启动Flask服务，监听所有网卡（容器内必须0.0.0.0）
if __name__ == '__main__':
    app.run(host="0.0.0.0", debug=True)
```
::: tip 关键说明
Redis 连接的 `host='redis'` 为 Compose 中定义的 `Redis 服务名`，Compose 会自动实现服务名解析，无需手动配置 IP/link。
:::

### 镜像构建配置：Dockerfile

基于轻量的 Python3.6-alpine 镜像，构建 Web 服务镜像，包含依赖安装和启动命令。

``` dockerfile title="Dockerfile"
# 基础镜像：Python3.6 轻量版（alpine镜像体积小，适合生产环境）
FROM python:3.6-alpine
# 将当前目录所有文件复制到容器内/code目录
ADD . /code
# 设置容器工作目录（后续命令基于此目录执行）
WORKDIR /code
# 安装应用依赖：redis 和 flask
RUN pip install redis flask
# 容器启动命令：运行Flask应用
CMD ["python", "app.py"]
```

**多服务编排配置：docker-compose.yml**

指定 Compose 版本，定义 Web 服务和 Redis 服务的关联配置，实现一键编排。

``` yaml title="docker-compose.yml"
# 指定Compose文件版本（3.9为稳定版本，兼容主流Docker引擎）
version: "3.9"
# 定义所有编排服务（一个服务对应一个容器）
services:
  # Web服务（Flask应用）
  web:
    build: .  # 基于当前目录的Dockerfile构建镜像
    ports:    # 端口映射：宿主机5000端口 → 容器5000端口
      - "5000:5000"
    volumes:  # 数据卷挂载：当前目录 → 容器/code目录（实现代码热更新，无需重新构建镜像）
      - .:/code
    depends_on:
      - redis  # 显式指定：web服务依赖redis服务，优先启动redis
  # Redis服务（计数存储）
  redis:
    image: "redis:alpine"  # 直接使用Docker Hub的Redis轻量镜像，无需手动构建
```


## 基础操作命令

### 安装 Docker Compose

适用于 Linux/Mac 环境（Windows 安装 Docker Desktop 会自动集成 Compose，无需手动安装）。

``` bash
# 通过Python pip包管理器安装（需提前安装python3和pip）
pip install docker-compose
```

### 版本验证（确认安装成功）

``` bash
# 查看Compose版本，验证安装是否正常
docker-compose --version
```

### 配置文件校验（启动前必做）

校验 docker-compose.yml 语法是否正确，避免因缩进、语法错误导致启动失败。

``` bash
# 校验配置文件，无报错则输出格式化配置
docker-compose config
```

### 构建服务镜像

针对 Web 服务的 `build: .` 配置，手动构建镜像（首次启动前必须执行）。

``` bash
# 构建compose中所有需要构建的镜像（此处仅web服务）
docker-compose build
# 可选：仅构建指定服务镜像（更高效）
# docker-compose build web
```

### 启动编排服务

一键启动 Web 和 Redis 服务，支持后台运行、指定配置文件。

``` bash
# 基础启动命令：后台运行（-d），默认读取当前目录docker-compose.yml
docker-compose up -d
# 可选：指定自定义配置文件启动（如测试环境配置）
# docker-compose -f docker-compose-test.yml up -d
```

`启动后验证`：浏览器访问 http://宿主机IP:5000，刷新页面可看到计数器持续自增。

### 查看服务运行日志

实时查看指定服务的日志，方便排查运行中的问题（如 Redis 连接失败、Flask 报错）。

``` bash
# 实时跟踪web服务日志（-f：类似tail -f，实时输出）
docker-compose logs -f web
# 可选：查看所有服务的实时日志
# docker-compose logs -f
# 可选：查看redis服务日志
# docker-compose logs -f redis
```

### 停止并删除编排资源

停止运行的服务，并删除容器、专属网桥（可选择是否删除数据卷 / 镜像）

``` bash
# 基础命令：停止容器+删除容器+删除专属网桥（保留数据卷和镜像）
docker-compose down
# 可选：删除容器+网桥+数据卷（谨慎，Redis数据会丢失）
# docker-compose down -v
# 可选：删除容器+网桥+数据卷+构建的镜像（彻底清理环境）
# docker-compose down -v --rmi all
```

### 重新构建并启动服务

当 Flask 代码或 Dockerfile 修改后，重新构建镜像并重启服务。

``` bash
# 重新构建镜像并后台启动（组合命令，一步到位）
docker-compose up -d --build
```


## 进阶版配置文件

``` yaml
version: "3.9"  # 兼容主流Docker版本，稳定无兼容问题

# 命名数据卷：Docker统一管理，数据持久化（容器删除不丢失）
volumes:
  mysql-data:  # 存储MySQL数据库文件
  redis-data:  # 存储Redis持久化文件

# 编排服务（3个服务，自动加入默认网桥，服务名互通）
services:
  # MySQL服务（持久化存储，先启动）
  mysql:
    image: mysql:8.0  # 直接使用官方镜像，无需手动构建
    restart: always   # 异常退出自动重启，生产必备
    environment:      # 从.env注入环境变量
      - MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
      - MYSQL_DATABASE=${MYSQL_DATABASE}
      - MYSQL_USER=${MYSQL_USER}
      - MYSQL_PASSWORD=${MYSQL_PASSWORD}
      - TZ=${TZ}
    volumes:
      - mysql-data:/var/lib/mysql  # 数据持久化核心
    healthcheck:      # 健康检查，确保服务就绪后再启动其他服务
      test: ["CMD", "mysqladmin", "ping", "-u", "root", "-p${MYSQL_ROOT_PASSWORD}"]
      interval: 5s
      retries: 3
      start_period: 30s

  # Redis服务（缓存，次启动）
  redis:
    image: redis:7-alpine  # alpine轻量镜像，体积小
    restart: always
    command: redis-server --requirepass ${REDIS_PASSWORD}  # 启动时设置密码
    volumes:
      - redis-data:/data  # 持久化Redis数据
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "${REDIS_PASSWORD}", "ping"]
      interval: 3s
      retries: 3
      start_period: 10s

  # Flask Web服务（业务核心，最后启动）
  web:
    build: .  # 基于当前目录自动构建镜像（读取当前目录的Dockerfile，Compose自动生成）
    restart: always
    ports:
      - "${FLASK_PORT}:${FLASK_PORT}"  # 宿主机端口映射，从.env读取
    volumes:
      - .:/app  # 本地目录挂载，实现代码热更新（修改app.py无需重建镜像）
    environment:
      - FLASK_ENV=${FLASK_ENV}
      - FLASK_PORT=${FLASK_PORT}
    depends_on:  # 依赖管理：等待MySQL/Redis健康后再启动
      mysql:
        condition: service_healthy
      redis:
        condition: service_healthy
```