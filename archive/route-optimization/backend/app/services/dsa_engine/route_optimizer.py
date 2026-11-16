import time
from typing import List, Dict, Tuple
from .graph import Graph
from .types import TSPResult, OptimizationObjective
from .dijkstra import Dijkstra

class RouteOptimizer:
    @staticmethod
    def optimize_tour(
        graph: Graph,
        start_node: int,
        waypoints: List[int],
        end_node: int = -1,
        round_trip: bool = False
    ) -> TSPResult:
        start_time = time.perf_counter()

        if not graph.has_node(start_node):
            return TSPResult(
                success=False,
                tour_order=[],
                complete_path=[],
                initial_distance_km=0.0,
                optimized_distance_km=0.0,
                distance_saved_km=0.0,
                improvement_percentage=0.0,
                two_opt_iterations=0,
                execution_time_ms=0.0
            )

        seen = {start_node}
        targets = []
        for wp in waypoints:
            if graph.has_node(wp) and wp not in seen:
                targets.append(wp)
                seen.add(wp)

        final_dest = end_node if (end_node != -1 and graph.has_node(end_node)) else start_node

        if final_dest == start_node and not round_trip and not targets:
            return TSPResult(
                success=True,
                tour_order=[start_node],
                complete_path=[start_node],
                initial_distance_km=0.0,
                optimized_distance_km=0.0,
                distance_saved_km=0.0,
                improvement_percentage=0.0,
                two_opt_iterations=0,
                execution_time_ms=0.0
            )

        all_nodes = [start_node] + targets
        if final_dest != start_node:
            all_nodes.append(final_dest)

        dist_matrix: Dict[Tuple[int, int], float] = {}
        path_matrix: Dict[Tuple[int, int], List[int]] = {}

        for u in all_nodes:
            for v in all_nodes:
                if u == v:
                    dist_matrix[(u, v)] = 0.0
                    path_matrix[(u, v)] = [u]
                    continue

                res = Dijkstra.find_shortest_path(graph, u, v, OptimizationObjective.DISTANCE)
                if not res.found:
                    dist_matrix[(u, v)] = float("inf")
                    path_matrix[(u, v)] = []
                else:
                    dist_matrix[(u, v)] = res.total_distance_km
                    path_matrix[(u, v)] = res.path

        # Step 1: Greedy Nearest Neighbor Construction
        tour = [start_node]
        unvisited = set(targets)
        current = start_node

        while unvisited:
            nearest = -1
            best_dist = float("inf")

            for cand in unvisited:
                d = dist_matrix.get((current, cand), float("inf"))
                if d < best_dist:
                    best_dist = d
                    nearest = cand

            if nearest == -1 or best_dist == float("inf"):
                return TSPResult(
                    success=False,
                    tour_order=[],
                    complete_path=[],
                    initial_distance_km=0.0,
                    optimized_distance_km=0.0,
                    distance_saved_km=0.0,
                    improvement_percentage=0.0,
                    two_opt_iterations=0,
                    execution_time_ms=(time.perf_counter() - start_time) * 1000.0
                )

            tour.append(nearest)
            unvisited.remove(nearest)
            current = nearest

        if round_trip or final_dest != start_node:
            tour.append(final_dest)

        def tour_length(t: List[int]) -> float:
            total = 0.0
            for i in range(len(t) - 1):
                d = dist_matrix.get((t[i], t[i + 1]), float("inf"))
                if d == float("inf"):
                    return float("inf")
                total += d
            return total

        initial_len = tour_length(tour)

        # Step 2: 2-Opt Local Search Improvement
        best_tour = list(tour)
        best_length = initial_len
        iterations = 0
        improved = True

        end_limit = len(best_tour) - 2 if (round_trip or final_dest != start_node) else len(best_tour) - 1

        while improved and iterations < 500:
            improved = False
            iterations += 1

            for i in range(1, end_limit):
                for j in range(i + 1, end_limit + 1):
                    if j >= len(best_tour):
                        continue

                    # 2-opt reversal
                    new_tour = best_tour[:i] + best_tour[i:j + 1][::-1] + best_tour[j + 1:]
                    new_len = tour_length(new_tour)

                    if new_len < best_length - 1e-6:
                        best_tour = new_tour
                        best_length = new_len
                        improved = True
                        break
                if improved:
                    break

        saved = max(0.0, initial_len - best_length)
        pct = (saved / initial_len * 100.0) if initial_len > 0 else 0.0

        # Build complete street path
        complete_path: List[int] = []
        for i in range(len(best_tour) - 1):
            subpath = path_matrix.get((best_tour[i], best_tour[i + 1]), [])
            if not subpath:
                return TSPResult(
                    success=False,
                    tour_order=[],
                    complete_path=[],
                    initial_distance_km=0.0,
                    optimized_distance_km=0.0,
                    distance_saved_km=0.0,
                    improvement_percentage=0.0,
                    two_opt_iterations=iterations,
                    execution_time_ms=(time.perf_counter() - start_time) * 1000.0
                )
            if not complete_path:
                complete_path.extend(subpath)
            else:
                complete_path.extend(subpath[1:])

        exec_ms = (time.perf_counter() - start_time) * 1000.0

        return TSPResult(
            success=True,
            tour_order=best_tour,
            complete_path=complete_path,
            initial_distance_km=round(initial_len, 4),
            optimized_distance_km=round(best_length, 4),
            distance_saved_km=round(saved, 4),
            improvement_percentage=round(pct, 2),
            two_opt_iterations=iterations,
            execution_time_ms=round(exec_ms, 3)
        )

