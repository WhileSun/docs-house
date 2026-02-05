---
title: itertools
createTime: 2026/02/05 14:51:32
permalink: /backend/python/advance-data-structure/itertools/
---


## 核心特性

提供一系列**惰性迭代器**，支持笛卡尔积、排列、组合、链式迭代等复杂迭代逻辑，内存占用极低（按需生成元素），比纯 Python 手动实现更高效。


## 高频方法实战

``` python
import itertools

# 1. chain：链式迭代 → 将多个可迭代对象合并为一个，惰性迭代
a = [1,2,3]
b = ("a", "b")
c = "xyz"
for elem in itertools.chain(a, b, c):
    print(elem, end=" ")  # 1 2 3 a b x y z

# 2. product：笛卡尔积 → 多个可迭代对象的所有组合，等价于嵌套循环
for x, y in itertools.product([1,2], ["a","b"]):
    print((x, y), end=" ")  # (1,a) (1,b) (2,a) (2,b)

# 3. permutations：排列 → 从可迭代对象中取k个元素的所有排列（有序，不重复）
for p in itertools.permutations([1,2,3], 2):
    print(p, end=" ")  # (1,2) (1,3) (2,1) (2,3) (3,1) (3,2)

# 4. combinations：组合 → 从可迭代对象中取k个元素的所有组合（无序，不重复）
for c in itertools.combinations([1,2,3], 2):
    print(c, end=" ")  # (1,2) (1,3) (2,3)

# 5. repeat：重复生成元素 → 生成n个相同元素，惰性迭代
for r in itertools.repeat("Python", 3):
    print(r, end=" ")  # Python Python Python

# 6. cycle：无限循环 → 无限迭代可迭代对象，需手动终止
# for elem in itertools.cycle([1,2]):
#     print(elem, end=" ")
#     if some_condition:
#         break
```


## 核心场景

笛卡尔积组合、排列组合计算、多数据集合并迭代、无限序列生成、嵌套循环简化。