package com.mealmesh.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "ngo_profiles")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class NgoProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "organization_name", nullable = false)
    private String organizationName;

    @Column(name = "registration_number", nullable = false)
    private String registrationNumber;

    @Column(name = "beneficiary_count")
    private int beneficiaryCount = 100;

    @Column(name = "daily_food_requirement_kg")
    private double dailyFoodRequirementKg = 50.0;

    @Column(name = "current_storage_capacity_kg")
    private double currentStorageCapacityKg = 0.0;

    @Column(name = "max_storage_capacity_kg")
    private double maxStorageCapacityKg = 200.0;

    @Column(name = "operating_hours")
    private String operatingHours = "08:00 - 20:00";

    @Column(name = "dietary_preferences")
    private String dietaryPreferences = "ALL";

    @Column(name = "is_verified")
    private boolean isVerified = true;

    @Column(name = "vulnerability_index")
    private Integer vulnerabilityIndex = 7;

    @Column(name = "target_beneficiary_group")
    private String targetBeneficiaryGroup = "Underprivileged Children & Families";

    @Column(name = "daily_deficit_kg")
    private Double dailyDeficitKg = 45.0;

    @Column(name = "days_since_last_served")
    private Integer daysSinceLastServed = 2;

    @Column(name = "historical_received_kg")
    private Double historicalReceivedKg = 150.0;

    public NgoProfile() {}

    public NgoProfile(UUID id, User user, String organizationName, String registrationNumber,
                      int beneficiaryCount, double dailyFoodRequirementKg,
                      double currentStorageCapacityKg, double maxStorageCapacityKg,
                      String operatingHours, String dietaryPreferences, boolean isVerified) {
        this.id = id;
        this.user = user;
        this.organizationName = organizationName;
        this.registrationNumber = registrationNumber;
        this.beneficiaryCount = beneficiaryCount;
        this.dailyFoodRequirementKg = dailyFoodRequirementKg;
        this.currentStorageCapacityKg = currentStorageCapacityKg;
        this.maxStorageCapacityKg = maxStorageCapacityKg;
        this.operatingHours = operatingHours;
        this.dietaryPreferences = dietaryPreferences;
        this.isVerified = isVerified;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getOrganizationName() { return organizationName; }
    public void setOrganizationName(String organizationName) { this.organizationName = organizationName; }

    public String getRegistrationNumber() { return registrationNumber; }
    public void setRegistrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; }

    public int getBeneficiaryCount() { return beneficiaryCount; }
    public void setBeneficiaryCount(int beneficiaryCount) { this.beneficiaryCount = beneficiaryCount; }

    public double getDailyFoodRequirementKg() { return dailyFoodRequirementKg; }
    public void setDailyFoodRequirementKg(double dailyFoodRequirementKg) { this.dailyFoodRequirementKg = dailyFoodRequirementKg; }

    public double getCurrentStorageCapacityKg() { return currentStorageCapacityKg; }
    public void setCurrentStorageCapacityKg(double currentStorageCapacityKg) { this.currentStorageCapacityKg = currentStorageCapacityKg; }

    public double getMaxStorageCapacityKg() { return maxStorageCapacityKg; }
    public void setMaxStorageCapacityKg(double maxStorageCapacityKg) { this.maxStorageCapacityKg = maxStorageCapacityKg; }

    public String getOperatingHours() { return operatingHours; }
    public void setOperatingHours(String operatingHours) { this.operatingHours = operatingHours; }

    public String getDietaryPreferences() { return dietaryPreferences; }
    public void setDietaryPreferences(String dietaryPreferences) { this.dietaryPreferences = dietaryPreferences; }

    public boolean isVerified() { return isVerified; }
    public void setVerified(boolean verified) { isVerified = verified; }

    public double getAvailableCapacityKg() {
        return Math.max(0.0, maxStorageCapacityKg - currentStorageCapacityKg);
    }

    public int getVulnerabilityIndex() { return vulnerabilityIndex != null ? vulnerabilityIndex : 7; }
    public void setVulnerabilityIndex(Integer vulnerabilityIndex) { this.vulnerabilityIndex = vulnerabilityIndex; }

    public String getTargetBeneficiaryGroup() { return targetBeneficiaryGroup != null ? targetBeneficiaryGroup : "Underprivileged Children & Families"; }
    public void setTargetBeneficiaryGroup(String targetBeneficiaryGroup) { this.targetBeneficiaryGroup = targetBeneficiaryGroup; }

    public double getDailyDeficitKg() { return dailyDeficitKg != null ? dailyDeficitKg : 45.0; }
    public void setDailyDeficitKg(Double dailyDeficitKg) { this.dailyDeficitKg = dailyDeficitKg; }

    public int getDaysSinceLastServed() { return daysSinceLastServed != null ? daysSinceLastServed : 2; }
    public void setDaysSinceLastServed(Integer daysSinceLastServed) { this.daysSinceLastServed = daysSinceLastServed; }

    public double getHistoricalReceivedKg() { return historicalReceivedKg != null ? historicalReceivedKg : 150.0; }
    public void setHistoricalReceivedKg(Double historicalReceivedKg) { this.historicalReceivedKg = historicalReceivedKg; }
}
