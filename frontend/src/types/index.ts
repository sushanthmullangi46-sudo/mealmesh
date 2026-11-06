export type TrafficLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'BLOCKED';
export type Objective = 'DISTANCE' | 'TIME' | 'COST';
export type Algorithm = 'Dijkstra' | 'A*';

export interface Location {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation_m: number;
  type: string;
  description: string;
}

export interface Road {
  id: string;
  source_id: number;
  target_id: number;
  distance_km: number;
  speed_limit_kmh: number;
  traffic_level: TrafficLevel;
  toll_cost: number;
  is_one_way: boolean;
  road_name: string;
  road_type: string;
}

export interface PathStepDetail {
  step_number: number;
  from_node_id: number;
  to_node_id: number;
  from_node_name: string;
  to_node_name: string;
  road_name: string;
  distance_km: number;
  travel_time_minutes: number;
  cost: number;
  traffic_level: TrafficLevel;
}

export interface RouteResponse {
  found: boolean;
  algorithm: string;
  objective: Objective;
  source_id: number;
  target_id: number;
  total_distance_km: number;
  total_time_minutes: number;
  total_cost: number;
  nodes_explored: number;
  edges_examined: number;
  execution_time_ms: number;
  path_node_ids: number[];
  path_coordinates: [number, number][];
  detailed_steps: PathStepDetail[];
  message: string;
}

export interface MultiCriteriaCompareResponse {
  source_id: number;
  target_id: number;
  shortest_distance_route: RouteResponse;
  fastest_time_route: RouteResponse;
  lowest_cost_route: RouteResponse;
}

export interface MultiStopResponse {
  success: boolean;
  tour_node_ids: number[];
  complete_path_node_ids: number[];
  complete_path_coordinates: [number, number][];
  initial_distance_km: number;
  optimized_distance_km: number;
  distance_saved_km: number;
  improvement_percentage: number;
  two_opt_iterations: number;
  execution_time_ms: number;
  heuristic_notes: string;
}

export interface VisualizationStep {
  step_index: number;
  event_type: 'VISIT_NODE' | 'EXAMINE_EDGE' | 'UPDATE_DISTANCE' | 'SKIP_EDGE' | 'REACH_GOAL' | 'NO_PATH';
  current_node: number;
  neighbor_node: number;
  edge_weight: number;
  current_dist: number;
  tentative_dist: number;
  heuristic: number;
  priority_score: number;
  description: string;
  priority_queue_state: [number, number][];
  visited_nodes: number[];
  parent_map: Record<string, number>;
  distance_map: Record<string, number>;
}

export interface VisualizationResponse {
  algorithm_name: string;
  source_id: number;
  target_id: number;
  path_found: boolean;
  final_path: number[];
  final_path_coords: [number, number][];
  total_cost: number;
  total_steps: number;
  execution_time_ms: number;
  steps: VisualizationStep[];
}

export interface ComponentDetail {
  component_id: number;
  node_count: number;
  node_ids: number[];
  node_names: string[];
}

export interface ConnectivityAnalysisResponse {
  total_nodes: number;
  total_edges: number;
  component_count: number;
  is_fully_connected: boolean;
  components: ComponentDetail[];
  isolated_nodes: number[];
  execution_time_ms: number;
  description: string;
}

export interface TraversalResponse {
  algorithm: string;
  start_node_id: number;
  visited_order: number[];
  visited_names: string[];
}

export interface BenchmarkMetricItem {
  algorithm: string;
  graph_size: number;
  edges_count: number;
  execution_time_ms: number;
  nodes_explored: number;
  edges_examined: number;
  path_distance_km: number;
}

export interface BenchmarkResponse {
  results: BenchmarkMetricItem[];
  timestamp: string;
}

export interface GraphStats {
  total_locations: number;
  total_roads: number;
  connected_components: number;
  is_fully_connected: boolean;
  average_road_distance_km: number;
  average_speed_limit_kmh: number;
  version: number;
  engine_type: string;
}

export interface RouteHistoryItem {
  id: number;
  source_id: number;
  target_id: number;
  algorithm: string;
  objective: string;
  distance_km: number;
  time_minutes: number;
  cost: number;
  nodes_explored: number;
  edges_examined: number;
  execution_time_ms: number;
  path_nodes: number[];
  created_at: string;
}
