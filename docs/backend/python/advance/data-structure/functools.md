---
title: functools
createTime: 2026/02/05 14:56:18
permalink: /backend/python/advance-data-structure/functools/
---


## lru_cache → 函数结果缓存

**核心作用**

**缓存纯函数**（输入相同则输出相同，无副作用、无外部依赖）的调用结果，避免重复计算，大幅提升高频调用函数的执行效率；

**纯函数判定**

无全局变量依赖、无文件 / 网络 IO、参数相同则返回值必相同（如数学计算、递归函数）；


``` python
from functools import lru_cache

# 无缓存：递归效率极低，n=30即耗时明显，n=100几乎无法执行
def fib(n: int) -> int:
    if n <= 1:
        return n
    return fib(n-1) + fib(n-2)

# 有缓存：lru_cache(maxsize=None) 表示无限制缓存，所有结果都缓存
@lru_cache(maxsize=None)
def fib_cached(n: int) -> int:
    if n <= 1:
        return n
    return fib_cached(n-1) + fib_cached(n-2)

# 性能差距极大
print(fib_cached(100))  # 瞬间出结果 → 354224848179261915075
# print(fib(100))       # 耗时极长，几乎无响应
```

**核心参数**

`maxsize`（最大缓存数，None 为无限制）、`typed`（是否区分参数类型，如 True 则 `1` 和 `1.0` 视为不同参数）；

**核心场景**

递归函数、高频调用的工具函数、数学计算函数、无状态接口的结果缓存。

