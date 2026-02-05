---
title: 修饰器
createTime: 2026/02/05 10:24:13
permalink: /backend/python/advance-core-grammar/decorator/
---


## 核心定位

高阶函数的核心应用，实现 Python 的**面向切面编程（AOP）**，在**不修改原函数代码、不改变调用方式**的前提下，为函数添加额外功能，是框架开发（Flask/Django/FastAPI）和日常开发的高频特性。


## 核心实战：3 类常用装饰器（全覆盖开发场景）

所有装饰器均**保留原函数元信息**（`functools.wraps`），这是开发规范，避免`__name__/__doc__`被覆盖导致的调试问题。

``` python
import time
from functools import wraps
from typing import Callable

# 场景1：基础无参装饰器 → 日志/计时/简单校验（最常用）
def timer(func: Callable) -> Callable:
    """函数执行耗时统计装饰器"""
    @wraps(func)  # 必须加：保留原函数的__name__、__doc__、参数列表
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)  # 执行原函数
        cost_time = time.time() - start_time
        print(f"函数【{func.__name__}】执行耗时：{cost_time:.4f}秒")
        return result  # 必须返回原函数结果，避免调用方丢失返回值
    return wrapper

# 场景2：带参装饰器 → 自定义配置（如日志级别、缓存过期时间）
def logger(level: str = "INFO") -> Callable:
    """自定义日志级别的装饰器"""
    # 外层：接收装饰器参数
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            print(f"[{level}] 开始执行函数：{func.__name__}")
            result = func(*args, **kwargs)
            print(f"[{level}] 函数执行完成：{func.__name__}")
            return result
        return wrapper
    return decorator

# 场景3：带返回值校验的装饰器 → 数据校验/结果过滤
def return_int(func: Callable) -> Callable:
    """强制函数返回值为整数的装饰器"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        result = func(*args, **kwargs)
        if not isinstance(result, int):
            raise TypeError(f"函数【{func.__name__}】返回值必须为int，当前为{type(result)}")
        return result
    return wrapper

# 装饰器使用：@语法糖，支持多层嵌套（执行顺序：从下到上）
@timer
@logger(level="DEBUG")
@return_int
def add(a: int, b: int) -> int:
    """两数相加"""
    time.sleep(0.1)
    return a + b

# 调用方式不变，自动触发所有装饰器功能
add(1, 2)
# 输出：
# [DEBUG] 开始执行函数：add
# 函数【add】执行耗时：0.1005秒
# [DEBUG] 函数执行完成：add
```


## 装饰器叠加执行顺序

多层装饰器嵌套时，执行顺序为**从下到上**，如上述示例：`return_int` → `logger` → `timer`。


## 核心场景

日志记录、性能计时、接口缓存、权限校验、参数校验、异常捕获、函数执行次数限制。


## 进阶拓展：类装饰器

适合需要**维护状态**的装饰器（如计数、缓存），实现`__call__`魔法方法即可，示例：

``` python
class CountCall:
    """统计函数调用次数的类装饰器"""
    def __init__(self, func: Callable):
        self.func = func
        self.count = 0  # 维护调用次数状态
        wraps(func)(self)  # 保留原函数元信息

    def __call__(self, *args, **kwargs):
        self.count += 1
        print(f"函数【{self.func.__name__}】已调用{self.count}次")
        return self.func(*args, **kwargs)

@CountCall
def say_hello():
    return "Hello"

say_hello()  # 函数【say_hello】已调用1次 → Hello
say_hello()  # 函数【say_hello】已调用2次 → Hello
```