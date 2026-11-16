package com.mealmesh.dsa.graph;

public class Edge {
    private final Vertex source;
    private final Vertex destination;
    private final double distanceKm;
    private final double transitTimeMinutes;
    private final String roadCondition; // "CLEAR", "MODERATE", "CONGESTED", "BLOCKED"
    private final double trafficMultiplier;

    public Edge(Vertex source, Vertex destination, double distanceKm, double transitTimeMinutes, String roadCondition) {
        this.source = source;
        this.destination = destination;
        this.distanceKm = distanceKm;
        this.transitTimeMinutes = transitTimeMinutes;
        this.roadCondition = roadCondition != null ? roadCondition : "CLEAR";
        this.trafficMultiplier = calculateMultiplier(this.roadCondition);
    }

    public Edge(Vertex source, Vertex destination, double distanceKm, double transitTimeMinutes) {
        this(source, destination, distanceKm, transitTimeMinutes, "CLEAR");
    }

    private double calculateMultiplier(String condition) {
        return switch (condition.toUpperCase()) {
            case "CONGESTED" -> 1.8;
            case "MODERATE" -> 1.3;
            case "BLOCKED" -> 999.0;
            default -> 1.0;
        };
    }

    public Vertex getSource() {
        return source;
    }

    public Vertex getDestination() {
        return destination;
    }

    public double getDistanceKm() {
        return distanceKm;
    }

    public double getTransitTimeMinutes() {
        return transitTimeMinutes;
    }

    public String getRoadCondition() {
        return roadCondition;
    }

    public double getTrafficMultiplier() {
        return trafficMultiplier;
    }

    public double getEffectiveWeight(String metric) {
        if ("time".equalsIgnoreCase(metric)) {
            return transitTimeMinutes * trafficMultiplier;
        }
        return distanceKm;
    }

    @Override
    public String toString() {
        return source.getLabel() + " -> " + destination.getLabel() + " (" + distanceKm + " km, " + transitTimeMinutes + " min)";
    }
}
