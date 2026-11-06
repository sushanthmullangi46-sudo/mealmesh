from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
from enum import Enum

class TrafficLevelEnum(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    BLOCKED = "BLOCKED"

class ObjectiveEnum(str, Enum):
    DISTANCE = "DISTANCE"
    TIME = "TIME"
    COST = "COST"

class LocationCreate(BaseModel):
    id: Optional[int] = None
    name: str
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    elevation_m: float = 0.0
    type: str = "intersection"
    description: str = ""

class LocationUpdate(BaseModel):
    name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    elevation_m: Optional[float] = None
    type: Optional[str] = None
    description: Optional[str] = None

class LocationOut(BaseModel):
    id: int
    name: str
    latitude: float
    longitude: float
    elevation_m: float
    type: str
    description: str

    model_config = ConfigDict(from_attributes=True)

class RoadCreate(BaseModel):
    id: Optional[str] = None
    source_id: int
    target_id: int
    distance_km: Optional[float] = None
    speed_limit_kmh: float = 50.0
    traffic_level: TrafficLevelEnum = TrafficLevelEnum.LOW
    toll_cost: float = 0.0
    is_one_way: bool = False
    road_name: str = "Road"
    road_type: str = "primary"

class RoadUpdate(BaseModel):
    speed_limit_kmh: Optional[float] = None
    traffic_level: Optional[TrafficLevelEnum] = None
    toll_cost: Optional[float] = None
    is_one_way: Optional[bool] = None
    road_name: Optional[str] = None
    road_type: Optional[str] = None

class RoadTrafficUpdate(BaseModel):
    traffic_level: TrafficLevelEnum

class RoadOut(BaseModel):
    id: str
    source_id: int
    target_id: int
    distance_km: float
    speed_limit_kmh: float
    traffic_level: TrafficLevelEnum
    toll_cost: float
    is_one_way: bool
    road_name: str
    road_type: str

    model_config = ConfigDict(from_attributes=True)

class GraphStats(BaseModel):
    total_locations: int
    total_roads: int
    connected_components: int
    is_fully_connected: bool
    average_road_distance_km: float
    average_speed_limit_kmh: float
    version: int
    engine_type: str
