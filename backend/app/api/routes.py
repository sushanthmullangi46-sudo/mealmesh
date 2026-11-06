from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.session import get_db
from app.models.route import SavedRoute, RouteHistory
from app.schemas.route import (
    RouteRequest, RouteResponse, MultiCriteriaCompareResponse,
    SavedRouteCreate, SavedRouteOut
)
from app.schemas.graph import ObjectiveEnum
from app.services.graph_service import GraphService

router = APIRouter(prefix="/routes", tags=["Route Calculation & Navigation"])

@router.post("/shortest", response_model=RouteResponse)
def calculate_shortest_route(req: RouteRequest, db: Session = Depends(get_db)):
    service = GraphService.get_instance()
    return service.find_route_dijkstra(req.source_id, req.target_id, ObjectiveEnum.DISTANCE, db=db)

@router.post("/fastest", response_model=RouteResponse)
def calculate_fastest_route(req: RouteRequest, db: Session = Depends(get_db)):
    service = GraphService.get_instance()
    return service.find_route_dijkstra(req.source_id, req.target_id, ObjectiveEnum.TIME, db=db)

@router.post("/astar", response_model=RouteResponse)
def calculate_astar_route(req: RouteRequest, db: Session = Depends(get_db)):
    service = GraphService.get_instance()
    return service.find_route_astar(req.source_id, req.target_id, req.objective, db=db)

@router.post("/compare", response_model=MultiCriteriaCompareResponse)
def compare_multi_criteria_routes(req: RouteRequest):
    service = GraphService.get_instance()
    return service.compare_multiple_routes(req.source_id, req.target_id)

@router.post("/save", response_model=SavedRouteOut)
def save_route(route_in: SavedRouteCreate, db: Session = Depends(get_db)):
    saved = SavedRoute(
        title=route_in.title,
        source_id=route_in.source_id,
        target_id=route_in.target_id,
        algorithm=route_in.algorithm,
        objective=route_in.objective,
        total_distance_km=route_in.total_distance_km,
        total_time_minutes=route_in.total_time_minutes,
        total_cost=route_in.total_cost,
        path_nodes=route_in.path_nodes
    )
    db.add(saved)
    db.commit()
    db.refresh(saved)
    return saved

@router.get("/saved", response_model=List[SavedRouteOut])
def get_saved_routes(db: Session = Depends(get_db)):
    return db.query(SavedRoute).order_by(SavedRoute.created_at.desc()).all()

@router.delete("/saved/{route_id}", status_code=204)
def delete_saved_route(route_id: int, db: Session = Depends(get_db)):
    rec = db.query(SavedRoute).filter(SavedRoute.id == route_id).first()
    if rec:
        db.delete(rec)
        db.commit()
    return None

@router.get("/history")
def get_route_history(limit: int = Query(50, ge=1, le=200), db: Session = Depends(get_db)):
    return db.query(RouteHistory).order_by(RouteHistory.created_at.desc()).limit(limit).all()

