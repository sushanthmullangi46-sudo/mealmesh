from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.models.benchmark import AlgorithmBenchmark
from app.schemas.route import BenchmarkRequest, BenchmarkResponse, BenchmarkMetricItem
from app.services.graph_service import GraphService

router = APIRouter(prefix="/benchmarks", tags=["Algorithmic Benchmarks"])

@router.post("/run", response_model=BenchmarkResponse)
def execute_benchmarks(
    req: BenchmarkRequest = Body(default=BenchmarkRequest(graph_sizes=[50, 500, 2000])),
    db: Session = Depends(get_db)
):
    service = GraphService.get_instance()
    return service.run_benchmarks(req.graph_sizes, db=db)

@router.get("/history")
def get_benchmark_history(db: Session = Depends(get_db)):
    return db.query(AlgorithmBenchmark).order_by(AlgorithmBenchmark.created_at.desc()).limit(100).all()
