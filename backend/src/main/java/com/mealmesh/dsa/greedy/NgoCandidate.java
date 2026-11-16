package com.mealmesh.dsa.greedy;

import java.util.List;

public class NgoCandidate {
    private String id;
    private String name;
    private double latitude;
    private double longitude;
    private double currentCapacityKg;
    private double maxCapacityKg;
    private double distanceKm;
    private List<String> dietaryPreferences;
    private double compositeScore;

    public NgoCandidate(String id, String name, double latitude, double longitude,
                        double currentCapacityKg, double maxCapacityKg, List<String> dietaryPreferences) {
        this.id = id;
        this.name = name;
        this.latitude = latitude;
        this.longitude = longitude;
        this.currentCapacityKg = currentCapacityKg;
        this.maxCapacityKg = maxCapacityKg;
        this.dietaryPreferences = dietaryPreferences;
    }

    public double getAvailableCapacityKg() {
        return Math.max(0.0, maxCapacityKg - currentCapacityKg);
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public double getLatitude() {
        return latitude;
    }

    public double getLongitude() {
        return longitude;
    }

    public double getCurrentCapacityKg() {
        return currentCapacityKg;
    }

    public void setCurrentCapacityKg(double currentCapacityKg) {
        this.currentCapacityKg = currentCapacityKg;
    }

    public double getMaxCapacityKg() {
        return maxCapacityKg;
    }

    public double getDistanceKm() {
        return distanceKm;
    }

    public void setDistanceKm(double distanceKm) {
        this.distanceKm = distanceKm;
    }

    public List<String> getDietaryPreferences() {
        return dietaryPreferences;
    }

    public double getCompositeScore() {
        return compositeScore;
    }

    public void setCompositeScore(double compositeScore) {
        this.compositeScore = compositeScore;
    }
}
