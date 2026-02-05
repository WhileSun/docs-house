---
title: 属性管理
createTime: 2026/02/05 15:52:18
permalink: /backend/python/advance-object-oriented/property/
---


## 核心痛点

传统的`get_xxx()`/`set_xxx()`方法访问属性，语法繁琐（如`obj.get_age()`），`@property`装饰器可将方法转为**属性访问**（如`obj.age`），同时实现**只读 / 可写 / 参数校验**，兼顾简洁性和数据安全性。


## 核心实战

``` python
class Person:
    """人物类，演示@property的使用"""
    def __init__(self, name: str, age: int, gender: str):
        # 单下划线_：Python约定俗成的**受保护属性**，表示不建议外部直接访问/修改
        self._name = name
        self._age = age
        self._gender = gender

    # 场景1：只读属性 → 仅定义@property，不定义setter
    @property
    def name(self) -> str:
        """姓名：只读属性，无法修改"""
        return self._name

    # 场景2：可写属性 + 参数校验 → 定义@property + 对应的@xxx.setter
    @property
    def age(self) -> int:
        """年龄：可写，带范围校验"""
        return self._age

    @age.setter
    def age(self, value: int):
        # 参数类型校验
        if not isinstance(value, int):
            raise TypeError(f"年龄必须是整数，当前为{type(value).__name__}")
        # 参数范围校验
        if value < 0 or value > 150:
            raise ValueError("年龄必须在0-150之间")
        self._age = value

    # 场景3：派生属性 → 由其他属性计算得到，无对应的私有属性，只读
    @property
    def info(self) -> str:
        """个人信息：派生属性，由name/age/gender计算得到"""
        return f"姓名：{self._name}，年龄：{self._age}，性别：{self._gender}"

# 使用：属性访问语法，简洁且安全
if __name__ == "__main__":
    p = Person("张三", 18, "男")
    # 访问只读属性
    print(p.name)  # 张三
    # 访问可写属性
    print(p.age)   # 18
    p.age = 20     # 正常修改，校验通过
    print(p.age)   # 20
    # 访问派生属性
    print(p.info)  # 姓名：张三，年龄：20，性别：男

    # 触发异常：测试参数校验
    # p.age = "25"  # TypeError：年龄必须是整数
    # p.age = 200   # ValueError：年龄必须在0-150之间
    # p.name = "李四"# AttributeError：无法设置只读属性
```


## 核心优势

- 外部访问语法不变（`实例.属性`），无侵入式提升代码安全性；
- 隐藏内部实现细节，若后续需要修改属性逻辑，无需修改外部调用代码；
- 支持派生属性（由其他属性计算得到），简化属性访问。


## 命名规范

私有属性：**双下划线__**（真正的私有，Python 会做名称改写，外部无法直接访问），如`self.__name`；
受保护属性：**单下划线_**（约定俗成的私有，外部可访问但不建议），如`self._name`；
公共属性：**无下划线**，如`self.name`（通常由`@property`包装）。