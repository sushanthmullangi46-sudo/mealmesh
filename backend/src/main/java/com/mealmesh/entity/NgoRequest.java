package com.mealmesh.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "ngo_requests")
public class NgoRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ngo_id", nullable = false)
    private NgoProfile ngo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private FoodCategory category;

    @Column(name = "requested_quantity_kg", nullable = false)
    private double requestedQuantityKg;

    @Column(name = "requested_servings")
    private int requestedServings;

    @Column(nullable = false)
    private String urgency = "MEDIUM"; // "CRITICAL", "HIGH", "MEDIUM", "LOW"

    @Column(nullable = false)
    private String status = "PENDING"; // "PENDING", "MATCHED", "FULFILLED", "CANCELLED"

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public NgoRequest() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public NgoProfile getNgo() { return ngo; }
    public void setNgo(NgoProfile ngo) { this.ngo = ngo; }

    public FoodCategory getCategory() { return category; }
    public void setCategory(FoodCategory category) { this.category = category; }

    public double getRequestedQuantityKg() { return requestedQuantityKg; }
    public void setRequestedQuantityKg(double requestedQuantityKg) { this.requestedQuantityKg = requestedQuantityKg; }

    public int getRequestedServings() { return requestedServings; }
    public void setRequestedServings(int requestedServings) { this.requestedServings = requestedServings; }

    public String getUrgency() { return urgency; }
    public void setUrgency(String urgency) { this.urgency = urgency; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
