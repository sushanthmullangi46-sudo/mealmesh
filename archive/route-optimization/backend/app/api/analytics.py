from fastapi import APIRouter, Query, HTTPException
from typing import List
from app.schemas.analytics import ConnectivityAnalysisResponse, TraversalResponse
from app.services.graph_service import GraphService
from app.services.dsa_engine import Connectivity

router = APIRouter(prefix="/analytics", tags=["Graph Connectivity & Analysis"])

@router.get("/connectivity", response_model=ConnectivityAnalysisResponse)
def analyze_network_connectivity():
    service = GraphService.get_instance()
    return service.analyze_connectivity()

@router.get("/bfs", response_model=TraversalResponse)
def run_bfs(start_node_id: int = Query(1, description="Root node for BFS traversal")):
    service = GraphService.get_instance()
    if not service.graph.has_node(start_node_id):
        raise HTTPException(status_code=400, detail=f"Start node {start_node_id} does not exist")

    order = Connectivity.bfs_traversal(service.graph, start_node_id)
    names = [service.graph.get_node(nid).name if service.graph.get_node(nid) else f"Node {nid}" for nid in order]

    return TraversalResponse(
        algorithm="BFS",
        start_node_id=start_node_id,
        visited_order=order,
        visited_names=names
    )

@router.get("/dfs", response_model=TraversalResponse)
def run_dfs(start_node_id: int = Query(1, description="Root node for DFS traversal")):
    service = GraphService.get_instance()
    if not service.graph.has_node(start_node_id):
        raise HTTPException(status_code=400, detail=f"Start node {start_node_id} does not exist")

    order = Connectivity.dfs_traversal(service.graph, start_node_id)
    names = [service.graph.get_node(nid).name if service.graph.get_node(nid) else f"Node {nid}" for nid in order]

    return TraversalResponse(
        algorithm="DFS",
        start_node_id=start_node_id,
        visited_order=order,
        visited_names=names
    )

