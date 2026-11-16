package com.mealmesh.controller;

import com.mealmesh.dsa.graph.Vertex;
import com.mealmesh.dto.ApiResponse;
import com.mealmesh.dto.RouteRequestDto;
import com.mealmesh.dto.RouteResponseDto;
import com.mealmesh.routing.RouteOptimizationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/routing")
public class RoutingController {

    private final RouteOptimizationService routeService;

    public RoutingController(RouteOptimizationService routeService) {
        this.routeService = routeService;
    }

    @PostMapping("/shortest-path")
    public ResponseEntity<ApiResponse<RouteResponseDto>> computeShortestPath(@RequestBody RouteRequestDto request) {
        try {
            RouteResponseDto dto = routeService.computeShortestRoute(request);
            return ResponseEntity.ok(ApiResponse.ok("Shortest route computed via custom Dijkstra engine", dto));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/multi-stop")
    public ResponseEntity<ApiResponse<RouteResponseDto>> computeMultiStopRoute(@RequestBody RouteRequestDto request) {
        try {
            RouteResponseDto dto = routeService.computeMultiStopRoute(request.getWaypointIds(), request.getOptimizationObjective());
            return ResponseEntity.ok(ApiResponse.ok("Multi-stop optimized route generated", dto));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/waypoints")
    public ResponseEntity<ApiResponse<List<Vertex>>> getAllWaypoints() {
        return ResponseEntity.ok(ApiResponse.ok(routeService.getAllWaypoints()));
    }
}
