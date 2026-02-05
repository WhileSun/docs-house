---
title: 高级解包
createTime: 2026/02/05 10:20:09
permalink: /backend/python/advance-core-grammar/unpack/
---


## 核心作用

灵活拆分 / 合并序列（列表 / 元组 / 字符串）、字典，替代繁琐的索引 / 键访问，支持**可变长度解包**和**函数动态传参**，是 Pythonic 代码的基础特征。

## 实战场景示例

``` python
# 1. 序列可变解包：*接收剩余元素，_忽略无用元素（最常用）
a, *middle, c = [1, 2, 3, 4, 5]  # a=1, middle=[2,3,4], c=5
*_, last_char = "PythonAdvance"   # last_char='e'，忽略前N个元素
head, *tail = (10, 20, 30, 40)    # 链表/序列拆分，适合递归场景

# 2. 字典解包：**合并字典（后值覆盖前值），*解包键
base_config = {"timeout": 10, "encoding": "utf-8"}
custom_config = {"timeout": 30, "proxy": "127.0.0.1:8080"}
final_config = {**base_config, **custom_config}  # 合并后：{"timeout":30, "encoding":"utf-8", "proxy":"127.0.0.1:8080"}
print(*base_config)  # 解包键 → timeout encoding

# 3. 函数传参解包：适配任意参数的函数，无需手动拆包
def calc(x, y, z=0):
    return x + y + z

# 序列解包传位置参数，字典解包传关键字参数
print(calc(*[1, 2]))          # 等价于calc(1,2) → 3
print(calc(**{"x":1, "y":2})) # 等价于calc(x=1,y=2) → 3
print(calc(*[1,2], **{"z":3}))# 混合解包 → 6
```

## 核心场景

批量赋值、函数动态传参（如接收任意参数的工具函数）、数据拆分 / 合并、字典配置合并、序列高效切片。

## 避坑要点

- 序列解包时，`*` 只能出现一次，否则会报语法错误；
- 字典解包仅支持 `Python3.5+`，低版本需用`dict.update()`替代。