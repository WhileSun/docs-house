---
title: 上下文管理器
createTime: 2026/02/05 11:14:55
permalink: /backend/python/advance-core-grammar/context-manager/
---


## 核心作用

通过`with`语句实现**资源的自动申请与释放**，替代手动的`try/finally`代码块，彻底避免因忘记释放资源导致的**资源泄漏**（如文件句柄、数据库连接、网络连接、锁）。


## 核心原理

触发`with`语句时，自动调用`__enter__`方法申请资源；代码块执行完成（正常 / 异常）后，自动调用`__exit__`方法释放资源，**无论是否报错，`exit` 一定会执行**。


## 两种实现方式（覆盖所有开发场景）

``` python
# 方式1：类实现 → 重写__enter__和__exit__，适合复杂场景（如数据库连接、自定义资源）
class DBConnection:
    """自定义数据库连接上下文管理器"""
    def __init__(self, host: str, port: int):
        self.host = host
        self.port = port
        self.conn = None

    def __enter__(self):
        """申请资源：建立数据库连接"""
        print(f"建立连接：{self.host}:{self.port}")
        self.conn = f"DBConn-{self.host}:{self.port}"  # 模拟连接对象
        return self.conn  # 返回值赋值给with后的变量

    def __exit__(self, exc_type, exc_val, exc_tb):
        """释放资源：关闭数据库连接，处理异常"""
        print(f"关闭连接：{self.host}:{self.port}")
        self.conn = None
        # 异常处理：返回True则忽略异常，返回False则抛出异常（默认None→False）
        if exc_type:
            print(f"数据库操作异常：{exc_type.__name__} - {exc_val}")
            # return True  # 取消注释则忽略异常

# 方式2：装饰器实现 → @contextlib.contextmanager，生成器简化实现，适合简单场景（如文件、锁）
from contextlib import contextmanager

@contextmanager
def file_manager(file_path: str, mode: str = "r"):
    """文件操作上下文管理器（简化版）"""
    # 前半部分：等价于__enter__，申请资源
    f = open(file_path, mode, encoding="utf-8")
    try:
        yield f  # 返回资源，赋值给with后的变量；暂停执行，进入with代码块
    finally:
        # 后半部分：等价于__exit__，释放资源，无论是否报错都会执行
        f.close()
        print(f"文件【{file_path}】已关闭")

# 通用使用方式：with 上下文管理器 as 资源变量
if __name__ == "__main__":
    # 类实现使用
    with DBConnection("127.0.0.1", 3306) as db:
        print(f"执行数据库操作：{db}")
        # raise ValueError("数据插入失败")  # 模拟异常，测试__exit__异常处理

    # 装饰器实现使用
    with file_manager("test.txt", "w") as f:
        f.write("Python 进阶")
```


## 核心场景

文件操作、数据库连接（MySQL/Redis/MongoDB）、网络请求、线程 / 进程锁管理、自定义资源申请 / 释放


## 内置上下文管理器

Python 内置多个常用上下文管理器，直接使用即可，无需自定义：

- `open()`：文件操作（最常用）；
- `threading.Lock()`/`multiprocessing.Lock()`：锁管理；
- `socket.socket()`：网络连接；
- `contextlib.suppress()`：忽略指定异常（如with `suppress(FileNotFoundError)`:）。