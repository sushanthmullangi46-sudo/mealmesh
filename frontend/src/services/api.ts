import {
  Location, Road, RouteResponse, MultiCriteriaCompareResponse,
  MultiStopResponse, VisualizationResponse, ConnectivityAnalysisResponse,
  BenchmarkResponse, GraphStats, RouteHistoryItem, TrafficLevel, Objective
} from '../types';

const API_BASE = '/api/v1';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    let errorMsg = `API request failed: ${res.status} ${res.statusText}`;
    try {
      const errData = await res.json();
      if (errData.detail) errorMsg = errData.detail;
    } catch (_) {}
    throw new Error(errorMsg);
  }

  return res.json();
}

export const api = {
  // Stats
  getStats: () => fetchJson<GraphStats>('/stats'),
  resetSeed: () => fetchJson<{ status: string; message: string; stats: GraphStats }>('/seed/reset', { method: 'POST' }),

  // Locations
  getLocations: () => fetchJson<Location[]>('/locations'),
  createLocation: (data: Partial<Location>) => fetchJson<Location>('/locations', { method: 'POST', body: JSON.stringify(data) }),
  updateLocation: (id: number, data: Partial<Location>) => fetchJson<Location>(`/locations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteLocation: (id: number) => fetchJson<void>(`/locations/${id}`, { method: 'DELETE' }),

  // Roads
  getRoads: () => fetchJson<Road[]>('/roads'),
  createRoad: (data: Partial<Road>) => fetchJson<Road>('/roads', { method: 'POST', body: JSON.stringify(data) }),
  deleteRoad: (id: string) => fetchJson<void>(`/roads/${id}`, { method: 'DELETE' }),

  // Routes
  findShortestPath: (source_id: number, target_id: number) =>
    fetchJson<RouteResponse>('/routes/shortest', {
      method: 'POST',
      body: JSON.stringify({ source_id, target_id, objective: 'DISTANCE' })
    }),
  findFastestPath: (source_id: number, target_id: number) =>
    fetchJson<RouteResponse>('/routes/fastest', {
      method: 'POST',
      body: JSON.stringify({ source_id, target_id, objective: 'TIME' })
    }),
  findAStarPath: (source_id: number, target_id: number, objective: Objective = 'DISTANCE') =>
    fetchJson<RouteResponse>('/routes/astar', {
      method: 'POST',
      body: JSON.stringify({ source_id, target_id, objective })
    }),
  compareRoutes: (source_id: number, target_id: number) =>
    fetchJson<MultiCriteriaCompareResponse>('/routes/compare', {
      method: 'POST',
      body: JSON.stringify({ source_id, target_id })
    }),
  getRouteHistory: () => fetchJson<RouteHistoryItem[]>('/routes/history?limit=50'),

  // Traffic
  updateRoadTraffic: (road_id: string, traffic_level: TrafficLevel) =>
    fetchJson<{ status: string; road_id: string; traffic_level: string; graph_version: number }>(
      `/traffic/roads/${road_id}`,
      { method: 'PUT', body: JSON.stringify({ traffic_level }) }
    ),
  randomizeTraffic: () => fetchJson<{ status: string; message: string; graph_version: number }>('/traffic/randomize', { method: 'POST' }),
  resetTraffic: () => fetchJson<{ status: string; message: string; graph_version: number }>('/traffic/reset', { method: 'POST' }),

  // Multi-Stop TSP
  optimizeMultiStop: (start_id: number, waypoint_ids: number[], end_id?: number, round_trip: boolean = false) =>
    fetchJson<MultiStopResponse>('/multistop/optimize', {
      method: 'POST',
      body: JSON.stringify({ start_id, waypoint_ids, end_id, round_trip })
    }),

  // Visualization Trace
  getTrace: (source_id: number, target_id: number, algorithm: 'Dijkstra' | 'A*' = 'Dijkstra', objective: Objective = 'DISTANCE') =>
    fetchJson<VisualizationResponse>('/visualize/trace', {
      method: 'POST',
      body: JSON.stringify({ source_id, target_id, algorithm, objective })
    }),

  // Connectivity
  getConnectivity: () => fetchJson<ConnectivityAnalysisResponse>('/analytics/connectivity'),
  getBfsTraversal: (start_node_id: number) => fetchJson<{ algorithm: string; start_node_id: number; visited_order: number[]; visited_names: string[] }>(`/analytics/bfs?start_node_id=${start_node_id}`),
  getDfsTraversal: (start_node_id: number) => fetchJson<{ algorithm: string; start_node_id: number; visited_order: number[]; visited_names: string[] }>(`/analytics/dfs?start_node_id=${start_node_id}`),

  // Benchmarks
  runBenchmarks: (graph_sizes: number[] = [50, 500, 2000]) =>
    fetchJson<BenchmarkResponse>('/benchmarks/run', {
      method: 'POST',
      body: JSON.stringify({ graph_sizes })
    }),
  getBenchmarkHistory: () => fetchJson<any[]>('/benchmarks/history'),
};
