---
title: 运行
createTime: 2026/02/04 15:50:44
permalink: /backend/python/base-run/
---

## 环境有效性验证

运行程序前先确认 Python 解释器和包管理器可用，打开终端`（macOS/Linux）` 或`CMD/PowerShell（Windows）` 执行以下命令，无报错且显示版本即正常：

``` bash
# 验证Python解释器（3.x版本，推荐3.8+）
python --version  # Windows优先，若无效用python3
python3 --version # macOS/Linux专用
# 验证包管理器pip
pip --version  # 对应python
pip3 --version # 对应python3
```

## 代码基础检查

- **语法无错误**：无缩进混乱、括号不匹配、关键字拼写错误（**开发工具会实时标红，优先修复**）；
- **主程序入口规范**：执行型脚本必须加`if __name__ == "__main__":`，作为单独运行的入口，避免被导入时自动执行代码，标准格式：

``` python
# 文件名：demo.py
def main():
    # 程序核心逻辑
    print("程序运行中...")

# 主入口：仅当直接运行该脚本时执行main()
if __name__ == "__main__":
    main()
```

## 依赖包准备（针对有第三方库的程序）

若程序使用非 Python 内置库（如 numpy/pandas/requests），需先安装依赖，推荐**冻结依赖版本**保证跨环境运行一致：

``` bash
# 1. 安装单个依赖（国内镜像源加速，避免下载慢）
pip install requests -i https://mirrors.aliyun.com/pypi/simple/
# 2. 从依赖文件批量安装（团队开发/生产环境必用，文件名为requirements.txt）
pip install -r requirements.txt -i https://mirrors.aliyun.com/pypi/simple/
# 3. 生成当前环境的依赖文件（自己开发后导出，供他人使用）
pip freeze > requirements.txt
```

## 运行脚本

**脚本直接运行（最基础，开发 / 调试首选）**

``` bash
python demo.py  # Windows
python3 demo.py # macOS/Linux
```

**模块式运行（适用于包 / 多文件项目）**

当程序是**多文件包结构**（含`__init__.py`文件）时，用模块运行方式（避免导入路径错误），核心命令`python -m `模块名（无需加`.py`，且在包的上级目录执行）：

``` plaintext
# 项目结构示例（包名为my_project）
python_code/  # 上级目录
  └─ my_project/
      ├─ __init__.py
      └─ main.py  # 程序主文件（含if __name__ == "__main__"）
```

运行命令（在 python_code 目录执行）：

``` bash
python -m my_project.main  # Windows
python3 -m my_project.main # macOS/Linux
```