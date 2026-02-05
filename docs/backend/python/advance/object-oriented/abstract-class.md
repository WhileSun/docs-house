---
title: 抽象基类
createTime: 2026/02/05 16:02:31
permalink: /backend/python/advance-object-oriented/abstract-class/
---


## 核心作用

通过`abc.ABC`和`@abstractmethod`定义**抽象基类（Abstract Base Class）**，实现接口规范：

1. 抽象基类**无法实例化**；
2. 子类**必须实现所有抽象方法**，否则无法实例化；
3. 可定义公共方法，让子类继承复用。


## 核心痛点

团队开发中，若父类仅定义方法名无实现，子类可能遗漏方法实现，导致运行时报错，抽象基类可将**运行时错误提前到实例化阶段**，强制子类遵循接口规范。


## 实战示例

``` python
from abc import ABC, abstractmethod

# 抽象基类：继承ABC，包含抽象方法（无实现）+ 公共方法（有实现）
class Animal(ABC):
    """动物抽象基类，定义统一的接口规范"""
    def __init__(self, name: str):
        self.name = name

    # 抽象方法：@abstractmethod装饰，无实现体，pass可选
    @abstractmethod
    def speak(self):
        """发出叫声：子类必须实现"""
        pass

    @abstractmethod
    def move(self):
        """移动方式：子类必须实现"""
        pass

    # 公共方法：有实现体，子类可直接继承复用
    def eat(self, food: str):
        """进食：所有动物的通用行为，子类无需重新实现"""
        print(f"{self.name}正在吃{food}")

# 子类1：实现所有抽象方法，可正常实例化
class Dog(Animal):
    def speak(self):
        print(f"{self.name}：汪汪汪")

    def move(self):
        print(f"{self.name}：跑")

# 子类2：未实现所有抽象方法（缺少move），无法实例化
# class Cat(Animal):
#     def speak(self):
#         print(f"{self.name}：喵喵喵")

# 使用：抽象基类无法实例化，子类实现所有抽象方法后可正常使用
if __name__ == "__main__":
    # a = Animal("动物")  # TypeError：无法实例化抽象基类
    dog = Dog("旺财")
    dog.speak()  # 旺财：汪汪汪
    dog.move()   # 旺财：跑
    dog.eat("骨头")  # 旺财正在吃骨头（继承公共方法）
    # cat = Cat("咪咪")  # TypeError：未实现抽象方法move
```


## 核心场景

框架开发、团队协作、定义统一的接口规范（如数据库操作基类、爬虫解析基类、任务执行基类），保证子类的一致性和可维护性。