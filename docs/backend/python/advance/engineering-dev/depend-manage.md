---
title: 精准依赖管理
createTime: 2026/02/06 09:32:30
permalink: /backend/python/advance-engineering-dev/depend-manage/
---


Python 内置`venv`模块，无需额外安装，可创建**独立的虚拟环境**，每个项目拥有自己的依赖包，避免全局环境依赖冲突。


## 虚拟环境：隔离项目依赖

**核心命令**

``` python
# 1. 创建虚拟环境：在项目根目录执行，环境名推荐为venv
python -m venv venv  # Windows
python3 -m venv venv # macOS/Linux

# 2. 激活虚拟环境
# Windows（CMD）
venv\Scripts\activate
# Windows（PowerShell）
.\venv\Scripts\Activate.ps1
# macOS/Linux（终端）
source venv/bin/activate

# 激活成功后，终端前缀会出现(venv)，表示进入虚拟环境

# 3. 安装依赖：激活后，pip安装的依赖仅在该虚拟环境中生效
pip install requests==2.31.0
pip install -r requirements.txt

# 4. 退出虚拟环境
deactivate

# 5. 删除虚拟环境：直接删除venv目录即可
rm -rf venv # macOS/Linux
rd /s /q venv # Windows
```

**关键规范**

- 每个项目必须创建**独立的虚拟环境**；
- `venv`目录必须加入`.gitignore`，不提交到 Git 仓库；
- **激活虚拟环境后**，再进行依赖安装、项目运行、测试。


## 依赖文件规范：requirements.txt(基础)

**核心原则**

1. **区分生产 / 开发依赖：**`requirements.txt`（生产环境，仅包含项目运行必需的依赖）、`requirements-dev.txt`（开发环境，包含测试、格式化、调试工具）；
2. **指定精确版本**：使用`==`指定精确版本（如requests==2.31.0），避免使用`>=/<`，防止自动升级导致的兼容问题；
3. **国内镜像加速**：安装依赖时使用国内镜像（阿里云 / 清华 / 豆瓣），解决下载慢的问题。

**依赖文件示例**

``` python
# requirements.txt（生产环境，精简）
requests==2.31.0
pandas==2.1.4
numpy==1.26.2
PyYAML==6.0.1
redis==5.0.1

# requirements-dev.txt（开发环境，包含生产依赖+开发工具）
-r requirements.txt  # 引入生产环境依赖
pytest==7.4.3
black==23.11.0
flake8==6.1.0
isort==5.12.0
pytest-cov==4.1.0
```

**核心操作命令**

``` python
# 激活虚拟环境后执行

#  安装开发环境依赖
pip install -r requirements-dev.txt -i https://mirrors.aliyun.com/pypi/simple/

#  升级指定依赖
pip install --upgrade requests==2.32.0

# 卸载依赖
pip uninstall requests -y
```


## 进阶依赖管理：Poetry/Pipenv（团队开发推荐）

原生`pip + requirements.txt`仅能**冻结版本**，无法实现**依赖锁**，`Poetry/Pipenv` 是 Python 社区推荐的**现代依赖管理工具**，核心优势：

1. **依赖锁：**生成`poetry.lock/Pipfile.lock`，保证跨环境依赖完全一致（所有开发者 / 生产环境的依赖版本完全相同）；
2. **包构建与发布：**内置`build/publish`命令，可直接将项目打包为第三方库发布到 PyPI；
3. **虚拟环境自动管理：**无需手动创建 / 激活虚拟环境，`Poetry` 会自动管理；
4. **依赖分组：**支持将依赖分为`main`（生产）、`dev`（开发）、`test`（测试）等分组，更精细。

**Poetry 核心命令（快速上手）**

``` python
# 1. 安装Poetry
pip install poetry -i https://mirrors.aliyun.com/pypi/simple/

# 2. 初始化项目（生成pyproject.toml，项目配置文件）
poetry init  # 交互式配置，按提示输入即可

# 3. 安装依赖
poetry add requests==2.31.0  # 安装生产环境依赖，添加到pyproject.toml
poetry add pytest --dev      # 安装开发环境依赖，添加到[tool.poetry.dev-dependencies]

# 4. 安装所有依赖（根据pyproject.toml和poetry.lock）
poetry install

# 5. 运行项目（自动激活虚拟环境）
poetry run python src/my_package/core/main.py

# 6. 进入虚拟环境终端
poetry env activate

# 7. 退出虚拟环境终端
deactivate

# 8. 冻结依赖（生成poetry.lock）
poetry lock
```

## 关键规范

- `pyproject.toml`：项目核心配置文件，必须提交到 Git 仓库；
- `poetry.lock`：依赖锁文件，必须提交到 Git 仓库；