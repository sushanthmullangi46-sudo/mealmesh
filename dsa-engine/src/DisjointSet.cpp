#include "DisjointSet.hpp"

namespace dsa {

void DisjointSet::addElement(NodeId element) {
    if (parent_.find(element) == parent_.end()) {
        parent_[element] = element;
        rank_[element] = 0;
        ++count_;
    }
}

NodeId DisjointSet::find(NodeId element) const {
    if (parent_.find(element) == parent_.end()) {
        parent_[element] = element;
        const_cast<DisjointSet*>(this)->rank_[element] = 0;
        const_cast<DisjointSet*>(this)->count_++;
        return element;
    }

    // Path compression: set parent directly to root
    if (parent_[element] != element) {
        parent_[element] = find(parent_[element]);
    }
    return parent_[element];
}

bool DisjointSet::unite(NodeId a, NodeId b) {
    NodeId rootA = find(a);
    NodeId rootB = find(b);

    if (rootA == rootB) {
        return false; // Already in same set
    }

    // Union by rank
    if (rank_[rootA] < rank_[rootB]) {
        parent_[rootA] = rootB;
    } else if (rank_[rootA] > rank_[rootB]) {
        parent_[rootB] = rootA;
    } else {
        parent_[rootB] = rootA;
        rank_[rootA]++;
    }

    --count_;
    return true;
}

bool DisjointSet::connected(NodeId a, NodeId b) const {
    return find(a) == find(b);
}

size_t DisjointSet::getComponentCount() const {
    return count_;
}

std::unordered_map<NodeId, std::vector<NodeId>> DisjointSet::getComponentGroups() const {
    std::unordered_map<NodeId, std::vector<NodeId>> groups;
    for (const auto& [element, _] : parent_) {
        NodeId root = find(element);
        groups[root].push_back(element);
    }
    return groups;
}

void DisjointSet::clear() {
    parent_.clear();
    rank_.clear();
    count_ = 0;
}

} // namespace dsa
