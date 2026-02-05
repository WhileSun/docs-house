---
title: collections
createTime: 2026/02/05 14:06:47
permalink: /backend/python/advance-data-structure/collections/
---


Python 开发使用**频率最高**的内置模块，解决基础数据结构的痛点问题（如列表两端增删慢、字典 KeyError、元素统计繁琐）。


## namedtuple：不可变具名元组 → 替代轻量类

**核心作用**

创建**不可变**的具名元组，通过**属性名**访问元素（比普通元组易读），比类更轻量（无实例字典，内存占用少）

**实战示例**

``` python
from collections import namedtuple

# 定义：类型名 + 字段名（列表/字符串）
Point = namedtuple("Point", ["x", "y"])  # 列表字段
User = namedtuple("User", "name age id") # 字符串字段（空格分隔）

# 实例化
p = Point(10, 20)
u = User("张三", 18, 1001)

# 访问：属性名（推荐）/索引，支持解包、作为字典键
print(p.x, p.y)  # 10 20（属性名访问，易读）
print(u[0], u[1])# 张三 18（索引访问，兼容元组）
a, b = p         # 解包
user_dict = {u: "普通用户"}  # 可哈希，作为字典键

# 核心方法：_asdict() → 转为有序字典，_replace() → 生成新对象（不可变，无法直接修改）
print(u._asdict())  # OrderedDict([('name', '张三'), ('age', 18), ('id', 1001)])
u2 = u._replace(age=20)  # 生成新对象，原对象不变
print(u2)  # User(name='张三', age=20, id=1001)
```

**核心场景**

存储简单数据对象（坐标 / 配置项 / 数据库查询结果 / 爬虫数据），无行为的轻量数据载体。


## deque：双端队列 → 替代列表实现高效增删

**核心痛点**

列表的`append/pop(0)`（左端增删）时间复杂度为**O(n)**（需移动所有元素），`deque`的`appendleft/popleft`为O(1)；

**核心特性**

支持两端高效增删、指定最大长度（超出自动丢弃另一端元素）、线程安全；

**实战示例**

``` python
from collections import deque

# 初始化
dq = deque([1, 2, 3])
# 右端增删（同列表，兼容使用）
dq.append(4)      # deque([1,2,3,4])
dq.pop()          # 4 → deque([1,2,3])
# 左端增删（高效，O(1)）
dq.appendleft(0)  # deque([0,1,2,3])
dq.popleft()      # 0 → deque([1,2,3])
# 指定最大长度：超出自动丢弃左端元素（适合滑动窗口、日志缓存）
dq = deque(maxlen=3)
dq.extend([1,2,3,4])  # 超出maxlen，丢弃左端1 → deque([2,3,4])
# 其他实用方法：extend/extendleft（批量增）、rotate（旋转）
dq.rotate(1)  # 向右旋转1位 → deque([4,2,3])
```

**核心场景**

队列（FIFO）、栈（LIFO）、滑动窗口（如最近 10 条日志）、高频两端增删的场景。


## defaultdict：默认值字典 → 避免 KeyError

**核心痛点**

访问字典不存在的键时抛出`KeyError`，需手动判断`if key not in dict`，`defaultdict`为不存在的键指定默认值类型，自动创建键并赋值默认值；

**实战示例**

``` python
from collections import defaultdict

# 初始化：指定默认值类型（int/list/set/dict，需传类型对象，而非实例）
d_int = defaultdict(int)    # 默认值0 → 适合计数
d_list = defaultdict(list)  # 默认值[] → 适合分组聚合
d_set = defaultdict(set)    # 默认值set() → 适合去重分组

# 访问不存在的键，自动创建并赋值默认值
d_int["count"] += 1  # 等价于 d_int["count"] = 0 + 1 → 1
d_list["user1"].append("read")  # d_list["user1"] = ["read"]
d_set["user2"].add("write")     # d_set["user2"] = {"write"}

# 经典场景：列表分组聚合（无需手动判断键是否存在）
data = [("fruit", "apple"), ("vegetable", "carrot"), ("fruit", "banana")]
group = defaultdict(list)
for category, name in data:
    group[category].append(name)
print(dict(group))  # {"fruit": ["apple", "banana"], "vegetable": ["carrot"]}
```

**核心场景**

统计计数、数据分组聚合、爬虫数据去重、避免繁琐的键存在性判断。


## Counter：元素计数器 → 替代手动循环统计

**核心作用**

快速实现**可迭代对象（列表 / 字符串 / 元组）** 的元素频次统计，返回字典格式的计数器，支持丰富的统计方法；

**实战示例**

``` python
from collections import Counter

# 初始化：传入可迭代对象
c1 = Counter([1, 2, 2, 3, 3, 3])  # 列表统计 → Counter({3:3, 2:2, 1:1})
c2 = Counter("abracadabra")       # 字符串统计 → Counter({'a':5, 'b':2, 'r':2, 'c':1, 'd':1})
c3 = Counter({"a":2, "b":3})      # 字典初始化 → Counter({'b':3, 'a':2})

# 核心访问：同字典，不存在的键返回0（无KeyError）
print(c2["a"])  # 5
print(c2["z"])  # 0

# 核心方法
print(c1.most_common(2))  # 获取前2个高频元素 → [(3,3), (2,2)]
print(c1.total())         # 统计元素总数 → 6
c1.update([3, 4])         # 更新计数 → Counter({3:4, 2:2, 1:1, 4:1})
c1.subtract([2, 3])       # 减少计数 → Counter({3:3, 2:1, 1:1, 4:1})
print(list(c1.elements()))# 生成元素迭代器（按计数重复）→ [1,2,3,3,3,4]
```

**核心场景**

词频统计、数据频次分析、投票统计、爬虫数据去重统计、日志级别统计。