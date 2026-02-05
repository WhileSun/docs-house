---
title: 魔法方法
createTime: 2026/02/05 15:16:02
permalink: /backend/python/advance-object-oriented/special-methods/
---


## 核心定位

以`__xx__`命名的 Python 内置特殊方法，无需手动调用，由 Python 解释器自动触发（如实例化`__init__`、打印`__str__`、长度计算`__len__`），是让自定义类拥有内置类型行为的核心，也是 Pythonic 类设计的关键。


## 常用魔法方法

| 魔法方法             | 触发场景                | 核心作用                                   | 返回值要求                                       |
| ------------------- | ----------------------- | ------------------------------------------ | ------------------------------------------------ |
| `__init__`          | Class(*args)            | 实例化时初始化属性                         | 无（None）                                        |
| `__str__`           | print(实例)/str(实例)    | 定义实例的用户友好字符串表示               | 字符串                                           |
| `__repr__`          | 交互式环境 /repr(实例)  | 定义实例的开发者友好字符串表示             | 字符串（推荐可直接实例化）                       |
| `__len__`           | len(实例)               | 让实例支持长度计算                       | 整数                                             |
| `__getitem__`       | 实例[key]               | 让实例支持索引 / 键访问                   | 任意类型（按业务需求）                           |
| `__setitem__`       | 实例[key] = value       | 让实例支持索引 / 键赋值                   | 无（None）                                        |
| `__call__`          | 实例(*args)             | 让实例可被调用（像函数一样）               | 任意类型                                         |
| `__enter__`/`__exit__`| with 实例 as var        | 实现上下文管理器                           | __enter__返回资源，__exit__返回布尔（是否忽略异常）|


## 实战示例

``` python
class MyList:
    """自定义列表类，实现内置列表的核心行为"""
    def __init__(self, data: list):
        self._data = list(data)  # 私有属性，避免外部直接修改

    def __str__(self):
        """用户友好的字符串表示"""
        return f"MyList({self._data})"

    def __repr__(self):
        """开发者友好的字符串表示，推荐与__str__一致（简单类）"""
        return self.__str__()

    def __len__(self):
        """支持len(实例)"""
        return len(self._data)

    def __getitem__(self, key):
        """支持实例[key]索引/切片访问"""
        return self._data[key]

    def __setitem__(self, key, value):
        """支持实例[key] = value 索引/切片赋值"""
        self._data[key] = value

    def __call__(self):
        """支持实例()调用，返回列表内容"""
        return f"MyList内容：{self._data}"

# 使用：与内置列表行为一致，更具自定义性
if __name__ == "__main__":
    ml = MyList([1, 2, 3])
    print(ml)          # 触发__str__ → MyList([1,2,3])
    print(len(ml))     # 触发__len__ → 3
    print(ml[0])       # 触发__getitem__ → 1
    ml[1] = 10         # 触发__setitem__ → MyList([1,10,3])
    print(ml[:2])      # 支持切片 → [1,10]
    print(ml())        # 触发__call__ → MyList内容：[1,10,3]
```


## 设计原则

- `__str__`面向用户，简洁易懂；`__repr__`面向开发者，推荐定义为可直接实例化的字符串（如`MyList([1,2,3])`）；
- 仅实现业务需要的魔法方法，无需全部实现；
- 魔法方法的参数和返回值需遵循 Python 规范，避免自定义规则导致的使用混乱。