from enum import Enum
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Tuple, Any

class TrafficLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    BLOCKED = "BLOCKED"

TRAFFIC_MULTIPLIERS = {
    TrafficLevel.LOW: 1.0,
    TrafficLevel.MEDIUM: 1.5,
    TrafficLevel.HIGH: 2.5,
    TrafficLevel.BLOCKED: float("inf"),
}

class OptimizationObjective(str, Enum):
    DISTANCE = "DISTANCE"
    TIME = "TIME"
    COST = "COST"

@dataclass
class Node:
    id: int
    name: str
    latitude: float
    longitude: float
    elevation_m: float = 0.0
    type: str = "intersection"

@dataclass
class Edge:
    id: str
    source: int
    target: int
    distance_km: float
    speed_limit_kmh: float = 50.0
    traffic_level: TrafficLevel = TrafficLevel.LOW
    custom_multiplier: float = 1.0
    toll_cost: float = 0.0
    is_one_way: bool = False
    road_name: str = "Road"
    road_type: str = "primary"

    FUEL_COST_PER_KM: float = 0.15
    TIME_VALUE_PER_MIN: float = 0.30

    def __post_init__(self):
        self.distance_km = max(0.001, self.distance_km)
        self.speed_limit_kmh = max(5.0, self.speed_limit_kmh)
        self.custom_multiplier = TRAFFIC_MULTIPLIERS.get(self.traffic_level, 1.0)

    def set_traffic_level(self, level: TrafficLevel):
        self.traffic_level = level
        self.custom_multiplier = TRAFFIC_MULTIPLIERS.get(level, 1.0)

    def get_effective_speed(self) -> float:
        if self.traffic_level == TrafficLevel.BLOCKED:
            return 0.0
        mult = self.custom_multiplier if self.custom_multiplier > 0 else 1.0
        return self.speed_limit_kmh / mult

    def get_travel_time_minutes(self) -> float:
        if self.traffic_level == TrafficLevel.BLOCKED:
            return float("inf")
        speed = self.get_effective_speed()
        if speed <= 0:
            return float("inf")
        return (self.distance_km / speed) * 60.0

    def get_monetary_cost(self) -> float:
        if self.traffic_level == TrafficLevel.BLOCKED:
            return float("inf")
        fuel = self.distance_km * self.FUEL_COST_PER_KM
        time_cost = self.get_travel_time_minutes() * self.TIME_VALUE_PER_MIN
        return fuel + self.toll_cost + time_cost

    def get_weight(self, obj: OptimizationObjective) -> float:
        if self.traffic_level == TrafficLevel.BLOCKED:
            return float("inf")
        if obj == OptimizationObjective.DISTANCE:
            return self.distance_km
        elif obj == OptimizationObjective.TIME:
            return self.get_travel_time_minutes()
        elif obj == OptimizationObjective.COST:
            return self.get_monetary_cost()
        return self.distance_km

@dataclass
class PathResult:
    found: bool
    path: List[int]
    total_distance_km: float
    total_time_minutes: float
    total_cost: float
    nodes_explored_count: int
    edges_examined_count: int
    execution_time_ms: float
    explored_nodes: List[int]
    algorithm_name: str
    optimization_objective: str

@dataclass
class TSPResult:
    success: bool
    tour_order: List[int]
    complete_path: List[int]
    initial_distance_km: float
    optimized_distance_km: float
    distance_saved_km: float
    improvement_percentage: float
    two_opt_iterations: int
    execution_time_ms: float

@dataclass
class ConnectivityResult:
    total_nodes: int
    total_edges: int
    component_count: int
    is_fully_connected: bool
    components: List[List[int]]
    isolated_nodes: List[int]
    execution_time_ms: float

@dataclass
class DetailedVisualizationStep:
    step_index: int
    event_type: str
    current_node: int
    neighbor_node: int = -1
    edge_weight: float = 0.0
    current_dist: float = 0.0
    tentative_dist: float = 0.0
    heuristic: float = 0.0
    priority_score: float = 0.0
    description: str = ""
    priority_queue_state: List[Tuple[int, float]] = field(default_factory=list)
    visited_nodes: List[int] = field(default_factory=list)
    parent_map: Dict[int, int] = field(default_factory=dict)
    distance_map: Dict[int, float] = field(default_factory=dict)

@dataclass
class VisualizationTrace:
    algorithm_name: str
    source: int
    target: int
    path_found: bool
    final_path: List[int]
    total_cost: float
    total_steps: int
    steps: List[DetailedVisualizationStep]
    execution_time_ms: float
