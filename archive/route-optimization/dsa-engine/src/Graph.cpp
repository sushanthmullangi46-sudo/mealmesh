#include "Graph.hpp"
#include <mutex>
#include <algorithm>

namespace dsa {

void Graph::recalculateMaxSpeed() {
    double max_s = 50.0;
    for (const auto& [_, edge] : edge_lookup_) {
        if (edge.speed_limit_kmh > max_s) {
            max_s = edge.speed_limit_kmh;
        }
    }
    max_speed_kmh_ = max_s;
}

bool Graph::addNode(const Node& node) {
    std::unique_lock lock(mutex_);
    nodes_[node.id] = node;
    if (adj_list_.find(node.id) == adj_list_.end()) {
        adj_list_[node.id] = {};
    }
    ++version_;
    return true;
}

bool Graph::removeNode(NodeId id) {
    std::unique_lock lock(mutex_);
    auto it = nodes_.find(id);
    if (it == nodes_.end()) {
        return false;
    }
    nodes_.erase(it);
    adj_list_.erase(id);

    // Remove any incoming edges to this node
    for (auto& [_, edges] : adj_list_) {
        edges.erase(std::remove_if(edges.begin(), edges.end(),
            [id](const Edge& e) { return e.target == id; }), edges.end());
    }

    // Clean edge lookup
    for (auto eit = edge_lookup_.begin(); eit != edge_lookup_.end(); ) {
        if (eit->second.source == id || eit->second.target == id) {
            eit = edge_lookup_.erase(eit);
        } else {
            ++eit;
        }
    }

    recalculateMaxSpeed();
    ++version_;
    return true;
}

bool Graph::hasNode(NodeId id) const {
    std::shared_lock lock(mutex_);
    return nodes_.find(id) != nodes_.end();
}

std::optional<Node> Graph::getNode(NodeId id) const {
    std::shared_lock lock(mutex_);
    auto it = nodes_.find(id);
    if (it != nodes_.end()) {
        return it->second;
    }
    return std::nullopt;
}

const std::unordered_map<NodeId, Node>& Graph::getAllNodes() const {
    std::shared_lock lock(mutex_);
    return nodes_;
}

bool Graph::addEdge(const Edge& edge) {
    std::unique_lock lock(mutex_);

    // Auto-create endpoints if they do not exist
    if (nodes_.find(edge.source) == nodes_.end()) {
        nodes_[edge.source] = Node(edge.source, "Node " + std::to_string(edge.source), 0.0, 0.0);
    }
    if (nodes_.find(edge.target) == nodes_.end()) {
        nodes_[edge.target] = Node(edge.target, "Node " + std::to_string(edge.target), 0.0, 0.0);
    }

    edge_lookup_[edge.id] = edge;

    // Check if edge already exists in adjacency list and update it
    auto& sourceEdges = adj_list_[edge.source];
    bool replaced = false;
    for (auto& existing : sourceEdges) {
        if (existing.id == edge.id || (existing.source == edge.source && existing.target == edge.target)) {
            existing = edge;
            replaced = true;
            break;
        }
    }
    if (!replaced) {
        sourceEdges.push_back(edge);
    }

    // If edge is bidirectional, also add reverse edge if not explicitly one way
    if (!edge.is_one_way) {
        std::string rev_id = edge.id + "_rev";
        Edge rev_edge = edge;
        rev_edge.id = rev_id;
        rev_edge.source = edge.target;
        rev_edge.target = edge.source;
        
        auto& targetEdges = adj_list_[edge.target];
        bool rev_replaced = false;
        for (auto& existing : targetEdges) {
            if (existing.id == rev_id || (existing.source == rev_edge.source && existing.target == rev_edge.target)) {
                existing = rev_edge;
                rev_replaced = true;
                break;
            }
        }
        if (!rev_replaced) {
            targetEdges.push_back(rev_edge);
        }
    }

    if (edge.speed_limit_kmh > max_speed_kmh_) {
        max_speed_kmh_ = edge.speed_limit_kmh;
    }

    ++version_;
    return true;
}

bool Graph::removeEdge(const std::string& edge_id) {
    std::unique_lock lock(mutex_);
    auto it = edge_lookup_.find(edge_id);
    if (it == edge_lookup_.end()) {
        return false;
    }

    const Edge edge = it->second;
    edge_lookup_.erase(it);

    if (auto sit = adj_list_.find(edge.source); sit != adj_list_.end()) {
        auto& edges = sit->second;
        edges.erase(std::remove_if(edges.begin(), edges.end(),
            [&edge_id](const Edge& e) { return e.id == edge_id; }), edges.end());
    }

    if (!edge.is_one_way) {
        std::string rev_id = edge.id + "_rev";
        if (auto tit = adj_list_.find(edge.target); tit != adj_list_.end()) {
            auto& edges = tit->second;
            edges.erase(std::remove_if(edges.begin(), edges.end(),
                [&rev_id, &edge_id](const Edge& e) { return e.id == rev_id || e.id == edge_id; }), edges.end());
        }
    }

    recalculateMaxSpeed();
    ++version_;
    return true;
}

bool Graph::hasEdge(const std::string& edge_id) const {
    std::shared_lock lock(mutex_);
    return edge_lookup_.find(edge_id) != edge_lookup_.end();
}

std::optional<Edge> Graph::getEdge(const std::string& edge_id) const {
    std::shared_lock lock(mutex_);
    auto it = edge_lookup_.find(edge_id);
    if (it != edge_lookup_.end()) {
        return it->second;
    }
    return std::nullopt;
}

const std::vector<Edge>& Graph::getNeighbors(NodeId node_id) const {
    std::shared_lock lock(mutex_);
    static const std::vector<Edge> empty_edges;
    auto it = adj_list_.find(node_id);
    if (it != adj_list_.end()) {
        return it->second;
    }
    return empty_edges;
}

std::vector<Edge> Graph::getAllEdges() const {
    std::shared_lock lock(mutex_);
    std::vector<Edge> edges;
    edges.reserve(edge_lookup_.size());
    for (const auto& [_, edge] : edge_lookup_) {
        edges.push_back(edge);
    }
    return edges;
}

bool Graph::updateEdgeTraffic(const std::string& edge_id, TrafficLevel level) {
    std::unique_lock lock(mutex_);
    auto it = edge_lookup_.find(edge_id);
    if (it == edge_lookup_.end()) {
        return false;
    }

    it->second.setTrafficLevel(level);

    // Update in adjacency list for source
    if (auto sit = adj_list_.find(it->second.source); sit != adj_list_.end()) {
        for (auto& e : sit->second) {
            if (e.id == edge_id) {
                e.setTrafficLevel(level);
            }
        }
    }

    // Update in reverse edge if bidirectional
    if (!it->second.is_one_way) {
        std::string rev_id = edge_id + "_rev";
        if (auto tit = adj_list_.find(it->second.target); tit != adj_list_.end()) {
            for (auto& e : tit->second) {
                if (e.id == rev_id || e.id == edge_id) {
                    e.setTrafficLevel(level);
                }
            }
        }
    }

    ++version_;
    return true;
}

uint64_t Graph::getVersion() const {
    std::shared_lock lock(mutex_);
    return version_;
}

double Graph::getMaxSpeedKmh() const {
    std::shared_lock lock(mutex_);
    return max_speed_kmh_;
}

size_t Graph::getNodeCount() const {
    std::shared_lock lock(mutex_);
    return nodes_.size();
}

size_t Graph::getEdgeCount() const {
    std::shared_lock lock(mutex_);
    return edge_lookup_.size();
}

void Graph::clear() {
    std::unique_lock lock(mutex_);
    nodes_.clear();
    adj_list_.clear();
    edge_lookup_.clear();
    max_speed_kmh_ = 120.0;
    ++version_;
}

Graph Graph::createSnapshot() const {
    std::shared_lock lock(mutex_);
    Graph copy;
    copy.nodes_ = nodes_;
    copy.adj_list_ = adj_list_;
    copy.edge_lookup_ = edge_lookup_;
    copy.version_ = version_;
    copy.max_speed_kmh_ = max_speed_kmh_;
    return copy;
}

} // namespace dsa

