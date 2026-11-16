package com.mealmesh.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "volunteer_profiles")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class VolunteerProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "vehicle_type", nullable = false)
    private String vehicleType; // "TWO_WHEELER", "THREE_WHEELER", "FOUR_WHEELER", "REFRIGERATED_VAN"

    @Column(name = "vehicle_number", nullable = false)
    private String vehicleNumber;

    @Column(name = "max_carrying_capacity_kg")
    private double maxCarryingCapacityKg = 30.0;

    @Column(name = "is_available")
    private boolean isAvailable = true;

    @Column(name = "current_latitude")
    private Double currentLatitude = 12.9716;

    @Column(name = "current_longitude")
    private Double currentLongitude = 77.5946;

    @Column(name = "deliveries_completed")
    private int deliveriesCompleted = 0;

    public VolunteerProfile() {}

    public VolunteerProfile(UUID id, User user, String vehicleType, String vehicleNumber,
                            double maxCarryingCapacityKg, boolean isAvailable,
                            Double currentLatitude, Double currentLongitude, int deliveriesCompleted) {
        this.id = id;
        this.user = user;
        this.vehicleType = vehicleType;
        this.vehicleNumber = vehicleNumber;
        this.maxCarryingCapacityKg = maxCarryingCapacityKg;
        this.isAvailable = isAvailable;
        this.currentLatitude = currentLatitude;
        this.currentLongitude = currentLongitude;
        this.deliveriesCompleted = deliveriesCompleted;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getVehicleType() { return vehicleType; }
    public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }

    public String getVehicleNumber() { return vehicleNumber; }
    public void setVehicleNumber(String vehicleNumber) { this.vehicleNumber = vehicleNumber; }

    public double getMaxCarryingCapacityKg() { return maxCarryingCapacityKg; }
    public void setMaxCarryingCapacityKg(double maxCarryingCapacityKg) { this.maxCarryingCapacityKg = maxCarryingCapacityKg; }

    public boolean isAvailable() { return isAvailable; }
    public void setAvailable(boolean available) { isAvailable = available; }

    public Double getCurrentLatitude() { return currentLatitude; }
    public void setCurrentLatitude(Double currentLatitude) { this.currentLatitude = currentLatitude; }

    public Double getCurrentLongitude() { return currentLongitude; }
    public void setCurrentLongitude(Double currentLongitude) { this.currentLongitude = currentLongitude; }

    public int getDeliveriesCompleted() { return deliveriesCompleted; }
    public void setDeliveriesCompleted(int deliveriesCompleted) { this.deliveriesCompleted = deliveriesCompleted; }
}
