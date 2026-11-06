from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime
from app.database.session import Base

class AlgorithmBenchmark(Base):
    __tablename__ = "algorithm_benchmarks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    algorithm = Column(String(50), nullable=False) # "Dijkstra", "A*"
    graph_size = Column(Integer, nullable=False) # 50, 500, 5000, 10000
    edges_count = Column(Integer, nullable=False)
    execution_time_ms = Column(Float, nullable=False)
    nodes_explored = Column(Integer, nullable=False)
    edges_examined = Column(Integer, nullable=False)
    path_distance_km = Column(Float, nullable=False)
    memory_mb = Column(Float, default=0.0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
