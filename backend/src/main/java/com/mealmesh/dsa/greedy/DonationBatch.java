package com.mealmesh.dsa.greedy;

public class DonationBatch {
    private String id;
    private String foodName;
    private double quantityKg;
    private double latitude;
    private double longitude;
    private long hoursRemainingUntilExpiry;
    private String dietaryType; // "VEG", "NON_VEG", "VEGAN"
    private String urgency;     // "CRITICAL", "HIGH", "MEDIUM", "LOW"

    public DonationBatch(String id, String foodName, double quantityKg, double latitude, double longitude,
                         long hoursRemainingUntilExpiry, String dietaryType, String urgency) {
        this.id = id;
        this.foodName = foodName;
        this.quantityKg = quantityKg;
        this.latitude = latitude;
        this.longitude = longitude;
        this.hoursRemainingUntilExpiry = hoursRemainingUntilExpiry;
        this.dietaryType = dietaryType;
        this.urgency = urgency;
    }

    public String getId() {
        return id;
    }

    public String getFoodName() {
        return foodName;
    }

    public double getQuantityKg() {
        return quantityKg;
    }

    public void setQuantityKg(double quantityKg) {
        this.quantityKg = quantityKg;
    }

    public double getLatitude() {
        return latitude;
    }

    public double getLongitude() {
        return longitude;
    }

    public long getHoursRemainingUntilExpiry() {
        return hoursRemainingUntilExpiry;
    }

    public String getDietaryType() {
        return dietaryType;
    }

    public String getUrgency() {
        return urgency;
    }
}
