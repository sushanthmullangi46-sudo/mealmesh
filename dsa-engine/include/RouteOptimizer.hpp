#pragma once

#include "Graph.hpp"
#include "Types.hpp"
#include <vector>

namespace dsa {

class RouteOptimizer {
public:
    RouteOptimizer() = default;

    /**
     * Optimize a multi-stop itinerary through a sequence of waypoints.
     * Uses Nearest Neighbor heuristic for greedy tour construction followed by
     * 2-Opt local search iterative edge-exchange optimization.
     * 
     * @param graph The road network graph.
     * @param startNode The origin location.
     * @param waypoints Intermediate stops to visit.
     * @param endNode Optional final destination (if -1, returns to startNode).
     * @param roundTrip Whether the journey must return to startNode.
     * @return TSPResult containing initial vs optimized metrics, tour order, and full path.
     */
    static TSPResult optimizeTour(
        const Graph& graph,
        NodeId startNode,
        const std::vector<NodeId>& waypoints,
        NodeId endNode = -1,
        bool roundTrip = false
    );
};

} // namespace dsa

