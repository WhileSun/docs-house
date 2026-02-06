---
title: 异常处理
createTime: 2026/02/06 14:10:07
permalink: /backend/python/advance-core-combat/except-manage/
---


## 核心痛点

开发中直接使用`except Exception as e: print(e)`存在以下问题：

1. **异常捕获过宽：**捕获所有异常，掩盖了代码中的 bug（如语法错误、逻辑错误）；
2. **无异常上下文：**仅打印异常信息，无参数、调用栈，难以定位问题；
3. **异常处理不统一：**不同模块的异常提示格式混乱，用户 / 调用方体验差；
4. **未做优雅降级：**异常发生后直接崩溃，未执行资源释放、错误上报等操作。

## 核心原则

1. **精准捕获：**仅捕获预期的异常（如`FileNotFoundError/requests.exceptions.RequestException`），避免捕获`BaseException/Exception`；
2. **保留调用栈：**使用日志记录完整的异常调用栈（`logger.exception`）；
3. **自定义业务异常：**区分系统异常和业务异常，业务异常返回友好提示；
4. **优雅降级：**异常发生后，执行资源释放、重试、兜底逻辑。

## 实战

### 自定义业务异常（区分系统异常）

适合**业务层面的错误**（如参数校验失败、用户不存在、权限不足），返回友好的错误码和提示信息。

``` python
# src/my_package/exceptions.py
"""自定义异常模块，统一管理项目所有业务异常"""

class BaseBusinessError(Exception):
    """业务异常基类，所有业务异常均继承此类"""
    code: int = 500  # 错误码
    message: str = "业务执行失败"  # 错误信息

    def __init__(self, message: str = None, code: int = None):
        if message:
            self.message = message
        if code:
            self.code = code
        super().__init__(self.message)

class UserNotFoundError(BaseBusinessError):
    """用户不存在异常"""
    code = 404
    message = "用户不存在"

class PermissionDeniedError(BaseBusinessError):
    """权限不足异常"""
    code = 403
    message = "权限不足，无法执行此操作"

class ParameterValidationError(BaseBusinessError):
    """参数校验异常"""
    code = 400
    message = "参数校验失败"
```

### 统一异常处理器（全局复用，格式化响应）

用于**捕获并处理项目中所有异常**，格式化输出（如接口返回 JSON、日志记录），避免重复编写`try/except`。

``` python
# src/my_package/utils/exception_handler.py
import traceback
from my_package.utils.logger import get_logger
from my_package.exceptions import BaseBusinessError

logger = get_logger(__name__)

class ExceptionHandler:
    """统一异常处理器"""

    @staticmethod
    def handle(exc: Exception) -> dict:
        """
        处理异常，返回标准化响应字典
        
        Args:
            exc: 捕获的异常对象
        
        Returns:
            dict: 标准化响应，包含code/message/success
        """
        # 处理业务异常：返回友好提示，不记录调用栈（业务异常是预期的）
        if isinstance(exc, BaseBusinessError):
            logger.warning(f"业务异常 - 错误码：{exc.code}，信息：{exc.message}")
            return {
                "success": False,
                "code": exc.code,
                "message": exc.message
            }
        
        # 处理系统异常：返回通用提示，记录完整调用栈（便于排查bug）
        logger.exception(f"系统异常：{exc}")  # logger.exception自动记录调用栈
        return {
            "success": False,
            "code": 500,
            "message": "服务器内部错误，请联系管理员"
        }

# 全局异常处理装饰器：用于函数/方法的异常捕获
def catch_exceptions(func):
    """捕获函数执行过程中的所有异常，返回标准化响应"""
    def wrapper(*args, **kwargs):
        try:
            result = func(*args, **kwargs)
            # 正常响应：标准化格式
            return {
                "success": True,
                "code": 200,
                "message": "执行成功",
                "data": result
            }
        except Exception as e:
            return ExceptionHandler.handle(e)
    return wrapper
```

### 异常处理实战（结合业务逻辑）

``` python
# src/my_package/core/user_service.py
from my_package.exceptions import UserNotFoundError, ParameterValidationError
from my_package.utils.exception_handler import catch_exceptions
from my_package.utils.logger import get_logger

logger = get_logger(__name__)

# 模拟用户数据库
USER_DB = {
    1: {"name": "张三", "age": 18, "role": "user"},
    2: {"name": "李四", "age": 25, "role": "admin"}
}

class UserService:
    @staticmethod
    @catch_exceptions
    def get_user(user_id: int) -> dict:
        """获取用户信息"""
        # 参数校验：抛出业务异常
        if not isinstance(user_id, int) or user_id <= 0:
            raise ParameterValidationError(f"用户ID必须为正整数，当前为{user_id}")
        
        # 业务逻辑：用户不存在则抛出业务异常
        user = USER_DB.get(user_id)
        if not user:
            raise UserNotFoundError(f"用户ID {user_id} 不存在")
        
        logger.info(f"成功获取用户信息：用户ID {user_id}，姓名 {user['name']}")
        return user

    @staticmethod
    @catch_exceptions
    def divide(a: int, b: int) -> float:
        """除法计算（模拟系统异常）"""
        # 未捕获ZeroDivisionError，会被全局异常处理器转为系统异常响应
        return a / b

if __name__ == "__main__":
    service = UserService()
    # 测试业务异常：参数校验失败
    print(service.get_user("abc"))
    # 测试业务异常：用户不存在
    print(service.get_user(10))
    # 测试系统异常：除零错误
    print(service.divide(10, 0))
    # 测试正常执行
    print(service.get_user(1))
```


## 异常处理避坑要点

1. **禁止空 except：**`except:` 会捕获所有异常（包括`KeyboardInterrupt/SystemExit`），导致程序无法正常退出；
2. **`logger.exception`仅在 except 块中使用：**它会自动记录当前异常的调用栈，非 except 块中使用无意义；
3. **业务异常不记录调用栈：**业务异常是预期的（如用户不存在），记录调用栈会增加日志冗余；
4. **系统异常返回通用提示：**生产环境中，系统异常（如数据库连接失败）不返回具体错误信息给用户，避免泄露系统细节。

