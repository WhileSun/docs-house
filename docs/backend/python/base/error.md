---
title: 异常处理
createTime: 2026/02/04 15:25:44
permalink: /backend/python/base-error/
---

程序运行过程中，因**语法错误、逻辑错误、外部因素**（如文件不存在、网络中断）导致的程序崩溃，称为异常（如`FileNotFoundError`、`ZeroDivisionError`）。Python 提供`try-except-finally`语句捕获并处理异常，让程序在出现异常时不崩溃，而是优雅处理。


## 常见内置异常

Python 内置了大量异常类型，对应不同的错误场景，常见的有：

| 异常类型 | 说明 |
| -- | -- |
| SyntaxError | 语法错误（代码写的不符合 Python 规范，运行前就报错） |
| NameError | 命名错误（使用了未定义的变量 / 函数） |
| TypeError | 类型错误（对不同类型执行不支持的操作，如 1+"2"） |
| ZeroDivisionError | 除零错误（除数为 0，如 10/0） |
| FileNotFoundError | 文件未找到错误（打开不存在的文件，模式 r） |
| IndexError | 索引错误（访问列表 / 元组的不存在索引） |
| KeyError | 键错误（访问字典的不存在键） |


## 异常处理核心语法

Python 通过`try-except-else-finally`捕获处理异常，各部分作用如下，其中`try`和`except`是**必须**的，`else`和`finally`是**可选**的。

``` python
try:
    # 尝试执行的代码块（可能出现异常的代码）
    可能报错的代码
except 异常类型1:
    # 捕获到异常类型1时，执行的代码块
    异常处理逻辑1
except 异常类型2:
    # 捕获到异常类型2时，执行的代码块
    异常处理逻辑2
except:
    # 捕获所有未指定的异常（万能异常，不推荐单独使用）
    通用异常处理逻辑
else:
    # 当try代码块**没有出现任何异常**时，执行的代码块
    无异常时的逻辑
finally:
    # 无论try代码块是否出现异常，**都会执行**的代码块
    必须执行的逻辑（如关闭文件、释放资源）
```


## 代码示例（捕获不同类型的异常）

``` python
# 示例1：捕获除零错误和类型错误
try:
    a = int(input("请输入被除数："))
    b = int(input("请输入除数："))
    result = a / b
    print(f"{a}/{b}={result}")
except ZeroDivisionError:
    print("错误：除数不能为0")
except ValueError:
    print("错误：请输入有效的整数")
else:
    print("计算成功，无异常")
finally:
    print("无论是否异常，都会执行这行代码")

# 示例2：捕获文件未找到错误
file_path = "none.txt"  # 不存在的文件
try:
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
except FileNotFoundError:
    print(f"错误：文件{file_path}不存在")
except Exception as e:  # Exception是所有异常的父类，捕获所有异常并获取错误信息
    print(f"未知错误：{e}")  # e是错误信息
finally:
    print("文件操作结束")

# 示例3：捕获索引错误和键错误
try:
    nums = [1,2,3]
    print(nums[5])  # 索引错误
    user = {"name":"张三"}
    print(user["age"])  # 键错误
except IndexError as e:
    print(f"索引错误：{e}")
except KeyError as e:
    print(f"键错误：{e}")
```


## 手动抛出异常：raise

除了 Python 自动抛出的异常，开发者也可通过`raise`关键字**手动抛出异常**，适用于自定义业务规则的场景（如年龄不能为负数）。

``` python
# 手动抛出异常：判断年龄是否合法
def check_age(age):
    if not isinstance(age, int):
        raise TypeError("年龄必须是整数")  # 抛出类型错误
    if age < 0 or age > 150:
        raise ValueError("年龄必须在0-150之间")  # 抛出值错误
    print(f"年龄{age}合法")

# 调用函数，捕获手动抛出的异常
try:
    check_age(-5)
except (TypeError, ValueError) as e:
    print(f"年龄验证失败：{e}")  # 输出：年龄验证失败：年龄必须在0-150之间
```