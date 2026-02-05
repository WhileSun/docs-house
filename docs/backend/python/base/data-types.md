---
title: 变量与数据类型
createTime: 2026/02/04 10:08:04
permalink: /backend/python/base-data-types/
---

## 变量的定义与命名规则

变量是程序中存储数据的容器，Python`无需声明变量类型`，赋值即定义，类型由赋值的内容决定（动态类型）。

### 变量定义

``` python
# 语法：变量名 = 变量值（等号 = 是赋值运算符，不是数学中的等号）
age = 18  # 整数类型变量
name = "张三"  # 字符串类型变量
score = 95.5  # 浮点数类型变量
is_student = True  # 布尔类型变量
```

### 强制命名规则（必须遵守，否则报错）

1. 由字母（a-z/A-Z）、数字（0-9）、下划线（_）组成；
2. 不能以数字开头；
3. 不能使用 **Python关键字**（如 if、for、while、def、class 等，共 35 个，系统保留用于语法）；
4. 严格区分**大小写**（如 Name 和 name 是两个不同的变量）。

### 推荐命名规范（PEP8 规范，行业通用）

1. 变量名小写，多个单词用下划线分隔（如`student_name`、`user_age`）；
2. 见名知意，避免使用 a、b、c 等无意义的变量名；
3. 不使用中文和特殊字符（如 @、#、$ 等）。


**错误示例（会报错 / 不推荐）:**

``` python
1age = 18  # 错误：以数字开头
if = 20    # 错误：使用关键字
学生姓名 = "李四"  # 不推荐：使用中文
UserAge = 22  # 不推荐：驼峰命名（Python推荐下划线命名）
```


## 五大基本数据类型

Python 内置五大常用基础数据类型，覆盖绝大多数基础开发场景，可通过type(变量名)查看变量类型。

| 类型名称 | 英文标识 | 说明 | 示例 |
| -- | -- | -- | -- |
| 整数 | int | 正整数、负整数、0，无大小限制 | a=18、b=-5、c=0 |
| 浮点数 | float | 小数，包含正浮点数、负浮点数 | x=95.5、y=-3.14 |
| 字符串 | str | 字符序列，用单 / 双 / 三引号包裹 | s1="Python"、s2='hello' |
| 布尔值 | bool | 只有两个值：True（真）、False（假） | flag=True、is_ok=False |
| 空值 | NoneType | 表示空，只有一个值：None（注意首字母大写） | res=None |

**代码示例：**

``` python
# 定义不同类型的变量
num1 = 100
num2 = 3.14159
str1 = "Python基础文档"
str2 = '单引号也可以'
bool1 = True
bool2 = False
null_var = None

# 用type()查看类型，print()输出结果
print(type(num1))   # 输出：<class 'int'>
print(type(num2))   # 输出：<class 'float'>
print(type(str1))   # 输出：<class 'str'>
print(type(bool1))  # 输出：<class 'bool'>
print(type(null_var))# 输出：<class 'NoneType'>
```

## 类型转换

开发中常需要将一种数据类型转为另一种，Python 提供**内置转换函数**，核心转换为：`int()`、`float()`、`str()`、`bool()`，转换规则简单直观。

``` python
# 1. 其他类型转整数（int()）：浮点数转整数会舍弃小数部分，纯数字字符串可转
print(int(3.99))    # 输出：3（舍弃小数，不是四舍五入）
print(int("123"))   # 输出：123
# print(int("123.45"))  # 报错：非纯数字字符串不能转int
# print(int("abc"))    # 报错：非数字字符串不能转int

# 2. 其他类型转浮点数（float()）：整数转浮点数末尾加.0，纯数字字符串可转
print(float(18))    # 输出：18.0
print(float("95.5"))# 输出：95.5
print(float("100")) # 输出：100.0

# 3. 其他类型转字符串（str()）：所有类型都能转，直接包裹为字符串
print(str(18))      # 输出："18"
print(str(3.14))    # 输出："3.14"
print(str(True))    # 输出："True"
print(str(None))    # 输出："None"

# 4. 其他类型转布尔值（bool()）：空/0为False，其余为True
print(bool(0))      # 输出：False
print(bool(""))     # 输出：False（空字符串）
print(bool(None))   # 输出：False
print(bool(18))     # 输出：True
print(bool("hello"))# 输出：True
print(bool([1,2]))  # 输出：True（非空列表）
```

