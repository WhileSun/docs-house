---
title: 类
createTime: 2026/02/04 15:00:16
permalink: /backend/python/base-class/
---

Python 是==纯面向对象语言==，万物皆对象（如列表、字符串、函数都是对象），面向对象编程的核心是==封装、继承、多态==，基础是类（Class） 和实例（Instance）。


## 核心概念

- 类（Class）：对**一类事物的抽象描述**，定义了这类事物的**属性（特征）和方法（行为）**，如 “人” 类、“车” 类；
- 实例（Instance）：类的**具体对象**，是类的**实际体现**，如 “张三” 是 “人” 类的一个实例，“宝马 X5” 是 “车” 类的一个实例；
- 属性：类 / 实例的特征，如 “人” 类的姓名、年龄、身高；
- 方法：类 / 实例的行为，如 “人” 类的吃饭、走路、说话。


## 类的定义与实例化

### 类的定义

关键字：`class`，语法格式：

``` python
class 类名(父类):  # 父类可选，无则默认继承object（Python所有类的基类）
    """类的文档字符串：说明类的功能"""
    # 类属性：所有实例共享的属性（可选）
    类属性名 = 属性值
    
    # 构造方法：初始化实例属性，创建实例时自动调用，关键字__init__（前后各两个下划线）
    def __init__(self, 参数1, 参数2, ...):
        # 实例属性：每个实例独有的属性，self.属性名 = 值
        self.属性名1 = 参数1
        self.属性名2 = 参数2
    
    # 实例方法：类的行为，第一个参数必须是self（代表当前实例）
    def 方法名1(self, 参数...):
        方法体
    
    def 方法名2(self, 参数...):
        方法体
```

- `类名规范`：**大驼峰命名**（每个单词首字母大写，如Person、Student）；
- `self`：必须是**实例方法的第一个参数**，代表当前实例对象，调用方法时无需手动传递，Python 自动传入；
- `__init__`：构造方法，创建实例时**自动执行**，用于初始化实例的属性，无返回值。

### 实例化

实例化是根据**类创建具体实例**的过程，语法：`实例名 = 类名(参数)`，参数需与`__init__`方法匹配。

**代码示例（定义 Person 类并实例化）**

``` python
# 定义Person类，默认继承object
class Person:
    # 类属性：所有Person实例共享
    species = "人类"
    
    # 构造方法：初始化实例属性name、age
    def __init__(self, name, age):
        self.name = name  # 实例属性：姓名
        self.age = age    # 实例属性：年龄
    
    # 实例方法：说话
    def say_hi(self):
        print(f"大家好，我是{self.name}，今年{self.age}岁，我是{self.species}")
    
    # 实例方法：过生日，修改年龄
    def birthday(self):
        self.age += 1
        print(f"{self.name}过生日了，现在{self.age}岁")

# 实例化：创建两个Person实例
p1 = Person("张三", 18)
p2 = Person("李四", 20)

# 访问实例属性：实例名.属性名
print(p1.name)  # 输出：张三
print(p2.age)   # 输出：20

# 访问类属性：类名.属性名 或 实例名.属性名
print(Person.species)  # 输出：人类
print(p1.species)      # 输出：人类

# 调用实例方法：实例名.方法名()
p1.say_hi()  # 输出：大家好，我是张三，今年18岁，我是人类
p2.birthday()# 输出：李四过生日了，现在21岁
print(p2.age)# 输出：21
```

## 封装、继承、多态（核心特性）

### 封装

将类的**属性和方法**包裹在类内部，隐藏内部实现细节，仅对外**提供统一的访问接口**，提高代码的安全性和可维护性。

- Python 中通过**命名规范**实现封装：
  - **普通属性** / 方法：`name`、`say_hi()`（公开，可外部访问）；
  - **受保护属性** / 方法：`_name`、`_say_hi()`（约定俗成，外部尽量不访问）；
  - **私有属性** / 方法：`__name`、`__say_hi()`（真正封装，**外部无法直接访问**，内部可通过_类名__属性名访问）。

### 继承

让**子类**继承**父类**的所有属性和方法，子类可直接使用父类的功能，也可**重写**父类的方法或**添加**自己的属性 / 方法，提高代码复用性。

- 语法：class `子类名(父类名):`；
- 子类重写父类方法：子类定义与父类**同名**的方法，**覆盖**父类的实现；
- `super()`：子类中调用父类的方法 / 构造方法，避免重复代码。

### 多态

同一方法，在不同子类中有**不同的实现**，调用时根据**实例的实际类型**执行对应的方法，提高代码的灵活性。

**继承与多态示例（Student 继承 Person）**

``` python
# 父类：Person
class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age
    
    def say_hi(self):
        print(f"我是{self.name}，今年{self.age}岁")

# 子类：Student，继承Person
class Student(Person):
    # 子类构造方法：调用父类构造方法，添加自己的属性score
    def __init__(self, name, age, score):
        super().__init__(name, age)  # 调用父类__init__，初始化name、age
        self.score = score  # 子类独有的属性
    
    # 重写父类的say_hi方法（多态体现）
    def say_hi(self):
        print(f"我是学生{self.name}，今年{self.age}岁，成绩{self.score}分")

# 子类：Teacher，继承Person
class Teacher(Person):
    def __init__(self, name, age, subject):
        super().__init__(name, age)
        self.subject = subject  # 子类独有的属性
    
    # 重写父类的say_hi方法（多态体现）
    def say_hi(self):
        print(f"我是老师{self.name}，今年{self.age}岁，教{self.subject}")

# 实例化子类
s = Student("张三", 18, 95)
t = Teacher("李老师", 30, "数学")

# 调用重写后的方法（多态：同一方法，不同实例执行不同逻辑）
s.say_hi()  # 输出：我是学生张三，今年18岁，成绩95分
t.say_hi()  # 输出：我是老师李老师，今年30岁，教数学

# 子类可访问父类的属性
print(s.name)  # 输出：张三
print(t.age)   # 输出：30
```

