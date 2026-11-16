package com.mealmesh.dto;

import java.time.LocalDateTime;

public class DonationRequestDto {
    private String title;
    private String description;
    private String categoryName; // "Cooked Meals", "Raw Groceries", "Bakery Items", etc.
    private String foodType;     // "COOKED", "RAW", "PACKAGED"
    private String dietaryType;  // "VEG", "NON_VEG", "VEGAN"
    private double quantityKg;
    private int servings;
    private int hoursUntilExpiry = 4;
    private String urgency;      // "CRITICAL", "HIGH", "MEDIUM", "LOW"
    private Double storageTemperatureCelsius;
    private String allergenInfo;
    private String pickupInstructions;
    private Double latitude;
    private Double longitude;
    private String addressLine;

    public DonationRequestDto() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public String getFoodType() { return foodType; }
    public void setFoodType(String foodType) { this.foodType = foodType; }

    public String getDietaryType() { return dietaryType; }
    public void setDietaryType(String dietaryType) { this.dietaryType = dietaryType; }

    public double getQuantityKg() { return quantityKg; }
    public void setQuantityKg(double quantityKg) { this.quantityKg = quantityKg; }

    public int getServings() { return servings; }
    public void setServings(int servings) { this.servings = servings; }

    public int getHoursUntilExpiry() { return hoursUntilExpiry; }
    public void setHoursUntilExpiry(int hoursUntilExpiry) { this.hoursUntilExpiry = hoursUntilExpiry; }

    public String getUrgency() { return urgency; }
    public void setUrgency(String urgency) { this.urgency = urgency; }

    public Double getStorageTemperatureCelsius() { return storageTemperatureCelsius; }
    public void setStorageTemperatureCelsius(Double storageTemperatureCelsius) { this.storageTemperatureCelsius = storageTemperatureCelsius; }

    public String getAllergenInfo() { return allergenInfo; }
    public void setAllergenInfo(String allergenInfo) { this.allergenInfo = allergenInfo; }

    public String getPickupInstructions() { return pickupInstructions; }
    public void setPickupInstructions(String pickupInstructions) { this.pickupInstructions = pickupInstructions; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getAddressLine() { return addressLine; }
    public void setAddressLine(String addressLine) { this.addressLine = addressLine; }
}
