---
title: bisect
createTime: 2026/02/05 14:46:48
permalink: /backend/python/advance-data-structure/bisect/
badge: 二分
---


## 核心前提

仅适用于**有序序列**（列表 / 元组），查找 / 插入的时间复杂度为`O(log n)`，替代手动**实现二分查找**，避免逻辑错误。


## 核心方法

| 方法名                | 核心作用                     | 关键特性                                   |
| --------------------- | ---------------------------- | ------------------------------------------ |
| bisect_left(nums, x)  | 查找 x 在有序序列中的左插入位置 | 若 x 已存在，返回第一个x 的索引            |
| bisect_right(nums, x) | 查找 x 在有序序列中的右插入位置 | 若 x 已存在，返回最后一个x 的下一个索引    |
| bisect(nums, x)       | 等价于bisect_right           | 基础查找默认使用                           |
| insort_left(nums, x)  | 插入 x 到有序序列，保持有序   | 等价于nums.insert(bisect_left(nums, x), x) |
| insort_right(nums, x) | 插入 x 到有序序列，保持有序   | 等价于nums.insert(bisect_right(nums, x), x) |
| insort(nums, x)       | 等价于insort_right           | 基础插入默认使用                           |


## 实战示例

``` python
import bisect

# 前提：有序序列（升序）
nums = [1, 3, 5, 7, 9]

# 1. 查找插入位置
pos1 = bisect.bisect_left(nums, 5)   # 2（5已存在，返回第一个5的索引）
pos2 = bisect.bisect_right(nums, 5)  # 3（5已存在，返回最后一个5的下一个索引）
pos3 = bisect.bisect_left(nums, 6)   # 3（6不存在，返回应插入的位置）

# 2. 插入元素并保持有序
bisect.insort(nums, 6)               # nums → [1,3,5,6,7,9]
bisect.insort_left(nums, 3)          # 左插入3 → [1,3,3,5,6,7,9]

# 3. 经典场景：有序序列去重（高效）
def unique_sorted(nums: list) -> list:
    if not nums:
        return []
    res = [nums[0]]
    for num in nums[1:]:
        if num != res[-1]:
            bisect.insort(res, num)
    return res

print(unique_sorted([1,3,3,5,6,6,9]))  # [1,3,5,6,9]
```


## 核心场景

有序序列的查找、插入、去重，适合**数据有序且频繁更新**的场景（如有序缓存、排行榜、有序数据集维护）。