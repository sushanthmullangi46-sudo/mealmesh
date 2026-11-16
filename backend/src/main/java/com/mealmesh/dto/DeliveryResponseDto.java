package com.mealmesh.dto;

import com.mealmesh.entity.Delivery;
import com.mealmesh.entity.Allocation;
import com.mealmesh.entity.Donation;
import com.mealmesh.entity.NgoProfile;
import com.mealmesh.entity.VolunteerProfile;

import java.time.LocalDateTime;
import java.util.UUID;

public class DeliveryResponseDto {
    private UUID id;
    private String status;
    private double pickupLatitude;
    private double pickupLongitude;
    private double dropoffLatitude;
    private double dropoffLongitude;
    private double estimatedDistanceKm;
    private double estimatedTimeMinutes;
    private LocalDateTime startTime;
    private LocalDateTime pickupTime;
    private LocalDateTime completionTime;
    private String notes;
    private AllocationSummaryDto allocation;
    private VolunteerSummaryDto volunteer;

    public DeliveryResponseDto() {}

    public static DeliveryResponseDto fromEntity(Delivery del) {
        if (del == null) return null;
        DeliveryResponseDto dto = new DeliveryResponseDto();
        dto.setId(del.getId());
        dto.setStatus(del.getStatus());
        dto.setPickupLatitude(del.getPickupLatitude());
        dto.setPickupLongitude(del.getPickupLongitude());
        dto.setDropoffLatitude(del.getDropoffLatitude());
        dto.setDropoffLongitude(del.getDropoffLongitude());
        dto.setEstimatedDistanceKm(del.getEstimatedDistanceKm());
        dto.setEstimatedTimeMinutes(del.getEstimatedTimeMinutes());
        dto.setStartTime(del.getStartTime());
        dto.setPickupTime(del.getPickupTime());
        dto.setCompletionTime(del.getCompletionTime());
        dto.setNotes(del.getNotes());

        if (del.getAllocation() != null) {
            dto.setAllocation(AllocationSummaryDto.fromEntity(del.getAllocation()));
        }

        if (del.getVolunteer() != null) {
            dto.setVolunteer(VolunteerSummaryDto.fromEntity(del.getVolunteer()));
        }

        return dto;
    }

    public static class AllocationSummaryDto {
        private UUID id;
        private double allocatedQuantityKg;
        private double matchScore;
        private String status;
        private LocalDateTime matchedAt;
        private DonationSummaryDto donation;
        private NgoSummaryDto ngo;

        public static AllocationSummaryDto fromEntity(Allocation a) {
            if (a == null) return null;
            AllocationSummaryDto dto = new AllocationSummaryDto();
            dto.setId(a.getId());
            dto.setAllocatedQuantityKg(a.getAllocatedQuantityKg());
            dto.setMatchScore(a.getMatchScore());
            dto.setStatus(a.getStatus());
            dto.setMatchedAt(a.getMatchedAt());

            if (a.getDonation() != null) {
                dto.setDonation(DonationSummaryDto.fromEntity(a.getDonation()));
            }
            if (a.getNgo() != null) {
                dto.setNgo(NgoSummaryDto.fromEntity(a.getNgo()));
            }
            return dto;
        }

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }
        public double getAllocatedQuantityKg() { return allocatedQuantityKg; }
        public void setAllocatedQuantityKg(double allocatedQuantityKg) { this.allocatedQuantityKg = allocatedQuantityKg; }
        public double getMatchScore() { return matchScore; }
        public void setMatchScore(double matchScore) { this.matchScore = matchScore; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public LocalDateTime getMatchedAt() { return matchedAt; }
        public void setMatchedAt(LocalDateTime matchedAt) { this.matchedAt = matchedAt; }
        public DonationSummaryDto getDonation() { return donation; }
        public void setDonation(DonationSummaryDto donation) { this.donation = donation; }
        public NgoSummaryDto getNgo() { return ngo; }
        public void setNgo(NgoSummaryDto ngo) { this.ngo = ngo; }
    }

    public static class DonationSummaryDto {
        private UUID id;
        private String title;
        private String description;
        private String categoryName;
        private String foodType;
        private String dietaryType;
        private double quantityKg;
        private int servings;
        private LocalDateTime expiryTime;
        private String urgency;
        private String status;
        private String donorName;
        private String donorOrganization;
        private String donorPhone;
        private String pickupInstructions;

        public static DonationSummaryDto fromEntity(Donation d) {
            if (d == null) return null;
            DonationSummaryDto dto = new DonationSummaryDto();
            dto.setId(d.getId());
            dto.setTitle(d.getTitle());
            dto.setDescription(d.getDescription());
            if (d.getCategory() != null) dto.setCategoryName(d.getCategory().getName());
            dto.setFoodType(d.getFoodType());
            dto.setDietaryType(d.getDietaryType());
            dto.setQuantityKg(d.getQuantityKg());
            dto.setServings(d.getServings());
            dto.setExpiryTime(d.getExpiryTime());
            dto.setUrgency(d.getUrgency());
            dto.setStatus(d.getStatus());
            dto.setPickupInstructions(d.getPickupInstructions());

            if (d.getDonor() != null) {
                dto.setDonorOrganization(d.getDonor().getOrganizationName());
                if (d.getDonor().getUser() != null) {
                    dto.setDonorName(d.getDonor().getUser().getFullName());
                    dto.setDonorPhone(d.getDonor().getUser().getPhone());
                }
            }
            return dto;
        }

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
        public LocalDateTime getExpiryTime() { return expiryTime; }
        public void setExpiryTime(LocalDateTime expiryTime) { this.expiryTime = expiryTime; }
        public String getUrgency() { return urgency; }
        public void setUrgency(String urgency) { this.urgency = urgency; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getDonorName() { return donorName; }
        public void setDonorName(String donorName) { this.donorName = donorName; }
        public String getDonorOrganization() { return donorOrganization; }
        public void setDonorOrganization(String donorOrganization) { this.donorOrganization = donorOrganization; }
        public String getDonorPhone() { return donorPhone; }
        public void setDonorPhone(String donorPhone) { this.donorPhone = donorPhone; }
        public String getPickupInstructions() { return pickupInstructions; }
        public void setPickupInstructions(String pickupInstructions) { this.pickupInstructions = pickupInstructions; }
    }

    public static class NgoSummaryDto {
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

        public static NgoSummaryDto fromEntity(NgoProfile n) {
            if (n == null) return null;
            NgoSummaryDto dto = new NgoSummaryDto();
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
    }

    public static class VolunteerSummaryDto {
        private UUID id;
        private String fullName;
        private String phone;
        private String vehicleType;
        private String vehicleNumber;
        private double maxCarryingCapacityKg;
        private boolean available;
        private Double currentLatitude;
        private Double currentLongitude;
        private int deliveriesCompleted;

        public static VolunteerSummaryDto fromEntity(VolunteerProfile v) {
            if (v == null) return null;
            VolunteerSummaryDto dto = new VolunteerSummaryDto();
            dto.setId(v.getId());
            if (v.getUser() != null) {
                dto.setFullName(v.getUser().getFullName());
                dto.setPhone(v.getUser().getPhone());
            }
            dto.setVehicleType(v.getVehicleType());
            dto.setVehicleNumber(v.getVehicleNumber());
            dto.setMaxCarryingCapacityKg(v.getMaxCarryingCapacityKg());
            dto.setAvailable(v.isAvailable());
            dto.setCurrentLatitude(v.getCurrentLatitude());
            dto.setCurrentLongitude(v.getCurrentLongitude());
            dto.setDeliveriesCompleted(v.getDeliveriesCompleted());
            return dto;
        }

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getVehicleType() { return vehicleType; }
        public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }
        public String getVehicleNumber() { return vehicleNumber; }
        public void setVehicleNumber(String vehicleNumber) { this.vehicleNumber = vehicleNumber; }
        public double getMaxCarryingCapacityKg() { return maxCarryingCapacityKg; }
        public void setMaxCarryingCapacityKg(double maxCarryingCapacityKg) { this.maxCarryingCapacityKg = maxCarryingCapacityKg; }
        public boolean isAvailable() { return available; }
        public void setAvailable(boolean available) { this.available = available; }
        public Double getCurrentLatitude() { return currentLatitude; }
        public void setCurrentLatitude(Double currentLatitude) { this.currentLatitude = currentLatitude; }
        public Double getCurrentLongitude() { return currentLongitude; }
        public void setCurrentLongitude(Double currentLongitude) { this.currentLongitude = currentLongitude; }
        public int getDeliveriesCompleted() { return deliveriesCompleted; }
        public void setDeliveriesCompleted(int deliveriesCompleted) { this.deliveriesCompleted = deliveriesCompleted; }
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public double getPickupLatitude() { return pickupLatitude; }
    public void setPickupLatitude(double pickupLatitude) { this.pickupLatitude = pickupLatitude; }
    public double getPickupLongitude() { return pickupLongitude; }
    public void setPickupLongitude(double pickupLongitude) { this.pickupLongitude = pickupLongitude; }
    public double getDropoffLatitude() { return dropoffLatitude; }
    public void setDropoffLatitude(double dropoffLatitude) { this.dropoffLatitude = dropoffLatitude; }
    public double getDropoffLongitude() { return dropoffLongitude; }
    public void setDropoffLongitude(double dropoffLongitude) { this.dropoffLongitude = dropoffLongitude; }
    public double getEstimatedDistanceKm() { return estimatedDistanceKm; }
    public void setEstimatedDistanceKm(double estimatedDistanceKm) { this.estimatedDistanceKm = estimatedDistanceKm; }
    public double getEstimatedTimeMinutes() { return estimatedTimeMinutes; }
    public void setEstimatedTimeMinutes(double estimatedTimeMinutes) { this.estimatedTimeMinutes = estimatedTimeMinutes; }
    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }
    public LocalDateTime getPickupTime() { return pickupTime; }
    public void setPickupTime(LocalDateTime pickupTime) { this.pickupTime = pickupTime; }
    public LocalDateTime getCompletionTime() { return completionTime; }
    public void setCompletionTime(LocalDateTime completionTime) { this.completionTime = completionTime; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public AllocationSummaryDto getAllocation() { return allocation; }
    public void setAllocation(AllocationSummaryDto allocation) { this.allocation = allocation; }
    public VolunteerSummaryDto getVolunteer() { return volunteer; }
    public void setVolunteer(VolunteerSummaryDto volunteer) { this.volunteer = volunteer; }
}
