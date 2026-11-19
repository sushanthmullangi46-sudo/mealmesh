package com.mealmesh.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "handoff_records")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class HandoffRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "delivery_id")
    private Delivery delivery;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "donation_id", nullable = false)
    private Donation donation;

    @Column(name = "pickup_code", nullable = false)
    private String pickupCode;

    @Column(name = "delivery_code", nullable = false)
    private String deliveryCode;

    @Column(name = "pickup_status")
    private String pickupStatus = "PENDING"; // PENDING, VERIFIED

    @Column(name = "delivery_status")
    private String deliveryStatus = "PENDING"; // PENDING, VERIFIED

    @Column(name = "pickup_timestamp")
    private LocalDateTime pickupTimestamp;

    @Column(name = "delivery_timestamp")
    private LocalDateTime deliveryTimestamp;

    @Column(name = "scanned_by_volunteer_name")
    private String scannedByVolunteerName;

    @Column(name = "verified_by_recipient_name")
    private String verifiedByRecipientName;

    @Column(name = "received_quantity_kg")
    private double receivedQuantityKg;

    @Column(name = "quality_inspection_passed")
    private boolean qualityInspectionPassed = true;

    @Column(name = "temperature_at_delivery_celsius")
    private double temperatureAtDeliveryCelsius = 64.0;

    @Column(name = "cryptographic_hash", length = 64)
    private String cryptographicHash;

    @Column(name = "meals_served")
    private int mealsServed;

    @Column(name = "co2_diverted_kg")
    private double co2DivertedKg;

    @Column(name = "water_saved_liters")
    private double waterSavedLiters;

    public HandoffRecord() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Delivery getDelivery() { return delivery; }
    public void setDelivery(Delivery delivery) { this.delivery = delivery; }

    public Donation getDonation() { return donation; }
    public void setDonation(Donation donation) { this.donation = donation; }

    public String getPickupCode() { return pickupCode; }
    public void setPickupCode(String pickupCode) { this.pickupCode = pickupCode; }

    public String getDeliveryCode() { return deliveryCode; }
    public void setDeliveryCode(String deliveryCode) { this.deliveryCode = deliveryCode; }

    public String getPickupStatus() { return pickupStatus; }
    public void setPickupStatus(String pickupStatus) { this.pickupStatus = pickupStatus; }

    public String getDeliveryStatus() { return deliveryStatus; }
    public void setDeliveryStatus(String deliveryStatus) { this.deliveryStatus = deliveryStatus; }

    public LocalDateTime getPickupTimestamp() { return pickupTimestamp; }
    public void setPickupTimestamp(LocalDateTime pickupTimestamp) { this.pickupTimestamp = pickupTimestamp; }

    public LocalDateTime getDeliveryTimestamp() { return deliveryTimestamp; }
    public void setDeliveryTimestamp(LocalDateTime deliveryTimestamp) { this.deliveryTimestamp = deliveryTimestamp; }

    public String getScannedByVolunteerName() { return scannedByVolunteerName; }
    public void setScannedByVolunteerName(String scannedByVolunteerName) { this.scannedByVolunteerName = scannedByVolunteerName; }

    public String getVerifiedByRecipientName() { return verifiedByRecipientName; }
    public void setVerifiedByRecipientName(String verifiedByRecipientName) { this.verifiedByRecipientName = verifiedByRecipientName; }

    public double getReceivedQuantityKg() { return receivedQuantityKg; }
    public void setReceivedQuantityKg(double receivedQuantityKg) { this.receivedQuantityKg = receivedQuantityKg; }

    public boolean isQualityInspectionPassed() { return qualityInspectionPassed; }
    public void setQualityInspectionPassed(boolean qualityInspectionPassed) { this.qualityInspectionPassed = qualityInspectionPassed; }

    public double getTemperatureAtDeliveryCelsius() { return temperatureAtDeliveryCelsius; }
    public void setTemperatureAtDeliveryCelsius(double t) { this.temperatureAtDeliveryCelsius = t; }

    public String getCryptographicHash() { return cryptographicHash; }
    public void setCryptographicHash(String cryptographicHash) { this.cryptographicHash = cryptographicHash; }

    public int getMealsServed() { return mealsServed; }
    public void setMealsServed(int mealsServed) { this.mealsServed = mealsServed; }

    public double getCo2DivertedKg() { return co2DivertedKg; }
    public void setCo2DivertedKg(double co2DivertedKg) { this.co2DivertedKg = co2DivertedKg; }

    public double getWaterSavedLiters() { return waterSavedLiters; }
    public void setWaterSavedLiters(double waterSavedLiters) { this.waterSavedLiters = waterSavedLiters; }
}
