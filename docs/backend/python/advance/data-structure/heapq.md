---
title: heapq
createTime: 2026/02/05 14:42:01
permalink: /backend/python/advance-data-structure/heapq/
badge: 堆
---


## 核心特性

- Python 内置**唯一堆结构**，实现**小顶堆**（根节点为最小值），插入 / 弹出 / 堆化的时间复杂度均为`O(log n)`；
- 基于**列表**实现，无需额外数据结构，直接操作列表即可；
- 如需**大顶堆**，将元素取负数后插入，取出时再取反即可。


## 实战示例

``` python
import heapq

# 1. 堆化：将普通列表原地转为小顶堆（O(n)），直接操作原列表，无返回值
nums = [3, 1, 4, 1, 5, 9]
heapq.heapify(nums)  # nums → [1,1,4,3,5,9]（小顶堆，仅保证根节点是最小值，并非整体有序）

# 2. 插入元素：heappush(堆列表, 元素) → 保持堆结构（O(log n)）
heapq.heappush(nums, 0)  # nums → [0,1,4,3,5,9,1]

# 3. 弹出最小值：heappop(堆列表) → 返回堆顶最小值，保持堆结构（O(log n)）
print(heapq.heappop(nums))  # 0 → nums → [1,1,4,3,5,9]

# 4. 经典场景1：获取TopK 最大元素（小顶堆最优解，时间复杂度O(n log k)）
def top_k_max(nums: list, k: int) -> list:
    if k <= 0 or k > len(nums):
        return []
    heap = []
    for num in nums:
        heapq.heappush(heap, num)  # 插入小顶堆
        if len(heap) > k:
            heapq.heappop(heap)    # 保留前k个最大元素，堆顶为第k大元素
    return heap  # 返回小顶堆，反转即为从大到小排序

print(top_k_max([3,1,4,1,5,9], 3))  # [4,5,9] → 反转后 [9,5,4]

# 5. 经典场景2：获取TopK 最小元素（直接取前k个堆顶）
def top_k_min(nums: list, k: int) -> list:
    heapq.heapify(nums)
    return [heapq.heappop(nums) for _ in range(k)]

print(top_k_min([3,1,4,1,5,9], 3))  # [1,1,3]

# 6. 大顶堆实现：元素取负数
nums = [3,1,4,1,5,9]
max_heap = [-num for num in nums]
heapq.heapify(max_heap)
print(-heapq.heappop(max_heap))  # 9（原列表最大值）
```


## 核心场景

优先队列（任务调度，如高优先级任务先执行）、TopK 最大 / 最小元素、数据流中的中位数、海量数据的有限内存统计。