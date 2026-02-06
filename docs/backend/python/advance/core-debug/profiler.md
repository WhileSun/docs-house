---
title: 性能分析
createTime: 2026/02/06 15:02:33
permalink: /backend/python/advance-core-debug/profiler/
---


- `line_profiler`：**按行分析函数执行时间**，适合定位函数内哪一行代码耗时最长；
- `memory_profiler`：**按行分析内存使用**，适合定位内存泄漏问题。

``` bash
# 安装
pip install line_profiler==4.1.1 memory_profiler==0.61.0 -i https://mirrors.aliyun.com/pypi/simple/
```

**使用示例**

``` python
# src/my_package/utils/performance.py
from line_profiler import profile
from memory_profiler import profile as mem_profile

# 按行分析执行时间
@profile
def calc_sum(n: int) -> int:
    total = 0
    for i in range(n):
        total += i
    return total

# 按行分析内存使用
@mem_profile
def create_list(n: int) -> list:
    return [i for i in range(n)]

if __name__ == "__main__":
    calc_sum(1000000)
    create_list(1000000)
```

**运行命令**

``` bash
kernprof -l -v src/my_package/utils/performance.py  # line_profiler
python -m memory_profiler src/my_package/utils/performance.py  # memory_profiler
```