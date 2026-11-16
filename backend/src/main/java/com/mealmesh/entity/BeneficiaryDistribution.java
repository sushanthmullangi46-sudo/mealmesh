package com.mealmesh.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "beneficiary_distributions")
public class BeneficiaryDistribution {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ngo_id", nullable = false)
    private NgoProfile ngo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "donation_id", nullable = false)
    private Donation donation;

    @Column(name = "beneficiary_group", nullable = false)
    private String beneficiaryGroup;

    @Column(name = "people_fed_count", nullable = false)
    private int peopleFedCount;

    @Column(name = "quantity_distributed_kg", nullable = false)
    private double quantityDistributedKg;

    @Column(name = "distributed_at")
    private LocalDateTime distributedAt = LocalDateTime.now();

    public BeneficiaryDistribution() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public NgoProfile getNgo() { return ngo; }
    public void setNgo(NgoProfile ngo) { this.ngo = ngo; }

    public Donation getDonation() { return donation; }
    public void setDonation(Donation donation) { this.donation = donation; }

    public String getBeneficiaryGroup() { return beneficiaryGroup; }
    public void setBeneficiaryGroup(String beneficiaryGroup) { this.beneficiaryGroup = beneficiaryGroup; }

    public int getPeopleFedCount() { return peopleFedCount; }
    public void setPeopleFedCount(int peopleFedCount) { this.peopleFedCount = peopleFedCount; }

    public double getQuantityDistributedKg() { return quantityDistributedKg; }
    public void setQuantityDistributedKg(double quantityDistributedKg) { this.quantityDistributedKg = quantityDistributedKg; }

    public LocalDateTime getDistributedAt() { return distributedAt; }
    public void setDistributedAt(LocalDateTime distributedAt) { this.distributedAt = distributedAt; }
}
