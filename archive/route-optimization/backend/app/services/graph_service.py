import math
import random
import time
from typing import List, Dict, Optional, Tuple, Any
from sqlalchemy.orm import Session
from app.models import Location as LocationModel, Road as RoadModel, RouteHistory, AlgorithmBenchmark
from app.services.dsa_engine import (
    Graph, Node, Edge, Dijkstra, AStar, Connectivity, RouteOptimizer,
    AlgorithmVisualizer, TrafficLevel, OptimizationObjective,
    PathResult, TSPResult, ConnectivityResult, VisualizationTrace,
    haversine_distance, HAS_CPP_ENGINE
)
from app.schemas import (
    RouteResponse, PathStepDetail, MultiCriteriaCompareResponse,
    MultiStopResponse, ConnectivityAnalysisResponse, ComponentDetail,
    VisualizationResponse, VisualizationStepOut, BenchmarkResponse,
    BenchmarkMetricItem, GraphStats, TrafficLevelEnum, ObjectiveEnum
)
from database.seed.seed_data import INITIAL_LOCATIONS, INITIAL_ROADS

class GraphService:
    _instance: Optional["GraphService"] = None

    def __init__(self):
        self.graph: Graph = Graph()
        self.is_initialized: bool = False

    @classmethod
    def get_instance(cls) -> "GraphService":
        if cls._instance is None:
            cls._instance = GraphService()
        return cls._instance

    def initialize_from_db(self, db: Session, force_reseed: bool = False):
        """Load locations and roads from DB into in-memory DSA Graph. If empty, seed automatically."""
        loc_count = db.query(LocationModel).count()
        if loc_count == 0 or force_reseed:
            self._seed_database(db)

        self.graph.clear()
        locations = db.query(LocationModel).all()
        for loc in locations:
            self.graph.add_node(Node(
                id=loc.id,
                name=loc.name,
                latitude=loc.latitude,
                longitude=loc.longitude,
                elevation_m=loc.elevation_m,
                type=loc.type
            ))

        roads = db.query(RoadModel).all()
        for road in roads:
            self.graph.add_edge(Edge(
                id=road.id,
                source=road.source_id,
                target=road.target_id,
                distance_km=road.distance_km,
                speed_limit_kmh=road.speed_limit_kmh,
                traffic_level=TrafficLevel(road.traffic_level),
                toll_cost=road.toll_cost,
                is_one_way=road.is_one_way,
                road_name=road.road_name,
                road_type=road.road_type
            ))

        self.is_initialized = True

    def _seed_database(self, db: Session):
        db.query(RoadModel).delete()
        db.query(LocationModel).delete()
        db.commit()

        loc_objs = [LocationModel(**loc) for loc in INITIAL_LOCATIONS]
        db.add_all(loc_objs)
        db.commit()

        road_objs = [RoadModel(**road) for road in INITIAL_ROADS]
        db.add_all(road_objs)
        db.commit()

    def get_stats(self, db: Session) -> GraphStats:
        total_locs = self.graph.get_node_count()
        total_roads = self.graph.get_edge_count()
        conn = Connectivity.analyze_connectivity(self.graph)

        edges = self.graph.get_all_edges()
        avg_dist = (sum(e.distance_km for e in edges) / len(edges)) if edges else 0.0
        avg_speed = (sum(e.speed_limit_kmh for e in edges) / len(edges)) if edges else 0.0

        return GraphStats(
            total_locations=total_locs,
            total_roads=total_roads,
            connected_components=conn.component_count,
            is_fully_connected=conn.is_fully_connected,
            average_road_distance_km=round(avg_dist, 2),
            average_speed_limit_kmh=round(avg_speed, 1),
            version=self.graph.get_version(),
            engine_type="Native C++20 (pybind11)" if HAS_CPP_ENGINE else "High-Performance Pure Python"
        )

    def _build_route_response(
        self,
        res: PathResult,
        source_id: int,
        target_id: int,
        algorithm: str,
        objective: ObjectiveEnum
    ) -> RouteResponse:
        coords: List[List[float]] = []
        steps: List[PathStepDetail] = []

        if not res.found or len(res.path) == 0:
            return RouteResponse(
                found=False,
                algorithm=algorithm,
                objective=objective,
                source_id=source_id,
                target_id=target_id,
                total_distance_km=0.0,
                total_time_minutes=0.0,
                total_cost=0.0,
                nodes_explored=res.nodes_explored_count,
                edges_examined=res.edges_examined_count,
                execution_time_ms=res.execution_time_ms,
                path_node_ids=[],
                path_coordinates=[],
                detailed_steps=[],
                message="No connected path exists between specified locations."
            )

        for nid in res.path:
            node = self.graph.get_node(nid)
            if node:
                coords.append([node.latitude, node.longitude])

        # Construct step-by-step navigation instructions
        for i in range(len(res.path) - 1):
            u_id = res.path[i]
            v_id = res.path[i + 1]
            u_node = self.graph.get_node(u_id)
            v_node = self.graph.get_node(v_id)

            edge = None
            for e in self.graph.get_neighbors(u_id):
                if e.target == v_id:
                    edge = e
                    break

            if edge and u_node and v_node:
                steps.append(PathStepDetail(
                    step_number=i + 1,
                    from_node_id=u_id,
                    to_node_id=v_id,
                    from_node_name=u_node.name,
                    to_node_name=v_node.name,
                    road_name=edge.road_name,
                    distance_km=round(edge.distance_km, 2),
                    travel_time_minutes=round(edge.get_travel_time_minutes(), 2),
                    cost=round(edge.get_monetary_cost(), 2),
                    traffic_level=TrafficLevelEnum(edge.traffic_level.value if hasattr(edge.traffic_level, "value") else str(edge.traffic_level))
                ))

        return RouteResponse(
            found=True,
            algorithm=algorithm,
            objective=objective,
            source_id=source_id,
            target_id=target_id,
            total_distance_km=res.total_distance_km,
            total_time_minutes=res.total_time_minutes,
            total_cost=res.total_cost,
            nodes_explored=res.nodes_explored_count,
            edges_examined=res.edges_examined_count,
            execution_time_ms=res.execution_time_ms,
            path_node_ids=res.path,
            path_coordinates=coords,
            detailed_steps=steps,
            message="Optimal route computed successfully."
        )

    def find_route_dijkstra(
        self,
        source_id: int,
        target_id: int,
        objective: ObjectiveEnum,
        db: Optional[Session] = None
    ) -> RouteResponse:
        dsa_obj = OptimizationObjective(objective.value)
        res = Dijkstra.find_shortest_path(self.graph, source_id, target_id, dsa_obj)
        response = self._build_route_response(res, source_id, target_id, "Dijkstra", objective)

        if db and response.found:
            self._record_history(db, response)

        return response

    def find_route_astar(
        self,
        source_id: int,
        target_id: int,
        objective: ObjectiveEnum,
        db: Optional[Session] = None
    ) -> RouteResponse:
        dsa_obj = OptimizationObjective(objective.value)
        res = AStar.find_path(self.graph, source_id, target_id, dsa_obj)
        response = self._build_route_response(res, source_id, target_id, "A*", objective)

        if db and response.found:
            self._record_history(db, response)

        return response

    def compare_multiple_routes(
        self,
        source_id: int,
        target_id: int
    ) -> MultiCriteriaCompareResponse:
        # 1. Shortest Distance
        d_dist = Dijkstra.find_shortest_path(self.graph, source_id, target_id, OptimizationObjective.DISTANCE)
        dist_resp = self._build_route_response(d_dist, source_id, target_id, "Dijkstra (Distance)", ObjectiveEnum.DISTANCE)

        # 2. Fastest Travel Time
        d_time = Dijkstra.find_shortest_path(self.graph, source_id, target_id, OptimizationObjective.TIME)
        time_resp = self._build_route_response(d_time, source_id, target_id, "Dijkstra (Fastest Time)", ObjectiveEnum.TIME)

        # 3. Lowest Monetary Cost
        d_cost = Dijkstra.find_shortest_path(self.graph, source_id, target_id, OptimizationObjective.COST)
        cost_resp = self._build_route_response(d_cost, source_id, target_id, "Dijkstra (Lowest Cost)", ObjectiveEnum.COST)

        return MultiCriteriaCompareResponse(
            source_id=source_id,
            target_id=target_id,
            shortest_distance_route=dist_resp,
            fastest_time_route=time_resp,
            lowest_cost_route=cost_resp
        )

    def optimize_multi_stop(
        self,
        start_id: int,
        waypoint_ids: List[int],
        end_id: Optional[int] = None,
        round_trip: bool = False
    ) -> MultiStopResponse:
        final_dest = end_id if (end_id is not None and end_id != -1) else -1
        tsp = RouteOptimizer.optimize_tour(self.graph, start_id, waypoint_ids, final_dest, round_trip)

        coords: List[List[float]] = []
        for nid in tsp.complete_path:
            node = self.graph.get_node(nid)
            if node:
                coords.append([node.latitude, node.longitude])

        return MultiStopResponse(
            success=tsp.success,
            tour_node_ids=tsp.tour_order,
            complete_path_node_ids=tsp.complete_path,
            complete_path_coordinates=coords,
            initial_distance_km=tsp.initial_distance_km,
            optimized_distance_km=tsp.optimized_distance_km,
            distance_saved_km=tsp.distance_saved_km,
            improvement_percentage=tsp.improvement_percentage,
            two_opt_iterations=tsp.two_opt_iterations,
            execution_time_ms=tsp.execution_time_ms
        )

    def analyze_connectivity(self) -> ConnectivityAnalysisResponse:
        cr = Connectivity.analyze_connectivity(self.graph)
        comp_details: List[ComponentDetail] = []

        for idx, members in enumerate(cr.components):
            names = []
            for m in members:
                node = self.graph.get_node(m)
                names.append(node.name if node else f"Node {m}")

            comp_details.append(ComponentDetail(
                component_id=idx + 1,
                node_count=len(members),
                node_ids=members,
                node_names=names
            ))

        desc = (
            f"The road network has {cr.total_nodes} locations and {cr.total_edges} roads. "
            f"Disjoint Set Union (DSU) partitioned the network into {cr.component_count} connected component(s). "
        )
        if cr.is_fully_connected:
            desc += "All locations are reachable from one another."
        else:
            desc += f"Detected {len(cr.isolated_nodes)} isolated or island location(s)."

        return ConnectivityAnalysisResponse(
            total_nodes=cr.total_nodes,
            total_edges=cr.total_edges,
            component_count=cr.component_count,
            is_fully_connected=cr.is_fully_connected,
            components=comp_details,
            isolated_nodes=cr.isolated_nodes,
            execution_time_ms=cr.execution_time_ms,
            description=desc
        )

    def generate_visualization_trace(
        self,
        source_id: int,
        target_id: int,
        algorithm: str = "Dijkstra",
        objective: ObjectiveEnum = ObjectiveEnum.DISTANCE
    ) -> VisualizationResponse:
        dsa_obj = OptimizationObjective(objective.value)
        if algorithm.lower() == "astar" or algorithm.lower() == "a*":
            trace = AlgorithmVisualizer.trace_astar(self.graph, source_id, target_id, dsa_obj)
        else:
            trace = AlgorithmVisualizer.trace_dijkstra(self.graph, source_id, target_id, dsa_obj)

        coords: List[List[float]] = []
        for nid in trace.final_path:
            node = self.graph.get_node(nid)
            if node:
                coords.append([node.latitude, node.longitude])

        steps_out: List[VisualizationStepOut] = []
        for s in trace.steps:
            steps_out.append(VisualizationStepOut(
                step_index=s.step_index,
                event_type=s.event_type,
                current_node=s.current_node,
                neighbor_node=s.neighbor_node,
                edge_weight=round(s.edge_weight, 2),
                current_dist=round(s.current_dist, 2),
                tentative_dist=round(s.tentative_dist, 2),
                heuristic=round(s.heuristic, 2),
                priority_score=round(s.priority_score, 2),
                description=s.description,
                priority_queue_state=[[elem, round(prio, 2)] for elem, prio in s.priority_queue_state],
                visited_nodes=s.visited_nodes,
                parent_map={str(k): v for k, v in s.parent_map.items()},
                distance_map={str(k): round(v, 2) for k, v in s.distance_map.items()}
            ))

        return VisualizationResponse(
            algorithm_name=trace.algorithm_name,
            source_id=source_id,
            target_id=target_id,
            path_found=trace.path_found,
            final_path=trace.final_path,
            final_path_coords=coords,
            total_cost=trace.total_cost,
            total_steps=trace.total_steps,
            execution_time_ms=trace.execution_time_ms,
            steps=steps_out
        )

    def update_road_traffic(
        self,
        road_id: str,
        traffic_level: TrafficLevelEnum,
        db: Session
    ) -> bool:
        db_road = db.query(RoadModel).filter(RoadModel.id == road_id).first()
        if not db_road:
            return False

        db_road.traffic_level = traffic_level.value
        db.commit()

        self.graph.update_edge_traffic(road_id, TrafficLevel(traffic_level.value))
        return True

    def randomize_traffic(self, db: Session) -> Dict[str, str]:
        roads = db.query(RoadModel).all()
        levels = [TrafficLevelEnum.LOW, TrafficLevelEnum.MEDIUM, TrafficLevelEnum.HIGH, TrafficLevelEnum.BLOCKED]
        weights = [0.55, 0.25, 0.15, 0.05] # Realistic congestion distribution
        updates = {}

        for road in roads:
            new_lvl = random.choices(levels, weights=weights)[0]
            road.traffic_level = new_lvl.value
            updates[road.id] = new_lvl.value
            self.graph.update_edge_traffic(road.id, TrafficLevel(new_lvl.value))

        db.commit()
        return updates

    def reset_traffic(self, db: Session):
        roads = db.query(RoadModel).all()
        for road in roads:
            road.traffic_level = TrafficLevelEnum.LOW.value
            self.graph.update_edge_traffic(road.id, TrafficLevel.LOW)
        db.commit()

    def run_benchmarks(self, sizes: List[int], db: Optional[Session] = None) -> BenchmarkResponse:
        results: List[BenchmarkMetricItem] = []

        for size in sizes:
            bg = Graph()
            random.seed(42 + size)
            # Create synthetic node lattice
            for i in range(1, size + 1):
                lat = 40.70 + (i % int(math.sqrt(size) + 1)) * 0.005
                lon = -74.01 + (i // int(math.sqrt(size) + 1)) * 0.005
                bg.add_node(Node(i, f"Bench_{i}", lat, lon))

            edge_count = 0
            k = min(size - 1, 4)
            for i in range(1, size + 1):
                for off in range(1, k + 1):
                    target_idx = ((i + off - 1) % size) + 1
                    if target_idx == i:
                        continue
                    n1 = bg.get_node(i)
                    n2 = bg.get_node(target_idx)
                    if n1 and n2:
                        dist = haversine_distance(n1.latitude, n1.longitude, n2.latitude, n2.longitude)
                        edge_count += 1
                        bg.add_edge(Edge(f"be_{edge_count}", i, target_idx, max(0.1, dist), 50.0))

            src = 1
            dst = max(2, size // 2)

            # Benchmark Dijkstra
            d_times = []
            d_res = None
            for _ in range(3):
                t0 = time.perf_counter()
                d_res = Dijkstra.find_shortest_path(bg, src, dst, OptimizationObjective.DISTANCE)
                d_times.append((time.perf_counter() - t0) * 1000.0)

            avg_d_time = sum(d_times) / len(d_times)
            d_metric = BenchmarkMetricItem(
                algorithm="Dijkstra",
                graph_size=size,
                edges_count=edge_count,
                execution_time_ms=round(avg_d_time, 3),
                nodes_explored=d_res.nodes_explored_count if d_res else 0,
                edges_examined=d_res.edges_examined_count if d_res else 0,
                path_distance_km=d_res.total_distance_km if d_res else 0.0
            )
            results.append(d_metric)

            # Benchmark A*
            a_times = []
            a_res = None
            for _ in range(3):
                t0 = time.perf_counter()
                a_res = AStar.find_path(bg, src, dst, OptimizationObjective.DISTANCE)
                a_times.append((time.perf_counter() - t0) * 1000.0)

            avg_a_time = sum(a_times) / len(a_times)
            a_metric = BenchmarkMetricItem(
                algorithm="A*",
                graph_size=size,
                edges_count=edge_count,
                execution_time_ms=round(avg_a_time, 3),
                nodes_explored=a_res.nodes_explored_count if a_res else 0,
                edges_examined=a_res.edges_examined_count if a_res else 0,
                path_distance_km=a_res.total_distance_km if a_res else 0.0
            )
            results.append(a_metric)

            if db:
                db.add(AlgorithmBenchmark(
                    algorithm=d_metric.algorithm,
                    graph_size=d_metric.graph_size,
                    edges_count=d_metric.edges_count,
                    execution_time_ms=d_metric.execution_time_ms,
                    nodes_explored=d_metric.nodes_explored,
                    edges_examined=d_metric.edges_examined,
                    path_distance_km=d_metric.path_distance_km
                ))
                db.add(AlgorithmBenchmark(
                    algorithm=a_metric.algorithm,
                    graph_size=a_metric.graph_size,
                    edges_count=a_metric.edges_count,
                    execution_time_ms=a_metric.execution_time_ms,
                    nodes_explored=a_metric.nodes_explored,
                    edges_examined=a_metric.edges_examined,
                    path_distance_km=a_metric.path_distance_km
                ))
                db.commit()

        return BenchmarkResponse(
            results=results,
            timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        )

    def _record_history(self, db: Session, route_resp: RouteResponse):
        try:
            hist = RouteHistory(
                source_id=route_resp.source_id,
                target_id=route_resp.target_id,
                algorithm=route_resp.algorithm,
                objective=route_resp.objective.value,
                distance_km=route_resp.total_distance_km,
                time_minutes=route_resp.total_time_minutes,
                cost=route_resp.total_cost,
                nodes_explored=route_resp.nodes_explored,
                edges_examined=route_resp.edges_examined,
                execution_time_ms=route_resp.execution_time_ms,
                path_nodes=route_resp.path_node_ids
            )
            db.add(hist)
            db.commit()
        except Exception:
            db.rollback()

