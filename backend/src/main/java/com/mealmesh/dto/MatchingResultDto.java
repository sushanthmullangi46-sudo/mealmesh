package com.mealmesh.dto;

import java.util.List;

public class MatchingResultDto {
    private String donationId;
    private String donationTitle;
    private double quantityKg;
    private double allocatedKg;
    private double remainingKg;
    private List<MatchedNgoDto> matchedNgos;

    public MatchingResultDto() {}

    public MatchingResultDto(String donationId, String donationTitle, double quantityKg, double allocatedKg, double remainingKg, List<MatchedNgoDto> matchedNgos) {
        this.donationId = donationId;
        this.donationTitle = donationTitle;
        this.quantityKg = quantityKg;
        this.allocatedKg = allocatedKg;
        this.remainingKg = remainingKg;
        this.matchedNgos = matchedNgos;
    }

    public String getDonationId() { return donationId; }
    public void setDonationId(String donationId) { this.donationId = donationId; }

    public String getDonationTitle() { return donationTitle; }
    public void setDonationTitle(String donationTitle) { this.donationTitle = donationTitle; }

    public double getQuantityKg() { return quantityKg; }
    public void setQuantityKg(double quantityKg) { this.quantityKg = quantityKg; }

    public double getAllocatedKg() { return allocatedKg; }
    public void setAllocatedKg(double allocatedKg) { this.allocatedKg = allocatedKg; }

    public double getRemainingKg() { return remainingKg; }
    public void setRemainingKg(double remainingKg) { this.remainingKg = remainingKg; }

    public List<MatchedNgoDto> getMatchedNgos() { return matchedNgos; }
    public void setMatchedNgos(List<MatchedNgoDto> matchedNgos) { this.matchedNgos = matchedNgos; }

    public static class MatchedNgoDto {
        private String ngoId;
        private String ngoName;
        private double allocatedKg;
        private double matchScore;
        private double distanceKm;
        private String rationale;

        public MatchedNgoDto() {}

        public MatchedNgoDto(String ngoId, String ngoName, double allocatedKg, double matchScore, double distanceKm, String rationale) {
            this.ngoId = ngoId;
            this.ngoName = ngoName;
            this.allocatedKg = allocatedKg;
            this.matchScore = matchScore;
            this.distanceKm = distanceKm;
            this.rationale = rationale;
        }

        public String getNgoId() { return ngoId; }
        public String getNgoName() { return ngoName; }
        public double getAllocatedKg() { return allocatedKg; }
        public double getMatchScore() { return matchScore; }
        public double getDistanceKm() { return distanceKm; }
        public String getRationale() { return rationale; }
    }
}
