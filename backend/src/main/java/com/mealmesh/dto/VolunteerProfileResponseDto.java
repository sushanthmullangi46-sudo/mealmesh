package com.mealmesh.dto;

import com.mealmesh.entity.VolunteerProfile;
import java.util.UUID;

public class VolunteerProfileResponseDto {
    private UUID id;
    private String fullName;
    private String email;
    private String phone;
    private String vehicleType;
    private String vehicleNumber;
    private double maxCarryingCapacityKg;
    private boolean available;
    private Double currentLatitude;
    private Double currentLongitude;
    private int deliveriesCompleted;

    public VolunteerProfileResponseDto() {}

    public static VolunteerProfileResponseDto fromEntity(VolunteerProfile v) {
        if (v == null) return null;
        VolunteerProfileResponseDto dto = new VolunteerProfileResponseDto();
        dto.setId(v.getId());
        if (v.getUser() != null) {
            dto.setFullName(v.getUser().getFullName());
            dto.setEmail(v.getUser().getEmail());
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
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
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
