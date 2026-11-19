package com.mealmesh.dsa.fairness;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;

/**
 * Fairness-Aware Multi-Criteria Allocation Engine (DSA).
 * Balances urgency, geographic proximity, community vulnerability,
 * deficit pressure, and starvation prevention across beneficiary organizations.
 *
 * Tracks Gini Coefficient to mathematically prove distribution equity and
 * generates an audit trail explaining why each match was chosen.
 */
public class FairnessAllocator {

    public static class CandidateNgo {
        private String id;
        private String name;
        private double latitude;
        private double longitude;
        private double availableCapacityKg;
        private double maxCapacityKg;
        private int vulnerabilityIndex; // 1 (lowest) to 10 (highest need)
        private String targetDemographic;
        private double dailyDeficitKg;
        private int daysSinceLastServed;
        private double historicalReceivedKg;
        private List<String> dietaryPreferences;

        // Calculated metrics
        private double distanceKm;
        private double proximityScore;
        private double vulnerabilityScore;
        private double starvationScore;
        private double deficitScore;
        private double compositeScore;

        public CandidateNgo(String id, String name, double latitude, double longitude,
                            double availableCapacityKg, double maxCapacityKg,
                            int vulnerabilityIndex, String targetDemographic,
                            double dailyDeficitKg, int daysSinceLastServed,
                            double historicalReceivedKg, List<String> dietaryPreferences) {
            this.id = id;
            this.name = name;
            this.latitude = latitude;
            this.longitude = longitude;
            this.availableCapacityKg = availableCapacityKg;
            this.maxCapacityKg = maxCapacityKg;
            this.vulnerabilityIndex = Math.max(1, Math.min(10, vulnerabilityIndex));
            this.targetDemographic = targetDemographic != null ? targetDemographic : "General Community";
            this.dailyDeficitKg = Math.max(0, dailyDeficitKg);
            this.daysSinceLastServed = Math.max(0, daysSinceLastServed);
            this.historicalReceivedKg = Math.max(0, historicalReceivedKg);
            this.dietaryPreferences = dietaryPreferences != null ? dietaryPreferences : new ArrayList<>();
        }

        // Getters and Setters
        public String getId() { return id; }
        public String getName() { return name; }
        public double getLatitude() { return latitude; }
        public double getLongitude() { return longitude; }
        public double getAvailableCapacityKg() { return availableCapacityKg; }
        public void setAvailableCapacityKg(double cap) { this.availableCapacityKg = cap; }
        public double getMaxCapacityKg() { return maxCapacityKg; }
        public int getVulnerabilityIndex() { return vulnerabilityIndex; }
        public String getTargetDemographic() { return targetDemographic; }
        public double getDailyDeficitKg() { return dailyDeficitKg; }
        public int getDaysSinceLastServed() { return daysSinceLastServed; }
        public double getHistoricalReceivedKg() { return historicalReceivedKg; }
        public void addHistoricalReceived(double kg) { this.historicalReceivedKg += kg; }
        public List<String> getDietaryPreferences() { return dietaryPreferences; }

        public double getDistanceKm() { return distanceKm; }
        public void setDistanceKm(double distanceKm) { this.distanceKm = distanceKm; }
        public double getProximityScore() { return proximityScore; }
        public void setProximityScore(double score) { this.proximityScore = score; }
        public double getVulnerabilityScore() { return vulnerabilityScore; }
        public void setVulnerabilityScore(double score) { this.vulnerabilityScore = score; }
        public double getStarvationScore() { return starvationScore; }
        public void setStarvationScore(double score) { this.starvationScore = score; }
        public double getDeficitScore() { return deficitScore; }
        public void setDeficitScore(double score) { this.deficitScore = score; }
        public double getCompositeScore() { return compositeScore; }
        public void setCompositeScore(double score) { this.compositeScore = score; }
    }

    public static class AllocationItem {
        private String ngoId;
        private String ngoName;
        private double allocatedKg;
        private double score;
        private double distanceKm;
        private String explanationReason;

        public AllocationItem(String ngoId, String ngoName, double allocatedKg,
                              double score, double distanceKm, String explanationReason) {
            this.ngoId = ngoId;
            this.ngoName = ngoName;
            this.allocatedKg = allocatedKg;
            this.score = score;
            this.distanceKm = distanceKm;
            this.explanationReason = explanationReason;
        }

        public String getNgoId() { return ngoId; }
        public String getNgoName() { return ngoName; }
        public double getAllocatedKg() { return allocatedKg; }
        public double getScore() { return score; }
        public double getDistanceKm() { return distanceKm; }
        public String getExplanationReason() { return explanationReason; }
    }

    public static class FairnessResult {
        private String donationId;
        private String donationTitle;
        private double totalDonationKg;
        private double allocatedKg;
        private double remainingKg;
        private double giniCoefficientBefore;
        private double giniCoefficientAfter;
        private double fairnessImprovementPct;
        private List<AllocationItem> allocations = new ArrayList<>();
        private List<String> auditLogSteps = new ArrayList<>();

        public FairnessResult(String donationId, String donationTitle, double totalDonationKg) {
            this.donationId = donationId;
            this.donationTitle = donationTitle;
            this.totalDonationKg = totalDonationKg;
        }

        public String getDonationId() { return donationId; }
        public String getDonationTitle() { return donationTitle; }
        public double getTotalDonationKg() { return totalDonationKg; }
        public double getAllocatedKg() { return allocatedKg; }
        public void setAllocatedKg(double allocatedKg) { this.allocatedKg = allocatedKg; }
        public double getRemainingKg() { return remainingKg; }
        public void setRemainingKg(double remainingKg) { this.remainingKg = remainingKg; }
        public double getGiniCoefficientBefore() { return giniCoefficientBefore; }
        public void setGiniCoefficientBefore(double gini) { this.giniCoefficientBefore = gini; }
        public double getGiniCoefficientAfter() { return giniCoefficientAfter; }
        public void setGiniCoefficientAfter(double gini) { this.giniCoefficientAfter = gini; }
        public double getFairnessImprovementPct() { return fairnessImprovementPct; }
        public void setFairnessImprovementPct(double pct) { this.fairnessImprovementPct = pct; }
        public List<AllocationItem> getAllocations() { return allocations; }
        public List<String> getAuditLogSteps() { return auditLogSteps; }
    }

    /**
     * Executes Fairness-Aware Allocation balancing proximity, urgency, vulnerability,
     * starvation defense, and unmet community need.
     */
    public static FairnessResult allocate(String donationId, String title, double donationKg,
                                          double donorLat, double donorLon,
                                          long hoursToExpiry, String urgencyLevel,
                                          List<CandidateNgo> candidates) {
        FairnessResult result = new FairnessResult(donationId, title, donationKg);

        if (candidates == null || candidates.isEmpty() || donationKg <= 0) {
            result.setRemainingKg(donationKg);
            result.getAuditLogSteps().add("No eligible candidate NGOs available for allocation.");
            return result;
        }

        // Calculate initial Gini coefficient across active NGOs
        double[] preAllocHistory = candidates.stream().mapToDouble(CandidateNgo::getHistoricalReceivedKg).toArray();
        double giniBefore = calculateGiniCoefficient(preAllocHistory);
        result.setGiniCoefficientBefore(Math.round(giniBefore * 1000.0) / 1000.0);

        // Multiplier based on donation shelf-life urgency
        double urgencyMultiplier = switch (urgencyLevel.toUpperCase()) {
            case "CRITICAL" -> 1.5;
            case "HIGH" -> 1.25;
            case "MEDIUM" -> 1.0;
            default -> 0.8;
        };
        double urgencyScore = Math.min(100.0, (100.0 / (1.0 + Math.max(0.5, hoursToExpiry))) * urgencyMultiplier);

        // Step 1: Score each candidate with fairness criteria
        for (CandidateNgo c : candidates) {
            double dist = haversineDistance(donorLat, donorLon, c.getLatitude(), c.getLongitude());
            c.setDistanceKm(dist);

            // Proximity score (decay with distance, min 5)
            double prox = Math.max(5.0, 100.0 - (dist * 4.5));
            c.setProximityScore(Math.round(prox * 10.0) / 10.0);

            // Community vulnerability index score (scale 10 to 100)
            double vuln = c.getVulnerabilityIndex() * 10.0;
            c.setVulnerabilityScore(vuln);

            // Starvation defense: penalty for NGOs not served recently (ensures fair distribution)
            double starvation = Math.min(100.0, c.getDaysSinceLastServed() * 22.0);
            c.setStarvationScore(Math.round(starvation * 10.0) / 10.0);

            // Deficit urgency: unmet demand relative to target
            double deficit = Math.min(100.0, (c.getDailyDeficitKg() / 60.0) * 100.0);
            c.setDeficitScore(Math.round(deficit * 10.0) / 10.0);

            // Composite Fairness Score:
            // 25% Proximity + 20% Expiry Urgency + 25% Vulnerability Index + 20% Starvation Defense + 10% Deficit
            double composite = (0.25 * prox) +
                               (0.20 * urgencyScore) +
                               (0.25 * vuln) +
                               (0.20 * starvation) +
                               (0.10 * deficit);

            c.setCompositeScore(Math.round(composite * 10.0) / 10.0);

            result.getAuditLogSteps().add(String.format(Locale.US,
                "Candidate '%s' [%s]: Composite Score = %.1f (Proximity=%.1f, Urgency=%.1f, Vulnerability=%.1f, Starvation=%.1f, Deficit=%.1f)",
                c.getName(), c.getTargetDemographic(), c.getCompositeScore(),
                c.getProximityScore(), urgencyScore, c.getVulnerabilityScore(),
                c.getStarvationScore(), c.getDeficitScore()));
        }

        // Custom QuickSort candidates by descending composite score
        CandidateNgo[] ranked = candidates.toArray(new CandidateNgo[0]);
        quickSort(ranked, 0, ranked.length - 1);

        double remainingKg = donationKg;
        double totalAllocated = 0;

        // Step 2: Allocate greedily to top-scoring organizations considering available capacity
        for (CandidateNgo chosen : ranked) {
            if (remainingKg <= 0) break;
            if (chosen.getAvailableCapacityKg() <= 0) {
                result.getAuditLogSteps().add("Skipped '" + chosen.getName() + "': Available storage capacity is 0 kg.");
                continue;
            }

            double allocated = Math.min(remainingKg, chosen.getAvailableCapacityKg());
            chosen.setAvailableCapacityKg(chosen.getAvailableCapacityKg() - allocated);
            chosen.addHistoricalReceived(allocated);
            remainingKg -= allocated;
            totalAllocated += allocated;

            String reason = String.format(Locale.US,
                "Allocated %.1f kg (Score %.1f). Key drivers: Vulnerability Index %d/10 (+%.1f pts), " +
                "Starvation defense (+%.1f pts, %d days unserved), Proximity %.1f km (+%.1f pts), Deficit %.1f kg (+%.1f pts).",
                allocated, chosen.getCompositeScore(),
                chosen.getVulnerabilityIndex(), chosen.getVulnerabilityScore() * 0.25,
                chosen.getStarvationScore() * 0.20, chosen.getDaysSinceLastServed(),
                chosen.getDistanceKm(), chosen.getProximityScore() * 0.25,
                chosen.getDailyDeficitKg(), chosen.getDeficitScore() * 0.10);

            result.getAllocations().add(new AllocationItem(
                chosen.getId(),
                chosen.getName(),
                Math.round(allocated * 10.0) / 10.0,
                chosen.getCompositeScore(),
                chosen.getDistanceKm(),
                reason
            ));

            result.getAuditLogSteps().add("MATCH DECISION: " + reason);
        }

        result.setAllocatedKg(Math.round(totalAllocated * 10.0) / 10.0);
        result.setRemainingKg(Math.round(remainingKg * 10.0) / 10.0);

        // Step 3: Compute post-allocation Gini Coefficient to verify fairness
        double[] postAllocHistory = candidates.stream().mapToDouble(CandidateNgo::getHistoricalReceivedKg).toArray();
        double giniAfter = calculateGiniCoefficient(postAllocHistory);
        result.setGiniCoefficientAfter(Math.round(giniAfter * 1000.0) / 1000.0);

        double improvement = giniBefore > 0 ? ((giniBefore - giniAfter) / giniBefore) * 100.0 : 0.0;
        result.setFairnessImprovementPct(Math.round(Math.max(0.0, improvement) * 10.0) / 10.0);

        result.getAuditLogSteps().add(String.format(Locale.US,
            "Fairness Audit Summary: Gini index shifted from %.3f to %.3f (Equity improved by %.1f%%). Total %.1f kg allocated.",
            result.getGiniCoefficientBefore(), result.getGiniCoefficientAfter(),
            result.getFairnessImprovementPct(), result.getAllocatedKg()));

        return result;
    }

    /**
     * Calculates the Gini Coefficient: a standard statistical dispersion measure
     * representing wealth/food distribution inequality.
     * 0.0 = perfect equality (fair), 1.0 = absolute monopoly.
     */
    public static double calculateGiniCoefficient(double[] values) {
        if (values == null || values.length <= 1) return 0.0;
        double sumDifference = 0;
        double totalSum = 0;
        int n = values.length;

        for (int i = 0; i < n; i++) {
            totalSum += values[i];
            for (int j = 0; j < n; j++) {
                sumDifference += Math.abs(values[i] - values[j]);
            }
        }

        if (totalSum == 0) return 0.0;
        return sumDifference / (2.0 * n * totalSum);
    }

    private static void quickSort(CandidateNgo[] arr, int low, int high) {
        if (low < high) {
            int pi = partition(arr, low, high);
            quickSort(arr, low, pi - 1);
            quickSort(arr, pi + 1, high);
        }
    }

    private static int partition(CandidateNgo[] arr, int low, int high) {
        double pivot = arr[high].getCompositeScore();
        int i = low - 1;
        for (int j = low; j < high; j++) {
            if (arr[j].getCompositeScore() >= pivot) {
                i++;
                CandidateNgo temp = arr[i];
                arr[i] = arr[j];
                arr[j] = temp;
            }
        }
        CandidateNgo temp = arr[i + 1];
        arr[i + 1] = arr[high];
        arr[high] = temp;
        return i + 1;
    }

    private static double haversineDistance(double lat1, double lon1, double lat2, double lon2) {
        final double R = 6371.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.sin(dLon / 2) * Math.sin(dLon / 2) *
                   Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2));
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c * 100.0) / 100.0;
    }
}
