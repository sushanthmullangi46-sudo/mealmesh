from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.models.location import Location as LocationModel
from app.models.road import Road as RoadModel
from app.schemas.graph import LocationCreate, LocationUpdate, LocationOut
from app.services.graph_service import GraphService
from app.services.dsa_engine import Node

router = APIRouter(prefix="/locations", tags=["Locations"])

@router.get("", response_model=List[LocationOut])
def get_all_locations(db: Session = Depends(get_db)):
    return db.query(LocationModel).order_by(LocationModel.id.asc()).all()

@router.get("/{location_id}", response_model=LocationOut)
def get_location_by_id(location_id: int, db: Session = Depends(get_db)):
    loc = db.query(LocationModel).filter(LocationModel.id == location_id).first()
    if not loc:
        raise HTTPException(status_code=404, detail=f"Location {location_id} not found")
    return loc

@router.post("", response_model=LocationOut, status_code=status.HTTP_201_CREATED)
def create_location(loc_in: LocationCreate, db: Session = Depends(get_db)):
    # Auto-generate ID if omitted
    if loc_in.id is None:
        max_id = db.query(LocationModel.id).order_by(LocationModel.id.desc()).first()
        loc_id = (max_id[0] + 1) if max_id else 1
    else:
        loc_id = loc_in.id
        if db.query(LocationModel).filter(LocationModel.id == loc_id).first():
            raise HTTPException(status_code=400, detail=f"Location with ID {loc_id} already exists")

    new_loc = LocationModel(
        id=loc_id,
        name=loc_in.name,
        latitude=loc_in.latitude,
        longitude=loc_in.longitude,
        elevation_m=loc_in.elevation_m,
        type=loc_in.type,
        description=loc_in.description
    )
    db.add(new_loc)
    db.commit()
    db.refresh(new_loc)

    # Sync to in-memory DSA Graph
    service = GraphService.get_instance()
    service.graph.add_node(Node(
        id=new_loc.id,
        name=new_loc.name,
        latitude=new_loc.latitude,
        longitude=new_loc.longitude,
        elevation_m=new_loc.elevation_m,
        type=new_loc.type
    ))

    return new_loc

@router.put("/{location_id}", response_model=LocationOut)
def update_location(location_id: int, loc_update: LocationUpdate, db: Session = Depends(get_db)):
    loc = db.query(LocationModel).filter(LocationModel.id == location_id).first()
    if not loc:
        raise HTTPException(status_code=404, detail="Location not found")

    if loc_update.name is not None: loc.name = loc_update.name
    if loc_update.latitude is not None: loc.latitude = loc_update.latitude
    if loc_update.longitude is not None: loc.longitude = loc_update.longitude
    if loc_update.elevation_m is not None: loc.elevation_m = loc_update.elevation_m
    if loc_update.type is not None: loc.type = loc_update.type
    if loc_update.description is not None: loc.description = loc_update.description

    db.commit()
    db.refresh(loc)

    # Sync to in-memory DSA Graph
    service = GraphService.get_instance()
    service.graph.add_node(Node(
        id=loc.id,
        name=loc.name,
        latitude=loc.latitude,
        longitude=loc.longitude,
        elevation_m=loc.elevation_m,
        type=loc.type
    ))

    return loc

@router.delete("/{location_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_location(location_id: int, db: Session = Depends(get_db)):
    loc = db.query(LocationModel).filter(LocationModel.id == location_id).first()
    if not loc:
        raise HTTPException(status_code=404, detail="Location not found")

    # Delete connected roads
    db.query(RoadModel).filter((RoadModel.source_id == location_id) | (RoadModel.target_id == location_id)).delete()
    db.delete(loc)
    db.commit()

    # Sync to DSA Graph
    service = GraphService.get_instance()
    service.graph.remove_node(location_id)
    return None

