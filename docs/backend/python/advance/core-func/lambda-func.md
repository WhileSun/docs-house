---
title: 匿名函数
createTime: 2026/02/05 16:50:28
permalink: /backend/python/advance-core-func/lambda-func/
---


## 核心语法

``` python
lambda 参数列表: 表达式
```

- **参数列表**：支持任意参数（位置参数 / 关键字参数 / 默认参数 / 可变参数），与普通函数一致；
- **表达式**：仅支持单个表达式，无语句（如 `if/for/while`），表达式的结果即为返回值，无需return；
- **返回值**：返回一个函数对象，可赋值给变量，或直接作为高阶函数的参数。


## 实战示例

``` python
# 1. 基础使用：赋值给变量，替代简单函数
add = lambda x, y: x + y
print(add(1, 2))  # 3

# 2. 带默认参数
pow2 = lambda x, exp=2: x ** exp
print(pow2(3))    # 9
print(pow2(3, 3)) # 27

# 3. 可变参数
sum_all = lambda *args: sum(args)
print(sum_all(1,2,3))  # 6

# 4. 核心场景：作为高阶函数的参数（map/filter/sort/sorted）
nums = [(1, 3), (4, 1), (2, 2)]
# 按元组的第二个元素排序
nums.sort(key=lambda x: x[1])
print(nums)  # [(4, 1), (2, 2), (1, 3)]

# 按元组的第一个元素降序排序
sorted_nums = sorted(nums, key=lambda x: x[0], reverse=True)
print(sorted_nums)  # [(4, 1), (2, 2), (1, 3)]
```


## 使用原则（核心：极简使用，避免滥用）

- **仅用于单行简单逻辑**，如高阶函数参数、简单计算，代码行数不超过 1 行；
- **避免赋值后复杂使用**，若需要多次调用或逻辑复杂，用def定义普通函数（可添加文档字符串、异常处理）；
- **避免嵌套 lambda**，可读性极差；
- **避免在 lambda 中使用副作用**（如修改全局变量、文件 IO、网络请求），lambda 应是**纯函数**。