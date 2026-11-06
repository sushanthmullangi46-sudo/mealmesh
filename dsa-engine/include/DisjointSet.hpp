#pragma once

#include "Types.hpp"
#include <unordered_map>
#include <vector>

namespace dsa {

/**
 * Disjoint Set Union (Union-Find) with Path Compression and Union by Rank.
 * Time complexity: O(alpha(V)) per operation, virtually O(1).
 */
class DisjointSet {
private:
    mutable std::unordered_map<NodeId, NodeId> parent_;
    std::unordered_map<NodeId, size_t> rank_;
    size_t count_{0};

public:
    DisjointSet() = default;

    void addElement(NodeId element);
    [[nodiscard]] NodeId find(NodeId element) const;
    bool unite(NodeId a, NodeId b);
    [[nodiscard]] bool connected(NodeId a, NodeId b) const;
    [[nodiscard]] size_t getComponentCount() const;
    [[nodiscard]] std::unordered_map<NodeId, std::vector<NodeId>> getComponentGroups() const;
    void clear();
};

} // namespace dsa

