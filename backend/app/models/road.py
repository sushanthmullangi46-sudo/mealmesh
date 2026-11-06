from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from app.database.session import Base

class Road(Base):
    __tablename__ = "roads"

    id = Column(String(100), primary_key=True, index=True)
    source_id = Column(Integer, ForeignKey("locations.id", ondelete="CASCADE"), nullable=False, index=True)
    target_id = Column(Integer, ForeignKey("locations.id", ondelete="CASCADE"), nullable=False, index=True)
    distance_km = Column(Float, nullable=False)
    speed_limit_kmh = Column(Float, default=50.0)
    traffic_level = Column(String(20), default="LOW") # "LOW", "MEDIUM", "HIGH", "BLOCKED"
    toll_cost = Column(Float, default=0.0)
    is_one_way = Column(Boolean, default=False)
    road_name = Column(String(100), default="Road")
    road_type = Column(String(50), default="primary") # "highway", "arterial", "avenue", "residential"
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
