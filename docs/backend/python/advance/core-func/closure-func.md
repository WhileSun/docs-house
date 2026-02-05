---
title: 闭包函数
createTime: 2026/02/05 16:43:34
permalink: /backend/python/advance-core-func/closure-func/
---


## 核心定义

**嵌套函数**引用**外部函数的非全局变量**，且外部函数返回该嵌套函数，此时嵌套函数称为闭包。


## 核心特性

- **状态持久化**：外部函数执行完毕后，其非全局变量仍被闭包保留，不会被垃圾回收；
- **数据私有化**：外部无法直接访问闭包引用的变量，仅能通过闭包函数操作，保证数据安全性；
- **实例独立**：不同闭包实例的变量相互独立，无共享。


## 实战示例

``` python
# 场景1：自定义计数器，实现计数功能，数据私有化
def counter(init: int = 0):
    """闭包实现计数器，init为初始值"""
    count = init  # 外部函数的非全局变量，被闭包引用
    # 嵌套函数：闭包
    def increment(step: int = 1):
        nonlocal count  # 声明count不是局部变量，而是外部函数的变量
        count += step
        return count
    # 返回闭包，不执行
    return increment

# 创建两个闭包实例，相互独立
c1 = counter(0)
c2 = counter(10)
print(c1(1))  # 1
print(c1(2))  # 3
print(c2(1))  # 11
print(c2(2))  # 13

# 场景2：固定函数的部分参数，实现函数模板（类似functools.partial）
def make_adder(x: int):
    """创建一个固定加数x的加法函数"""
    def adder(y: int):
        return x + y
    return adder

# 固定加数为10和20，创建两个加法函数
add10 = make_adder(10)
add20 = make_adder(20)
print(add10(5))  # 15
print(add20(5))  # 25
```


## 关键语法：nonlocal

- 闭包中若需**修改**外部函数的变量，需用`nonlocal`声明（表示该变量不是闭包的局部变量）；
- 若仅**访问**外部函数的变量，无需**nonlocal**声明；
- `nonlocal`与`global`的区别：`nonlocal`引用外部函数的变量，`global`引用全局变量。


## 核心场景

装饰器实现、工厂函数、自定义计数器、固定参数的函数模板、数据私有化的简单实现（无需定义类）。