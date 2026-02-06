---
title: 文件操作
createTime: 2026/02/06 14:23:51
permalink: /backend/python/advance-core-combat/file-manage/
---


Python 内置`os/pathlib/shutil`模块处理文件，进阶开发需掌握跨平台路径处理、大文件读写、配置文件（`JSON/YAML/CSV`）读写，避免文件操作的常见坑（**如路径拼接错误、大文件内存溢出、编码问题**）。


## 路径处理：pathlib 替代 os.path（Python3.4 + 推荐）

`pathlib`是面向对象的路径处理模块，比`os.path`更简洁、易读，支持跨平台（Windows/macOS/Linux），彻底解决路径拼接的`\//`问题。

``` python
from pathlib import Path

# 1. 路径初始化：支持字符串/路径对象
current_dir = Path(__file__).parent  # 当前文件所在目录（面向对象，无需os.path.dirname）
project_dir = current_dir.parent.parent  # 上级目录
log_file = project_dir / "logs" / "dev.log"  # 路径拼接：用/运算符，跨平台自动适配

# 2. 路径属性：快速获取路径信息
print(log_file.name)  # 文件名：dev.log
print(log_file.suffix)  # 文件后缀：.log
print(log_file.stem)  # 文件名（无后缀）：dev
print(log_file.parent)  # 父目录：/path/to/project/logs
print(log_file.absolute())  # 绝对路径

# 3. 路径操作：创建目录/判断存在/删除文件
log_file.parent.mkdir(parents=True, exist_ok=True)  # 创建目录，parents=True创建父目录，exist_ok=True已存在不报错
print(log_file.exists())  # 判断文件是否存在
print(log_file.is_file())  # 判断是否为文件
print(log_file.is_dir())   # 判断是否为目录

# 4. 遍历目录：glob匹配，返回路径对象迭代器
# 匹配logs目录下所有.log文件
for file in project_dir.glob("logs/*.log"):
    print(file)
# 递归匹配所有.log文件
for file in project_dir.rglob("**/*.log"):
    print(file)

# 5. 路径转换：转为字符串/os.PathLike对象
print(str(log_file))  # 转为字符串
print(log_file.as_posix())  # 转为POSIX路径（/分隔，适合跨平台）
```


## 大文件读写：逐行读取（避免内存溢出）

处理**GB 级大文件**时，禁止使用`read()/readlines()`一次性读取全部内容（会导致内存溢出），应逐行读取（**惰性迭代，每次仅读取一行**）。

``` python
from pathlib import Path
from my_package.utils.logger import get_logger

logger = get_logger(__name__)

# 大文件路径
large_file = Path("data/large_file.txt")

# 方式1：with open + for循环逐行读取（推荐，最简洁）
def read_large_file(file_path: Path) -> None:
    """逐行读取大文件，处理每一行数据"""
    if not file_path.is_file():
        logger.error(f"文件不存在：{file_path}")
        return
    
    line_count = 0
    # encoding="utf-8" 避免中文乱码，errors="ignore" 忽略编码错误（生产环境慎用）
    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        for line in f:  # 逐行读取，惰性迭代，内存占用极低
            line = line.strip()  # 去除首尾空格/换行符
            if not line:
                continue  # 跳过空行
            # 处理行数据：如统计、解析、写入新文件
            line_count += 1
            if line_count % 10000 == 0:
                logger.info(f"已处理{line_count}行")
    
    logger.info(f"文件处理完成，总行数：{line_count}")

# 方式2：分块读取（适合二进制文件/非文本文件，如图片/视频）
def read_large_binary_file(file_path: Path, chunk_size: int = 1024 * 1024) -> None:
    """分块读取二进制大文件，chunk_size=1MB"""
    with open(file_path, "rb") as f:
        while chunk := f.read(chunk_size):  # 每次读取1MB
            # 处理块数据：如写入新文件、计算MD5
            pass
```


## 配置文件读写：JSON/YAML/CSV（生产环境常用）

**JSON 文件读写实战**

``` python
import json
from pathlib import Path
from typing import Dict, Any

# JSON文件路径
json_file = Path("data/config.json")

# 1. 写入JSON文件：ensure_ascii=False 支持中文，indent=2 格式化输出
def write_json(file_path: Path, data: Dict[str, Any]) -> None:
    file_path.parent.mkdir(parents=True, exist_ok=True)
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(
            data,
            f,
            ensure_ascii=False,  # 必须设置，否则中文会被转为\uXXXX
            indent=2,           # 格式化输出，便于阅读
            sort_keys=False      # 不排序键，保持原顺序
        )

# 2. 读取JSON文件
def read_json(file_path: Path) -> Dict[str, Any]:
    if not file_path.is_file():
        raise FileNotFoundError(f"JSON文件不存在：{file_path}")
    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)

# 实战：写入并读取
if __name__ == "__main__":
    config_data = {
        "server": {"host": "127.0.0.1", "port": 5000},
        "log": {"level": "DEBUG", "file": "logs/dev.log"},
        "users": ["张三", "李四"]
    }
    write_json(json_file, config_data)
    data = read_json(json_file)
    print(data["server"]["port"])  # 5000
```

**CSV 文件读写实战（处理批量数据）**

``` python
import csv
from pathlib import Path
from typing import List, Dict

# CSV文件路径
csv_file = Path("data/users.csv")

# 1. 写入CSV文件：DictWriter 按列名写入，适合结构化数据
def write_csv(file_path: Path, headers: List[str], rows: List[Dict[str, Any]]) -> None:
    file_path.parent.mkdir(parents=True, exist_ok=True)
    with open(file_path, "w", encoding="utf-8", newline="") as f:  # newline="" 避免空行
        writer = csv.DictWriter(f, fieldnames=headers)
        writer.writeheader()  # 写入列名
        writer.writerows(rows)  # 批量写入行

# 2. 读取CSV文件：DictReader 按列名读取，返回字典迭代器
def read_csv(file_path: Path) -> List[Dict[str, Any]]:
    if not file_path.is_file():
        raise FileNotFoundError(f"CSV文件不存在：{file_path}")
    with open(file_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        return list(reader)  # 转为列表，小文件适用；大文件请逐行迭代

# 实战：写入并读取
if __name__ == "__main__":
    headers = ["id", "name", "age", "role"]
    rows = [
        {"id": 1, "name": "张三", "age": 18, "role": "user"},
        {"id": 2, "name": "李四", "age": 25, "role": "admin"}
    ]
    write_csv(csv_file, headers, rows)
    users = read_csv(csv_file)
    for user in users:
        print(f"姓名：{user['name']}，年龄：{user['age']}")
```


## 文件操作避坑要点

1. **编码统一：**所有文件操作均指定`encoding="utf-8"`，避免中文乱码；
2. **关闭文件：**必须使用`with`语句（上下文管理器），自动关闭文件句柄，避免资源泄漏；
3. **二进制文件：**读写二进制文件（图片 / 视频 / 压缩包）时，使用`rb/wb`模式，不指定编码；
4. **CSV 空行：**写入 CSV 时，指定`newline=""`，避免 Windows 系统下出现空行。

