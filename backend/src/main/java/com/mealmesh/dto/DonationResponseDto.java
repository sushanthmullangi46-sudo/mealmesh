package com.mealmesh.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class DonationResponseDto {
    private UUID id;
    private String title;
    private String description;
    private String categoryName;
    private String foodType;
    private String dietaryType;
    private double quantityKg;
    private int servings;
    private LocalDateTime cookedTime;
    private LocalDateTime expiryTime;
    private long minutesRemaining;
    private String urgency;
    private String status;
    private Double storageTemperatureCelsius;
    private String allergenInfo;
    private String pickupInstructions;
    private String donorName;
    private String donorOrganization;
    private String donorPhone;
    private String locationName;
    private String addressLine;
    private double latitude;
    private double longitude;
    private LocalDateTime createdAt;

    public DonationResponseDto() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

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

    public LocalDateTime getCookedTime() { return cookedTime; }
    public void setCookedTime(LocalDateTime cookedTime) { this.cookedTime = cookedTime; }

    public LocalDateTime getExpiryTime() { return expiryTime; }
    public void setExpiryTime(LocalDateTime expiryTime) { this.expiryTime = expiryTime; }

    public long getMinutesRemaining() { return minutesRemaining; }
    public void setMinutesRemaining(long minutesRemaining) { this.minutesRemaining = minutesRemaining; }

    public String getUrgency() { return urgency; }
    public void setUrgency(String urgency) { this.urgency = urgency; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Double getStorageTemperatureCelsius() { return storageTemperatureCelsius; }
    public void setStorageTemperatureCelsius(Double storageTemperatureCelsius) { this.storageTemperatureCelsius = storageTemperatureCelsius; }

    public String getAllergenInfo() { return allergenInfo; }
    public void setAllergenInfo(String allergenInfo) { this.allergenInfo = allergenInfo; }

    public String getPickupInstructions() { return pickupInstructions; }
    public void setPickupInstructions(String pickupInstructions) { this.pickupInstructions = pickupInstructions; }

    public String getDonorName() { return donorName; }
    public void setDonorName(String donorName) { this.donorName = donorName; }

    public String getDonorOrganization() { return donorOrganization; }
    public void setDonorOrganization(String donorOrganization) { this.donorOrganization = donorOrganization; }

    public String getDonorPhone() { return donorPhone; }
    public void setDonorPhone(String donorPhone) { this.donorPhone = donorPhone; }

    public String getLocationName() { return locationName; }
    public void setLocationName(String locationName) { this.locationName = locationName; }

    public String getAddressLine() { return addressLine; }
    public void setAddressLine(String addressLine) { this.addressLine = addressLine; }

    public double getLatitude() { return latitude; }
    public void setLatitude(double latitude) { this.latitude = latitude; }

    public double getLongitude() { return longitude; }
    public void setLongitude(double longitude) { this.longitude = longitude; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
