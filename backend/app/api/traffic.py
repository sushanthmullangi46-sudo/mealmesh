from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any
from app.database.session import get_db
from app.models.road import Road as RoadModel
from app.schemas.graph import RoadTrafficUpdate
from app.services.graph_service import GraphService

router = APIRouter(prefix="/traffic", tags=["Dynamic Traffic Simulation"])

@router.put("/roads/{road_id}")
def update_road_traffic(road_id: str, payload: RoadTrafficUpdate, db: Session = Depends(get_db)):
    service = GraphService.get_instance()
    success = service.update_road_traffic(road_id, payload.traffic_level, db)
    if not success:
        raise HTTPException(status_code=404, detail="Road not found")
    return {
        "status": "success",
        "road_id": road_id,
        "traffic_level": payload.traffic_level.value,
        "graph_version": service.graph.get_version()
    }

@router.post("/randomize")
def randomize_traffic_conditions(db: Session = Depends(get_db)):
    service = GraphService.get_instance()
    updates = service.randomize_traffic(db)
    return {
        "status": "success",
        "message": f"Simulated dynamic traffic across {len(updates)} roads.",
        "updates": updates,
        "graph_version": service.graph.get_version()
    }

@router.post("/reset")
def reset_all_traffic(db: Session = Depends(get_db)):
    service = GraphService.get_instance()
    service.reset_traffic(db)
    return {
        "status": "success",
        "message": "Reset all traffic conditions to LOW (free flow).",
        "graph_version": service.graph.get_version()
    }

@router.get("/snapshot")
def get_traffic_snapshot(db: Session = Depends(get_db)):
    roads = db.query(RoadModel).all()
    return {
        "road_traffic": {r.id: r.traffic_level for r in roads},
        "graph_version": GraphService.get_instance().graph.get_version()
    }
