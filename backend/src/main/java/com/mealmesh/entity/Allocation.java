package com.mealmesh.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "allocations")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Allocation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "donation_id", nullable = false)
    private Donation donation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ngo_id", nullable = false)
    private NgoProfile ngo;

    @Column(name = "allocated_quantity_kg", nullable = false)
    private double allocatedQuantityKg;

    @Column(nullable = false)
    private String status = "PROPOSED"; // "PROPOSED", "ACCEPTED", "REJECTED", "DISPATCHED", "COMPLETED"

    @Column(name = "match_score")
    private double matchScore = 85.0;

    @Column(name = "matched_at")
    private LocalDateTime matchedAt = LocalDateTime.now();

    public Allocation() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Donation getDonation() { return donation; }
    public void setDonation(Donation donation) { this.donation = donation; }

    public NgoProfile getNgo() { return ngo; }
    public void setNgo(NgoProfile ngo) { this.ngo = ngo; }

    public double getAllocatedQuantityKg() { return allocatedQuantityKg; }
    public void setAllocatedQuantityKg(double allocatedQuantityKg) { this.allocatedQuantityKg = allocatedQuantityKg; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public double getMatchScore() { return matchScore; }
    public void setMatchScore(double matchScore) { this.matchScore = matchScore; }

    public LocalDateTime getMatchedAt() { return matchedAt; }
    public void setMatchedAt(LocalDateTime matchedAt) { this.matchedAt = matchedAt; }
}
