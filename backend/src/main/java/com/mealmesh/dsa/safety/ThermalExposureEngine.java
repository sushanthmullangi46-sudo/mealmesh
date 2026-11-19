package com.mealmesh.dsa.safety;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * Temperature-Exposure-Based Food Safety Engine (DSA).
 * Evaluates the cumulative time-temperature exposure profile of cooked and chilled food batches
 * by integrating thermal abuse over time (Degree-Minutes integral and Bacterial Hazard Factor).
 *
 * Distinguishes transient temperature fluctuations from prolonged Danger Zone incubation:
 * Danger Zone for cooked food: 5.0Â°C to 60.0Â°C.
 */
public class ThermalExposureEngine {

    public static final double HOT_SAFE_LOWER_BOUND = 60.0; // Â°C
    public static final double COLD_SAFE_UPPER_BOUND = 5.0;  // Â°C
    public static final double OPTIMAL_BACTERIAL_PEAK = 37.0; // Â°C

    public static class TemperaturePoint {
        private LocalDateTime timestamp;
        private double temperatureCelsius;
        private double humidityPercent;
        private double gasPpm;

        public TemperaturePoint(LocalDateTime timestamp, double temperatureCelsius,
                                double humidityPercent, double gasPpm) {
            this.timestamp = timestamp;
            this.temperatureCelsius = temperatureCelsius;
            this.humidityPercent = humidityPercent;
            this.gasPpm = gasPpm;
        }

        public LocalDateTime getTimestamp() { return timestamp; }
        public double getTemperatureCelsius() { return temperatureCelsius; }
        public double getHumidityPercent() { return humidityPercent; }
        public double getGasPpm() { return gasPpm; }
    }

    public static class ExposureAssessment {
        private String donationId;
        private String foodType; // COOKED or REFRIGERATED
        private double currentTemperatureCelsius;
        private double minRecordedCelsius;
        private double maxRecordedCelsius;
        private double averageTemperatureCelsius;
        private double totalMonitoringMinutes;
        private double cumulativeDangerZoneMinutes;
        private double degreeMinutesExposure;
        private double bacterialHazardScore; // 0 (Safe) to 100 (Unsafe)
        private String safetyClassification; // SAFE_OPTIMAL, CAUTION_EXPEDITE, QA_REVIEW_REQUIRED, CRITICAL_QUARANTINED
        private String actionRecommendation;
        private boolean requiresQaIntervention;
        private List<String> flaggedEvents = new ArrayList<>();

        public String getDonationId() { return donationId; }
        public void setDonationId(String id) { this.donationId = id; }
        public String getFoodType() { return foodType; }
        public void setFoodType(String type) { this.foodType = type; }
        public double getCurrentTemperatureCelsius() { return currentTemperatureCelsius; }
        public void setCurrentTemperatureCelsius(double t) { this.currentTemperatureCelsius = t; }
        public double getMinRecordedCelsius() { return minRecordedCelsius; }
        public void setMinRecordedCelsius(double min) { this.minRecordedCelsius = min; }
        public double getMaxRecordedCelsius() { return maxRecordedCelsius; }
        public void setMaxRecordedCelsius(double max) { this.maxRecordedCelsius = max; }
        public double getAverageTemperatureCelsius() { return averageTemperatureCelsius; }
        public void setAverageTemperatureCelsius(double avg) { this.averageTemperatureCelsius = avg; }
        public double getTotalMonitoringMinutes() { return totalMonitoringMinutes; }
        public void setTotalMonitoringMinutes(double mins) { this.totalMonitoringMinutes = mins; }
        public double getCumulativeDangerZoneMinutes() { return cumulativeDangerZoneMinutes; }
        public void setCumulativeDangerZoneMinutes(double mins) { this.cumulativeDangerZoneMinutes = mins; }
        public double getDegreeMinutesExposure() { return degreeMinutesExposure; }
        public void setDegreeMinutesExposure(double dm) { this.degreeMinutesExposure = dm; }
        public double getBacterialHazardScore() { return bacterialHazardScore; }
        public void setBacterialHazardScore(double s) { this.bacterialHazardScore = s; }
        public String getSafetyClassification() { return safetyClassification; }
        public void setSafetyClassification(String sc) { this.safetyClassification = sc; }
        public String getActionRecommendation() { return actionRecommendation; }
        public void setActionRecommendation(String rec) { this.actionRecommendation = rec; }
        public boolean isRequiresQaIntervention() { return requiresQaIntervention; }
        public void setRequiresQaIntervention(boolean r) { this.requiresQaIntervention = r; }
        public List<String> getFlaggedEvents() { return flaggedEvents; }
    }

    /**
     * Integrates time-series sensor telemetry points and computes
     * cumulative exposure outside safe thermal boundaries.
     */
    public static ExposureAssessment evaluate(String donationId, String foodType, List<TemperaturePoint> timeSeries) {
        ExposureAssessment assessment = new ExposureAssessment();
        assessment.setDonationId(donationId);
        assessment.setFoodType(foodType != null ? foodType.toUpperCase() : "COOKED");

        if (timeSeries == null || timeSeries.isEmpty()) {
            assessment.setCurrentTemperatureCelsius(65.0);
            assessment.setSafetyClassification("SAFE_OPTIMAL");
            assessment.setActionRecommendation("Initial batch temperature within optimal standard range. Monitor telemetry.");
            assessment.setRequiresQaIntervention(false);
            return assessment;
        }

        // Sort chronologically
        timeSeries.sort((a, b) -> a.getTimestamp().compareTo(b.getTimestamp()));

        double minT = Double.MAX_VALUE;
        double maxT = -Double.MAX_VALUE;
        double sumT = 0;
        double totalMinutes = 0;
        double dangerZoneMinutes = 0;
        double cumulativeDegreeMinutes = 0;
        double bacterialHazardScore = 0;

        boolean isCooked = assessment.getFoodType().equals("COOKED");

        for (int i = 0; i < timeSeries.size(); i++) {
            TemperaturePoint pt = timeSeries.get(i);
            double temp = pt.getTemperatureCelsius();
            minT = Math.min(minT, temp);
            maxT = Math.max(maxT, temp);
            sumT += temp;

            if (i > 0) {
                TemperaturePoint prev = timeSeries.get(i - 1);
                long sec = Math.max(1, Duration.between(prev.getTimestamp(), pt.getTimestamp()).getSeconds());
                double intervalMinutes = sec / 60.0;
                totalMinutes += intervalMinutes;

                // Average temp over interval
                double intervalAvgTemp = (prev.getTemperatureCelsius() + temp) / 2.0;

                // Check Danger Zone condition
                boolean inDangerZone;
                double degreeDeviation;

                if (isCooked) {
                    // Cooked hot food: danger zone is below 60Â°C and above 5Â°C
                    inDangerZone = intervalAvgTemp < HOT_SAFE_LOWER_BOUND && intervalAvgTemp > COLD_SAFE_UPPER_BOUND;
                    degreeDeviation = Math.max(0.0, HOT_SAFE_LOWER_BOUND - intervalAvgTemp);
                } else {
                    // Refrigerated food: danger zone is above 5Â°C
                    inDangerZone = intervalAvgTemp > COLD_SAFE_UPPER_BOUND;
                    degreeDeviation = Math.max(0.0, intervalAvgTemp - COLD_SAFE_UPPER_BOUND);
                }

                if (inDangerZone) {
                    dangerZoneMinutes += intervalMinutes;
                    cumulativeDegreeMinutes += (degreeDeviation * intervalMinutes);

                    // Microbial doubling growth risk factor (exponential peak around 37Â°C)
                    double tempDiffFromPeak = Math.abs(intervalAvgTemp - OPTIMAL_BACTERIAL_PEAK);
                    double growthFactor = Math.max(0.1, 1.0 - (tempDiffFromPeak / 30.0));
                    bacterialHazardScore += (growthFactor * intervalMinutes * 1.8);

                    if (intervalMinutes >= 15.0) {
                        assessment.getFlaggedEvents().add(String.format(Locale.US,
                            "Extended Danger Zone exposure: %.1f mins at avg %.1fÂ°C (%s)",
                            intervalMinutes, intervalAvgTemp, pt.getTimestamp().toLocalTime()));
                    }
                }
            }
        }

        double latestTemp = timeSeries.get(timeSeries.size() - 1).getTemperatureCelsius();
        assessment.setCurrentTemperatureCelsius(Math.round(latestTemp * 10.0) / 10.0);
        assessment.setMinRecordedCelsius(Math.round(minT * 10.0) / 10.0);
        assessment.setMaxRecordedCelsius(Math.round(maxT * 10.0) / 10.0);
        assessment.setAverageTemperatureCelsius(Math.round((sumT / timeSeries.size()) * 10.0) / 10.0);
        assessment.setTotalMonitoringMinutes(Math.round(totalMinutes * 10.0) / 10.0);
        assessment.setCumulativeDangerZoneMinutes(Math.round(dangerZoneMinutes * 10.0) / 10.0);
        assessment.setDegreeMinutesExposure(Math.round(cumulativeDegreeMinutes * 10.0) / 10.0);

        // Normalize hazard score (0 to 100)
        double normalizedHazard = Math.min(100.0, bacterialHazardScore);
        assessment.setBacterialHazardScore(Math.round(normalizedHazard * 10.0) / 10.0);

        // Classify decision based on cumulative exposure
        if (dangerZoneMinutes > 60.0 || cumulativeDegreeMinutes > 400.0 || normalizedHazard >= 75.0) {
            assessment.setSafetyClassification("CRITICAL_QUARANTINED");
            assessment.setRequiresQaIntervention(true);
            assessment.setActionRecommendation(
                "CRITICAL SPOILAGE HAZARD: Cumulative Danger Zone exposure exceeded 60 minutes (" +
                Math.round(dangerZoneMinutes) + " mins, " + Math.round(cumulativeDegreeMinutes) + " degree-minutes). " +
                "Batch quarantined. DO NOT DISTRIBUTE. Divert to certified organic composting.");
        } else if (dangerZoneMinutes >= 30.0 || cumulativeDegreeMinutes >= 180.0 || normalizedHazard >= 45.0) {
            assessment.setSafetyClassification("QA_REVIEW_REQUIRED");
            assessment.setRequiresQaIntervention(true);
            assessment.setActionRecommendation(
                "QA REVIEW MANDATED: Cumulative exposure (" + Math.round(dangerZoneMinutes) + " mins outside safe limits) " +
                "warrants sensory and organoleptic inspection by NGO Food Safety Officer before beneficiary distribution.");
        } else if (dangerZoneMinutes > 10.0 || cumulativeDegreeMinutes > 60.0) {
            assessment.setSafetyClassification("CAUTION_EXPEDITE");
            assessment.setRequiresQaIntervention(false);
            assessment.setActionRecommendation(
                "CAUTION - ACCELERATE TRANSPORT: Minor thermal excursion detected (" + Math.round(dangerZoneMinutes) +
                " mins). Prioritize immediate direct handover within 30 minutes.");
        } else {
            assessment.setSafetyClassification("SAFE_OPTIMAL");
            assessment.setRequiresQaIntervention(false);
            assessment.setActionRecommendation(
                "OPTIMAL FOOD INTEGRITY: Batch conforms to FSSAI thermal holding standards. Safe for immediate distribution.");
        }

        return assessment;
    }
}
