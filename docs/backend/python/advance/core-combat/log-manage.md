---
title: 日志系统
createTime: 2026/02/06 13:59:37
permalink: /backend/python/advance-core-combat/log-manage/
---


## 核心痛点

开发中使用`print()`打印信息，在生产环境存在以下问题：

1. 无法控制打印级别（如 `DEBUG/INFO/ERROR`），生产环境会输出大量无用信息；
2. 无法将日志写入文件，仅打印到控制台，程序崩溃后无法追溯问题；
3. 无日志格式（如时间 / 模块 / 行号），难以定位问题；
4. 无法实现日志滚动，日志文件会无限增大，占满磁盘。


## 核心功能实现

Python 内置`logging`模块支持**多日志级别、自定义格式、文件滚动、多处理器（控制台 + 文件）**，生产环境推荐使用`logging.config.dictConfig`通过**字典配置**实现（比代码硬编码更灵活，可结合前文 YAML 配置文件管理），核心需求：

**实战：生产级日志配置**

``` python
# src/my_package/utils/logger.py
import os
import logging
import logging.config
from logging.handlers import RotatingFileHandler
from my_package.config.settings import Config

# 确保日志目录存在
os.makedirs(os.path.dirname(Config.log.file), exist_ok=True)

# 生产级日志配置字典
LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,  # 不禁用已存在的日志器（避免第三方库日志被屏蔽）
    "formatters": {
        # 控制台日志格式：简洁，仅包含时间、级别、消息
        "console": {
            "format": "%(asctime)s - %(levelname)s - %(message)s",
            "datefmt": "%Y-%m-%d %H:%M:%S"
        },
        # 文件日志格式：详细，包含进程ID、模块、行号，便于定位问题
        "file": {
            "format": "%(asctime)s - %(process)d - %(threadName)s - %(name)s:%(lineno)d - %(levelname)s - %(message)s",
            "datefmt": "%Y-%m-%d %H:%M:%S"
        }
    },
    "handlers": {
        # 控制台处理器：输出到stdout，仅INFO及以上
        "console": {
            "class": "logging.StreamHandler",
            "level": Config.log.level.upper(),  # 从配置读取级别
            "formatter": "console",
            "stream": "ext://sys.stdout"
        },
        # 文件处理器：按大小滚动，DEBUG及以上，保存历史日志
        "file": {
            "class": "logging.handlers.RotatingFileHandler",
            "level": "DEBUG",
            "formatter": "file",
            "filename": Config.log.file,  # 日志文件路径
            "maxBytes": parse_size(Config.log.max_size),  # 单文件最大大小
            "backupCount": Config.log.backup_count,  # 保留备份文件数
            "encoding": "utf-8"  # 避免中文乱码
        }
    },
    "loggers": {
        # 项目根日志器：继承控制台+文件处理器，所有模块日志器的父级
        "my_package": {
            "handlers": ["console", "file"],
            "level": "DEBUG",
            "propagate": False  # 不向上传播到root日志器，避免重复输出
        },
        # 第三方库日志器：降低级别，避免输出冗余信息（如requests/urllib3）
        "requests": {
            "level": "WARNING",
            "propagate": True
        },
        "urllib3": {
            "level": "WARNING",
            "propagate": True
        }
    },
    # 根日志器：兜底配置，仅控制台输出
    "root": {
        "handlers": ["console"],
        "level": "WARNING"
    }
}

def parse_size(size_str: str) -> int:
    """解析日志大小配置（如100MB/50KB）为字节数"""
    size_str = size_str.strip().upper()
    if size_str.endswith("MB"):
        return int(size_str[:-2]) * 1024 * 1024
    elif size_str.endswith("KB"):
        return int(size_str[:-2]) * 1024
    elif size_str.endswith("GB"):
        return int(size_str[:-2]) * 1024 * 1024 * 1024
    else:
        raise ValueError(f"不支持的日志大小单位：{size_str}，仅支持MB/KB/GB")

# 初始化日志配置：项目启动时执行一次
logging.config.dictConfig(LOGGING_CONFIG)

# 全局获取日志器的工具函数：项目所有模块通过此函数获取日志器
def get_logger(name: str) -> logging.Logger:
    """
    获取日志器，推荐传入__name__（模块名），便于定位日志来源
    
    Args:
        name: 日志器名称，通常为__name__
    
    Returns:
        logging.Logger: 配置好的日志器
    """
    return logging.getLogger(f"my_package.{name}")
```

**日志使用：项目模块中快速接入**

``` python
# src/my_package/core/main.py
from my_package.utils.logger import get_logger

# 获取日志器：传入__name__，日志中会显示模块路径
logger = get_logger(__name__)

def divide(a: int, b: int) -> float:
    try:
        result = a / b
        logger.debug(f"计算{a}/{b}，结果：{result}")  # DEBUG级别：调试细节，仅写入文件
        logger.info(f"完成除法计算：{a}/{b}={result}")  # INFO级别：正常业务日志，控制台+文件
        return result
    except ZeroDivisionError as e:
        logger.error(f"除法计算失败：{e}，参数a={a}, b={b}")  # ERROR级别：业务异常，控制台+文件
        raise

if __name__ == "__main__":
    logger.info("项目启动...")
    try:
        divide(10, 2)
        divide(10, 0)
    except Exception as e:
        logger.critical(f"项目运行出错，终止执行：{e}")  # CRITICAL级别：严重错误，控制台+文件
    logger.info("项目退出...")
```

