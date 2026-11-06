#include "Graph.hpp"
#include "Dijkstra.hpp"
#include "AStar.hpp"
#include "DisjointSet.hpp"
#include "Connectivity.hpp"
#include "RouteOptimizer.hpp"
#include "AlgorithmVisualizer.hpp"
#include <iostream>
#include <cassert>
#include <cmath>

using namespace dsa;

void printTestHeader(const std::string& name) {
    std::cout << "[RUNNING TEST] " << name << " ... ";
}

void printTestPass() {
    std::cout << "PASSED" << std::endl;
}

// Helper to construct a standard grid/diamond test graph
Graph createSampleGraph() {
    Graph g;
    // Nodes representing a mini urban network
    // Coordinates: Latitudes ~40.7128, Longitudes ~-74.0060 (New York area)
    g.addNode(Node(1, "Times Square", 40.7580, -73.9855, 10.0, "poi"));
    g.addNode(Node(2, "Grand Central", 40.7527, -73.9772, 12.0, "poi"));
    g.addNode(Node(3, "Empire State", 40.7484, -73.9857, 15.0, "poi"));
    g.addNode(Node(4, "Flatiron Building", 40.7411, -73.9897, 8.0, "poi"));
    g.addNode(Node(5, "Union Square", 40.7359, -73.9911, 7.0, "poi"));
    g.addNode(Node(6, "Brooklyn Bridge Terminal", 40.7061, -73.9969, 5.0, "poi"));

    // Edges (id, source, target, dist_km, speed_kmh, traffic, toll, one_way, name, type)
    // 1 -> 2
    g.addEdge(Edge("e1_2", 1, 2, 0.9, 45.0, TrafficLevel::LOW, 0.0, false, "42nd St", "arterial"));
    // 1 -> 3
    g.addEdge(Edge("e1_3", 1, 3, 1.2, 30.0, TrafficLevel::LOW, 0.0, false, "Broadway", "avenue"));
    // 2 -> 3
    g.addEdge(Edge("e2_3", 2, 3, 0.8, 40.0, TrafficLevel::LOW, 0.0, false, "Park Ave S", "arterial"));
    // 3 -> 4
    g.addEdge(Edge("e3_4", 3, 4, 0.9, 35.0, TrafficLevel::LOW, 0.0, false, "5th Ave", "avenue"));
    // 2 -> 4 (Express route)
    g.addEdge(Edge("e2_4", 2, 4, 1.5, 60.0, TrafficLevel::LOW, 2.5, false, "FDR Expressway Link", "highway"));
    // 4 -> 5
    g.addEdge(Edge("e4_5", 4, 5, 0.7, 30.0, TrafficLevel::LOW, 0.0, false, "Broadway Downtown", "avenue"));
    // 5 -> 6
    g.addEdge(Edge("e5_6", 5, 6, 3.5, 50.0, TrafficLevel::LOW, 0.0, false, "Lafayette St", "arterial"));

    return g;
}

void testDijkstraBasic() {
    printTestHeader("Dijkstra Shortest Path Basic");
    Graph g = createSampleGraph();

    PathResult res = Dijkstra::findShortestPath(g, 1, 5, OptimizationObjective::DISTANCE);
    assert(res.found);
    assert(res.path.front() == 1);
    assert(res.path.back() == 5);
    // Path 1 -> 3 -> 4 -> 5 = 1.2 + 0.9 + 0.7 = 2.8 km
    // Path 1 -> 2 -> 3 -> 4 -> 5 = 0.9 + 0.8 + 0.9 + 0.7 = 3.3 km
    // Path 1 -> 2 -> 4 -> 5 = 0.9 + 1.5 + 0.7 = 3.1 km
    assert(std::abs(res.total_distance_km - 2.8) < 1e-4);
    assert(res.path.size() == 4);
    assert(res.path[1] == 3);
    assert(res.path[2] == 4);
    printTestPass();
}

void testAStarCorrectnessAndOptimality() {
    printTestHeader("A* Shortest Path Optimality");
    Graph g = createSampleGraph();

    PathResult dijkstraRes = Dijkstra::findShortestPath(g, 1, 6, OptimizationObjective::DISTANCE);
    PathResult astarRes = AStar::findPath(g, 1, 6, OptimizationObjective::DISTANCE);

    assert(dijkstraRes.found);
    assert(astarRes.found);
    assert(std::abs(dijkstraRes.total_distance_km - astarRes.total_distance_km) < 1e-4);
    // A* should explore <= nodes than Dijkstra due to admissible heuristic guidance
    assert(astarRes.nodes_explored_count <= dijkstraRes.nodes_explored_count);
    printTestPass();
}

void testMultiCriteriaRouting() {
    printTestHeader("Multi-Criteria Routing (Distance vs Time vs Cost)");
    Graph g = createSampleGraph();

    // In sample graph:
    // Route A (via 3): 1 -> 3 -> 4: dist = 1.2+0.9 = 2.1km, speed = 30 and 35 km/h
    // Route B (via 2 express): 1 -> 2 -> 4: dist = 0.9+1.5 = 2.4km, speed = 45 and 60 km/h, toll = $2.50
    PathResult distRoute = Dijkstra::findShortestPath(g, 1, 4, OptimizationObjective::DISTANCE);
    PathResult timeRoute = Dijkstra::findShortestPath(g, 1, 4, OptimizationObjective::TIME);
    PathResult costRoute = Dijkstra::findShortestPath(g, 1, 4, OptimizationObjective::COST);

    assert(distRoute.found && timeRoute.found && costRoute.found);
    // Shortest distance must be route via node 3
    assert(distRoute.path[1] == 3);
    // Fastest time should prefer express road via node 2
    assert(timeRoute.path[1] == 2);
    // Lowest cost avoids the $2.50 toll
    assert(costRoute.path[1] == 3);

    printTestPass();
}

void testDynamicTrafficRerouting() {
    printTestHeader("Dynamic Traffic Simulation and Rerouting");
    Graph g = createSampleGraph();

    // Initial shortest distance and fastest time: 1 -> 3 -> 4
    PathResult initial = Dijkstra::findShortestPath(g, 1, 4, OptimizationObjective::TIME);
    
    // Now simulate severe congestion or blockage on Broadway (e1_3)
    g.updateEdgeTraffic("e1_3", TrafficLevel::BLOCKED);

    PathResult rerouted = Dijkstra::findShortestPath(g, 1, 4, OptimizationObjective::TIME);
    assert(rerouted.found);
    // The path should now divert via node 2
    assert(rerouted.path[1] == 2);
    printTestPass();
}

void testDSUAndConnectivity() {
    printTestHeader("Disjoint Set Union and Connectivity Analysis");
    Graph g = createSampleGraph();

    // Add an isolated island with nodes 10, 11
    g.addNode(Node(10, "Roosevelt Island North", 40.768, -73.945));
    g.addNode(Node(11, "Roosevelt Island South", 40.755, -73.952));
    g.addEdge(Edge("e10_11", 10, 11, 1.4, 40.0));

    // Add completely isolated node 99
    g.addNode(Node(99, "Offshore Beacon", 40.650, -74.050));

    ConnectivityResult cr = Connectivity::analyzeConnectivity(g);
    assert(!cr.is_fully_connected);
    assert(cr.component_count == 3); // Main city, Island, and Beacon
    assert(!cr.isolated_nodes.empty());
    assert(cr.isolated_nodes[0] == 99);

    // BFS and DFS checks
    std::vector<NodeId> bfs = Connectivity::bfsTraversal(g, 10);
    assert(bfs.size() == 2);
    std::vector<NodeId> dfs = Connectivity::dfsTraversal(g, 10);
    assert(dfs.size() == 2);

    printTestPass();
}

void testMultiStopRouteOptimization() {
    printTestHeader("Multi-Stop TSP Route Optimization (Nearest Neighbor + 2-Opt)");
    Graph g = createSampleGraph();

    // Stops: start at 1, visit {5, 2, 4, 3}, round trip to 1
    std::vector<NodeId> waypoints = {5, 2, 4, 3};
    TSPResult tsp = RouteOptimizer::optimizeTour(g, 1, waypoints, 1, true);

    assert(tsp.success);
    assert(tsp.tour_order.front() == 1);
    assert(tsp.tour_order.back() == 1);
    assert(tsp.tour_order.size() == 6); // 1 + 4 stops + 1 return
    assert(tsp.optimized_distance_km <= tsp.initial_distance_km);
    assert(!tsp.complete_path.empty());

    printTestPass();
}

void testAlgorithmVisualizerTrace() {
    printTestHeader("Algorithm Visualizer Step-by-Step Trace Generation");
    Graph g = createSampleGraph();

    VisualizationTrace dTrace = AlgorithmVisualizer::traceDijkstra(g, 1, 5);
    assert(dTrace.path_found);
    assert(!dTrace.steps.empty());
    assert(dTrace.steps.front().event_type == "VISIT_NODE");
    assert(dTrace.steps.back().event_type == "REACH_GOAL");

    VisualizationTrace aTrace = AlgorithmVisualizer::traceAStar(g, 1, 5);
    assert(aTrace.path_found);
    assert(!aTrace.steps.empty());
    assert(aTrace.steps.front().event_type == "VISIT_NODE");

    printTestPass();
}

int main() {
    std::cout << "======================================================" << std::endl;
    std::cout << " Intelligent Route Optimization C++ Test Suite (C++20)" << std::endl;
    std::cout << "======================================================" << std::endl;

    testDijkstraBasic();
    testAStarCorrectnessAndOptimality();
    testMultiCriteriaRouting();
    testDynamicTrafficRerouting();
    testDSUAndConnectivity();
    testMultiStopRouteOptimization();
    testAlgorithmVisualizerTrace();

    std::cout << "======================================================" << std::endl;
    std::cout << " ALL TESTS PASSED SUCCESSFULLY! (100% Core Verification)" << std::endl;
    std::cout << "======================================================" << std::endl;
    return 0;
}
