#pragma once

#include "Graph.hpp"
#include "Types.hpp"
#include "PriorityQueue.hpp"
#include <unordered_map>
#include <vector>

namespace dsa {

class AStar {
public:
    AStar() = default;

    /**
     * Compute path using A* search with an admissible Haversine heuristic.
     */
    static PathResult findPath(
        const Graph& graph,
        NodeId source,
        NodeId target,
        OptimizationObjective objective = OptimizationObjective::DISTANCE
    );

    /**
     * Calculate admissible heuristic estimate from node `u` to `target`.
     */
    static double calculateHeuristic(
        const Graph& graph,
        NodeId u,
        NodeId target,
        OptimizationObjective objective
    );
};

} // namespace dsa
