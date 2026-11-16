import time
from typing import Dict, List, Optional
from .types import PathResult, OptimizationObjective, Edge, TrafficLevel
from .graph import Graph, haversine_distance
from .priority_queue import PriorityQueue

class AStar:
    @staticmethod
    def calculate_heuristic(
        graph: Graph,
        u: int,
        target: int,
        objective: OptimizationObjective = OptimizationObjective.DISTANCE
    ) -> float:
        if u == target:
            return 0.0

        u_node = graph.get_node(u)
        target_node = graph.get_node(target)
        if not u_node or not target_node:
            return 0.0

        straight_line_km = haversine_distance(
            u_node.latitude, u_node.longitude,
            target_node.latitude, target_node.longitude
        )

        if objective == OptimizationObjective.DISTANCE:
            return straight_line_km
        elif objective == OptimizationObjective.TIME:
            max_speed = max(10.0, graph.get_max_speed_kmh())
            return (straight_line_km / max_speed) * 60.0
        elif objective == OptimizationObjective.COST:
            min_fuel = straight_line_km * Edge.FUEL_COST_PER_KM
            max_speed = max(10.0, graph.get_max_speed_kmh())
            min_time_cost = ((straight_line_km / max_speed) * 60.0) * Edge.TIME_VALUE_PER_MIN
            return min_fuel + min_time_cost
        return straight_line_km

    @staticmethod
    def find_path(
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
                algorithm_name="A*",
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
                algorithm_name="A*",
                optimization_objective=objective.value if hasattr(objective, "value") else str(objective)
            )

        g_score: Dict[int, float] = {source: 0.0}
        f_score: Dict[int, float] = {}
        parent: Dict[int, int] = {}
        parent_edge: Dict[int, Edge] = {}
        closed_set: Dict[int, bool] = {}

        initial_h = AStar.calculate_heuristic(graph, source, target, objective)
        f_score[source] = initial_h

        open_set: PriorityQueue[int] = PriorityQueue()
        open_set.push(source, initial_h)

        edges_examined = 0
        explored_order: List[int] = []

        while not open_set.empty():
            f, current = open_set.pop()

            if closed_set.get(current, False):
                continue
            closed_set[current] = True
            explored_order.append(current)

            if current == target:
                break

            for edge in graph.get_neighbors(current):
                edges_examined += 1
                neighbor = edge.target
                w = edge.get_weight(objective)

                if w == float("inf") or edge.traffic_level == TrafficLevel.BLOCKED:
                    continue

                if closed_set.get(neighbor, False):
                    continue

                tentative_g = g_score[current] + w
                if neighbor not in g_score or tentative_g < g_score[neighbor]:
                    parent[neighbor] = current
                    parent_edge[neighbor] = edge
                    g_score[neighbor] = tentative_g
                    h = AStar.calculate_heuristic(graph, neighbor, target, objective)
                    f_val = tentative_g + h
                    f_score[neighbor] = f_val
                    open_set.push(neighbor, f_val)

        end_time = time.perf_counter()
        exec_ms = (end_time - start_time) * 1000.0

        if target not in g_score:
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
                algorithm_name="A*",
                optimization_objective=objective.value if hasattr(objective, "value") else str(objective)
            )

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
            algorithm_name="A*",
            optimization_objective=objective.value if hasattr(objective, "value") else str(objective)
        )

