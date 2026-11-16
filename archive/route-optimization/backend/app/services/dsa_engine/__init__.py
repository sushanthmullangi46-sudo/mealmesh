import os
import logging
from .types import (
    Node, Edge, TrafficLevel, OptimizationObjective,
    PathResult, TSPResult, ConnectivityResult,
    DetailedVisualizationStep, VisualizationTrace
)
from .graph import Graph, haversine_distance
from .dijkstra import Dijkstra
from .astar import AStar
from .disjoint_set import DisjointSet
from .connectivity import Connectivity
from .route_optimizer import RouteOptimizer
from .visualizer import AlgorithmVisualizer

logger = logging.getLogger(__name__)

# Check if native C++ pybind11 module is compiled and available
HAS_CPP_ENGINE = False
try:
    import dsa_engine_cpp # type: ignore
    HAS_CPP_ENGINE = True
    logger.info("Native C++20 DSA Engine (pybind11) detected and loaded.")
except ImportError:
    HAS_CPP_ENGINE = False
    logger.info("Using Pure Python DSA Engine mirror with identical OOP semantics.")

__all__ = [
    "Node",
    "Edge",
    "Graph",
    "TrafficLevel",
    "OptimizationObjective",
    "PathResult",
    "TSPResult",
    "ConnectivityResult",
    "DetailedVisualizationStep",
    "VisualizationTrace",
    "Dijkstra",
    "AStar",
    "DisjointSet",
    "Connectivity",
    "RouteOptimizer",
    "AlgorithmVisualizer",
    "haversine_distance",
    "HAS_CPP_ENGINE"
]

