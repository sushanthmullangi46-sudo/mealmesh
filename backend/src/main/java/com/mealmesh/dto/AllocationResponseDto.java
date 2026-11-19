package com.mealmesh.dto;

import com.mealmesh.entity.Allocation;

import java.time.LocalDateTime;
import java.util.UUID;

public class AllocationResponseDto {
    private UUID id;
    private double allocatedQuantityKg;
    private double matchScore;
    private String status;
    private LocalDateTime matchedAt;
    private String fairnessExplanation;
    private DeliveryResponseDto.DonationSummaryDto donation;
    private DeliveryResponseDto.NgoSummaryDto ngo;

    public AllocationResponseDto() {}

    public static AllocationResponseDto fromEntity(Allocation a) {
        if (a == null) return null;
        AllocationResponseDto dto = new AllocationResponseDto();
        dto.setId(a.getId());
        dto.setAllocatedQuantityKg(a.getAllocatedQuantityKg());
        dto.setMatchScore(a.getMatchScore());
        dto.setStatus(a.getStatus());
        dto.setMatchedAt(a.getMatchedAt());
        dto.setFairnessExplanation(a.getFairnessExplanation());

        if (a.getDonation() != null) {
            dto.setDonation(DeliveryResponseDto.DonationSummaryDto.fromEntity(a.getDonation()));
        }
        if (a.getNgo() != null) {
            dto.setNgo(DeliveryResponseDto.NgoSummaryDto.fromEntity(a.getNgo()));
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
    public String getFairnessExplanation() { return fairnessExplanation; }
    public void setFairnessExplanation(String fairnessExplanation) { this.fairnessExplanation = fairnessExplanation; }
    public DeliveryResponseDto.DonationSummaryDto getDonation() { return donation; }
    public void setDonation(DeliveryResponseDto.DonationSummaryDto donation) { this.donation = donation; }
    public DeliveryResponseDto.NgoSummaryDto getNgo() { return ngo; }
    public void setNgo(DeliveryResponseDto.NgoSummaryDto ngo) { this.ngo = ngo; }
}
