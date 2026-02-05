---
title: 基础编程规范
createTime: 2026/02/04 15:34:57
permalink: /backend/python/base-pep8/
badge: PEP8
---

PEP8 是 Python 官方的代码风格指南，遵循规范能让代码更整洁、易读，是团队协作和个人开发的基本要求，核心规范如下：

1. **缩进：**用 `4` 个空格作为缩进，禁止空格和 Tab 混用；
2. **行宽：**每行代码不超过 `80` 个字符，过长可使用\或括号换行；
3. **命名：**
    - 变量 / 函数 / 方法：小写字母，多个单词用下划线分隔（如`user_name`、`calc_sum`）；
    - 类：大驼峰命名，每个单词首字母大写（如`Person`、`Student`）；
    - 常量：全大写，多个单词用下划线分隔（如`MAX_AGE`、`PI`）；
4. **空行：**
    - 函数 / 类之间用 `2` 个空行分隔；
    - 函数内部不同逻辑块之间用 `1` 个空行分隔；
5. **注释：**
    - 单行注释：`#`后加`一个空格`，注释内容与代码隔一行（必要时可行尾注释）；
    - 多行注释：用`三个双引号``"""`，放在函数 / 类的开头（文档字符串）；
6. **运算符：**赋值、算术、比较运算符两侧各加一个空格（如`a = 10`、`a + b`、`a > b`）；
7. **导入：**
    - 导入语句放在**文件开头**，按 “**标准库→第三方库→自定义库**” 顺序，之间用空行分隔；
    - 避免导入无用的模块，如import os后未使用 os；
8. **其他：**行尾不添加多余的空格，避免使用中文变量名，函数 / 方法的参数逗号后加一个空格。

**规范代码示例：**

``` python
# 标准库导入（按字母序排列，符合PEP8）
import os
import sys

# 第三方库导入（示例，注释占位）
# import numpy as np

# 自定义库导入（示例，注释占位）
# from my_module import test

# 常量（全大写蛇形，符合PEP8）
MAX_AGE = 150


# 顶层类定义前加两个空行（PEP8要求）
class Person:
    """人类类，包含姓名、年龄属性。"""  # 补充句点
    def __init__(self, name, age):
        self.name = name
        self.age = age

    # 类内方法间加一个空行（正确，无需修改）
    def check_age(self):
        """验证年龄是否合法。"""  # 补充句点
        # 比较运算符两侧补空格（PEP8要求）
        if self.age < 0 or self.age > MAX_AGE:
            return False
        return True


# 顶层函数定义前加两个空行（PEP8要求）
def calc_sum(a, b):
    """计算两个数的和。  # 补充句点
    参数：
        a (int/float)：第一个数
        b (int/float)：第二个数
    返回：
        int/float：两个数的和
    """
    if not isinstance(a, (int, float)) or not isinstance(b, (int, float)):
        raise TypeError("参数必须是数字类型")
    return a + b


# 主程序入口（规范，无需修改）
if __name__ == "__main__":
    p = Person("张三", 18)
    print(p.check_age())

    result = calc_sum(10, 20)
    print(f"10 + 20 = {result}")
```