from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
from .graph import ObjectiveEnum, TrafficLevelEnum

class RouteRequest(BaseModel):
    source_id: int
    target_id: int
    objective: ObjectiveEnum = ObjectiveEnum.DISTANCE

class PathStepDetail(BaseModel):
    step_number: int
    from_node_id: int
    to_node_id: int
    from_node_name: str
    to_node_name: str
    road_name: str
    distance_km: float
    travel_time_minutes: float
    cost: float
    traffic_level: TrafficLevelEnum

class RouteResponse(BaseModel):
    found: bool
    algorithm: str
    objective: ObjectiveEnum
    source_id: int
    target_id: int
    total_distance_km: float
    total_time_minutes: float
    total_cost: float
    nodes_explored: int
    edges_examined: int
    execution_time_ms: float
    path_node_ids: List[int]
    path_coordinates: List[List[float]] # [[lat, lon], ...]
    detailed_steps: List[PathStepDetail] = []
    message: str = "Route calculated successfully"

class MultiCriteriaCompareResponse(BaseModel):
    source_id: int
    target_id: int
    shortest_distance_route: RouteResponse
    fastest_time_route: RouteResponse
    lowest_cost_route: RouteResponse

class MultiStopRequest(BaseModel):
    start_id: int
    waypoint_ids: List[int]
    end_id: Optional[int] = None
    round_trip: bool = False

class MultiStopResponse(BaseModel):
    success: bool
    tour_node_ids: List[int]
    complete_path_node_ids: List[int]
    complete_path_coordinates: List[List[float]]
    initial_distance_km: float
    optimized_distance_km: float
    distance_saved_km: float
    improvement_percentage: float
    two_opt_iterations: int
    execution_time_ms: float
    heuristic_notes: str = (
        "Traveling Salesperson Problem (TSP) is NP-hard. Route was greedily "
        "initialized using Nearest Neighbor and optimized via 2-Opt edge swaps."
    )

class VisualizationRequest(BaseModel):
    source_id: int
    target_id: int
    algorithm: str = "Dijkstra" # "Dijkstra" or "AStar"
    objective: ObjectiveEnum = ObjectiveEnum.DISTANCE

class VisualizationStepOut(BaseModel):
    step_index: int
    event_type: str
    current_node: int
    neighbor_node: int = -1
    edge_weight: float = 0.0
    current_dist: float = 0.0
    tentative_dist: float = 0.0
    heuristic: float = 0.0
    priority_score: float = 0.0
    description: str
    priority_queue_state: List[List[Any]] # [[node_id, score], ...]
    visited_nodes: List[int]
    parent_map: Dict[str, int]
    distance_map: Dict[str, float]

class VisualizationResponse(BaseModel):
    algorithm_name: str
    source_id: int
    target_id: int
    path_found: bool
    final_path: List[int]
    final_path_coords: List[List[float]]
    total_cost: float
    total_steps: int
    execution_time_ms: float
    steps: List[VisualizationStepOut]

class SavedRouteCreate(BaseModel):
    title: str
    source_id: int
    target_id: int
    algorithm: str
    objective: str
    total_distance_km: float
    total_time_minutes: float
    total_cost: float
    path_nodes: List[int]

class SavedRouteOut(SavedRouteCreate):
    id: int
    created_at: Any

    model_config = ConfigDict(from_attributes=True)

class BenchmarkRequest(BaseModel):
    graph_sizes: List[int] = [50, 500, 2000]

class BenchmarkMetricItem(BaseModel):
    algorithm: str
    graph_size: int
    edges_count: int
    execution_time_ms: float
    nodes_explored: int
    edges_examined: int
    path_distance_km: float

class BenchmarkResponse(BaseModel):
    results: List[BenchmarkMetricItem]
    timestamp: str
