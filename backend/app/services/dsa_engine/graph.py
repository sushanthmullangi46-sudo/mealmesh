import math
from typing import Dict, List, Optional
from .types import Node, Edge, TrafficLevel, OptimizationObjective

EARTH_RADIUS_KM = 6371.0088

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    deg_to_rad = math.pi / 180.0
    phi1 = lat1 * deg_to_rad
    phi2 = lat2 * deg_to_rad
    delta_phi = (lat2 - lat1) * deg_to_rad
    delta_lambda = (lon2 - lon1) * deg_to_rad

    sin_half_phi = math.sin(delta_phi / 2.0)
    sin_half_lambda = math.sin(delta_lambda / 2.0)

    a = (sin_half_phi * sin_half_phi +
         math.cos(phi1) * math.cos(phi2) *
         sin_half_lambda * sin_half_lambda)
    
    clamped_a = max(0.0, min(1.0, a))
    c = 2.0 * math.atan2(math.sqrt(clamped_a), math.sqrt(1.0 - clamped_a))
    return EARTH_RADIUS_KM * c

class Graph:
    def __init__(self):
        self.nodes_: Dict[int, Node] = {}
        self.adj_list_: Dict[int, List[Edge]] = {}
        self.edge_lookup_: Dict[str, Edge] = {}
        self.version_: int = 1
        self.max_speed_kmh_: float = 120.0

    def recalculate_max_speed(self):
        max_s = 50.0
        for edge in self.edge_lookup_.values():
            if edge.speed_limit_kmh > max_s:
                max_s = edge.speed_limit_kmh
        self.max_speed_kmh_ = max_s

    def add_node(self, node: Node) -> bool:
        self.nodes_[node.id] = node
        if node.id not in self.adj_list_:
            self.adj_list_[node.id] = []
        self.version_ += 1
        return True

    def remove_node(self, node_id: int) -> bool:
        if node_id not in self.nodes_:
            return False
        del self.nodes_[node_id]
        if node_id in self.adj_list_:
            del self.adj_list_[node_id]

        for edges in self.adj_list_.values():
            edges[:] = [e for e in edges if e.target != node_id]

        to_remove = [k for k, e in self.edge_lookup_.items() if e.source == node_id or e.target == node_id]
        for k in to_remove:
            del self.edge_lookup_[k]

        self.recalculate_max_speed()
        self.version_ += 1
        return True

    def has_node(self, node_id: int) -> bool:
        return node_id in self.nodes_

    def get_node(self, node_id: int) -> Optional[Node]:
        return self.nodes_.get(node_id)

    def get_all_nodes(self) -> Dict[int, Node]:
        return self.nodes_

    def add_edge(self, edge: Edge) -> bool:
        if edge.source not in self.nodes_:
            self.nodes_[edge.source] = Node(edge.source, f"Node {edge.source}", 0.0, 0.0)
            self.adj_list_[edge.source] = []
        if edge.target not in self.nodes_:
            self.nodes_[edge.target] = Node(edge.target, f"Node {edge.target}", 0.0, 0.0)
            self.adj_list_[edge.target] = []

        self.edge_lookup_[edge.id] = edge

        source_edges = self.adj_list_[edge.source]
        replaced = False
        for i, existing in enumerate(source_edges):
            if existing.id == edge.id or (existing.source == edge.source and existing.target == edge.target):
                source_edges[i] = edge
                replaced = True
                break
        if not replaced:
            source_edges.append(edge)

        if not edge.is_one_way:
            rev_id = f"{edge.id}_rev"
            rev_edge = Edge(
                id=rev_id,
                source=edge.target,
                target=edge.source,
                distance_km=edge.distance_km,
                speed_limit_kmh=edge.speed_limit_kmh,
                traffic_level=edge.traffic_level,
                custom_multiplier=edge.custom_multiplier,
                toll_cost=edge.toll_cost,
                is_one_way=True,
                road_name=edge.road_name,
                road_type=edge.road_type
            )
            target_edges = self.adj_list_[edge.target]
            rev_replaced = False
            for i, existing in enumerate(target_edges):
                if existing.id == rev_id or (existing.source == rev_edge.source and existing.target == rev_edge.target):
                    target_edges[i] = rev_edge
                    rev_replaced = True
                    break
            if not rev_replaced:
                target_edges.append(rev_edge)

        if edge.speed_limit_kmh > self.max_speed_kmh_:
            self.max_speed_kmh_ = edge.speed_limit_kmh

        self.version_ += 1
        return True

    def remove_edge(self, edge_id: str) -> bool:
        if edge_id not in self.edge_lookup_:
            return False
        edge = self.edge_lookup_[edge_id]
        del self.edge_lookup_[edge_id]

        if edge.source in self.adj_list_:
            self.adj_list_[edge.source] = [e for e in self.adj_list_[edge.source] if e.id != edge_id]

        if not edge.is_one_way:
            rev_id = f"{edge_id}_rev"
            if edge.target in self.adj_list_:
                self.adj_list_[edge.target] = [e for e in self.adj_list_[edge.target] if e.id != rev_id and e.id != edge_id]

        self.recalculate_max_speed()
        self.version_ += 1
        return True

    def has_edge(self, edge_id: str) -> bool:
        return edge_id in self.edge_lookup_

    def get_edge(self, edge_id: str) -> Optional[Edge]:
        return self.edge_lookup_.get(edge_id)

    def get_neighbors(self, node_id: int) -> List[Edge]:
        return self.adj_list_.get(node_id, [])

    def get_all_edges(self) -> List[Edge]:
        return list(self.edge_lookup_.values())

    def update_edge_traffic(self, edge_id: str, level: TrafficLevel) -> bool:
        if edge_id not in self.edge_lookup_:
            return False
        edge = self.edge_lookup_[edge_id]
        edge.set_traffic_level(level)

        if edge.source in self.adj_list_:
            for e in self.adj_list_[edge.source]:
                if e.id == edge_id:
                    e.set_traffic_level(level)

        if not edge.is_one_way:
            rev_id = f"{edge_id}_rev"
            if edge.target in self.adj_list_:
                for e in self.adj_list_[edge.target]:
                    if e.id == rev_id or e.id == edge_id:
                        e.set_traffic_level(level)

        self.version_ += 1
        return True

    def get_version(self) -> int:
        return self.version_

    def get_max_speed_kmh(self) -> float:
        return self.max_speed_kmh_

    def get_node_count(self) -> int:
        return len(self.nodes_)

    def get_edge_count(self) -> int:
        return len(self.edge_lookup_)

    def clear(self):
        self.nodes_.clear()
        self.adj_list_.clear()
        self.edge_lookup_.clear()
        self.max_speed_kmh_ = 120.0
        self.version_ += 1

    def create_snapshot(self) -> "Graph":
        g = Graph()
        g.nodes_ = {k: Node(**v.__dict__) for k, v in self.nodes_.items()}
        g.edge_lookup_ = {k: Edge(**v.__dict__) for k, v in self.edge_lookup_.items()}
        g.adj_list_ = {}
        for nid, edges in self.adj_list_.items():
            g.adj_list_[nid] = [Edge(**e.__dict__) for e in edges]
        g.version_ = self.version_
        g.max_speed_kmh_ = self.max_speed_kmh_
        return g
