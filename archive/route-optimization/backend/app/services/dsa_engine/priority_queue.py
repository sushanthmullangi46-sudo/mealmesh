from typing import TypeVar, Generic, List, Tuple

T = TypeVar("T")

class PriorityQueue(Generic[T]):
    """
    Custom Min-Heap Priority Queue implementation in Python.
    Provides O(log N) insertion and extraction, O(1) peek.
    """
    def __init__(self):
        self.heap: List[Tuple[float, T]] = []

    def _sift_up(self, index: int):
        while index > 0:
            parent = (index - 1) // 2
            if self.heap[index][0] < self.heap[parent][0]:
                self.heap[index], self.heap[parent] = self.heap[parent], self.heap[index]
                index = parent
            else:
                break

    def _sift_down(self, index: int):
        size = len(self.heap)
        while True:
            smallest = index
            left = 2 * index + 1
            right = 2 * index + 2

            if left < size and self.heap[left][0] < self.heap[smallest][0]:
                smallest = left
            if right < size and self.heap[right][0] < self.heap[smallest][0]:
                smallest = right

            if smallest != index:
                self.heap[index], self.heap[smallest] = self.heap[smallest], self.heap[index]
                index = smallest
            else:
                break

    def push(self, element: T, priority: float):
        self.heap.append((priority, element))
        self._sift_up(len(self.heap) - 1)

    def pop(self) -> Tuple[float, T]:
        if not self.heap:
            raise IndexError("pop from empty priority queue")
        item = self.heap[0]
        last = self.heap.pop()
        if self.heap:
            self.heap[0] = last
            self._sift_down(0)
        return item

    def top(self) -> Tuple[float, T]:
        if not self.heap:
            raise IndexError("peek empty priority queue")
        return self.heap[0]

    def empty(self) -> bool:
        return len(self.heap) == 0

    def size(self) -> int:
        return len(self.heap)

    def clear(self):
        self.heap.clear()

    def get_top_k(self, k: int = 10) -> List[Tuple[T, float]]:
        sorted_heap = sorted(self.heap, key=lambda x: x[0])
        return [(elem, prio) for prio, elem in sorted_heap[:k]]

