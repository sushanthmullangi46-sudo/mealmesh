cmake_minimum_required(VERSION 3.20)
project(IntelligentRouteOptimizationDSA VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# Optimization and warning flags
if(MSVC)
    add_compile_options(/W4 /O2 /permissive-)
else()
    add_compile_options(-Wall -Wextra -Wpedantic -O3)
endif()

include_directories(include)

# Core DSA Library
set(DSA_SOURCES
    src/Graph.cpp
    src/Dijkstra.cpp
    src/AStar.cpp
    src/DisjointSet.cpp
    src/Connectivity.cpp
    src/RouteOptimizer.cpp
    src/AlgorithmVisualizer.cpp
)

add_library(dsa_core STATIC ${DSA_SOURCES})

# Test Runner Executable
add_executable(dsa_tests
    tests/TestMain.cpp
)
target_link_libraries(dsa_tests PRIVATE dsa_core)

# Performance Benchmark Executable
add_executable(dsa_benchmarks
    benchmarks/BenchmarkMain.cpp
)
target_link_libraries(dsa_benchmarks PRIVATE dsa_core)

# Optional Pybind11 Python Module
find_package(pybind11 CONFIG QUIET)
if(pybind11_FOUND)
    pybind11_add_module(dsa_engine_cpp src/Bindings.cpp)
    target_link_libraries(dsa_engine_cpp PRIVATE dsa_core)
    message(STATUS "pybind11 found: dsa_engine_cpp target enabled.")
else()
    message(STATUS "pybind11 not found via CMake config. To build python extension, use setup.py.")
endif()
