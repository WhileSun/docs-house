---
title: 循环语句和条件语句
createTime: 2026/02/04 14:31:49
permalink: /backend/python/base-condition-loop/
---

流程控制用于控制代码的执行顺序，核心分为==条件语句==（根据条件执行不同代码）和==循环语句==（重复执行某段代码），是 Python 逻辑开发的基础。

::: warning 关键注意
Python 的**缩进是语法**（不是格式），必须严格遵守！
:::

- 缩进表示代码块的归属（如 if/for/while 后的代码块）；
- 推荐用`4 个空格`作为缩进（PEP8 规范），**禁止空格和 Tab 混用**；
- 同一代码块的缩进必须一致，否则报错。


## 条件语句：if-elif-else

根据**条件的真假（True/False）** 执行不同的代码块，支持单条件、多条件、嵌套条件，核心关键字：`if`（如果）、`elif`（否则如果）、`else`（否则）。

**语法格式**

``` python
# 单条件
if 条件1:
    代码块1  # 条件1为True时执行，注意缩进

# 多条件
if 条件1:
    代码块1
elif 条件2:
    代码块2  # 条件1为False，条件2为True时执行
elif 条件3:
    代码块3
else:
    代码块4  # 所有条件都为False时执行

# 嵌套条件：if里面再嵌套if-elif-else
if 条件1:
    代码块1
    if 条件2:
        代码块2
    else:
        代码块3
else:
    代码块4
```

**代码示例（成绩等级判断）**

``` python
score = 85
# 多条件判断成绩等级
if score >= 90:
    print("优秀")
elif score >= 80:
    print("良好")
elif score >= 60:
    print("及格")
else:
    print("不及格")
# 输出：良好

# 嵌套条件
age = 17
if age < 18:
    print("未成年")
    if age < 6:
        print("幼儿")
    else:
        print("青少年")
else:
    print("成年")
# 输出：未成年 青少年
```


## 循环语句：for 循环 & while 循环

用于重复执行某段代码，直到满足终止条件，`for`循环适合**已知循环次数**的场景，`while`循环适合**未知循环次数**的场景，可通过`break`和`continue`控制循环流程。

### for 循环：遍历可迭代对象

Python 中**可迭代对象**包括：列表、元组、字典、集合、字符串、`range()`等，`for`循环的核心是**遍历**（逐个取出元素）

**核心语法 + 常用示例**

``` python
# 基础语法：for 变量 in 可迭代对象: 代码块
# 1. 遍历字符串
for char in "Python":
    print(char)  # 逐行输出：P y t h o n

# 2. 遍历列表
nums = [1,2,3,4]
for num in nums:
    print(num*2)  # 输出：2 4 6 8

# 3. range()函数：生成整数序列，语法range(起始, 结束, 步长)，左闭右开
# range(5) → 0,1,2,3,4（起始默认0，步长默认1）
# range(1,5) →1,2,3,4（结束5不包含）
# range(1,10,2) →1,3,5,7,9（步长2）
for i in range(5):
    print(i)  # 输出：0 1 2 3 4

# 4. 遍历字典（常用items()获取键值对）
user = {"name":"张三", "age":18}
for k, v in user.items():
    print(f"{k}:{v}")  # 输出：name:张三  age:18

# 5. 遍历集合（无序，输出顺序不固定）
s = {1,2,3}
for num in s:
    print(num)
```

### while 循环：条件满足则循环

只要`while`后的条件为 **True**，就会重复执行代码块，必须在循环内修改条件，否则会陷入**死循环**（无限执行）。

**核心语法 + 常用示例**

``` python
# 基础语法：while 条件: 代码块
# 示例1：计算1-10的和
sum_num = 0
i = 1
while i <= 10:
    sum_num += i  # 等价于sum_num = sum_num + i
    i += 1  # 必须修改i，否则死循环
print(sum_num)  # 输出：55

# 示例2：死循环（需避免，除非有break）
# while True:
#     print("无限执行")
```

### 循环控制：break & continue

- `break`：**立即终止整个循环**，跳出循环体，不再执行后续循环；
- `continue`：**跳过当前次循环**，直接进入下一次循环，不执行本次循环后续代码。

**代码示例**

```python
# break：遍历1-10，遇到5终止循环
for i in range(1,11):
    if i == 5:
        break
    print(i)  # 输出：1 2 3 4

# continue：遍历1-10，跳过偶数，只输出奇数
for i in range(1,11):
    if i % 2 == 0:  # 偶数：能被2整除，余数为0
        continue
    print(i)  # 输出：1 3 5 7 9
```

### 循环嵌套：循环里面再嵌套循环

外层循环执行 1 次，内层循环执行**全部次数**，适用于二维数据遍历（如矩阵、九九乘法表）。

**示例：打印九九乘法表**

``` python
for i in range(1,10):  # 外层：行
    for j in range(1, i+1):  # 内层：列，列数不超过行数
        print(f"{j}×{i}={i*j}", end="\t")
    print()  # 换行
```