from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, ForeignKey
from app.database.session import Base

class SavedRoute(Base):
    __tablename__ = "saved_routes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(150), nullable=False)
    source_id = Column(Integer, ForeignKey("locations.id"), nullable=False)
    target_id = Column(Integer, ForeignKey("locations.id"), nullable=False)
    algorithm = Column(String(50), default="Dijkstra")
    objective = Column(String(50), default="DISTANCE")
    total_distance_km = Column(Float, nullable=False)
    total_time_minutes = Column(Float, nullable=False)
    total_cost = Column(Float, nullable=False)
    path_nodes = Column(JSON, nullable=False) # list of node IDs
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class RouteHistory(Base):
    __tablename__ = "route_history"

    id = Column(Integer, primary_key=True, autoincrement=True)
    source_id = Column(Integer, nullable=False)
    target_id = Column(Integer, nullable=False)
    algorithm = Column(String(50), nullable=False)
    objective = Column(String(50), nullable=False)
    distance_km = Column(Float, nullable=False)
    time_minutes = Column(Float, nullable=False)
    cost = Column(Float, nullable=False)
    nodes_explored = Column(Integer, default=0)
    edges_examined = Column(Integer, default=0)
    execution_time_ms = Column(Float, nullable=False)
    path_nodes = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

