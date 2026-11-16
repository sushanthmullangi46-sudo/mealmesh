import time
from collections import deque
from typing import List
from .graph import Graph
from .types import ConnectivityResult, TrafficLevel
from .disjoint_set import DisjointSet

class Connectivity:
    @staticmethod
    def bfs_traversal(graph: Graph, start_node: int) -> List[int]:
        order: List[int] = []
        if not graph.has_node(start_node):
            return order

        visited = {start_node}
        queue = deque([start_node])

        while queue:
            u = queue.popleft()
            order.append(u)

            for edge in graph.get_neighbors(u):
                if edge.traffic_level == TrafficLevel.BLOCKED:
                    continue
                v = edge.target
                if v not in visited:
                    visited.add(v)
                    queue.append(v)

        return order

    @staticmethod
    def dfs_traversal(graph: Graph, start_node: int) -> List[int]:
        order: List[int] = []
        if not graph.has_node(start_node):
            return order

        visited = set()
        stack = [start_node]

        while stack:
            u = stack.pop()
            if u in visited:
                continue
            visited.add(u)
            order.append(u)

            for edge in graph.get_neighbors(u):
                if edge.traffic_level == TrafficLevel.BLOCKED:
                    continue
                v = edge.target
                if v not in visited:
                    stack.append(v)

        return order

    @staticmethod
    def analyze_connectivity(graph: Graph) -> ConnectivityResult:
        start_time = time.perf_counter()

        nodes = graph.get_all_nodes()
        total_nodes = len(nodes)
        total_edges = graph.get_edge_count()

        if total_nodes == 0:
            return ConnectivityResult(
                total_nodes=0,
                total_edges=0,
                component_count=0,
                is_fully_connected=True,
                components=[],
                isolated_nodes=[],
                execution_time_ms=0.0
            )

        dsu = DisjointSet()
        for nid in nodes.keys():
            dsu.add_element(nid)

        for u in nodes.keys():
            for edge in graph.get_neighbors(u):
                if edge.traffic_level == TrafficLevel.BLOCKED:
                    continue
                dsu.unite(edge.source, edge.target)

        groups = dsu.get_component_groups()
        components = list(groups.values())
        components.sort(key=lambda c: len(c), reverse=True)

        isolated = [members[0] for members in components if len(members) == 1]

        end_time = time.perf_counter()
        exec_ms = (end_time - start_time) * 1000.0

        return ConnectivityResult(
            total_nodes=total_nodes,
            total_edges=total_edges,
            component_count=len(groups),
            is_fully_connected=(len(groups) <= 1),
            components=components,
            isolated_nodes=isolated,
            execution_time_ms=round(exec_ms, 3)
        )

