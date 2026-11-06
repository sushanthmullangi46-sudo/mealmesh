# REST API Specification

Base URL: `/api/v1`

---

## 1. Authentication (`/auth`)

### `POST /auth/register`
Creates a new user account.
- **Request Body**:
  ```json
  {
    "username": "engineer",
    "email": "engineer@example.com",
    "password": "Password123!"
  }
  ```
- **Response** `201 Created`: User object with ID and timestamp.

### `POST /auth/login`
Authenticates a user and generates a JWT bearer token.
- **Request Body**:
  ```json
  {
    "username": "engineer",
    "password": "Password123!"
  }
  ```
- **Response** `200 OK`: `access_token`, `token_type`, and user profile.

---

## 2. Locations & Roads (`/locations`, `/roads`)

### `GET /locations`
Retrieves all geographical vertices in the active road network.

### `POST /locations`
Adds a new location vertex.
- **Request Body**:
  ```json
  {
    "name": "New Transit Center",
    "latitude": 40.7300,
    "longitude": -73.9900,
    "elevation_m": 8.0,
    "type": "terminal"
  }
  ```

### `GET /roads`
Retrieves all directed/undirected road segments.

### `POST /roads`
Adds a new road edge between two existing locations. Distance is computed via Haversine formula if not specified.

---

## 3. Route Calculation & Optimization (`/routes`)

### `POST /routes/shortest`
Finds the shortest distance route between two vertices using Dijkstra's algorithm.

### `POST /routes/fastest`
Finds the fastest travel time route accounting for road speed limits and current traffic congestion.

### `POST /routes/astar`
Executes A* search using the great-circle Haversine formula as an admissible heuristic.

### `POST /routes/compare`
Computes all three optimization objectives (Shortest Distance, Fastest Duration, Lowest Monetary Cost) and returns side-by-side comparative metrics.

---

## 4. Dynamic Traffic Simulation (`/traffic`)

### `PUT /traffic/roads/{road_id}`
Updates the traffic congestion level on a specific road.
- **Allowed values**: `LOW` (1.0x), `MEDIUM` (1.5x), `HIGH` (2.5x), `BLOCKED` ($\infty$).

### `POST /traffic/randomize`
Simulates random realistic rush-hour fluctuations across the entire network.

### `POST /traffic/reset`
Restores all road segments to `LOW` free-flow conditions.

---

## 5. Multi-Stop Route Optimization (`/multistop`)

### `POST /multistop/optimize`
Approximates the optimal itinerary across multiple waypoints using Nearest Neighbor heuristic and 2-Opt local search edge reversals.
- **Request Body**:
  ```json
  {
    "start_id": 1,
    "waypoint_ids": [2, 5, 8, 11],
    "end_id": 1,
    "round_trip": true
  }
  ```

---

## 6. Algorithm Visualization Trace (`/visualize`)

### `POST /visualize/trace`
Executes Dijkstra or A* and returns an ordered sequence of atomic execution events:
- Extracted node from priority queue
- Neighbor edge inspection
- Distance relaxation
- Priority queue heap state
- Parent pointer updates

---

## 7. Graph Connectivity & Analysis (`/analytics`)

### `GET /analytics/connectivity`
Partitions the road graph using Disjoint Set Union (DSU) with path compression and union by rank. Detects isolated locations and unreachable partitions.

### `GET /analytics/bfs?start_node_id=1`
Returns level-order Breadth-First Search traversal sequence.

### `GET /analytics/dfs?start_node_id=1`
Returns Depth-First Search traversal sequence.

---

## 8. Benchmarks (`/benchmarks`)

### `POST /benchmarks/run`
Executes repeatable scalability tests on synthetic graph topologies (50, 500, 2000, 5000 nodes) measuring runtime latency, visited nodes, examined edges, and path distance.

