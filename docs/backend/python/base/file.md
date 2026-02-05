---
title: 文件操作
createTime: 2026/02/04 15:12:29
permalink: /backend/python/base-file/
---

开发中常需要读取 / 写入文件（如 txt、csv、json），Python 提供内置的`open()`函数实现文件操作，核心是**打开文件→操作文件（读 / 写）→关闭文件**，推荐使用**with语句自动关闭文件**，避免资源泄漏。

## 文件打开模式

`open()`函数的语法：`open(文件路径, 模式, encoding="utf-8")`，其中模式决定了文件的操作方式，核心模式如下（常用r、w、a）：


| 模式 | 说明 | 若文件不存在 | 是否覆盖原有内容 |
| -- | -- | -- | -- |
| r | 只读（默认） | 报错 | - |
| w | 只写（文本模式） | 创建新文件 | 是（覆盖原有内容） |
| a | 追加（文本模式） | 创建新文件 | 否（在末尾添加） |
| r+ | 读写 | 报错 | 是（从开头写入） |
| w+ | 写读 | 创建新文件 | 是 |
| a+ | 追加读 | 创建新文件 | 否 |
| b | 二进制模式（如图片、视频） | - | - |


- `encoding="utf-8"`：指定文件编码，避免中文乱码（必须指定，尤其是 Windows 系统）；
- 二进制模式：与文本模式结合使用（如`rb`、`wb`、`ab`），用于操作非文本文件（图片、视频、压缩包）。

## 核心操作：读文件 & 写文件

**推荐方式：with 语句**

`with`语句会在代码块执行结束后**自动关闭文件**，无需手动调用`close()`，即使操作过程中报错，也会保证文件关闭，是 Python 文件操作的**标准方式**。

**读文件：3 种常用方法**

- `read()`：读取**整个文件**的内容，返回字符串；
- `readline()`：**读取一行**内容，返回字符串，多次调用读取下一行；
- `readlines()`：**读取所有行，返回列表**，每行作为列表的一个元素。

**写文件：2 种常用方法**

- write(内容)：写入**单个字符串**；
- writelines(列表)：批量写入**多个字符串**（列表中的每个元素为字符串）；

::: warning 注意
写文件时，`\n`表示**换行**，需手动添加。
:::


## 代码示例（文本文件操作）

**示例 1：读文件（读取 txt 文件内容）**

假设存在文件`test.txt`，内容为：

``` plaintext
Python基础文档
Hello World
123456
```

读取代码：

``` python
# 读文件：with + open，模式r，编码utf-8
file_path = "test.txt"  # 文件路径（同目录下直接写文件名，否则写绝对路径）
with open(file_path, "r", encoding="utf-8") as f:
    # 方法1：读取全部内容
    content = f.read()
    print("读取全部内容：")
    print(content)
    
    # 方法2：读取一行（需重新打开文件，或文件指针回到开头）
with open(file_path, "r", encoding="utf-8") as f:
    line1 = f.readline()
    line2 = f.readline()
    print("\n读取前两行：")
    print(line1.strip())  # strip()去除换行符和空格
    print(line2.strip())
    
    # 方法3：读取所有行，返回列表
with open(file_path, "r", encoding="utf-8") as f:
    lines = f.readlines()
    print("\n读取所有行（列表）：")
    print(lines)  # 输出：['Python基础文档\n', 'Hello World\n', '123456\n']
    # 遍历每行并去除换行符
    for line in lines:
        print(line.strip())
```

**示例 2：写文件（写入内容到 txt 文件）**

``` python
# 方法1：w模式，覆盖写入（文件不存在则创建）
with open("write1.txt", "w", encoding="utf-8") as f:
    f.write("Python文件操作\n")  # 写入单行，\n换行
    f.write("w模式：覆盖写入\n")
    # 批量写入
    lines = ["第一行\n", "第二行\n", "第三行"]
    f.writelines(lines)

# 方法2：a模式，追加写入（在文件末尾添加，不覆盖）
with open("write1.txt", "a", encoding="utf-8") as f:
    f.write("\na模式：追加写入的内容")

print("文件写入完成")
```

执行后生成`write1.txt`，内容为：

``` plaintext
Python文件操作
w模式：覆盖写入
第一行
第二行
第三行
a模式：追加写入的内容
```


## 绝对路径与相对路径

- 相对路径：以当前程序所在目录为基准，如`test.txt`（同目录）、`data/test.txt`（当前目录下的 data 子目录）；
- 绝对路径：文件的完整路径，如 Windows 的`C:/Users/xxx/Desktop/test.txt`，macOS/Linux 的`/Users/xxx/Desktop/test.txt`；

::: warning 注意
Windows 路径中的反斜杠`\`需转义为`\\`，或使用原始字符串r"路径"，避免报错：
:::

