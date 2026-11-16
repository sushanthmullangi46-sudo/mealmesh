#include "AlgorithmVisualizer.hpp"
#include "AStar.hpp"
#include "PriorityQueue.hpp"
#include <chrono>
#include <algorithm>
#include <sstream>
#include <iomanip>

namespace dsa {

static std::string formatDouble(double val) {
    if (std::isinf(val)) return "INF";
    std::ostringstream ss;
    ss << std::fixed << std::setprecision(2) << val;
    return ss.str();
}

VisualizationTrace AlgorithmVisualizer::traceDijkstra(
    const Graph& graph,
    NodeId source,
    NodeId target,
    OptimizationObjective objective
) {
    const auto startTime = std::chrono::high_resolution_clock::now();
    VisualizationTrace trace;
    trace.algorithm_name = "Dijkstra";
    trace.source = source;
    trace.target = target;

    if (!graph.hasNode(source) || !graph.hasNode(target)) {
        DetailedVisualizationStep step;
        step.step_index = 0;
        step.event_type = "NO_PATH";
        step.description = "Source or destination node does not exist in graph.";
        trace.steps.push_back(step);
        trace.total_steps = 1;
        return trace;
    }

    std::unordered_map<NodeId, double> dist;
    std::unordered_map<NodeId, NodeId> parent;
    std::unordered_map<NodeId, bool> visited;
    std::vector<NodeId> visitedList;

    PriorityQueue<NodeId, double> pq;

    dist[source] = 0.0;
    pq.push(source, 0.0);

    uint32_t stepIdx = 0;

    // Initial step: Push source
    {
        DetailedVisualizationStep step;
        step.step_index = stepIdx++;
        step.event_type = "VISIT_NODE";
        step.current_node = source;
        step.current_dist = 0.0;
        step.priority_score = 0.0;
        step.description = "Initialized Dijkstra search. Pushed source node " + std::to_string(source) + " with distance 0.";
        step.priority_queue_state = pq.getTopK(10);
        step.visited_nodes = visitedList;
        step.parent_map = parent;
        step.distance_map = dist;
        trace.steps.push_back(step);
    }

    bool reached = false;

    while (!pq.empty()) {
        const auto topItem = pq.top();
        const NodeId u = topItem.element;
        const double d = topItem.priority;
        pq.pop();

        if (visited[u]) {
            continue;
        }
        visited[u] = true;
        visitedList.push_back(u);

        // Step: Extracted node from priority queue
        {
            DetailedVisualizationStep step;
            step.step_index = stepIdx++;
            step.event_type = "VISIT_NODE";
            step.current_node = u;
            step.current_dist = d;
            step.priority_score = d;
            step.description = "Extracted node " + std::to_string(u) + " from Min-Heap with settled cost " + formatDouble(d);
            step.priority_queue_state = pq.getTopK(10);
            step.visited_nodes = visitedList;
            step.parent_map = parent;
            step.distance_map = dist;
            trace.steps.push_back(step);
        }

        if (u == target) {
            reached = true;
            DetailedVisualizationStep step;
            step.step_index = stepIdx++;
            step.event_type = "REACH_GOAL";
            step.current_node = u;
            step.current_dist = d;
            step.description = "Reached target node " + std::to_string(target) + " with optimal cost " + formatDouble(d);
            step.priority_queue_state = pq.getTopK(10);
            step.visited_nodes = visitedList;
            step.parent_map = parent;
            step.distance_map = dist;
            trace.steps.push_back(step);
            break;
        }

        const auto& neighbors = graph.getNeighbors(u);
        for (const auto& edge : neighbors) {
            const NodeId v = edge.target;
            const double weight = edge.getWeight(objective);

            if (weight >= INF_WEIGHT || std::isinf(weight)) {
                DetailedVisualizationStep step;
                step.step_index = stepIdx++;
                step.event_type = "SKIP_EDGE";
                step.current_node = u;
                step.neighbor_node = v;
                step.edge_weight = weight;
                step.description = "Edge (" + std::to_string(u) + " -> " + std::to_string(v) + ") is BLOCKED by traffic.";
                step.priority_queue_state = pq.getTopK(10);
                step.visited_nodes = visitedList;
                step.parent_map = parent;
                step.distance_map = dist;
                trace.steps.push_back(step);
                continue;
            }

            if (visited[v]) {
                DetailedVisualizationStep step;
                step.step_index = stepIdx++;
                step.event_type = "SKIP_EDGE";
                step.current_node = u;
                step.neighbor_node = v;
                step.edge_weight = weight;
                step.description = "Neighbor node " + std::to_string(v) + " already settled. Skipping.";
                step.priority_queue_state = pq.getTopK(10);
                step.visited_nodes = visitedList;
                step.parent_map = parent;
                step.distance_map = dist;
                trace.steps.push_back(step);
                continue;
            }

            const double oldDist = (dist.find(v) != dist.end()) ? dist[v] : INF_WEIGHT;
            const double newDist = d + weight;

            DetailedVisualizationStep step;
            step.step_index = stepIdx++;
            step.current_node = u;
            step.neighbor_node = v;
            step.edge_weight = weight;
            step.current_dist = oldDist;
            step.tentative_dist = newDist;

            if (newDist < oldDist) {
                dist[v] = newDist;
                parent[v] = u;
                pq.push(v, newDist);

                step.event_type = "UPDATE_DISTANCE";
                step.priority_score = newDist;
                step.description = "Relaxed edge (" + std::to_string(u) + " -> " + std::to_string(v) +
                    "): improved distance from " + formatDouble(oldDist) + " to " + formatDouble(newDist) +
                    ". Pushed to priority queue.";
            } else {
                step.event_type = "EXAMINE_EDGE";
                step.description = "Examined edge (" + std::to_string(u) + " -> " + std::to_string(v) +
                    "): tentative distance " + formatDouble(newDist) + " >= existing " + formatDouble(oldDist) + ". No update.";
            }

            step.priority_queue_state = pq.getTopK(10);
            step.visited_nodes = visitedList;
            step.parent_map = parent;
            step.distance_map = dist;
            trace.steps.push_back(step);
        }
    }

    trace.total_steps = trace.steps.size();
    trace.path_found = reached;

    if (reached) {
        std::vector<NodeId> path;
        NodeId curr = target;
        while (curr != source) {
            path.push_back(curr);
            curr = parent[curr];
        }
        path.push_back(source);
        std::reverse(path.begin(), path.end());
        trace.final_path = path;
        trace.total_cost = dist[target];
    }

    const auto endTime = std::chrono::high_resolution_clock::now();
    trace.execution_time_ms = std::chrono::duration<double, std::milli>(endTime - startTime).count();
    return trace;
}

VisualizationTrace AlgorithmVisualizer::traceAStar(
    const Graph& graph,
    NodeId source,
    NodeId target,
    OptimizationObjective objective
) {
    const auto startTime = std::chrono::high_resolution_clock::now();
    VisualizationTrace trace;
    trace.algorithm_name = "A*";
    trace.source = source;
    trace.target = target;

    if (!graph.hasNode(source) || !graph.hasNode(target)) {
        DetailedVisualizationStep step;
        step.step_index = 0;
        step.event_type = "NO_PATH";
        step.description = "Source or destination node does not exist in graph.";
        trace.steps.push_back(step);
        trace.total_steps = 1;
        return trace;
    }

    std::unordered_map<NodeId, double> gScore;
    std::unordered_map<NodeId, double> fScore;
    std::unordered_map<NodeId, NodeId> parent;
    std::unordered_map<NodeId, bool> closedSet;
    std::vector<NodeId> closedList;

    PriorityQueue<NodeId, double> openSet;

    gScore[source] = 0.0;
    const double initialH = AStar::calculateHeuristic(graph, source, target, objective);
    fScore[source] = initialH;
    openSet.push(source, initialH);

    uint32_t stepIdx = 0;

    {
        DetailedVisualizationStep step;
        step.step_index = stepIdx++;
        step.event_type = "VISIT_NODE";
        step.current_node = source;
        step.current_dist = 0.0;
        step.heuristic = initialH;
        step.priority_score = initialH;
        step.description = "Initialized A* search. g(source)=0, h(source)=" + formatDouble(initialH) +
            ", f(source)=" + formatDouble(initialH) + ". Pushed into Open Set.";
        step.priority_queue_state = openSet.getTopK(10);
        step.visited_nodes = closedList;
        step.parent_map = parent;
        step.distance_map = gScore;
        trace.steps.push_back(step);
    }

    bool reached = false;

    while (!openSet.empty()) {
        const auto topItem = openSet.top();
        const NodeId current = topItem.element;
        openSet.pop();

        if (closedSet[current]) {
            continue;
        }
        closedSet[current] = true;
        closedList.push_back(current);

        const double currentG = gScore[current];
        const double currentH = AStar::calculateHeuristic(graph, current, target, objective);
        const double currentF = fScore[current];

        {
            DetailedVisualizationStep step;
            step.step_index = stepIdx++;
            step.event_type = "VISIT_NODE";
            step.current_node = current;
            step.current_dist = currentG;
            step.heuristic = currentH;
            step.priority_score = currentF;
            step.description = "Expanded node " + std::to_string(current) + " from Open Set. [g=" +
                formatDouble(currentG) + ", h=" + formatDouble(currentH) + ", f=" + formatDouble(currentF) + "]";
            step.priority_queue_state = openSet.getTopK(10);
            step.visited_nodes = closedList;
            step.parent_map = parent;
            step.distance_map = gScore;
            trace.steps.push_back(step);
        }

        if (current == target) {
            reached = true;
            DetailedVisualizationStep step;
            step.step_index = stepIdx++;
            step.event_type = "REACH_GOAL";
            step.current_node = current;
            step.current_dist = currentG;
            step.description = "Target node " + std::to_string(target) + " reached! Optimal g(target)=" + formatDouble(currentG);
            step.priority_queue_state = openSet.getTopK(10);
            step.visited_nodes = closedList;
            step.parent_map = parent;
            step.distance_map = gScore;
            trace.steps.push_back(step);
            break;
        }

        const auto& neighbors = graph.getNeighbors(current);
        for (const auto& edge : neighbors) {
            const NodeId neighbor = edge.target;
            const double weight = edge.getWeight(objective);

            if (weight >= INF_WEIGHT || std::isinf(weight)) {
                DetailedVisualizationStep step;
                step.step_index = stepIdx++;
                step.event_type = "SKIP_EDGE";
                step.current_node = current;
                step.neighbor_node = neighbor;
                step.edge_weight = weight;
                step.description = "Edge (" + std::to_string(current) + " -> " + std::to_string(neighbor) + ") is BLOCKED.";
                step.priority_queue_state = openSet.getTopK(10);
                step.visited_nodes = closedList;
                step.parent_map = parent;
                step.distance_map = gScore;
                trace.steps.push_back(step);
                continue;
            }

            if (closedSet[neighbor]) {
                DetailedVisualizationStep step;
                step.step_index = stepIdx++;
                step.event_type = "SKIP_EDGE";
                step.current_node = current;
                step.neighbor_node = neighbor;
                step.edge_weight = weight;
                step.description = "Neighbor " + std::to_string(neighbor) + " is already in Closed Set.";
                step.priority_queue_state = openSet.getTopK(10);
                step.visited_nodes = closedList;
                step.parent_map = parent;
                step.distance_map = gScore;
                trace.steps.push_back(step);
                continue;
            }

            const double tentativeG = currentG + weight;
            const double oldG = (gScore.find(neighbor) != gScore.end()) ? gScore[neighbor] : INF_WEIGHT;

            DetailedVisualizationStep step;
            step.step_index = stepIdx++;
            step.current_node = current;
            step.neighbor_node = neighbor;
            step.edge_weight = weight;
            step.current_dist = oldG;
            step.tentative_dist = tentativeG;

            if (tentativeG < oldG) {
                parent[neighbor] = current;
                gScore[neighbor] = tentativeG;
                const double h = AStar::calculateHeuristic(graph, neighbor, target, objective);
                const double f = tentativeG + h;
                fScore[neighbor] = f;
                openSet.push(neighbor, f);

                step.event_type = "UPDATE_DISTANCE";
                step.heuristic = h;
                step.priority_score = f;
                step.description = "Relaxed edge: g(" + std::to_string(neighbor) + ") updated to " +
                    formatDouble(tentativeG) + " + h=" + formatDouble(h) + " => f=" + formatDouble(f) + ". Inserted to Open Set.";
            } else {
                step.event_type = "EXAMINE_EDGE";
                step.description = "Examined edge: tentative g " + formatDouble(tentativeG) + " >= existing " + formatDouble(oldG);
            }

            step.priority_queue_state = openSet.getTopK(10);
            step.visited_nodes = closedList;
            step.parent_map = parent;
            step.distance_map = gScore;
            trace.steps.push_back(step);
        }
    }

    trace.total_steps = trace.steps.size();
    trace.path_found = reached;

    if (reached) {
        std::vector<NodeId> path;
        NodeId curr = target;
        while (curr != source) {
            path.push_back(curr);
            curr = parent[curr];
        }
        path.push_back(source);
        std::reverse(path.begin(), path.end());
        trace.final_path = path;
        trace.total_cost = gScore[target];
    }

    const auto endTime = std::chrono::high_resolution_clock::now();
    trace.execution_time_ms = std::chrono::duration<double, std::milli>(endTime - startTime).count();
    return trace;
}

} // namespace dsa

