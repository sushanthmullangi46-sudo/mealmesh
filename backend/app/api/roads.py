from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.models.location import Location as LocationModel
from app.models.road import Road as RoadModel
from app.schemas.graph import RoadCreate, RoadUpdate, RoadOut, TrafficLevelEnum
from app.services.graph_service import GraphService
from app.services.dsa_engine import Edge, TrafficLevel, haversine_distance

router = APIRouter(prefix="/roads", tags=["Roads"])

@router.get("", response_model=List[RoadOut])
def get_all_roads(db: Session = Depends(get_db)):
    return db.query(RoadModel).all()

@router.get("/{road_id}", response_model=RoadOut)
def get_road_by_id(road_id: str, db: Session = Depends(get_db)):
    road = db.query(RoadModel).filter(RoadModel.id == road_id).first()
    if not road:
        raise HTTPException(status_code=404, detail="Road not found")
    return road

@router.post("", response_model=RoadOut, status_code=status.HTTP_201_CREATED)
def create_road(road_in: RoadCreate, db: Session = Depends(get_db)):
    src = db.query(LocationModel).filter(LocationModel.id == road_in.source_id).first()
    tgt = db.query(LocationModel).filter(LocationModel.id == road_in.target_id).first()
    if not src or not tgt:
        raise HTTPException(status_code=400, detail="Source or target location does not exist")

    road_id = road_in.id or f"r_{road_in.source_id}_{road_in.target_id}"
    if db.query(RoadModel).filter(RoadModel.id == road_id).first():
        raise HTTPException(status_code=400, detail=f"Road {road_id} already exists")

    dist = road_in.distance_km
    if dist is None or dist <= 0.0:
        dist = round(haversine_distance(src.latitude, src.longitude, tgt.latitude, tgt.longitude), 2)
        dist = max(0.05, dist)

    new_road = RoadModel(
        id=road_id,
        source_id=road_in.source_id,
        target_id=road_in.target_id,
        distance_km=dist,
        speed_limit_kmh=road_in.speed_limit_kmh,
        traffic_level=road_in.traffic_level.value,
        toll_cost=road_in.toll_cost,
        is_one_way=road_in.is_one_way,
        road_name=road_in.road_name,
        road_type=road_in.road_type
    )
    db.add(new_road)
    db.commit()
    db.refresh(new_road)

    # Sync to in-memory DSA Graph
    service = GraphService.get_instance()
    service.graph.add_edge(Edge(
        id=new_road.id,
        source=new_road.source_id,
        target=new_road.target_id,
        distance_km=new_road.distance_km,
        speed_limit_kmh=new_road.speed_limit_kmh,
        traffic_level=TrafficLevel(new_road.traffic_level),
        toll_cost=new_road.toll_cost,
        is_one_way=new_road.is_one_way,
        road_name=new_road.road_name,
        road_type=new_road.road_type
    ))

    return new_road

@router.put("/{road_id}", response_model=RoadOut)
def update_road(road_id: str, road_up: RoadUpdate, db: Session = Depends(get_db)):
    road = db.query(RoadModel).filter(RoadModel.id == road_id).first()
    if not road:
        raise HTTPException(status_code=404, detail="Road not found")

    if road_up.speed_limit_kmh is not None: road.speed_limit_kmh = road_up.speed_limit_kmh
    if road_up.traffic_level is not None: road.traffic_level = road_up.traffic_level.value
    if road_up.toll_cost is not None: road.toll_cost = road_up.toll_cost
    if road_up.is_one_way is not None: road.is_one_way = road_up.is_one_way
    if road_up.road_name is not None: road.road_name = road_up.road_name
    if road_up.road_type is not None: road.road_type = road_up.road_type

    db.commit()
    db.refresh(road)

    # Sync to DSA Graph
    service = GraphService.get_instance()
    service.graph.add_edge(Edge(
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

    return road

@router.delete("/{road_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_road(road_id: str, db: Session = Depends(get_db)):
    road = db.query(RoadModel).filter(RoadModel.id == road_id).first()
    if not road:
        raise HTTPException(status_code=404, detail="Road not found")

    db.delete(road)
    db.commit()

    service = GraphService.get_instance()
    service.graph.remove_edge(road_id)
    return None
