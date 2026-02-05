---
title: 高阶函数
createTime: 2026/02/05 16:38:33
permalink: /backend/python/advance-core-func/advance-func/
---


## 核心定义

接收一个或多个函数作为参数，或返回一个函数的函数，称为高阶函数，Python 内置多个高频高阶函数，可直接替代简单循环，提升代码简洁性。


## 内置三大核心高阶函数（map/filter/reduce）

``` python
from functools import reduce
from typing import Iterable

# 原始数据
nums = [1, 2, 3, 4, 5]

# 1. map：将函数应用于可迭代对象的每个元素，返回惰性迭代器
# 功能：对nums中每个元素求平方
map_res = map(lambda x: x ** 2, nums)
print(list(map_res))  # [1, 4, 9, 16, 25]

# 2. filter：根据函数返回值过滤可迭代对象，返回惰性迭代器
# 功能：过滤nums中的偶数
filter_res = filter(lambda x: x % 2 == 0, nums)
print(list(filter_res))  # [2, 4]

# 3. reduce：将函数累积应用于可迭代对象，返回单个值
# 功能1：计算nums中所有元素的和
reduce_sum = reduce(lambda x, y: x + y, nums)
print(reduce_sum)  # 15
# 功能2：计算nums中所有元素的积，指定初始值1
reduce_mul = reduce(lambda x, y: x * y, nums, 1)
print(reduce_mul)  # 120
```


## 使用原则

- 结合**匿名函数 lambda**使用，简化简单逻辑；
- 聚焦 “做什么” 而非 “怎么做”，替代 1-3 行的简单循环；
- 若逻辑复杂（超过 1 行），建议使用普通循环，提升代码可读性。