package com.mealmesh.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "deliveries")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Delivery {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "allocation_id", nullable = false)
    private Allocation allocation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "volunteer_id")
    private VolunteerProfile volunteer;

    @Column(nullable = false)
    private String status = "ASSIGNED"; // "ASSIGNED", "ACCEPTED", "EN_ROUTE_PICKUP", "PICKED_UP", "EN_ROUTE_DROPOFF", "DELIVERED", "FAILED"

    @Column(name = "pickup_latitude")
    private double pickupLatitude;

    @Column(name = "pickup_longitude")
    private double pickupLongitude;

    @Column(name = "dropoff_latitude")
    private double dropoffLatitude;

    @Column(name = "dropoff_longitude")
    private double dropoffLongitude;

    @Column(name = "estimated_distance_km")
    private double estimatedDistanceKm;

    @Column(name = "estimated_time_minutes")
    private double estimatedTimeMinutes;

    @Column(name = "start_time")
    private LocalDateTime startTime;

    @Column(name = "pickup_time")
    private LocalDateTime pickupTime;

    @Column(name = "completion_time")
    private LocalDateTime completionTime;

    @Column(columnDefinition = "TEXT")
    private String notes;

    public Delivery() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Allocation getAllocation() { return allocation; }
    public void setAllocation(Allocation allocation) { this.allocation = allocation; }

    public VolunteerProfile getVolunteer() { return volunteer; }
    public void setVolunteer(VolunteerProfile volunteer) { this.volunteer = volunteer; }

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
}
