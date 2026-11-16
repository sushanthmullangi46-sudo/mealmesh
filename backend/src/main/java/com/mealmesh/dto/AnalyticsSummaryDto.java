package com.mealmesh.dto;

import java.util.List;
import java.util.Map;

public class AnalyticsSummaryDto {
    private double totalFoodRescuedKg;
    private long totalMealsDistributed;
    private long totalPeopleFed;
    private double co2EmissionsSavedKg; // ~2.5 kg CO2 per kg food rescued
    private double financialValueInr;   // ~Rs 120 per kg food value
    private long activeDonorsCount;
    private long registeredNgosCount;
    private long activeVolunteersCount;
    private long completedDeliveriesCount;
    private List<CategoryStatDto> rescuedByCategory;
    private List<DailyTrendDto> weeklyTrend;

    public AnalyticsSummaryDto() {}

    public double getTotalFoodRescuedKg() { return totalFoodRescuedKg; }
    public void setTotalFoodRescuedKg(double totalFoodRescuedKg) { this.totalFoodRescuedKg = totalFoodRescuedKg; }

    public long getTotalMealsDistributed() { return totalMealsDistributed; }
    public void setTotalMealsDistributed(long totalMealsDistributed) { this.totalMealsDistributed = totalMealsDistributed; }

    public long getTotalPeopleFed() { return totalPeopleFed; }
    public void setTotalPeopleFed(long totalPeopleFed) { this.totalPeopleFed = totalPeopleFed; }

    public double getCo2EmissionsSavedKg() { return co2EmissionsSavedKg; }
    public void setCo2EmissionsSavedKg(double co2EmissionsSavedKg) { this.co2EmissionsSavedKg = co2EmissionsSavedKg; }

    public double getFinancialValueInr() { return financialValueInr; }
    public void setFinancialValueInr(double financialValueInr) { this.financialValueInr = financialValueInr; }

    public long getActiveDonorsCount() { return activeDonorsCount; }
    public void setActiveDonorsCount(long activeDonorsCount) { this.activeDonorsCount = activeDonorsCount; }

    public long getRegisteredNgosCount() { return registeredNgosCount; }
    public void setRegisteredNgosCount(long registeredNgosCount) { this.registeredNgosCount = registeredNgosCount; }

    public long getActiveVolunteersCount() { return activeVolunteersCount; }
    public void setActiveVolunteersCount(long activeVolunteersCount) { this.activeVolunteersCount = activeVolunteersCount; }

    public long getCompletedDeliveriesCount() { return completedDeliveriesCount; }
    public void setCompletedDeliveriesCount(long completedDeliveriesCount) { this.completedDeliveriesCount = completedDeliveriesCount; }

    public List<CategoryStatDto> getRescuedByCategory() { return rescuedByCategory; }
    public void setRescuedByCategory(List<CategoryStatDto> rescuedByCategory) { this.rescuedByCategory = rescuedByCategory; }

    public List<DailyTrendDto> getWeeklyTrend() { return weeklyTrend; }
    public void setWeeklyTrend(List<DailyTrendDto> weeklyTrend) { this.weeklyTrend = weeklyTrend; }

    public static class CategoryStatDto {
        private String category;
        private double quantityKg;
        private int percentage;

        public CategoryStatDto() {}

        public CategoryStatDto(String category, double quantityKg, int percentage) {
            this.category = category;
            this.quantityKg = quantityKg;
            this.percentage = percentage;
        }

        public String getCategory() { return category; }
        public double getQuantityKg() { return quantityKg; }
        public int getPercentage() { return percentage; }
    }

    public static class DailyTrendDto {
        private String day;
        private double foodRescuedKg;
        private int deliveries;

        public DailyTrendDto() {}

        public DailyTrendDto(String day, double foodRescuedKg, int deliveries) {
            this.day = day;
            this.foodRescuedKg = foodRescuedKg;
            this.deliveries = deliveries;
        }

        public String getDay() { return day; }
        public double getFoodRescuedKg() { return foodRescuedKg; }
        public int getDeliveries() { return deliveries; }
    }
}
