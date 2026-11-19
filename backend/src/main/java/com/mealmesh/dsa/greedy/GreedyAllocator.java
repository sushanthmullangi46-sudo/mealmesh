package com.mealmesh.dsa.greedy;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * Custom Multi-Criteria Greedy Matching and Allocation Algorithm.
 * Ranks candidate NGOs according to a weighted utility function:
 * Score = w1 * Proximity + w2 * UrgencyWeight + w3 * CapacityFit + w4 * DietaryAlignment
 */
public class GreedyAllocator {

    public static class AllocationResult {
        private String donationId;
        private double originalQuantityKg;
        private double allocatedQuantityKg;
        private double remainingQuantityKg;
        private List<NgoAllocationItem> allocations;
        private List<GreedyStep> steps;

        public AllocationResult(String donationId, double originalQuantityKg) {
            this.donationId = donationId;
            this.originalQuantityKg = originalQuantityKg;
            this.allocations = new ArrayList<>();
            this.steps = new ArrayList<>();
        }

        public String getDonationId() {
            return donationId;
        }

        public double getOriginalQuantityKg() {
            return originalQuantityKg;
        }

        public double getAllocatedQuantityKg() {
            return allocatedQuantityKg;
        }

        public void setAllocatedQuantityKg(double allocatedQuantityKg) {
            this.allocatedQuantityKg = allocatedQuantityKg;
        }

        public double getRemainingQuantityKg() {
            return remainingQuantityKg;
        }

        public void setRemainingQuantityKg(double remainingQuantityKg) {
            this.remainingQuantityKg = remainingQuantityKg;
        }

        public List<NgoAllocationItem> getAllocations() {
            return allocations;
        }

        public List<GreedyStep> getSteps() {
            return steps;
        }
    }

    public static class NgoAllocationItem {
        private String ngoId;
        private String ngoName;
        private double allocatedKg;
        private double score;
        private double distanceKm;

        public NgoAllocationItem(String ngoId, String ngoName, double allocatedKg, double score, double distanceKm) {
            this.ngoId = ngoId;
            this.ngoName = ngoName;
            this.allocatedKg = allocatedKg;
            this.score = score;
            this.distanceKm = distanceKm;
        }

        public String getNgoId() {
            return ngoId;
        }

        public String getNgoName() {
            return ngoName;
        }

        public double getAllocatedKg() {
            return allocatedKg;
        }

        public double getScore() {
            return score;
        }

        public double getDistanceKm() {
            return distanceKm;
        }
    }

    public static AllocationResult allocate(DonationBatch donation, List<NgoCandidate> candidateList) {
        AllocationResult result = new AllocationResult(donation.getId(), donation.getQuantityKg());
        if (candidateList == null || candidateList.isEmpty() || donation.getQuantityKg() <= 0) {
            result.setRemainingQuantityKg(donation.getQuantityKg());
            return result;
        }

        // Convert list to array for custom in-place sorting
        NgoCandidate[] candidates = candidateList.toArray(new NgoCandidate[0]);
        int stepNum = 1;

        // Step 1: Compute scores for each candidate
        for (NgoCandidate candidate : candidates) {
            double dist = haversineDistance(donation.getLatitude(), donation.getLongitude(),
                                            candidate.getLatitude(), candidate.getLongitude());
            candidate.setDistanceKm(dist);

            // Weights: Proximity (0.35), Urgency Factor (0.25), Capacity Fit (0.25), Dietary (0.15)
            double proximityScore = Math.max(0.0, 100.0 - (dist * 4.0)); // e.g. 5km = 80, 20km = 20

            double urgencyMultiplier = switch (donation.getUrgency().toUpperCase()) {
                case "CRITICAL" -> 1.5;
                case "HIGH" -> 1.25;
                case "MEDIUM" -> 1.0;
                default -> 0.8;
            };

            double capacityScore = Math.min(100.0, (candidate.getAvailableCapacityKg() / Math.max(1.0, donation.getQuantityKg())) * 100.0);

            double dietaryScore = 50.0;
            if (candidate.getDietaryPreferences() != null && donation.getDietaryType() != null) {
                for (String pref : candidate.getDietaryPreferences()) {
                    if (pref.equalsIgnoreCase(donation.getDietaryType()) || pref.equalsIgnoreCase("ALL")) {
                        dietaryScore = 100.0;
                        break;
                    }
                }
            }

            // Each term is on a 0-100 scale and the weights sum to 1.0, so the score is always 0-100.
            // Urgency boosts proximity (an urgent batch should go to the nearest shelter) but is capped at 100.
            double composite = (0.35 * Math.min(100.0, proximityScore * urgencyMultiplier)) +
                               (0.35 * capacityScore) +
                               (0.15 * dietaryScore) +
                               (0.15 * (100.0 / (1.0 + Math.max(0.0, donation.getHoursRemainingUntilExpiry()))));

            candidate.setCompositeScore(Math.round(composite * 100.0) / 100.0);

            result.getSteps().add(new GreedyStep(
                stepNum++,
                "EVALUATE_CANDIDATE",
                candidate.getId(),
                candidate.getName(),
                candidate.getCompositeScore(),
                0.0,
                donation.getQuantityKg(),
                String.format(Locale.US, "Evaluated %s: Distance=%.1f km, AvailCap=%.1f kg, Score=%.1f",
                    candidate.getName(), dist, candidate.getAvailableCapacityKg(), candidate.getCompositeScore())
            ));
        }

        // Custom in-place sort: descending order of composite score
        quickSort(candidates, 0, candidates.length - 1);

        double remainingToAllocate = donation.getQuantityKg();
        double totalAllocated = 0.0;

        // Step 2: Greedy Allocation pass
        for (NgoCandidate candidate : candidates) {
            if (remainingToAllocate <= 0) break;
            double avail = candidate.getAvailableCapacityKg();

            if (avail <= 0) {
                result.getSteps().add(new GreedyStep(
                    stepNum++,
                    "CAPACITY_EXCEEDED",
                    candidate.getId(),
                    candidate.getName(),
                    candidate.getCompositeScore(),
                    0.0,
                    remainingToAllocate,
                    "Skipped " + candidate.getName() + " due to zero available storage capacity."
                ));
                continue;
            }

            double assignKg = Math.min(remainingToAllocate, avail);
            candidate.setCurrentCapacityKg(candidate.getCurrentCapacityKg() + assignKg);
            remainingToAllocate -= assignKg;
            totalAllocated += assignKg;

            result.getAllocations().add(new NgoAllocationItem(
                candidate.getId(),
                candidate.getName(),
                Math.round(assignKg * 100.0) / 100.0,
                candidate.getCompositeScore(),
                candidate.getDistanceKm()
            ));

            result.getSteps().add(new GreedyStep(
                stepNum++,
                "ALLOCATE",
                candidate.getId(),
                candidate.getName(),
                candidate.getCompositeScore(),
                assignKg,
                remainingToAllocate,
                String.format(Locale.US, "Greedily allocated %.1f kg to %s (Remaining donation: %.1f kg)",
                    assignKg, candidate.getName(), remainingToAllocate)
            ));
        }

        result.setAllocatedQuantityKg(Math.round(totalAllocated * 100.0) / 100.0);
        result.setRemainingQuantityKg(Math.round(remainingToAllocate * 100.0) / 100.0);

        result.getSteps().add(new GreedyStep(
            stepNum,
            "COMPLETE",
            null,
            null,
            0.0,
            totalAllocated,
            remainingToAllocate,
            "Greedy allocation cycle completed. Successfully matched " + result.getAllocations().size() + " NGOs."
        ));

        return result;
    }

    private static void quickSort(NgoCandidate[] arr, int low, int high) {
        if (low < high) {
            int pi = partition(arr, low, high);
            quickSort(arr, low, pi - 1);
            quickSort(arr, pi + 1, high);
        }
    }

    private static int partition(NgoCandidate[] arr, int low, int high) {
        double pivot = arr[high].getCompositeScore();
        int i = low - 1;
        for (int j = low; j < high; j++) {
            // Descending order: highest score first
            if (arr[j].getCompositeScore() >= pivot) {
                i++;
                NgoCandidate temp = arr[i];
                arr[i] = arr[j];
                arr[j] = temp;
            }
        }
        NgoCandidate temp = arr[i + 1];
        arr[i + 1] = arr[high];
        arr[high] = temp;
        return i + 1;
    }

    public static double haversineDistance(double lat1, double lon1, double lat2, double lon2) {
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
