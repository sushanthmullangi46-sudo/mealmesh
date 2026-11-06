#include "Connectivity.hpp"
#include <queue>
#include <stack>
#include <chrono>

namespace dsa {

std::vector<NodeId> Connectivity::bfsTraversal(const Graph& graph, NodeId startNode) {
    std::vector<NodeId> order;
    if (!graph.hasNode(startNode)) return order;

    std::unordered_set<NodeId> visited;
    std::queue<NodeId> q;

    visited.insert(startNode);
    q.push(startNode);

    while (!q.empty()) {
        NodeId u = q.front();
        q.pop();
        order.push_back(u);

        for (const auto& edge : graph.getNeighbors(u)) {
            if (edge.traffic_level == TrafficLevel::BLOCKED) continue;
            NodeId v = edge.target;
            if (visited.find(v) == visited.end()) {
                visited.insert(v);
                q.push(v);
            }
        }
    }

    return order;
}

std::vector<NodeId> Connectivity::dfsTraversal(const Graph& graph, NodeId startNode) {
    std::vector<NodeId> order;
    if (!graph.hasNode(startNode)) return order;

    std::unordered_set<NodeId> visited;
    std::stack<NodeId> s;

    s.push(startNode);

    while (!s.empty()) {
        NodeId u = s.top();
        s.pop();

        if (visited.find(u) != visited.end()) continue;
        visited.insert(u);
        order.push_back(u);

        for (const auto& edge : graph.getNeighbors(u)) {
            if (edge.traffic_level == TrafficLevel::BLOCKED) continue;
            NodeId v = edge.target;
            if (visited.find(v) == visited.end()) {
                s.push(v);
            }
        }
    }

    return order;
}

ConnectivityResult Connectivity::analyzeConnectivity(const Graph& graph) {
    const auto startTime = std::chrono::high_resolution_clock::now();
    ConnectivityResult result;

    const auto& nodes = graph.getAllNodes();
    result.total_nodes = nodes.size();
    result.total_edges = graph.getEdgeCount();

    if (nodes.empty()) {
        result.is_fully_connected = true;
        result.component_count = 0;
        return result;
    }

    DisjointSet dsu;
    for (const auto& [nodeId, _] : nodes) {
        dsu.addElement(nodeId);
    }

    for (const auto& [u, _] : nodes) {
        for (const auto& edge : graph.getNeighbors(u)) {
            if (edge.traffic_level == TrafficLevel::BLOCKED) continue;
            dsu.unite(edge.source, edge.target);
        }
    }

    auto groups = dsu.getComponentGroups();
    result.component_count = groups.size();
    result.is_fully_connected = (groups.size() <= 1);

    for (auto& [root, members] : groups) {
        if (members.size() == 1) {
            // Node has no reachable neighbors or is completely isolated
            result.isolated_nodes.push_back(members[0]);
        }
        result.components.push_back(std::move(members));
    }

    // Sort components from largest to smallest for clear presentation
    std::sort(result.components.begin(), result.components.end(),
        [](const std::vector<NodeId>& a, const std::vector<NodeId>& b) {
            return a.size() > b.size();
        });

    const auto endTime = std::chrono::high_resolution_clock::now();
    result.execution_time_ms = std::chrono::duration<double, std::milli>(endTime - startTime).count();

    return result;
}

} // namespace dsa
