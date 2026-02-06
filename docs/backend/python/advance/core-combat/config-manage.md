---
title: 配置管理
createTime: 2026/02/06 11:23:03
permalink: /backend/python/advance-core-combat/config-manage/
---


## 核心痛点

开发中直接将配置（如数据库地址、密钥、超时时间）硬编码到代码中，存在以下问题：

1. 生产 / 开发 / 测试环境配置不同，切换时需修改代码，易出错；
2. 密钥 / 密码等敏感信息硬编码，存在安全风险；
3. 配置修改需重新部署项目，灵活性差。


## 核心解决方案

采用 **“配置文件 + 环境变量”** 的方式管理配置，遵循 **“敏感配置用环境变量，普通配置用配置文件”** 的原则，支持多环境（dev/prod/test）切换，配置文件推荐使用**YAML**（语法简洁，支持层级结构，比 INI/JSON 更适合配置管理）。


## 实战步骤：YAML 配置文件 + 环境变量 + 配置加载

### 步骤 1：安装 PyYAML 依赖

``` bash
pip install PyYAML==6.0.1 -i https://mirrors.aliyun.com/pypi/simple/
```

### 步骤 2：创建配置文件目录与多环境配置文件

在`src/my_package/config/`下创建配置文件，支持 `dev`（开发）、`prod`（生产）、`test`（测试）环境：

``` plaintext
src/
└─ my_package/
   └─ config/
      ├─ __init__.py
      ├─ dev.yaml    # 开发环境配置
      ├─ prod.yaml   # 生产环境配置
      ├─ test.yaml   # 测试环境配置
      └─ settings.py # 配置加载逻辑（核心）
```

### 步骤 3：编写 YAML 配置文件（示例：prod.yaml/dev.yaml）

YAML 支持层级结构、注释、列表，语法简洁，示例如下：

``` yaml
# prod.yaml（生产环境配置，精简，日志级别高，超时时间短）
# 服务器配置
server:
  host: 0.0.0.0
  port: 8080
  timeout: 10

# 数据库配置
db:
  host: 192.168.1.100
  port: 3306
  user: prod_user
  # 密码：敏感配置，用环境变量DB_PASSWORD覆盖，此处仅做占位
  password: ${DB_PASSWORD}
  db_name: prod_db
  charset: utf8mb4

# Redis配置
redis:
  host: 192.168.1.101
  port: 6379
  db: 0
  password: ${REDIS_PASSWORD}
  timeout: 5

# 日志配置
log:
  level: INFO
  file: logs/prod.log
  max_size: 100MB
  backup_count: 10

# dev.yaml（开发环境配置，详细，日志级别低，本地地址）
server:
  host: 127.0.0.1
  port: 5000
  timeout: 30

db:
  host: 127.0.0.1
  port: 3306
  user: root
  password: 123456
  db_name: dev_db
  charset: utf8mb4

redis:
  host: 127.0.0.1
  port: 6379
  db: 0
  password:
  timeout: 10

log:
  level: DEBUG
  file: logs/dev.log
  max_size: 50MB
  backup_count: 5
```

### 步骤 4：编写配置加载逻辑（settings.py）

**核心功能：**

1. 通过**环境变量 ENV**指定当前运行环境（dev/prod/test），默认 dev；
2. 加载对应环境的 YAML 配置文件；
3. 替换配置中的环境变量占位符（如 ${DB_PASSWORD}）；
4. 将配置转为**不可变的命名元组**，避免外部修改，保证配置安全性；
5. 提供全局的配置对象，供项目其他模块导入使用。

``` python
# src/my_package/config/settings.py
import os
import re
import yaml
from collections import namedtuple
from typing import Dict, Any

# 1. 获取当前运行环境：从环境变量ENV获取，默认dev
ENV = os.getenv("ENV", "dev").lower()
if ENV not in ["dev", "prod", "test"]:
    raise ValueError(f"环境变量ENV必须为dev/prod/test，当前为{ENV}")

# 2. 配置文件路径：获取当前文件所在目录，拼接配置文件路径
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CONFIG_FILE = os.path.join(BASE_DIR, f"{ENV}.yaml")

# 3. 加载YAML配置文件
def load_yaml(file_path: str) -> Dict[str, Any]:
    """加载YAML配置文件"""
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"配置文件{file_path}不存在")
    with open(file_path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f) or {}

# 4. 替换配置中的环境变量占位符（如${DB_PASSWORD}）
def replace_env_var(config: Dict[str, Any]) -> Dict[str, Any]:
    """递归替换配置中的环境变量占位符"""
    env_pattern = re.compile(r"\$\{(\w+)\}")  # 匹配${VAR_NAME}
    for key, value in config.items():
        if isinstance(value, dict):
            config[key] = replace_env_var(value)
        elif isinstance(value, str):
            # 查找所有环境变量占位符
            matches = env_pattern.findall(value)
            for match in matches:
                env_value = os.getenv(match)
                if env_value is not None:
                    value = value.replace(f"${{{match}}}", env_value)
            config[key] = value
    return config

# 5. 将字典配置转为命名元组（不可变，避免外部修改）
def dict_to_namedtuple(name: str, config: Dict[str, Any]) -> namedtuple:
    """递归将字典转为命名元组"""
    fields = {}
    for key, value in config.items():
        if isinstance(value, dict):
            fields[key] = dict_to_namedtuple(key.capitalize(), value)
        else:
            fields[key] = value
    return namedtuple(name, fields.keys())(*fields.values())

# 6. 加载并处理配置，生成全局配置对象
raw_config = load_yaml(CONFIG_FILE)
processed_config = replace_env_var(raw_config)
Config = dict_to_namedtuple("Config", processed_config)

# 7. 导出全局配置对象，供其他模块导入使用
if __name__ == "__main__":
    # 测试配置加载
    print(f"当前运行环境：{ENV}")
    print(f"服务器地址：{Config.server.host}:{Config.server.port}")
    print(f"数据库地址：{Config.db.host}:{Config.db.port}")
    print(f"日志级别：{Config.log.level}")
```

### 步骤 5：使用配置（项目其他模块导入即可）

``` python
# src/my_package/core/main.py
from my_package.config.settings import Config

# 直接使用配置，通过属性访问，简洁且安全
def main():
    print(f"启动服务器：{Config.server.host}:{Config.server.port}")
    print(f"数据库连接：{Config.db.user}@{Config.db.host}:{Config.db.port}/{Config.db.db_name}")
    print(f"日志文件：{Config.log.file}，级别：{Config.log.level}")

if __name__ == "__main__":
    main()
```

### 步骤 6：运行项目，指定环境变量（生产 / 测试环境）

``` bash
# 开发环境：默认ENV=dev，无需指定环境变量
python src/my_package/core/main.py

# 生产环境：指定ENV=prod，并设置敏感配置的环境变量
export ENV=prod && export DB_PASSWORD=prod123456 && export REDIS_PASSWORD=redis123 && python src/my_package/core/main.py

# Windows CMD（生产环境）
set ENV=prod && set DB_PASSWORD=prod123456 && set REDIS_PASSWORD=redis123 && python src/my_package/core/main.py
```