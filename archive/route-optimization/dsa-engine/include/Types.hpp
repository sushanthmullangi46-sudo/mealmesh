#pragma once

#include <string>
#include <vector>
#include <unordered_map>
#include <limits>
#include <cmath>
#include <cstdint>

namespace dsa {

using NodeId = int64_t;
constexpr double INF_WEIGHT = std::numeric_limits<double>::infinity();
constexpr double EARTH_RADIUS_KM = 6371.0088; // WGS84 mean earth radius

enum class TrafficLevel {
    LOW = 0,      // Free flow, 1.0x time
    MEDIUM = 1,   // Moderate traffic, 1.5x time
    HIGH = 2,     // Heavy congestion, 2.5x time
    BLOCKED = 3   // Impassable / closed, infinity
};

inline double trafficToMultiplier(TrafficLevel level) {
    switch (level) {
        case TrafficLevel::LOW: return 1.0;
        case TrafficLevel::MEDIUM: return 1.5;
        case TrafficLevel::HIGH: return 2.5;
        case TrafficLevel::BLOCKED: return INF_WEIGHT;
        default: return 1.0;
    }
}

inline TrafficLevel stringToTrafficLevel(const std::string& str) {
    if (str == "MEDIUM" || str == "medium") return TrafficLevel::MEDIUM;
    if (str == "HIGH" || str == "high") return TrafficLevel::HIGH;
    if (str == "BLOCKED" || str == "blocked") return TrafficLevel::BLOCKED;
    return TrafficLevel::LOW;
}

inline std::string trafficLevelToString(TrafficLevel level) {
    switch (level) {
        case TrafficLevel::LOW: return "LOW";
        case TrafficLevel::MEDIUM: return "MEDIUM";
        case TrafficLevel::HIGH: return "HIGH";
        case TrafficLevel::BLOCKED: return "BLOCKED";
        default: return "LOW";
    }
}

enum class OptimizationObjective {
    DISTANCE = 0, // Shortest route in kilometers
    TIME = 1,     // Fastest route in minutes (traffic-aware)
    COST = 2      // Lowest monetary cost (fuel + toll + time value)
};

inline OptimizationObjective stringToObjective(const std::string& str) {
    if (str == "TIME" || str == "time" || str == "fastest") return OptimizationObjective::TIME;
    if (str == "COST" || str == "cost" || str == "cheapest") return OptimizationObjective::COST;
    return OptimizationObjective::DISTANCE;
}

inline std::string objectiveToString(OptimizationObjective obj) {
    switch (obj) {
        case OptimizationObjective::DISTANCE: return "DISTANCE";
        case OptimizationObjective::TIME: return "TIME";
        case OptimizationObjective::COST: return "COST";
        default: return "DISTANCE";
    }
}

enum class StepEventType {
    VISIT_NODE,
    EXAMINE_EDGE,
    UPDATE_DISTANCE,
    SKIP_EDGE,
    REACH_GOAL,
    NO_PATH
};

inline std::string stepEventToString(StepEventType type) {
    switch (type) {
        case StepEventType::VISIT_NODE: return "VISIT_NODE";
        case StepEventType::EXAMINE_EDGE: return "EXAMINE_EDGE";
        case StepEventType::UPDATE_DISTANCE: return "UPDATE_DISTANCE";
        case StepEventType::SKIP_EDGE: return "SKIP_EDGE";
        case StepEventType::REACH_GOAL: return "REACH_GOAL";
        case StepEventType::NO_PATH: return "NO_PATH";
        default: return "UNKNOWN";
    }
}

struct AlgorithmStep {
    uint32_t step_index{0};
    std::string event_type;
    NodeId current_node{-1};
    NodeId neighbor_node{-1};
    double edge_weight{0.0};
    double current_dist{0.0};
    double tentative_dist{0.0};
    double heuristic{0.0};
    double priority_score{0.0};
    std::string description;
    std::vector<std::pair<NodeId, double>> priority_queue_snapshot;
    std::vector<NodeId> visited_nodes_snapshot;
};

struct PathResult {
    bool found{false};
    std::vector<NodeId> path;
    double total_distance_km{0.0};
    double total_time_minutes{0.0};
    double total_cost{0.0};
    uint64_t nodes_explored_count{0};
    uint64_t edges_examined_count{0};
    double execution_time_ms{0.0};
    std::vector<NodeId> explored_nodes;
    std::string algorithm_name;
    std::string optimization_objective;
};

struct TSPResult {
    bool success{false};
    std::vector<NodeId> tour_order;
    std::vector<NodeId> complete_path;
    double initial_distance_km{0.0};
    double optimized_distance_km{0.0};
    double distance_saved_km{0.0};
    double improvement_percentage{0.0};
    uint32_t two_opt_iterations{0};
    double execution_time_ms{0.0};
};

struct ConnectivityResult {
    size_t total_nodes{0};
    size_t total_edges{0};
    size_t component_count{0};
    bool is_fully_connected{false};
    std::vector<std::vector<NodeId>> components;
    std::vector<NodeId> isolated_nodes;
    double execution_time_ms{0.0};
};

} // namespace dsa

