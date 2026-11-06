import time
from typing import Dict, List, Optional
from .types import PathResult, OptimizationObjective, Edge, TrafficLevel
from .graph import Graph
from .priority_queue import PriorityQueue

class Dijkstra:
    @staticmethod
    def find_shortest_path(
        graph: Graph,
        source: int,
        target: int,
        objective: OptimizationObjective = OptimizationObjective.DISTANCE
    ) -> PathResult:
        start_time = time.perf_counter()

        if not graph.has_node(source) or not graph.has_node(target):
            end_time = time.perf_counter()
            return PathResult(
                found=False,
                path=[],
                total_distance_km=0.0,
                total_time_minutes=0.0,
                total_cost=0.0,
                nodes_explored_count=0,
                edges_examined_count=0,
                execution_time_ms=(end_time - start_time) * 1000.0,
                explored_nodes=[],
                algorithm_name="Dijkstra",
                optimization_objective=objective.value if hasattr(objective, "value") else str(objective)
            )

        if source == target:
            end_time = time.perf_counter()
            return PathResult(
                found=True,
                path=[source],
                total_distance_km=0.0,
                total_time_minutes=0.0,
                total_cost=0.0,
                nodes_explored_count=1,
                edges_examined_count=0,
                execution_time_ms=(end_time - start_time) * 1000.0,
                explored_nodes=[source],
                algorithm_name="Dijkstra",
                optimization_objective=objective.value if hasattr(objective, "value") else str(objective)
            )

        dist: Dict[int, float] = {source: 0.0}
        parent: Dict[int, int] = {}
        parent_edge: Dict[int, Edge] = {}
        visited: Dict[int, bool] = {}

        pq: PriorityQueue[int] = PriorityQueue()
        pq.push(source, 0.0)

        edges_examined = 0
        explored_order: List[int] = []

        while not pq.empty():
            d, u = pq.pop()

            if visited.get(u, False):
                continue
            visited[u] = True
            explored_order.append(u)

            if u == target:
                break

            for edge in graph.get_neighbors(u):
                edges_examined += 1
                v = edge.target
                w = edge.get_weight(objective)

                if math_is_inf(w) or edge.traffic_level == TrafficLevel.BLOCKED:
                    continue

                if visited.get(v, False):
                    continue

                new_dist = d + w
                if v not in dist or new_dist < dist[v]:
                    dist[v] = new_dist
                    parent[v] = u
                    parent_edge[v] = edge
                    pq.push(v, new_dist)

        end_time = time.perf_counter()
        exec_ms = (end_time - start_time) * 1000.0

        if target not in dist:
            return PathResult(
                found=False,
                path=[],
                total_distance_km=0.0,
                total_time_minutes=0.0,
                total_cost=0.0,
                nodes_explored_count=len(explored_order),
                edges_examined_count=edges_examined,
                execution_time_ms=exec_ms,
                explored_nodes=explored_order,
                algorithm_name="Dijkstra",
                optimization_objective=objective.value if hasattr(objective, "value") else str(objective)
            )

        # Path reconstruction
        path = []
        curr = target
        while curr != source:
            path.append(curr)
            curr = parent[curr]
        path.append(source)
        path.reverse()

        tot_dist = 0.0
        tot_time = 0.0
        tot_cost = 0.0

        for i in range(1, len(path)):
            to_node = path[i]
            if to_node in parent_edge:
                e = parent_edge[to_node]
                tot_dist += e.distance_km
                tot_time += e.get_travel_time_minutes()
                tot_cost += e.get_monetary_cost()

        return PathResult(
            found=True,
            path=path,
            total_distance_km=round(tot_dist, 4),
            total_time_minutes=round(tot_time, 2),
            total_cost=round(tot_cost, 2),
            nodes_explored_count=len(explored_order),
            edges_examined_count=edges_examined,
            execution_time_ms=round(exec_ms, 3),
            explored_nodes=explored_order,
            algorithm_name="Dijkstra",
            optimization_objective=objective.value if hasattr(objective, "value") else str(objective)
        )

    @staticmethod
    def compute_all_distances(
        graph: Graph,
        source: int,
        objective: OptimizationObjective = OptimizationObjective.DISTANCE
    ) -> Dict[int, float]:
        dist: Dict[int, float] = {}
        if not graph.has_node(source):
            return dist

        dist[source] = 0.0
        pq: PriorityQueue[int] = PriorityQueue()
        pq.push(source, 0.0)
        visited: Dict[int, bool] = {}

        while not pq.empty():
            d, u = pq.pop()
            if visited.get(u, False):
                continue
            visited[u] = True

            for edge in graph.get_neighbors(u):
                v = edge.target
                w = edge.get_weight(objective)
                if math_is_inf(w) or edge.traffic_level == TrafficLevel.BLOCKED:
                    continue

                new_dist = dist[u] + w
                if v not in dist or new_dist < dist[v]:
                    dist[v] = new_dist
                    pq.push(v, new_dist)

        return dist

def math_is_inf(val: float) -> bool:
    return val == float("inf") or val != val

