package com.mealmesh.dto;

import com.mealmesh.entity.NgoProfile;
import java.util.UUID;

public class NgoProfileResponseDto {
    private UUID id;
    private String organizationName;
    private String registrationNumber;
    private int beneficiaryCount;
    private double dailyFoodRequirementKg;
    private double currentStorageCapacityKg;
    private double maxStorageCapacityKg;
    private String operatingHours;
    private String dietaryPreferences;
    private boolean verified;
    private double availableCapacityKg;
    private String contactPerson;
    private String email;
    private String phone;

    public NgoProfileResponseDto() {}

    public static NgoProfileResponseDto fromEntity(NgoProfile n) {
        if (n == null) return null;
        NgoProfileResponseDto dto = new NgoProfileResponseDto();
        dto.setId(n.getId());
        dto.setOrganizationName(n.getOrganizationName());
        dto.setRegistrationNumber(n.getRegistrationNumber());
        dto.setBeneficiaryCount(n.getBeneficiaryCount());
        dto.setDailyFoodRequirementKg(n.getDailyFoodRequirementKg());
        dto.setCurrentStorageCapacityKg(n.getCurrentStorageCapacityKg());
        dto.setMaxStorageCapacityKg(n.getMaxStorageCapacityKg());
        dto.setOperatingHours(n.getOperatingHours());
        dto.setDietaryPreferences(n.getDietaryPreferences());
        dto.setVerified(n.isVerified());
        dto.setAvailableCapacityKg(n.getAvailableCapacityKg());

        if (n.getUser() != null) {
            dto.setContactPerson(n.getUser().getFullName());
            dto.setEmail(n.getUser().getEmail());
            dto.setPhone(n.getUser().getPhone());
        }
        return dto;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
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
    public boolean isVerified() { return verified; }
    public void setVerified(boolean verified) { this.verified = verified; }
    public double getAvailableCapacityKg() { return availableCapacityKg; }
    public void setAvailableCapacityKg(double availableCapacityKg) { this.availableCapacityKg = availableCapacityKg; }
    public String getContactPerson() { return contactPerson; }
    public void setContactPerson(String contactPerson) { this.contactPerson = contactPerson; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
}
