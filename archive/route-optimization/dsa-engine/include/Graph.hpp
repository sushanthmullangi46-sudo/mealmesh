#pragma once

#include "Types.hpp"
#include "Node.hpp"
#include "Edge.hpp"
#include <unordered_map>
#include <vector>
#include <string>
#include <optional>
#include <shared_mutex>
#include <cstdint>

namespace dsa {

class Graph {
private:
    std::unordered_map<NodeId, Node> nodes_;
    std::unordered_map<NodeId, std::vector<Edge>> adj_list_;
    std::unordered_map<std::string, Edge> edge_lookup_;
    uint64_t version_{1};
    double max_speed_kmh_{120.0};
    mutable std::shared_mutex mutex_;

    void recalculateMaxSpeed();

public:
    Graph() = default;

    // Node operations
    bool addNode(const Node& node);
    bool removeNode(NodeId id);
    [[nodiscard]] bool hasNode(NodeId id) const;
    [[nodiscard]] std::optional<Node> getNode(NodeId id) const;
    [[nodiscard]] const std::unordered_map<NodeId, Node>& getAllNodes() const;

    // Edge operations
    bool addEdge(const Edge& edge);
    bool removeEdge(const std::string& edge_id);
    [[nodiscard]] bool hasEdge(const std::string& edge_id) const;
    [[nodiscard]] std::optional<Edge> getEdge(const std::string& edge_id) const;
    [[nodiscard]] const std::vector<Edge>& getNeighbors(NodeId node_id) const;
    [[nodiscard]] std::vector<Edge> getAllEdges() const;

    // Traffic updates & Snapshot versioning
    bool updateEdgeTraffic(const std::string& edge_id, TrafficLevel level);
    [[nodiscard]] uint64_t getVersion() const;
    [[nodiscard]] double getMaxSpeedKmh() const;

    // Metrics & Utilities
    [[nodiscard]] size_t getNodeCount() const;
    [[nodiscard]] size_t getEdgeCount() const;
    void clear();

    // Snapshot creation (thread-safe copy)
    [[nodiscard]] Graph createSnapshot() const;
};

} // namespace dsa

