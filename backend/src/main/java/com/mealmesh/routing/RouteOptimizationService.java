package com.mealmesh.routing;

import com.mealmesh.dsa.graph.DijkstraResult;
import com.mealmesh.dsa.graph.Graph;
import com.mealmesh.dsa.graph.Vertex;
import com.mealmesh.dto.RouteRequestDto;
import com.mealmesh.dto.RouteResponseDto;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class RouteOptimizationService {

    private final Graph transportGraph = new Graph();
    private final Map<String, Vertex> vertexIndex = new HashMap<>();

    @PostConstruct
    public void initRoadNetwork() {
        // Build realistic Bengaluru urban road network vertices
        addWaypoint("V_KORAMANGALA", "Koramangala 5th Block", 12.9352, 77.6245, "DONOR");
        addWaypoint("V_INDIRANAGAR", "Indiranagar 100ft Rd", 12.9784, 77.6408, "DONOR");
        addWaypoint("V_HSR", "HSR Layout Sector 2", 12.9121, 77.6446, "DONOR");
        addWaypoint("V_WHITEFIELD", "Whitefield ITPL Main Rd", 12.9698, 77.7499, "DONOR");
        addWaypoint("V_MG_ROAD", "MG Road Metro Hub", 12.9756, 77.6066, "JUNCTION");
        addWaypoint("V_JAYANAGAR", "Jayanagar 4th Block", 12.9250, 77.5938, "NGO");
        addWaypoint("V_MALLESHWARAM", "Malleshwaram 8th Cross", 13.0031, 77.5643, "NGO");
        addWaypoint("V_ELECTRONIC_CITY", "Electronic City Phase 1", 12.8452, 77.6602, "NGO");
        addWaypoint("V_HEBBAL", "Hebbal Flyover Junction", 13.0358, 77.5970, "JUNCTION");
        addWaypoint("V_BANASHANKARI", "Banashankari BDA Complex", 12.9177, 77.5736, "NGO");
        addWaypoint("V_MARATHAHALLI", "Marathahalli Bridge", 12.9591, 77.6974, "JUNCTION");
        addWaypoint("V_SHIVAJINAGAR", "Shivajinagar Bus Station", 12.9856, 77.6033, "JUNCTION");

        // Connect road segments with realistic urban distances and transit times
        connect("V_KORAMANGALA", "V_INDIRANAGAR", 5.8, 18.0, "MODERATE");
        connect("V_KORAMANGALA", "V_HSR", 4.2, 12.0, "CLEAR");
        connect("V_KORAMANGALA", "V_MG_ROAD", 5.2, 16.0, "CONGESTED");
        connect("V_KORAMANGALA", "V_JAYANAGAR", 5.0, 15.0, "CLEAR");

        connect("V_INDIRANAGAR", "V_MG_ROAD", 4.5, 14.0, "MODERATE");
        connect("V_INDIRANAGAR", "V_MARATHAHALLI", 6.8, 22.0, "CONGESTED");
        connect("V_INDIRANAGAR", "V_SHIVAJINAGAR", 4.0, 12.0, "CLEAR");

        connect("V_MARATHAHALLI", "V_WHITEFIELD", 7.5, 20.0, "MODERATE");
        connect("V_HSR", "V_ELECTRONIC_CITY", 9.8, 24.0, "CLEAR");
        connect("V_HSR", "V_MARATHAHALLI", 8.2, 25.0, "CONGESTED");

        connect("V_MG_ROAD", "V_SHIVAJINAGAR", 2.1, 7.0, "CLEAR");
        connect("V_MG_ROAD", "V_MALLESHWARAM", 6.2, 20.0, "MODERATE");

        connect("V_JAYANAGAR", "V_BANASHANKARI", 3.2, 10.0, "CLEAR");
        connect("V_BANASHANKARI", "V_ELECTRONIC_CITY", 14.5, 35.0, "MODERATE");

        connect("V_MALLESHWARAM", "V_HEBBAL", 5.5, 15.0, "CLEAR");
        connect("V_SHIVAJINAGAR", "V_HEBBAL", 7.2, 22.0, "MODERATE");
    }

    private void addWaypoint(String id, String label, double lat, double lon, String type) {
        Vertex v = new Vertex(id, label, lat, lon, type);
        transportGraph.addVertex(v);
        vertexIndex.put(id, v);
    }

    private void connect(String uId, String vId, double distKm, double minutes, String condition) {
        Vertex u = vertexIndex.get(uId);
        Vertex v = vertexIndex.get(vId);
        if (u != null && v != null) {
            transportGraph.addEdge(u, v, distKm, minutes, condition, true);
        }
    }

    public RouteResponseDto computeShortestRoute(RouteRequestDto request) {
        String originId = request.getOriginId() != null ? request.getOriginId() : "V_KORAMANGALA";
        String destId = request.getDestinationId() != null ? request.getDestinationId() : "V_JAYANAGAR";
        String metric = request.getOptimizationObjective() != null ? request.getOptimizationObjective() : "distance";

        DijkstraResult result = transportGraph.dijkstra(originId, destId, metric);

        RouteResponseDto dto = new RouteResponseDto();
        Vertex origin = vertexIndex.get(originId);
        Vertex dest = vertexIndex.get(destId);

        dto.setOriginId(originId);
        dto.setOriginLabel(origin != null ? origin.getLabel() : originId);
        dto.setDestinationId(destId);
        dto.setDestinationLabel(dest != null ? dest.getLabel() : destId);
        dto.setReachable(result.isReachable());
        dto.setTotalDistanceKm(result.getTotalDistanceKm());
        dto.setTotalTimeMinutes(result.getTotalTimeMinutes());

        List<RouteResponseDto.RouteWaypointDto> waypoints = new ArrayList<>();
        if (result.getPath() != null) {
            for (Vertex v : result.getPath()) {
                waypoints.add(new RouteResponseDto.RouteWaypointDto(v.getId(), v.getLabel(), v.getLatitude(), v.getLongitude(), v.getType()));
            }
        }
        dto.setPath(waypoints);
        return dto;
    }

    /**
     * Solves multi-stop delivery route using Nearest-Neighbor Greedy TSP heuristic,
     * chaining Dijkstra shortest paths between consecutive stops.
     */
    public RouteResponseDto computeMultiStopRoute(List<String> stopIds, String metric) {
        if (stopIds == null || stopIds.size() < 2) {
            throw new IllegalArgumentException("At least 2 stop nodes required for route optimization");
        }

        List<String> unvisited = new ArrayList<>(stopIds.subList(1, stopIds.size()));
        String current = stopIds.get(0);
        List<RouteResponseDto.RouteWaypointDto> fullPath = new ArrayList<>();
        double grandDistance = 0.0;
        double grandTime = 0.0;

        Vertex startV = vertexIndex.get(current);
        if (startV != null) {
            fullPath.add(new RouteResponseDto.RouteWaypointDto(startV.getId(), startV.getLabel(), startV.getLatitude(), startV.getLongitude(), startV.getType()));
        }

        while (!unvisited.isEmpty()) {
            // Find nearest neighbor using Dijkstra
            String bestNext = null;
            DijkstraResult bestResult = null;
            double minCost = Double.POSITIVE_INFINITY;

            for (String candidate : unvisited) {
                DijkstraResult dRes = transportGraph.dijkstra(current, candidate, metric);
                if (dRes.isReachable()) {
                    double cost = "time".equalsIgnoreCase(metric) ? dRes.getTotalTimeMinutes() : dRes.getTotalDistanceKm();
                    if (cost < minCost) {
                        minCost = cost;
                        bestNext = candidate;
                        bestResult = dRes;
                    }
                }
            }

            if (bestNext == null || bestResult == null) {
                break; // Disconnected remaining stops
            }

            // Append intermediate nodes
            if (bestResult.getPath() != null && bestResult.getPath().size() > 1) {
                for (int i = 1; i < bestResult.getPath().size(); i++) {
                    Vertex v = bestResult.getPath().get(i);
                    fullPath.add(new RouteResponseDto.RouteWaypointDto(v.getId(), v.getLabel(), v.getLatitude(), v.getLongitude(), v.getType()));
                }
            }
            grandDistance += bestResult.getTotalDistanceKm();
            grandTime += bestResult.getTotalTimeMinutes();

            unvisited.remove(bestNext);
            current = bestNext;
        }

        RouteResponseDto dto = new RouteResponseDto();
        dto.setOriginId(stopIds.get(0));
        dto.setDestinationId(current);
        dto.setTotalDistanceKm(Math.round(grandDistance * 100.0) / 100.0);
        dto.setTotalTimeMinutes(Math.round(grandTime * 10.0) / 10.0);
        dto.setPath(fullPath);
        dto.setReachable(!fullPath.isEmpty());
        dto.setAlgorithmUsed("Nearest-Neighbor TSP + Dijkstra Shortest Path");
        return dto;
    }

    public Graph getGraph() {
        return transportGraph;
    }

    public List<Vertex> getAllWaypoints() {
        return transportGraph.getVertices();
    }
}
