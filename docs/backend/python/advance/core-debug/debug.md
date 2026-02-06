---
title: 调试技巧
createTime: 2026/02/06 14:41:53
permalink: /backend/python/advance-core-debug/debug/
---


## pdb 调试：Python 内置断点调试（无 IDE 时必备）

`pdb`是 Python 内置的命令行调试工具，支持**断点设置、单步执行、查看变量、调用栈**，适合服务器 / 无 IDE 环境下的调试。

``` python
import pdb

def calc_sum(nums: list) -> int:
    total = 0
    pdb.set_trace()  # 设置断点，程序执行到此处暂停
    for num in nums:
        total += num
    return total

if __name__ == "__main__":
    calc_sum([1, 2, 3, 4])
```

**pdb 核心命令（常用）**

| 命令                | 作用                                               |
| :------------------ | :------------------------------------------------- |
| n（next）           | 单步执行，不进入函数                               |
| s（step）           | 单步执行，进入函数                                 |
| c（continue）       | 继续执行，直到下一个断点                           |
| l（list）           | 查看当前代码上下文                                 |
| p 变量名（print）   | 打印变量值                                         |
| pp 变量名（pretty print） | 格式化打印复杂变量（如字典 / 列表）|
| bt（backtrace）     | 查看完整调用栈                                     |
| q（quit）           | 退出调试，终止程序                                 |


## logging 调试：生产环境调试替代 print

如前文所述，生产环境禁止使用`print`，通过`logger.debug`记录调试信息，结合日志文件定位问题，无需修改代码即可开启 / 关闭调试。


## traceback 模块：手动获取异常调用栈

当需要手动处理异常并记录调用栈时，使用`traceback`模块（`logger.exception`底层也是基于此实现）。

``` python
import traceback

try:
    1 / 0
except Exception as e:
    # 获取完整调用栈字符串
    tb_str = traceback.format_exc()
    print(tb_str)
```