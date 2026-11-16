package com.mealmesh.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "donations")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Donation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "donor_id", nullable = false)
    private DonorProfile donor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private FoodCategory category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id", nullable = false)
    private Location location;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "food_type", nullable = false)
    private String foodType = "COOKED"; // "COOKED", "RAW", "PACKAGED"

    @Column(name = "dietary_type", nullable = false)
    private String dietaryType = "VEG"; // "VEG", "NON_VEG", "VEGAN"

    @Column(name = "quantity_kg", nullable = false)
    private double quantityKg;

    private int servings = 20;

    @Column(name = "cooked_time")
    private LocalDateTime cookedTime;

    @Column(name = "expiry_time", nullable = false)
    private LocalDateTime expiryTime;

    @Column(nullable = false)
    private String urgency = "MEDIUM"; // "CRITICAL", "HIGH", "MEDIUM", "LOW"

    @Column(nullable = false)
    private String status = "AVAILABLE"; // "AVAILABLE", "RESERVED", "IN_TRANSIT", "DELIVERED", "EXPIRED", "CANCELLED"

    @Column(name = "storage_temperature_celsius")
    private Double storageTemperatureCelsius;

    @Column(name = "allergen_info")
    private String allergenInfo;

    @Column(name = "pickup_instructions", columnDefinition = "TEXT")
    private String pickupInstructions;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public Donation() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public DonorProfile getDonor() { return donor; }
    public void setDonor(DonorProfile donor) { this.donor = donor; }

    public FoodCategory getCategory() { return category; }
    public void setCategory(FoodCategory category) { this.category = category; }

    public Location getLocation() { return location; }
    public void setLocation(Location location) { this.location = location; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

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

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
