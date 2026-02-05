---
title: MRO 与多继承
createTime: 2026/02/05 16:11:57
permalink: /backend/python/advance-object-oriented/mro-extend/
---


## 核心概念

- **多继承**：一个子类继承多个父类，Python 支持多继承，但易出现**钻石继承**（多个父类继承同一个基类）导致的方法调用冲突；

- **MRO（Method Resolution Order）**：子类调用方法时的**父类查找顺序**，Python3 采用**C3 算法**，彻底解决钻石继承问题，遵循 3 大原则：

    1. 子类先于父类查找；
    2. 父类按继承顺序查找；
    3. 同一基类仅最后访问一次。


## 核心要点

1. **查看 MRO**：通过类名`.__mro__`或`type`(类名)查看，返回元组，按查找顺序排列；
2. **super () 原理**：并非简单调用 “父类方法”，而是**按 MRO 顺序查找下一个类的方法**，这是解决多继承方法冲突的核心；
3. **使用原则：优先使用组合替代多继承**（组合更简单、易维护），若必须使用多继承，需明确 MRO 顺序，避免方法调用冲突。


## 实战示例

``` python
# 钻石继承结构：D → B → C → A → object
class A:
    def func(self):
        print("A.func")

class B(A):
    def func(self):
        print("B.func")
        super().func()  # 按MRO查找下一个类的func，而非直接调用A.func

class C(A):
    def func(self):
        print("C.func")
        super().func()  # 按MRO查找下一个类的func

class D(B, C):
    def func(self):
        print("D.func")
        super().func()  # 按MRO查找下一个类的func

# 查看D的MRO顺序：D → B → C → A → object
print(D.__mro__)
# 输出：(<class '__main__.D'>, <class '__main__.B'>, <class '__main__.C'>, <class '__main__.A'>, <class 'object'>)

# 调用D的func：按MRO顺序执行
d = D()
d.func()
# 输出顺序：D.func → B.func → C.func → A.func
# 说明：super()在B中调用的是C的func，而非A的func，符合MRO顺序
```

**多继承替代方案：组合**

组合是 “把其他类的实例作为当前类的属性”，**比多继承更灵活、易维护，遵循**“多用组合，少用继承” 的 Python 设计原则。

``` python
# 组合实现：将B和C的实例作为D的属性，调用其方法
class A:
    def func(self):
        print("A.func")

class B(A):
    def func(self):
        print("B.func")
        super().func()

class C(A):
    def func(self):
        print("C.func")
        super().func()

class D:
    def __init__(self):
        self.b = B()  # 组合B的实例
        self.c = C()  # 组合C的实例

    def func(self):
        print("D.func")
        self.b.func()  # 调用B的func
        self.c.func()  # 调用C的func

# 使用：组合方式更清晰，无MRO冲突问题
d = D()
d.func()
# 输出：
# D.func
# B.func
# A.func
# C.func
# A.func
```
