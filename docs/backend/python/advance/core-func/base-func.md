---
title: 函数一等对象特性
createTime: 2026/02/05 16:32:56
permalink: /backend/python/advance-core-func/base-func/
---

## 核心原理

Python 中**函数是一等对象（First-Class Object）**，即函数可以：

1. 赋值给变量；
2. 作为参数传递给其他函数；
3. 作为函数的返回值；
4. 作为容器（列表 / 字典 / 集合）的元素。


## 实战示例

``` python
def add(a: int, b: int) -> int:
    return a + b

# 1. 赋值给变量
f = add
print(f(1, 2))  # 3

# 2. 作为参数传递给其他函数
def calc(func, x: int, y: int) -> int:
    return func(x, y)

print(calc(add, 3, 4))  # 7

# 3. 作为函数的返回值
def get_operate(op: str):
    if op == "add":
        return add
    elif op == "sub":
        return lambda x, y: x - y
    else:
        raise ValueError("不支持的操作")

add_func = get_operate("add")
print(add_func(5, 6))  # 11

# 4. 作为容器的元素
func_dict = {
    "add": add,
    "mul": lambda x, y: x * y
}
print(func_dict["mul"](2, 3))  # 6
```


## 核心意义

函数一等对象是**高阶函数、装饰器、闭包**的基础，也是 Python 函数式编程的核心前提。