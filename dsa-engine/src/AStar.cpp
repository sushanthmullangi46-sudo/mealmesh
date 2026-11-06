#include "AStar.hpp"
#include <chrono>
#include <algorithm>
#include <cmath>

namespace dsa {

double AStar::calculateHeuristic(
    const Graph& graph,
    NodeId u,
    NodeId target,
    OptimizationObjective objective
) {
    if (u == target) return 0.0;

    auto uNodeOpt = graph.getNode(u);
    auto targetNodeOpt = graph.getNode(target);

    if (!uNodeOpt.has_value() || !targetNodeOpt.has_value()) {
        return 0.0;
    }

    const double straightLineKm = uNodeOpt->distanceTo(*targetNodeOpt);

    switch (objective) {
        case OptimizationObjective::DISTANCE:
            // Direct haversine distance in km (strictly <= actual road distance)
            return straightLineKm;

        case OptimizationObjective::TIME: {
            // Lower bound travel time: straightLineKm / max_speed in km/h * 60 min
            const double maxSpeed = std::max(10.0, graph.getMaxSpeedKmh());
            return (straightLineKm / maxSpeed) * 60.0;
        }

        case OptimizationObjective::COST: {
            // Lower bound monetary cost: minimum fuel cost along straight line (no tolls, fastest time)
            const double minFuelCost = straightLineKm * Edge::FUEL_COST_PER_KM;
            const double maxSpeed = std::max(10.0, graph.getMaxSpeedKmh());
            const double minTimeCost = ((straightLineKm / maxSpeed) * 60.0) * Edge::TIME_VALUE_PER_MIN;
            return minFuelCost + minTimeCost;
        }

        default:
            return straightLineKm;
    }
}

PathResult AStar::findPath(
    const Graph& graph,
    NodeId source,
    NodeId target,
    OptimizationObjective objective
) {
    const auto startTime = std::chrono::high_resolution_clock::now();
    PathResult result;
    result.algorithm_name = "A*";
    result.optimization_objective = objectiveToString(objective);

    if (!graph.hasNode(source) || !graph.hasNode(target)) {
        const auto endTime = std::chrono::high_resolution_clock::now();
        result.execution_time_ms = std::chrono::duration<double, std::milli>(endTime - startTime).count();
        result.found = false;
        return result;
    }

    if (source == target) {
        const auto endTime = std::chrono::high_resolution_clock::now();
        result.found = true;
        result.path = {source};
        result.total_distance_km = 0.0;
        result.total_time_minutes = 0.0;
        result.total_cost = 0.0;
        result.nodes_explored_count = 1;
        result.explored_nodes = {source};
        result.execution_time_ms = std::chrono::duration<double, std::milli>(endTime - startTime).count();
        return result;
    }

    // gScore[n]: Cost of cheapest path from source to n currently known
    std::unordered_map<NodeId, double> gScore;
    // fScore[n]: gScore[n] + h(n)
    std::unordered_map<NodeId, double> fScore;
    std::unordered_map<NodeId, NodeId> parent;
    std::unordered_map<NodeId, Edge> parent_edge;
    std::unordered_map<NodeId, bool> closedSet;

    PriorityQueue<NodeId, double> openSet;

    gScore[source] = 0.0;
    const double initialH = calculateHeuristic(graph, source, target, objective);
    fScore[source] = initialH;
    openSet.push(source, initialH);

    uint64_t edgesExamined = 0;
    std::vector<NodeId> exploredOrder;

    while (!openSet.empty()) {
        const auto topItem = openSet.top();
        const NodeId current = topItem.element;
        openSet.pop();

        if (closedSet[current]) {
            continue;
        }
        closedSet[current] = true;
        exploredOrder.push_back(current);

        if (current == target) {
            break;
        }

        const auto& neighbors = graph.getNeighbors(current);
        for (const auto& edge : neighbors) {
            ++edgesExamined;
            const NodeId neighbor = edge.target;
            const double weight = edge.getWeight(objective);

            if (weight >= INF_WEIGHT || std::isinf(weight)) {
                continue;
            }

            if (closedSet[neighbor]) {
                continue;
            }

            const double tentativeG = gScore[current] + weight;
            auto git = gScore.find(neighbor);

            if (git == gScore.end() || tentativeG < git->second) {
                parent[neighbor] = current;
                parent_edge[neighbor] = edge;
                gScore[neighbor] = tentativeG;

                const double h = calculateHeuristic(graph, neighbor, target, objective);
                const double f = tentativeG + h;
                fScore[neighbor] = f;

                openSet.push(neighbor, f);
            }
        }
    }

    const auto endTime = std::chrono::high_resolution_clock::now();
    result.execution_time_ms = std::chrono::duration<double, std::milli>(endTime - startTime).count();
    result.nodes_explored_count = exploredOrder.size();
    result.edges_examined_count = edgesExamined;
    result.explored_nodes = exploredOrder;

    if (gScore.find(target) == gScore.end()) {
        result.found = false;
        return result;
    }

    // Reconstruct path
    std::vector<NodeId> path;
    NodeId curr = target;
    while (curr != source) {
        path.push_back(curr);
        curr = parent[curr];
    }
    path.push_back(source);
    std::reverse(path.begin(), path.end());

    result.path = path;
    result.found = true;

    // Calculate detailed aggregates across reconstructed path
    double totalDistance = 0.0;
    double totalTime = 0.0;
    double totalCost = 0.0;

    for (size_t i = 1; i < path.size(); ++i) {
        NodeId toNode = path[i];
        if (parent_edge.find(toNode) != parent_edge.end()) {
            const auto& e = parent_edge[toNode];
            totalDistance += e.distance_km;
            totalTime += e.getTravelTimeMinutes();
            totalCost += e.getMonetaryCost();
        }
    }

    result.total_distance_km = totalDistance;
    result.total_time_minutes = totalTime;
    result.total_cost = totalCost;

    return result;
}

} // namespace dsa

