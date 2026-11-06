#pragma once

#include "Graph.hpp"
#include "DisjointSet.hpp"
#include "Types.hpp"
#include <vector>
#include <unordered_set>

namespace dsa {

class Connectivity {
public:
    Connectivity() = default;

    /**
     * Run Breadth-First Search starting from root to discover all reachable nodes
     * and minimum hop distances.
     */
    static std::vector<NodeId> bfsTraversal(const Graph& graph, NodeId startNode);

    /**
     * Run Depth-First Search starting from root.
     */
    static std::vector<NodeId> dfsTraversal(const Graph& graph, NodeId startNode);

    /**
     * Complete connectivity analysis using DSU, BFS, and degree inspection.
     * Identifies connected components and isolated nodes.
     */
    static ConnectivityResult analyzeConnectivity(const Graph& graph);
};

} // namespace dsa
