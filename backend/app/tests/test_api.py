import pytest
from fastapi.testclient import TestClient
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from app.main import app
from app.database.session import SessionLocal, Base, engine
from app.services.graph_service import GraphService

client = TestClient(app)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        GraphService.get_instance().initialize_from_db(db, force_reseed=True)
    finally:
        db.close()
    yield

def test_health_and_root():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"

    res_root = client.get("/")
    assert res_root.status_code == 200
    assert "Intelligent Route Optimization" in res_root.json()["project"]

def test_get_locations():
    res = client.get("/api/v1/locations")
    assert res.status_code == 200
    locs = res.json()
    assert len(locs) >= 20
    # Times Square Hub
    assert any(l["id"] == 2 for l in locs)

def test_get_roads():
    res = client.get("/api/v1/roads")
    assert res.status_code == 200
    roads = res.json()
    assert len(roads) >= 30

def test_dijkstra_route():
    # Route from Times Square (2) to Battery Park Terminal (12)
    payload = {"source_id": 2, "target_id": 12, "objective": "DISTANCE"}
    res = client.post("/api/v1/routes/shortest", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["found"] is True
    assert data["source_id"] == 2
    assert data["target_id"] == 12
    assert len(data["path_node_ids"]) > 2
    assert len(data["path_coordinates"]) == len(data["path_node_ids"])
    assert data["total_distance_km"] > 0

def test_astar_route():
    # Route from Central Station (1) to World Trade Center (10)
    payload = {"source_id": 1, "target_id": 10, "objective": "DISTANCE"}
    res = client.post("/api/v1/routes/astar", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["found"] is True
    assert data["source_id"] == 1
    assert data["target_id"] == 10
    assert len(data["path_node_ids"]) > 2

def test_compare_routes():
    # Compare Distance vs Time vs Cost from Columbus Circle (23) to Wall St (11)
    payload = {"source_id": 23, "target_id": 11, "objective": "DISTANCE"}
    res = client.post("/api/v1/routes/compare", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "shortest_distance_route" in data
    assert "fastest_time_route" in data
    assert "lowest_cost_route" in data
    assert data["shortest_distance_route"]["found"] is True
    assert data["fastest_time_route"]["found"] is True

def test_dynamic_traffic_update():
    # Update a road to BLOCKED and verify status
    res = client.put("/api/v1/traffic/roads/r_2_1", json={"traffic_level": "BLOCKED"})
    assert res.status_code == 200
    assert res.json()["traffic_level"] == "BLOCKED"

    # Reset traffic
    res_reset = client.post("/api/v1/traffic/reset")
    assert res_reset.status_code == 200

def test_multistop_tsp():
    # TSP starting at 1, visiting [2, 5, 8], return to 1
    payload = {
        "start_id": 1,
        "waypoint_ids": [2, 5, 8],
        "end_id": 1,
        "round_trip": True
    }
    res = client.post("/api/v1/multistop/optimize", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert len(data["tour_node_ids"]) == 5 # 1 -> 3 stops -> 1
    assert len(data["complete_path_coordinates"]) > 0

def test_algorithm_visualization_trace():
    # Generate visualization trace for Dijkstra
    payload = {
        "source_id": 1,
        "target_id": 4,
        "algorithm": "Dijkstra",
        "objective": "DISTANCE"
    }
    res = client.post("/api/v1/visualize/trace", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["path_found"] is True
    assert len(data["steps"]) > 0
    assert data["steps"][0]["event_type"] == "VISIT_NODE"

def test_connectivity_analysis():
    res = client.get("/api/v1/analytics/connectivity")
    assert res.status_code == 200
    data = res.json()
    assert data["total_nodes"] >= 24
    assert data["component_count"] >= 2 # Mainland + Governors Island (90, 91)
    assert len(data["isolated_nodes"]) >= 0

def test_auth_flow():
    # Register
    user_payload = {
        "username": "testengineer",
        "email": "engineer@dsa.test",
        "password": "Password123!"
    }
    res = client.post("/api/v1/auth/register", json=user_payload)
    assert res.status_code in [201, 400] # 400 if already exists

    # Login
    login_payload = {
        "username": "testengineer",
        "password": "Password123!"
    }
    res_login = client.post("/api/v1/auth/login", json=login_payload)
    assert res_login.status_code == 200
    token_data = res_login.json()
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"
