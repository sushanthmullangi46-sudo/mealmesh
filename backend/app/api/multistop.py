from fastapi import APIRouter, HTTPException
from app.schemas.route import MultiStopRequest, MultiStopResponse
from app.services.graph_service import GraphService

router = APIRouter(prefix="/multistop", tags=["Multi-Stop Route Optimization"])

@router.post("/optimize", response_model=MultiStopResponse)
def optimize_multi_stop_route(req: MultiStopRequest):
    service = GraphService.get_instance()
    if not service.graph.has_node(req.start_id):
        raise HTTPException(status_code=400, detail=f"Start location {req.start_id} not found in graph")

    res = service.optimize_multi_stop(
        start_id=req.start_id,
        waypoint_ids=req.waypoint_ids,
        end_id=req.end_id,
        round_trip=req.round_trip
    )

    if not res.success:
        raise HTTPException(
            status_code=400,
            detail="Could not construct valid tour. Some waypoints may be in disconnected components."
        )

    return res

