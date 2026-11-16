package com.mealmesh.dsa.graph;

import java.util.Objects;

/**
 * Represents a geographical node in the MealMesh transport network
 * (donor kitchen, NGO distribution center, volunteer waypoint).
 */
public class Vertex {
    private final String id;
    private final String label;
    private final double latitude;
    private final double longitude;
    private final String type; // "DONOR", "NGO", "WAREHOUSE", "JUNCTION"

    public Vertex(String id, String label, double latitude, double longitude, String type) {
        this.id = id;
        this.label = label;
        this.latitude = latitude;
        this.longitude = longitude;
        this.type = type;
    }

    public String getId() {
        return id;
    }

    public String getLabel() {
        return label;
    }

    public double getLatitude() {
        return latitude;
    }

    public double getLongitude() {
        return longitude;
    }

    public String getType() {
        return type;
    }

    /**
     * Great-Circle Haversine distance in kilometers.
     */
    public double distanceTo(Vertex other) {
        final double R = 6371.0088; // Earth's mean radius in km
        double dLat = Math.toRadians(other.latitude - this.latitude);
        double dLon = Math.toRadians(other.longitude - this.longitude);
        double lat1 = Math.toRadians(this.latitude);
        double lat2 = Math.toRadians(other.latitude);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Vertex vertex = (Vertex) o;
        return Objects.equals(id, vertex.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return label + " (" + id + ")";
    }
}
