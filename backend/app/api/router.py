from fastapi import APIRouter
from app.api.auth import router as auth_router
from app.api.locations import router as locations_router
from app.api.roads import router as roads_router
from app.api.routes import router as routes_router
from app.api.traffic import router as traffic_router
from app.api.multistop import router as multistop_router
from app.api.visualize import router as visualize_router
from app.api.analytics import router as analytics_router
from app.api.benchmarks import router as benchmarks_router
from app.api.stats import router as stats_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(locations_router)
api_router.include_router(roads_router)
api_router.include_router(routes_router)
api_router.include_router(traffic_router)
api_router.include_router(multistop_router)
api_router.include_router(visualize_router)
api_router.include_router(analytics_router)
api_router.include_router(benchmarks_router)
api_router.include_router(stats_router)
