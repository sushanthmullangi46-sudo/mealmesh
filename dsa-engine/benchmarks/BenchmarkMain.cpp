#include "Graph.hpp"
#include "Dijkstra.hpp"
#include "AStar.hpp"
#include "Connectivity.hpp"
#include <iostream>
#include <vector>
#include <random>
#include <iomanip>
#include <chrono>

using namespace dsa;

// Generates a repeatable synthetic road network of size N with deterministic random seed
Graph generateBenchmarkGraph(size_t nodeCount, unsigned int seed = 42) {
    Graph g;
    std::mt19937 rng(seed);
    std::uniform_real_distribution<double> latDist(40.7000, 40.8500);
    std::uniform_real_distribution<double> lonDist(-74.0200, -73.8500);
    std::uniform_real_distribution<double> speedDist(30.0, 90.0);

    for (size_t i = 1; i <= nodeCount; ++i) {
        g.addNode(Node(static_cast<NodeId>(i), "Node_" + std::to_string(i), latDist(rng), lonDist(rng)));
    }

    // Connect in a grid-like or k-nearest neighbor planar mesh
    // Each node connects to ~3-4 nearby nodes to model real street topology
    size_t k = std::min(nodeCount - 1, static_cast<size_t>(4));
    size_t edgeCounter = 0;

    for (size_t i = 1; i <= nodeCount; ++i) {
        for (size_t offset = 1; offset <= k; ++offset) {
            size_t targetIdx = ((i + offset - 1) % nodeCount) + 1;
            if (targetIdx == i) continue;

            auto n1 = g.getNode(static_cast<NodeId>(i));
            auto n2 = g.getNode(static_cast<NodeId>(targetIdx));
            if (!n1 || !n2) continue;

            double dist = n1->distanceTo(*n2);
            double speed = speedDist(rng);
            std::string eid = "e_" + std::to_string(++edgeCounter);

            g.addEdge(Edge(eid, static_cast<NodeId>(i), static_cast<NodeId>(targetIdx), dist, speed));
        }
    }

    return g;
}

struct BenchmarkMetric {
    std::string algorithm;
    size_t graph_size;
    double execution_time_ms;
    uint64_t nodes_explored;
    uint64_t edges_examined;
    double path_length_km;
};

void runBenchmarkSuite() {
    std::vector<size_t> testSizes = {50, 500, 5000, 10000};
    std::vector<BenchmarkMetric> results;

    std::cout << "\n========================================================================================\n";
    std::cout << " RUNNING BENCHMARK SUITE: Small (50), Medium (500), Large (5000), Very Large (10000)\n";
    std::cout << "========================================================================================\n";

    for (size_t size : testSizes) {
        std::cout << "\nGenerating graph with " << size << " nodes..." << std::flush;
        Graph g = generateBenchmarkGraph(size);
        std::cout << " Done. (Edges: " << g.getEdgeCount() << ")\n";

        NodeId source = 1;
        NodeId target = static_cast<NodeId>(size / 2 + 1);

        // 1. Run Dijkstra benchmark (averaged over 3 runs)
        double dijkstraTimeTotal = 0.0;
        PathResult dRes;
        for (int run = 0; run < 3; ++run) {
            dRes = Dijkstra::findShortestPath(g, source, target, OptimizationObjective::DISTANCE);
            dijkstraTimeTotal += dRes.execution_time_ms;
        }
        results.push_back({
            "Dijkstra",
            size,
            dijkstraTimeTotal / 3.0,
            dRes.nodes_explored_count,
            dRes.edges_examined_count,
            dRes.total_distance_km
        });

        // 2. Run A* benchmark (averaged over 3 runs)
        double astarTimeTotal = 0.0;
        PathResult aRes;
        for (int run = 0; run < 3; ++run) {
            aRes = AStar::findPath(g, source, target, OptimizationObjective::DISTANCE);
            astarTimeTotal += aRes.execution_time_ms;
        }
        results.push_back({
            "A*",
            size,
            astarTimeTotal / 3.0,
            aRes.nodes_explored_count,
            aRes.edges_examined_count,
            aRes.total_distance_km
        });
    }

    std::cout << "\n----------------------------------------------------------------------------------------\n";
    std::cout << std::left << std::setw(12) << "Algorithm"
              << std::setw(12) << "Nodes (V)"
              << std::setw(18) << "Time (ms)"
              << std::setw(18) << "Explored Nodes"
              << std::setw(18) << "Examined Edges"
              << std::setw(16) << "Distance (km)" << "\n";
    std::cout << "----------------------------------------------------------------------------------------\n";

    for (const auto& r : results) {
        std::cout << std::left << std::setw(12) << r.algorithm
                  << std::setw(12) << r.graph_size
                  << std::setw(18) << std::fixed << std::setprecision(3) << r.execution_time_ms
                  << std::setw(18) << r.nodes_explored
                  << std::setw(18) << r.edges_examined
                  << std::setw(16) << std::fixed << std::setprecision(2) << r.path_length_km << "\n";
    }
    std::cout << "----------------------------------------------------------------------------------------\n";
    std::cout << "Benchmark completed successfully.\n";
}

int main() {
    runBenchmarkSuite();
    return 0;
}
