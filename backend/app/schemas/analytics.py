from pydantic import BaseModel
from typing import List

class ComponentDetail(BaseModel):
    component_id: int
    node_count: int
    node_ids: List[int]
    node_names: List[str]

class ConnectivityAnalysisResponse(BaseModel):
    total_nodes: int
    total_edges: int
    component_count: int
    is_fully_connected: bool
    components: List[ComponentDetail]
    isolated_nodes: List[int]
    execution_time_ms: float
    description: str

class TraversalResponse(BaseModel):
    algorithm: str # "BFS" or "DFS"
    start_node_id: int
    visited_order: List[int]
    visited_names: List[str]

