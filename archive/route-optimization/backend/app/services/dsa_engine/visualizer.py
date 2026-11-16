import time
from typing import Dict, List, Tuple
from .graph import Graph
from .types import (
    DetailedVisualizationStep,
    VisualizationTrace,
    OptimizationObjective,
    TrafficLevel
)
from .priority_queue import PriorityQueue
from .astar import AStar

def format_val(val: float) -> str:
    if val == float("inf"):
        return "INF"
    return f"{val:.2f}"

class AlgorithmVisualizer:
    @staticmethod
    def trace_dijkstra(
        graph: Graph,
        source: int,
        target: int,
        objective: OptimizationObjective = OptimizationObjective.DISTANCE
    ) -> VisualizationTrace:
        start_time = time.perf_counter()

        if not graph.has_node(source) or not graph.has_node(target):
            return VisualizationTrace(
                algorithm_name="Dijkstra",
                source=source,
                target=target,
                path_found=False,
                final_path=[],
                total_cost=0.0,
                total_steps=1,
                steps=[DetailedVisualizationStep(
                    step_index=0,
                    event_type="NO_PATH",
                    current_node=source,
                    description="Source or target node not found in graph."
                )],
                execution_time_ms=0.0
            )

        dist: Dict[int, float] = {source: 0.0}
        parent: Dict[int, int] = {}
        visited: Dict[int, bool] = {}
        visited_list: List[int] = []

        pq: PriorityQueue[int] = PriorityQueue()
        pq.push(source, 0.0)

        steps: List[DetailedVisualizationStep] = []
        step_idx = 0

        # Initial step
        steps.append(DetailedVisualizationStep(
            step_index=step_idx,
            event_type="VISIT_NODE",
            current_node=source,
            current_dist=0.0,
            priority_score=0.0,
            description=f"Initialized Dijkstra search. Pushed source node {source} with distance 0.",
            priority_queue_state=pq.get_top_k(10),
            visited_nodes=list(visited_list),
            parent_map=dict(parent),
            distance_map=dict(dist)
        ))
        step_idx += 1

        reached = False

        while not pq.empty():
            d, u = pq.pop()

            if visited.get(u, False):
                continue
            visited[u] = True
            visited_list.append(u)

            steps.append(DetailedVisualizationStep(
                step_index=step_idx,
                event_type="VISIT_NODE",
                current_node=u,
                current_dist=d,
                priority_score=d,
                description=f"Extracted node {u} from Min-Heap with settled cost {format_val(d)}",
                priority_queue_state=pq.get_top_k(10),
                visited_nodes=list(visited_list),
                parent_map=dict(parent),
                distance_map=dict(dist)
            ))
            step_idx += 1

            if u == target:
                reached = True
                steps.append(DetailedVisualizationStep(
                    step_index=step_idx,
                    event_type="REACH_GOAL",
                    current_node=u,
                    current_dist=d,
                    description=f"Reached target node {target} with optimal cost {format_val(d)}",
                    priority_queue_state=pq.get_top_k(10),
                    visited_nodes=list(visited_list),
                    parent_map=dict(parent),
                    distance_map=dict(dist)
                ))
                step_idx += 1
                break

            for edge in graph.get_neighbors(u):
                v = edge.target
                w = edge.get_weight(objective)

                if w == float("inf") or edge.traffic_level == TrafficLevel.BLOCKED:
                    steps.append(DetailedVisualizationStep(
                        step_index=step_idx,
                        event_type="SKIP_EDGE",
                        current_node=u,
                        neighbor_node=v,
                        edge_weight=w,
                        description=f"Edge ({u} -> {v}) is BLOCKED by traffic.",
                        priority_queue_state=pq.get_top_k(10),
                        visited_nodes=list(visited_list),
                        parent_map=dict(parent),
                        distance_map=dict(dist)
                    ))
                    step_idx += 1
                    continue

                if visited.get(v, False):
                    steps.append(DetailedVisualizationStep(
                        step_index=step_idx,
                        event_type="SKIP_EDGE",
                        current_node=u,
                        neighbor_node=v,
                        edge_weight=w,
                        description=f"Neighbor node {v} already settled. Skipping.",
                        priority_queue_state=pq.get_top_k(10),
                        visited_nodes=list(visited_list),
                        parent_map=dict(parent),
                        distance_map=dict(dist)
                    ))
                    step_idx += 1
                    continue

                old_dist = dist.get(v, float("inf"))
                new_dist = d + w

                if new_dist < old_dist:
                    dist[v] = new_dist
                    parent[v] = u
                    pq.push(v, new_dist)

                    steps.append(DetailedVisualizationStep(
                        step_index=step_idx,
                        event_type="UPDATE_DISTANCE",
                        current_node=u,
                        neighbor_node=v,
                        edge_weight=w,
                        current_dist=old_dist,
                        tentative_dist=new_dist,
                        priority_score=new_dist,
                        description=f"Relaxed edge ({u} -> {v}): improved distance from {format_val(old_dist)} to {format_val(new_dist)}. Pushed to PQ.",
                        priority_queue_state=pq.get_top_k(10),
                        visited_nodes=list(visited_list),
                        parent_map=dict(parent),
                        distance_map=dict(dist)
                    ))
                else:
                    steps.append(DetailedVisualizationStep(
                        step_index=step_idx,
                        event_type="EXAMINE_EDGE",
                        current_node=u,
                        neighbor_node=v,
                        edge_weight=w,
                        current_dist=old_dist,
                        tentative_dist=new_dist,
                        description=f"Examined edge ({u} -> {v}): tentative distance {format_val(new_dist)} >= existing {format_val(old_dist)}.",
                        priority_queue_state=pq.get_top_k(10),
                        visited_nodes=list(visited_list),
                        parent_map=dict(parent),
                        distance_map=dict(dist)
                    ))
                step_idx += 1

        final_path = []
        if reached:
            curr = target
            while curr != source:
                final_path.append(curr)
                curr = parent[curr]
            final_path.append(source)
            final_path.reverse()

        exec_ms = (time.perf_counter() - start_time) * 1000.0

        return VisualizationTrace(
            algorithm_name="Dijkstra",
            source=source,
            target=target,
            path_found=reached,
            final_path=final_path,
            total_cost=round(dist.get(target, 0.0), 3),
            total_steps=len(steps),
            steps=steps,
            execution_time_ms=round(exec_ms, 3)
        )

    @staticmethod
    def trace_astar(
        graph: Graph,
        source: int,
        target: int,
        objective: OptimizationObjective = OptimizationObjective.DISTANCE
    ) -> VisualizationTrace:
        start_time = time.perf_counter()

        if not graph.has_node(source) or not graph.has_node(target):
            return VisualizationTrace(
                algorithm_name="A*",
                source=source,
                target=target,
                path_found=False,
                final_path=[],
                total_cost=0.0,
                total_steps=1,
                steps=[DetailedVisualizationStep(
                    step_index=0,
                    event_type="NO_PATH",
                    current_node=source,
                    description="Source or target node not found in graph."
                )],
                execution_time_ms=0.0
            )

        g_score: Dict[int, float] = {source: 0.0}
        f_score: Dict[int, float] = {}
        parent: Dict[int, int] = {}
        closed_set: Dict[int, bool] = {}
        closed_list: List[int] = []

        initial_h = AStar.calculate_heuristic(graph, source, target, objective)
        f_score[source] = initial_h

        open_set: PriorityQueue[int] = PriorityQueue()
        open_set.push(source, initial_h)

        steps: List[DetailedVisualizationStep] = []
        step_idx = 0

        steps.append(DetailedVisualizationStep(
            step_index=step_idx,
            event_type="VISIT_NODE",
            current_node=source,
            current_dist=0.0,
            heuristic=initial_h,
            priority_score=initial_h,
            description=f"Initialized A*. g={format_val(0.0)}, h={format_val(initial_h)} => f={format_val(initial_h)}",
            priority_queue_state=open_set.get_top_k(10),
            visited_nodes=list(closed_list),
            parent_map=dict(parent),
            distance_map=dict(g_score)
        ))
        step_idx += 1

        reached = False

        while not open_set.empty():
            f_val, current = open_set.pop()

            if closed_set.get(current, False):
                continue
            closed_set[current] = True
            closed_list.append(current)

            curr_g = g_score[current]
            curr_h = AStar.calculate_heuristic(graph, current, target, objective)

            steps.append(DetailedVisualizationStep(
                step_index=step_idx,
                event_type="VISIT_NODE",
                current_node=current,
                current_dist=curr_g,
                heuristic=curr_h,
                priority_score=f_val,
                description=f"Expanded node {current} from Open Set. [g={format_val(curr_g)}, h={format_val(curr_h)}, f={format_val(f_val)}]",
                priority_queue_state=open_set.get_top_k(10),
                visited_nodes=list(closed_list),
                parent_map=dict(parent),
                distance_map=dict(g_score)
            ))
            step_idx += 1

            if current == target:
                reached = True
                steps.append(DetailedVisualizationStep(
                    step_index=step_idx,
                    event_type="REACH_GOAL",
                    current_node=current,
                    current_dist=curr_g,
                    description=f"Target node {target} reached! Optimal g={format_val(curr_g)}",
                    priority_queue_state=open_set.get_top_k(10),
                    visited_nodes=list(closed_list),
                    parent_map=dict(parent),
                    distance_map=dict(g_score)
                ))
                step_idx += 1
                break

            for edge in graph.get_neighbors(current):
                neighbor = edge.target
                w = edge.get_weight(objective)

                if w == float("inf") or edge.traffic_level == TrafficLevel.BLOCKED:
                    steps.append(DetailedVisualizationStep(
                        step_index=step_idx,
                        event_type="SKIP_EDGE",
                        current_node=current,
                        neighbor_node=neighbor,
                        edge_weight=w,
                        description=f"Edge ({current} -> {neighbor}) is BLOCKED.",
                        priority_queue_state=open_set.get_top_k(10),
                        visited_nodes=list(closed_list),
                        parent_map=dict(parent),
                        distance_map=dict(g_score)
                    ))
                    step_idx += 1
                    continue

                if closed_set.get(neighbor, False):
                    steps.append(DetailedVisualizationStep(
                        step_index=step_idx,
                        event_type="SKIP_EDGE",
                        current_node=current,
                        neighbor_node=neighbor,
                        edge_weight=w,
                        description=f"Neighbor {neighbor} is in Closed Set.",
                        priority_queue_state=open_set.get_top_k(10),
                        visited_nodes=list(closed_list),
                        parent_map=dict(parent),
                        distance_map=dict(g_score)
                    ))
                    step_idx += 1
                    continue

                tentative_g = curr_g + w
                old_g = g_score.get(neighbor, float("inf"))

                if tentative_g < old_g:
                    parent[neighbor] = current
                    g_score[neighbor] = tentative_g
                    h = AStar.calculate_heuristic(graph, neighbor, target, objective)
                    new_f = tentative_g + h
                    f_score[neighbor] = new_f
                    open_set.push(neighbor, new_f)

                    steps.append(DetailedVisualizationStep(
                        step_index=step_idx,
                        event_type="UPDATE_DISTANCE",
                        current_node=current,
                        neighbor_node=neighbor,
                        edge_weight=w,
                        current_dist=old_g,
                        tentative_dist=tentative_g,
                        heuristic=h,
                        priority_score=new_f,
                        description=f"Relaxed edge: g({neighbor}) updated to {format_val(tentative_g)} + h={format_val(h)} => f={format_val(new_f)}",
                        priority_queue_state=open_set.get_top_k(10),
                        visited_nodes=list(closed_list),
                        parent_map=dict(parent),
                        distance_map=dict(g_score)
                    ))
                else:
                    steps.append(DetailedVisualizationStep(
                        step_index=step_idx,
                        event_type="EXAMINE_EDGE",
                        current_node=current,
                        neighbor_node=neighbor,
                        edge_weight=w,
                        current_dist=old_g,
                        tentative_dist=tentative_g,
                        description=f"Examined edge: tentative g {format_val(tentative_g)} >= existing {format_val(old_g)}",
                        priority_queue_state=open_set.get_top_k(10),
                        visited_nodes=list(closed_list),
                        parent_map=dict(parent),
                        distance_map=dict(g_score)
                    ))
                step_idx += 1

        final_path = []
        if reached:
            curr = target
            while curr != source:
                final_path.append(curr)
                curr = parent[curr]
            final_path.append(source)
            final_path.reverse()

        exec_ms = (time.perf_counter() - start_time) * 1000.0

        return VisualizationTrace(
            algorithm_name="A*",
            source=source,
            target=target,
            path_found=reached,
            final_path=final_path,
            total_cost=round(g_score.get(target, 0.0), 3),
            total_steps=len(steps),
            steps=steps,
            execution_time_ms=round(exec_ms, 3)
        )

