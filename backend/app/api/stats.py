from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.graph import GraphStats
from app.services.graph_service import GraphService

router = APIRouter(tags=["System & Statistics"])

@router.get("/stats", response_model=GraphStats)
def get_system_stats(db: Session = Depends(get_db)):
    service = GraphService.get_instance()
    return service.get_stats(db)

@router.post("/seed/reset")
def reset_seed_data(db: Session = Depends(get_db)):
    service = GraphService.get_instance()
    service.initialize_from_db(db, force_reseed=True)
    return {
        "status": "success",
        "message": "Demo road network reseeded successfully.",
        "stats": service.get_stats(db)
    }

