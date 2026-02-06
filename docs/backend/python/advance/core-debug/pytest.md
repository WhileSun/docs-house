---
title: 单元测试
createTime: 2026/02/06 14:52:10
permalink:  /backend/python/advance-core-debug/pytest/
---

`pytest`是 Python 最流行的单元测试框架，比内置`unittest`更简洁、灵活，支持**夹具、参数化、跳过测试、测试覆盖率**。


## pytest 核心规范

1. 测试文件命名：`test_*.py` 或 `*_test.py`；
2. 测试函数 `/` 方法命名：`test_*`；
3. 测试类命名：`Test*`（类名首字母大写，无`__init__`方法）；
4. 断言：使用 Python 原生`assert`语句，无需`self.assertEqual`。


## 核心功能实战：夹具 + 参数化 + 跳过测试

``` python
# tests/test_utils/test_calc.py
import pytest
from my_package.utils.calc import add, divide
from my_package.exceptions import ParameterValidationError

# 夹具（Fixture）：测试前置/后置操作，如初始化数据库、创建临时文件，支持复用
@pytest.fixture(scope="function")  # scope：function（默认）/class/module/session
def test_data():
    """提供测试数据的夹具，每个测试函数执行前调用一次"""
    print("\n初始化测试数据...")
    data = {"nums": [1, 2, 3, 4], "expected_sum": 10}
    yield data  # yield前为前置操作，yield后为后置操作
    print("清理测试数据...")

# 参数化测试：用多组参数执行同一个测试函数，避免重复代码
@pytest.mark.parametrize(
    "a, b, expected",
    [
        (1, 2, 3),    # 正常用例
        (-1, 1, 0),   # 负数用例
        (0, 0, 0),    # 零值用例
        (10, 20, 30)  # 大数用例
    ],
    ids=["normal", "negative", "zero", "large_num"]  # 为每组参数命名，便于查看测试结果
)
def test_add(a, b, expected):
    """测试加法函数"""
    assert add(a, b) == expected

def test_add_with_fixture(test_data):
    """测试加法函数，使用夹具"""
    nums = test_data["nums"]
    expected_sum = test_data["expected_sum"]
    assert add(*nums[:2]) + add(*nums[2:]) == expected_sum

# 跳过测试：使用@pytest.mark.skip，适合暂未实现的功能或特定环境不支持的测试
@pytest.mark.skip(reason="除法函数暂未完成优化，跳过测试")
def test_divide_skip():
    assert divide(10, 2) == 5

# 条件跳过：使用@pytest.mark.skipif，适合特定Python版本/系统不支持的测试
@pytest.mark.skipif(pytest.version_info < (3, 8), reason="Python版本需≥3.8")
def test_divide_skipif():
    assert divide(10, 5) == 2

# 预期失败：使用@pytest.mark.xfail，适合已知会失败的测试（如bug未修复）
@pytest.mark.xfail(raises=ZeroDivisionError, reason="预期除零错误")
def test_divide_xfail():
    divide(10, 0)

# 测试异常：使用pytest.raises捕获预期异常
def test_divide_exception():
    with pytest.raises(ParameterValidationError, match="参数必须为整数"):
        divide(10, "2")  # 传入字符串，预期抛出参数校验异常
```


## 测试覆盖率：pytest-cov（衡量测试完整性）

测试覆盖率表示**被测试代码覆盖的比例**，生产环境推荐核心代码覆盖率≥80%。

``` python
# 安装pytest-cov
pip install pytest-cov==4.1.0 -i https://mirrors.aliyun.com/pypi/simple/

# 运行测试并生成覆盖率报告
pytest tests/ --cov=src/my_package --cov-report=term --cov-report=html
```

- `--cov=src/my_package：`指定要统计覆盖率的包；
- `--cov-report=term：`在终端输出覆盖率摘要；
- `--cov-report=html：`生成 HTML 格式的详细报告（在htmlcov目录下，用浏览器打开index.html查看）。


## pytest 运行命令（常用）

``` bash
pytest tests/ -v  # 详细输出测试结果
pytest tests/test_utils/test_calc.py::test_add -v  # 仅运行指定测试函数
pytest tests/ -k "add" -v  # 运行名称包含add的测试用例
pytest tests/ -x  # 第一个测试失败时立即停止
```
