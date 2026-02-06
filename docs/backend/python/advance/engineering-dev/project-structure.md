---
title: 标准项目目录结构
createTime: 2026/02/06 09:21:37
permalink: /backend/python/advance-engineering-dev/project-structure/
---


遵循 Python 社区（PEP8/Poetry）推荐的**源码与非源码分离**原则，层次清晰，便于团队协作、后续扩展和第三方库发布，以下为**通用标准结构**，可根据项目类型（如 Web / 爬虫 / 数据分析）灵活删减。


``` plaintext
my_project/                # 项目根目录（建议使用小写+下划线，避免空格和特殊字符）
├─ README.md               # 项目说明文档（必写，核心：功能/安装/使用/贡献/依赖）
├─ requirements.txt        # 生产环境依赖清单（精确版本，如requests==2.31.0）
├─ requirements-dev.txt    # 开发环境依赖清单（测试/格式化/调试，如pytest/black/flake8）
├─ setup.py/setup.cfg/pyproject.toml  # 包构建配置（若作为第三方库发布，Poetry用pyproject.toml）
├─ .gitignore              # Git忽略文件（必写，不提交的文件/目录，如__pycache__/venv/日志/缓存）
├─ .flake8/.black.toml     # 代码规范工具配置文件（可选，自定义工具规则）
├─ src/                    # 核心源码目录（推荐，避免根目录模块冲突，Python3.3+必选）
│  └─ my_package/          # 项目核心包（与项目名一致，小写+下划线，含__init__.py）
│     ├─ __init__.py       # 包标识+初始化+导出配置（必写，可空）
│     ├─ core/             # 核心功能子包（按业务模块划分，如api/dao/service）
│     │  ├─ __init__.py
│     │  └─ main.py        # 核心业务逻辑
│     ├─ utils/            # 工具函数子包（通用工具，如加密/日志/数据处理）
│     │  ├─ __init__.py
│     │  └─ common.py      # 通用工具函数
│     ├─ config/           # 配置子包（配置加载/管理，如yaml/ini/环境变量）
│     │  ├─ __init__.py
│     │  └─ settings.py    # 配置加载逻辑
│     ├─ models/           # 模型子包（数据模型/ORM模型，如User/Product）
│     │  ├─ __init__.py
│     │  └─ user.py        # 数据模型定义
│     └─ __main__.py       # 包可直接运行入口（可选，支持python -m my_package）
├─ tests/                  # 单元测试目录（必写，与src目录结构一一对应）
│  ├─ __init__.py
│  ├─ test_core/           # 对应src/my_package/core
│  │  ├─ __init__.py
│  │  └─ test_main.py
│  ├─ test_utils/          # 对应src/my_package/utils
│  │  ├─ __init__.py
│  │  └─ test_common.py
│  └─ conftest.py          # pytest全局配置文件（可选，如夹具/全局参数）
├─ docs/                   # 文档目录（可选，接口文档/设计文档/使用文档，如Sphinx/MkDocs）
│  └─ index.md
├─ examples/               # 示例代码目录（可选，快速上手示例，如demo.py/usage.py）
│  └─ quick_start.py
├─ logs/                   # 日志目录（可选，项目运行日志，gitignore忽略）
└─ data/                   # 数据目录（可选，如爬虫数据/分析数据，gitignore忽略）
```

**目录设计核心原则**

1. **源码与非源码分离**：`src`/（源码）、`tests`/（测试）、`docs`/（文档）、`examples`/（示例）相互独立；
2. **按业务模块划分**：子包按业务功能划分（如 `core/utils/config`），而非按文件类型（如 `py_files/yml_files`）；
3. **包结构清晰**：每个子包都包含`__init__.py`，标记为 Python 包；
4. **可扩展性强**：新增业务功能时，只需在对应子包下添加文件，或新增子包，无需修改现有结构。