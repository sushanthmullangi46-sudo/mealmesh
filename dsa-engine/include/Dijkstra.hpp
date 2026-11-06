#pragma once

#include "Graph.hpp"
#include "Types.hpp"
#include "PriorityQueue.hpp"
#include <unordered_map>
#include <vector>
#include <chrono>

namespace dsa {

class Dijkstra {
public:
    Dijkstra() = default;

    /**
     * Compute shortest path between source and target using Dijkstra's algorithm.
     * Complexity: O((V + E) log V) with binary heap.
     */
    static PathResult findShortestPath(
        const Graph& graph,
        NodeId source,
        NodeId target,
        OptimizationObjective objective = OptimizationObjective::DISTANCE
    );

    /**
     * Compute single-source shortest path tree to all reachable nodes.
     * Useful for TSP distance matrix precomputation.
     */
    static std::unordered_map<NodeId, double> computeAllDistances(
        const Graph& graph,
        NodeId source,
        OptimizationObjective objective = OptimizationObjective::DISTANCE
    );
};

} // namespace dsa
