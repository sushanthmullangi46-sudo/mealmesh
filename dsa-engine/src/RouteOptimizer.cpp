#include "RouteOptimizer.hpp"
#include "Dijkstra.hpp"
#include <chrono>
#include <algorithm>
#include <unordered_set>
#include <map>

namespace dsa {

TSPResult RouteOptimizer::optimizeTour(
    const Graph& graph,
    NodeId startNode,
    const std::vector<NodeId>& waypoints,
    NodeId endNode,
    bool roundTrip
) {
    const auto startTime = std::chrono::high_resolution_clock::now();
    TSPResult result;

    if (!graph.hasNode(startNode)) {
        result.success = false;
        return result;
    }

    // Determine unique stops to visit
    std::vector<NodeId> targets;
    std::unordered_set<NodeId> seen;
    seen.insert(startNode);

    for (NodeId wp : waypoints) {
        if (graph.hasNode(wp) && seen.find(wp) == seen.end()) {
            targets.push_back(wp);
            seen.insert(wp);
        }
    }

    NodeId finalDest = (endNode != -1 && graph.hasNode(endNode)) ? endNode : startNode;
    if (finalDest == startNode && !roundTrip && targets.empty()) {
        result.success = true;
        result.tour_order = {startNode};
        result.complete_path = {startNode};
        result.initial_distance_km = 0.0;
        result.optimized_distance_km = 0.0;
        return result;
    }

    // Precompute all pairwise shortest paths between all nodes involved
    std::vector<NodeId> allNodes = {startNode};
    allNodes.insert(allNodes.end(), targets.begin(), targets.end());
    if (finalDest != startNode) {
        allNodes.push_back(finalDest);
    }

    // Pairwise distance matrix and path cache
    std::map<std::pair<NodeId, NodeId>, double> distMatrix;
    std::map<std::pair<NodeId, NodeId>, std::vector<NodeId>> pathMatrix;

    for (size_t i = 0; i < allNodes.size(); ++i) {
        for (size_t j = 0; j < allNodes.size(); ++j) {
            if (i == j) {
                distMatrix[{allNodes[i], allNodes[j]}] = 0.0;
                pathMatrix[{allNodes[i], allNodes[j]}] = {allNodes[i]};
                continue;
            }
            PathResult p = Dijkstra::findShortestPath(graph, allNodes[i], allNodes[j], OptimizationObjective::DISTANCE);
            if (!p.found) {
                distMatrix[{allNodes[i], allNodes[j]}] = INF_WEIGHT;
            } else {
                distMatrix[{allNodes[i], allNodes[j]}] = p.total_distance_km;
                pathMatrix[{allNodes[i], allNodes[j]}] = p.path;
            }
        }
    }

    // Stage 1: Greedy Nearest Neighbor Construction
    std::vector<NodeId> tour;
    tour.push_back(startNode);

    std::unordered_set<NodeId> unvisited(targets.begin(), targets.end());
    NodeId current = startNode;

    while (!unvisited.empty()) {
        NodeId nearest = -1;
        double bestDist = INF_WEIGHT;

        for (NodeId candidate : unvisited) {
            double d = distMatrix[{current, candidate}];
            if (d < bestDist) {
                bestDist = d;
                nearest = candidate;
            }
        }

        if (nearest == -1 || std::isinf(bestDist)) {
            // Unreachable waypoint in disconnected component
            result.success = false;
            return result;
        }

        tour.push_back(nearest);
        unvisited.erase(nearest);
        current = nearest;
    }

    if (roundTrip || finalDest != startNode) {
        tour.push_back(finalDest);
    }

    // Compute initial tour length
    auto calculateTourLength = [&](const std::vector<NodeId>& t) -> double {
        double total = 0.0;
        for (size_t i = 0; i + 1 < t.size(); ++i) {
            double d = distMatrix[{t[i], t[i + 1]}];
            if (std::isinf(d)) return INF_WEIGHT;
            total += d;
        }
        return total;
    };

    const double initialDist = calculateTourLength(tour);
    result.initial_distance_km = initialDist;

    // Stage 2: 2-Opt Local Search Improvement
    // We keep tour[0] (start) fixed, and if end is fixed (roundTrip or specific finalDest), keep tour.back() fixed.
    std::vector<NodeId> bestTour = tour;
    double bestLength = initialDist;
    uint32_t iterations = 0;
    bool improved = true;

    const size_t endLimit = (roundTrip || finalDest != startNode) ? bestTour.size() - 2 : bestTour.size() - 1;

    while (improved && iterations < 500) {
        improved = false;
        ++iterations;

        for (size_t i = 1; i <= endLimit; ++i) {
            for (size_t j = i + 1; j <= endLimit + (bestTour.size() - 1 == endLimit ? 0 : 0); ++j) {
                if (j >= bestTour.size()) continue;

                // Test 2-opt reversal of segment [i, j]
                std::vector<NodeId> newTour = bestTour;
                std::reverse(newTour.begin() + i, newTour.begin() + j + 1);

                double newLength = calculateTourLength(newTour);
                if (newLength < bestLength - 1e-6) {
                    bestTour = std::move(newTour);
                    bestLength = newLength;
                    improved = true;
                    break;
                }
            }
            if (improved) break;
        }
    }

    result.two_opt_iterations = iterations;
    result.optimized_distance_km = bestLength;
    result.distance_saved_km = std::max(0.0, initialDist - bestLength);
    result.improvement_percentage = (initialDist > 0.0) 
        ? ((result.distance_saved_km / initialDist) * 100.0) 
        : 0.0;
    result.tour_order = bestTour;

    // Assemble complete node-by-node path through graph
    std::vector<NodeId> completePath;
    for (size_t i = 0; i + 1 < bestTour.size(); ++i) {
        const auto& subpath = pathMatrix[{bestTour[i], bestTour[i + 1]}];
        if (subpath.empty()) {
            result.success = false;
            return result;
        }
        // Append subpath avoiding duplicating boundary nodes
        if (completePath.empty()) {
            completePath.insert(completePath.end(), subpath.begin(), subpath.end());
        } else {
            completePath.insert(completePath.end(), subpath.begin() + 1, subpath.end());
        }
    }

    result.complete_path = completePath;
    result.success = true;

    const auto endTime = std::chrono::high_resolution_clock::now();
    result.execution_time_ms = std::chrono::duration<double, std::milli>(endTime - startTime).count();

    return result;
}

} // namespace dsa
