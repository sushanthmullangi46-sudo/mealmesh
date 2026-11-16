from typing import Dict, List

class DisjointSet:
    """
    Disjoint Set Union (Union-Find) with Path Compression and Union by Rank.
    """
    def __init__(self):
        self.parent_: Dict[int, int] = {}
        self.rank_: Dict[int, int] = {}
        self.count_: int = 0

    def add_element(self, element: int):
        if element not in self.parent_:
            self.parent_[element] = element
            self.rank_[element] = 0
            self.count_ += 1

    def find(self, element: int) -> int:
        if element not in self.parent_:
            self.parent_[element] = element
            self.rank_[element] = 0
            self.count_ += 1
            return element

        if self.parent_[element] != element:
            self.parent_[element] = self.find(self.parent_[element])
        return self.parent_[element]

    def unite(self, a: int, b: int) -> bool:
        root_a = self.find(a)
        root_b = self.find(b)
        if root_a == root_b:
            return False

        if self.rank_[root_a] < self.rank_[root_b]:
            self.parent_[root_a] = root_b
        elif self.rank_[root_a] > self.rank_[root_b]:
            self.parent_[root_b] = root_a
        else:
            self.parent_[root_b] = root_a
            self.rank_[root_a] += 1

        self.count_ -= 1
        return True

    def connected(self, a: int, b: int) -> bool:
        return self.find(a) == self.find(b)

    def get_component_count(self) -> int:
        return self.count_

    def get_component_groups(self) -> Dict[int, List[int]]:
        groups: Dict[int, List[int]] = {}
        for element in list(self.parent_.keys()):
            root = self.find(element)
            if root not in groups:
                groups[root] = []
            groups[root].append(element)
        return groups

    def clear(self):
        self.parent_.clear()
        self.rank_.clear()
        self.count_ = 0

