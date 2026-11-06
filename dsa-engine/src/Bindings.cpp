#include <pybind11/pybind11.h>
#include <pybind11/stl.h>
#include "Types.hpp"
#include "Node.hpp"
#include "Edge.hpp"
#include "Graph.hpp"
#include "Dijkstra.hpp"
#include "AStar.hpp"
#include "DisjointSet.hpp"
#include "Connectivity.hpp"
#include "RouteOptimizer.hpp"
#include "AlgorithmVisualizer.hpp"

namespace py = pybind11;
using namespace dsa;

PYBIND11_MODULE(dsa_engine_cpp, m) {
    m.doc() = "High Performance C++20 DSA Engine for Route Optimization & Navigation";

    py::enum_<TrafficLevel>(m, "TrafficLevel")
        .value("LOW", TrafficLevel::LOW)
        .value("MEDIUM", TrafficLevel::MEDIUM)
        .value("HIGH", TrafficLevel::HIGH)
        .value("BLOCKED", TrafficLevel::BLOCKED)
        .export_values();

    py::enum_<OptimizationObjective>(m, "OptimizationObjective")
        .value("DISTANCE", OptimizationObjective::DISTANCE)
        .value("TIME", OptimizationObjective::TIME)
        .value("COST", OptimizationObjective::COST)
        .export_values();

    py::class_<Node>(m, "Node")
        .def(py::init<NodeId, std::string, double, double, double, std::string>(),
             py::arg("id"), py::arg("name"), py::arg("latitude"), py::arg("longitude"),
             py::arg("elevation") = 0.0, py::arg("type") = "intersection")
        .def_readwrite("id", &Node::id)
        .def_readwrite("name", &Node::name)
        .def_readwrite("latitude", &Node::latitude)
        .def_readwrite("longitude", &Node::longitude)
        .def_readwrite("elevation_m", &Node::elevation_m)
        .def_readwrite("type", &Node::type)
        .def("distance_to", &Node::distanceTo);

    py::class_<Edge>(m, "Edge")
        .def(py::init<std::string, NodeId, NodeId, double, double, TrafficLevel, double, bool, std::string, std::string>(),
             py::arg("id"), py::arg("source"), py::arg("target"), py::arg("distance_km"),
             py::arg("speed_limit") = 50.0, py::arg("traffic") = TrafficLevel::LOW,
             py::arg("toll") = 0.0, py::arg("one_way") = false,
             py::arg("name") = "Road", py::arg("type") = "primary")
        .def_readwrite("id", &Edge::id)
        .def_readwrite("source", &Edge::source)
        .def_readwrite("target", &Edge::target)
        .def_readwrite("distance_km", &Edge::distance_km)
        .def_readwrite("speed_limit_kmh", &Edge::speed_limit_kmh)
        .def_readwrite("traffic_level", &Edge::traffic_level)
        .def_readwrite("custom_multiplier", &Edge::custom_multiplier)
        .def_readwrite("toll_cost", &Edge::toll_cost)
        .def_readwrite("is_one_way", &Edge::is_one_way)
        .def_readwrite("road_name", &Edge::road_name)
        .def_readwrite("road_type", &Edge::road_type)
        .def("get_effective_speed", &Edge::getEffectiveSpeedKmh)
        .def("get_travel_time_minutes", &Edge::getTravelTimeMinutes)
        .def("get_monetary_cost", &Edge::getMonetaryCost)
        .def("get_weight", &Edge::getWeight)
        .def("set_traffic_level", &Edge::setTrafficLevel);

    py::class_<PathResult>(m, "PathResult")
        .def_readwrite("found", &PathResult::found)
        .def_readwrite("path", &PathResult::path)
        .def_readwrite("total_distance_km", &PathResult::total_distance_km)
        .def_readwrite("total_time_minutes", &PathResult::total_time_minutes)
        .def_readwrite("total_cost", &PathResult::total_cost)
        .def_readwrite("nodes_explored_count", &PathResult::nodes_explored_count)
        .def_readwrite("edges_examined_count", &PathResult::edges_examined_count)
        .def_readwrite("execution_time_ms", &PathResult::execution_time_ms)
        .def_readwrite("explored_nodes", &PathResult::explored_nodes)
        .def_readwrite("algorithm_name", &PathResult::algorithm_name)
        .def_readwrite("optimization_objective", &PathResult::optimization_objective);

    py::class_<TSPResult>(m, "TSPResult")
        .def_readwrite("success", &TSPResult::success)
        .def_readwrite("tour_order", &TSPResult::tour_order)
        .def_readwrite("complete_path", &TSPResult::complete_path)
        .def_readwrite("initial_distance_km", &TSPResult::initial_distance_km)
        .def_readwrite("optimized_distance_km", &TSPResult::optimized_distance_km)
        .def_readwrite("distance_saved_km", &TSPResult::distance_saved_km)
        .def_readwrite("improvement_percentage", &TSPResult::improvement_percentage)
        .def_readwrite("two_opt_iterations", &TSPResult::two_opt_iterations)
        .def_readwrite("execution_time_ms", &TSPResult::execution_time_ms);

    py::class_<ConnectivityResult>(m, "ConnectivityResult")
        .def_readwrite("total_nodes", &ConnectivityResult::total_nodes)
        .def_readwrite("total_edges", &ConnectivityResult::total_edges)
        .def_readwrite("component_count", &ConnectivityResult::component_count)
        .def_readwrite("is_fully_connected", &ConnectivityResult::is_fully_connected)
        .def_readwrite("components", &ConnectivityResult::components)
        .def_readwrite("isolated_nodes", &ConnectivityResult::isolated_nodes)
        .def_readwrite("execution_time_ms", &ConnectivityResult::execution_time_ms);

    py::class_<DetailedVisualizationStep>(m, "DetailedVisualizationStep")
        .def_readwrite("step_index", &DetailedVisualizationStep::step_index)
        .def_readwrite("event_type", &DetailedVisualizationStep::event_type)
        .def_readwrite("current_node", &DetailedVisualizationStep::current_node)
        .def_readwrite("neighbor_node", &DetailedVisualizationStep::neighbor_node)
        .def_readwrite("edge_weight", &DetailedVisualizationStep::edge_weight)
        .def_readwrite("current_dist", &DetailedVisualizationStep::current_dist)
        .def_readwrite("tentative_dist", &DetailedVisualizationStep::tentative_dist)
        .def_readwrite("heuristic", &DetailedVisualizationStep::heuristic)
        .def_readwrite("priority_score", &DetailedVisualizationStep::priority_score)
        .def_readwrite("description", &DetailedVisualizationStep::description)
        .def_readwrite("priority_queue_state", &DetailedVisualizationStep::priority_queue_state)
        .def_readwrite("visited_nodes", &DetailedVisualizationStep::visited_nodes)
        .def_readwrite("parent_map", &DetailedVisualizationStep::parent_map)
        .def_readwrite("distance_map", &DetailedVisualizationStep::distance_map);

    py::class_<VisualizationTrace>(m, "VisualizationTrace")
        .def_readwrite("algorithm_name", &VisualizationTrace::algorithm_name)
        .def_readwrite("source", &VisualizationTrace::source)
        .def_readwrite("target", &VisualizationTrace::target)
        .def_readwrite("path_found", &VisualizationTrace::path_found)
        .def_readwrite("final_path", &VisualizationTrace::final_path)
        .def_readwrite("total_cost", &VisualizationTrace::total_cost)
        .def_readwrite("total_steps", &VisualizationTrace::total_steps)
        .def_readwrite("steps", &VisualizationTrace::steps)
        .def_readwrite("execution_time_ms", &VisualizationTrace::execution_time_ms);

    py::class_<Graph>(m, "Graph")
        .def(py::init<>())
        .def("add_node", &Graph::addNode)
        .def("remove_node", &Graph::removeNode)
        .def("has_node", &Graph::hasNode)
        .def("get_node", &Graph::getNode)
        .def("get_all_nodes", &Graph::getAllNodes)
        .def("add_edge", &Graph::addEdge)
        .def("remove_edge", &Graph::removeEdge)
        .def("has_edge", &Graph::hasEdge)
        .def("get_edge", &Graph::getEdge)
        .def("get_neighbors", &Graph::getNeighbors)
        .def("get_all_edges", &Graph::getAllEdges)
        .def("update_edge_traffic", &Graph::updateEdgeTraffic)
        .def("get_version", &Graph::getVersion)
        .def("get_max_speed_kmh", &Graph::getMaxSpeedKmh)
        .def("get_node_count", &Graph::getNodeCount)
        .def("get_edge_count", &Graph::getEdgeCount)
        .def("clear", &Graph::clear)
        .def("create_snapshot", &Graph::createSnapshot);

    py::class_<Dijkstra>(m, "Dijkstra")
        .def_static("find_shortest_path", &Dijkstra::findShortestPath,
                    py::arg("graph"), py::arg("source"), py::arg("target"),
                    py::arg("objective") = OptimizationObjective::DISTANCE)
        .def_static("compute_all_distances", &Dijkstra::computeAllDistances,
                    py::arg("graph"), py::arg("source"),
                    py::arg("objective") = OptimizationObjective::DISTANCE);

    py::class_<AStar>(m, "AStar")
        .def_static("find_path", &AStar::findPath,
                    py::arg("graph"), py::arg("source"), py::arg("target"),
                    py::arg("objective") = OptimizationObjective::DISTANCE)
        .def_static("calculate_heuristic", &AStar::calculateHeuristic,
                    py::arg("graph"), py::arg("u"), py::arg("target"),
                    py::arg("objective") = OptimizationObjective::DISTANCE);

    py::class_<DisjointSet>(m, "DisjointSet")
        .def(py::init<>())
        .def("add_element", &DisjointSet::addElement)
        .def("find", &DisjointSet::find)
        .def("unite", &DisjointSet::unite)
        .def("connected", &DisjointSet::connected)
        .def("get_component_count", &DisjointSet::getComponentCount)
        .def("get_component_groups", &DisjointSet::getComponentGroups)
        .def("clear", &DisjointSet::clear);

    py::class_<Connectivity>(m, "Connectivity")
        .def_static("bfs_traversal", &Connectivity::bfsTraversal,
                    py::arg("graph"), py::arg("start_node"))
        .def_static("dfs_traversal", &Connectivity::dfsTraversal,
                    py::arg("graph"), py::arg("start_node"))
        .def_static("analyze_connectivity", &Connectivity::analyzeConnectivity,
                    py::arg("graph"));

    py::class_<RouteOptimizer>(m, "RouteOptimizer")
        .def_static("optimize_tour", &RouteOptimizer::optimizeTour,
                    py::arg("graph"), py::arg("start_node"), py::arg("waypoints"),
                    py::arg("end_node") = -1, py::arg("round_trip") = false);

    py::class_<AlgorithmVisualizer>(m, "AlgorithmVisualizer")
        .def_static("trace_dijkstra", &AlgorithmVisualizer::traceDijkstra,
                    py::arg("graph"), py::arg("source"), py::arg("target"),
                    py::arg("objective") = OptimizationObjective::DISTANCE)
        .def_static("trace_astar", &AlgorithmVisualizer::traceAStar,
                    py::arg("graph"), py::arg("source"), py::arg("target"),
                    py::arg("objective") = OptimizationObjective::DISTANCE);
}
