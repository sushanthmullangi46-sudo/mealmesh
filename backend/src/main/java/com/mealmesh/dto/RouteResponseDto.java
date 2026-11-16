package com.mealmesh.dto;

import java.util.List;

public class RouteResponseDto {
    private String originId;
    private String originLabel;
    private String destinationId;
    private String destinationLabel;
    private double totalDistanceKm;
    private double totalTimeMinutes;
    private List<RouteWaypointDto> path;
    private boolean reachable;
    private String algorithmUsed = "Dijkstra's Algorithm (Custom Priority Queue)";

    public RouteResponseDto() {}

    public String getOriginId() { return originId; }
    public void setOriginId(String originId) { this.originId = originId; }

    public String getOriginLabel() { return originLabel; }
    public void setOriginLabel(String originLabel) { this.originLabel = originLabel; }

    public String getDestinationId() { return destinationId; }
    public void setDestinationId(String destinationId) { this.destinationId = destinationId; }

    public String getDestinationLabel() { return destinationLabel; }
    public void setDestinationLabel(String destinationLabel) { this.destinationLabel = destinationLabel; }

    public double getTotalDistanceKm() { return totalDistanceKm; }
    public void setTotalDistanceKm(double totalDistanceKm) { this.totalDistanceKm = totalDistanceKm; }

    public double getTotalTimeMinutes() { return totalTimeMinutes; }
    public void setTotalTimeMinutes(double totalTimeMinutes) { this.totalTimeMinutes = totalTimeMinutes; }

    public List<RouteWaypointDto> getPath() { return path; }
    public void setPath(List<RouteWaypointDto> path) { this.path = path; }

    public boolean isReachable() { return reachable; }
    public void setReachable(boolean reachable) { this.reachable = reachable; }

    public String getAlgorithmUsed() { return algorithmUsed; }
    public void setAlgorithmUsed(String algorithmUsed) { this.algorithmUsed = algorithmUsed; }

    public static class RouteWaypointDto {
        private String id;
        private String label;
        private double latitude;
        private double longitude;
        private String type;

        public RouteWaypointDto() {}

        public RouteWaypointDto(String id, String label, double latitude, double longitude, String type) {
            this.id = id;
            this.label = label;
            this.latitude = latitude;
            this.longitude = longitude;
            this.type = type;
        }

        public String getId() { return id; }
        public String getLabel() { return label; }
        public double getLatitude() { return latitude; }
        public double getLongitude() { return longitude; }
        public String getType() { return type; }
    }
}
