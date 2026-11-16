from fastapi import APIRouter, HTTPException
from app.schemas.route import VisualizationRequest, VisualizationResponse
from app.services.graph_service import GraphService

router = APIRouter(prefix="/visualize", tags=["Algorithm Visualization"])

@router.post("/trace", response_model=VisualizationResponse)
def get_algorithm_trace(req: VisualizationRequest):
    service = GraphService.get_instance()
    if not service.graph.has_node(req.source_id):
        raise HTTPException(status_code=400, detail=f"Source node {req.source_id} does not exist.")
    if not service.graph.has_node(req.target_id):
        raise HTTPException(status_code=400, detail=f"Target node {req.target_id} does not exist.")

    return service.generate_visualization_trace(
        source_id=req.source_id,
        target_id=req.target_id,
        algorithm=req.algorithm,
        objective=req.objective
    )

