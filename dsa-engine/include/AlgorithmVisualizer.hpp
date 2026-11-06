#pragma once

#include "Graph.hpp"
#include "Types.hpp"
#include <vector>
#include <string>
#include <unordered_map>

namespace dsa {

struct DetailedVisualizationStep {
    uint32_t step_index{0};
    std::string event_type; // "VISIT_NODE", "EXAMINE_EDGE", "UPDATE_DISTANCE", "SKIP_EDGE", "REACH_GOAL", "NO_PATH"
    NodeId current_node{-1};
    NodeId neighbor_node{-1};
    double edge_weight{0.0};
    double current_dist{0.0};
    double tentative_dist{0.0};
    double heuristic{0.0};
    double priority_score{0.0};
    std::string description;
    std::vector<std::pair<NodeId, double>> priority_queue_state;
    std::vector<NodeId> visited_nodes;
    std::unordered_map<NodeId, NodeId> parent_map;
    std::unordered_map<NodeId, double> distance_map;
};

struct VisualizationTrace {
    std::string algorithm_name;
    NodeId source{-1};
    NodeId target{-1};
    bool path_found{false};
    std::vector<NodeId> final_path;
    double total_cost{0.0};
    uint64_t total_steps{0};
    std::vector<DetailedVisualizationStep> steps;
    double execution_time_ms{0.0};
};

class AlgorithmVisualizer {
public:
    AlgorithmVisualizer() = default;

    /**
     * Trace Dijkstra step-by-step recording every frontier expansion, edge relaxation,
     * distance update, and parent assignment.
     */
    static VisualizationTrace traceDijkstra(
        const Graph& graph,
        NodeId source,
        NodeId target,
        OptimizationObjective objective = OptimizationObjective::DISTANCE
    );

    /**
     * Trace A* step-by-step recording evaluation of f(n) = g(n) + h(n),
     * priority queue changes, and heuristic calculations.
     */
    static VisualizationTrace traceAStar(
        const Graph& graph,
        NodeId source,
        NodeId target,
        OptimizationObjective objective = OptimizationObjective::DISTANCE
    );
};

} // namespace dsa

