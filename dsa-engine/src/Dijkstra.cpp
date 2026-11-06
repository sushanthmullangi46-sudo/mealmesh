#include "Dijkstra.hpp"
#include <chrono>
#include <algorithm>

namespace dsa {

PathResult Dijkstra::findShortestPath(
    const Graph& graph,
    NodeId source,
    NodeId target,
    OptimizationObjective objective
) {
    const auto startTime = std::chrono::high_resolution_clock::now();
    PathResult result;
    result.algorithm_name = "Dijkstra";
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

    std::unordered_map<NodeId, double> dist;
    std::unordered_map<NodeId, NodeId> parent;
    std::unordered_map<NodeId, Edge> parent_edge;
    std::unordered_map<NodeId, bool> visited;

    PriorityQueue<NodeId, double> pq;

    dist[source] = 0.0;
    pq.push(source, 0.0);

    uint64_t edgesExamined = 0;
    std::vector<NodeId> exploredOrder;

    while (!pq.empty()) {
        const auto topItem = pq.top();
        const NodeId u = topItem.element;
        const double d = topItem.priority;
        pq.pop();

        if (visited[u]) {
            continue;
        }
        visited[u] = true;
        exploredOrder.push_back(u);

        if (u == target) {
            break;
        }

        const auto& neighbors = graph.getNeighbors(u);
        for (const auto& edge : neighbors) {
            ++edgesExamined;
            const NodeId v = edge.target;
            const double weight = edge.getWeight(objective);

            // Skip blocked roads or infinite weights
            if (weight >= INF_WEIGHT || std::isinf(weight)) {
                continue;
            }

            if (visited[v]) {
                continue;
            }

            const double newDist = d + weight;
            auto it = dist.find(v);
            if (it == dist.end() || newDist < it->second) {
                dist[v] = newDist;
                parent[v] = u;
                parent_edge[v] = edge;
                pq.push(v, newDist);
            }
        }
    }

    const auto endTime = std::chrono::high_resolution_clock::now();
    result.execution_time_ms = std::chrono::duration<double, std::milli>(endTime - startTime).count();
    result.nodes_explored_count = exploredOrder.size();
    result.edges_examined_count = edgesExamined;
    result.explored_nodes = exploredOrder;

    if (dist.find(target) == dist.end()) {
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

std::unordered_map<NodeId, double> Dijkstra::computeAllDistances(
    const Graph& graph,
    NodeId source,
    OptimizationObjective objective
) {
    std::unordered_map<NodeId, double> dist;
    if (!graph.hasNode(source)) return dist;

    PriorityQueue<NodeId, double> pq;
    std::unordered_map<NodeId, bool> visited;

    dist[source] = 0.0;
    pq.push(source, 0.0);

    while (!pq.empty()) {
        const auto topItem = pq.top();
        const NodeId u = topItem.element;
        pq.pop();

        if (visited[u]) continue;
        visited[u] = true;

        for (const auto& edge : graph.getNeighbors(u)) {
            const NodeId v = edge.target;
            const double w = edge.getWeight(objective);
            if (w >= INF_WEIGHT || std::isinf(w)) continue;

            const double newDist = dist[u] + w;
            if (dist.find(v) == dist.end() || newDist < dist[v]) {
                dist[v] = newDist;
                pq.push(v, newDist);
            }
        }
    }

    return dist;
}

} // namespace dsa
