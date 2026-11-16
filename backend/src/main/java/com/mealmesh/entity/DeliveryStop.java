package com.mealmesh.entity;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "delivery_stops")
public class DeliveryStop {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "delivery_id", nullable = false)
    private Delivery delivery;

    @Column(name = "sequence_order", nullable = false)
    private int sequenceOrder;

    @Column(name = "stop_type", nullable = false)
    private String stopType; // "PICKUP", "DROPOFF"

    @Column(nullable = false)
    private double latitude;

    @Column(nullable = false)
    private double longitude;

    private String address;

    @Column(nullable = false)
    private String status = "PENDING"; // "PENDING", "ARRIVED", "COMPLETED"

    public DeliveryStop() {}

    public DeliveryStop(UUID id, Delivery delivery, int sequenceOrder, String stopType, double latitude, double longitude, String address, String status) {
        this.id = id;
        this.delivery = delivery;
        this.sequenceOrder = sequenceOrder;
        this.stopType = stopType;
        this.latitude = latitude;
        this.longitude = longitude;
        this.address = address;
        this.status = status;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Delivery getDelivery() { return delivery; }
    public void setDelivery(Delivery delivery) { this.delivery = delivery; }

    public int getSequenceOrder() { return sequenceOrder; }
    public void setSequenceOrder(int sequenceOrder) { this.sequenceOrder = sequenceOrder; }

    public String getStopType() { return stopType; }
    public void setStopType(String stopType) { this.stopType = stopType; }

    public double getLatitude() { return latitude; }
    public void setLatitude(double latitude) { this.latitude = latitude; }

    public double getLongitude() { return longitude; }
    public void setLongitude(double longitude) { this.longitude = longitude; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
