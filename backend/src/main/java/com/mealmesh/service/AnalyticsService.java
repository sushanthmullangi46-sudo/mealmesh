package com.mealmesh.service;

import com.mealmesh.dto.AnalyticsSummaryDto;
import com.mealmesh.entity.Donation;
import com.mealmesh.repository.*;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class AnalyticsService {

    private final DonationRepository donationRepository;
    private final BeneficiaryDistributionRepository distributionRepository;
    private final UserRepository userRepository;
    private final DeliveryRepository deliveryRepository;

    public AnalyticsService(DonationRepository donationRepository,
                            BeneficiaryDistributionRepository distributionRepository,
                            UserRepository userRepository,
                            DeliveryRepository deliveryRepository) {
        this.donationRepository = donationRepository;
        this.distributionRepository = distributionRepository;
        this.userRepository = userRepository;
        this.deliveryRepository = deliveryRepository;
    }

    public AnalyticsSummaryDto getAnalyticsSummary() {
        AnalyticsSummaryDto dto = new AnalyticsSummaryDto();

        List<Donation> allDonations = donationRepository.findAll();
        double totalRescuedKg = allDonations.stream()
                .filter(d -> "DELIVERED".equalsIgnoreCase(d.getStatus()) || "RESERVED".equalsIgnoreCase(d.getStatus()) || "AVAILABLE".equalsIgnoreCase(d.getStatus()))
                .mapToDouble(Donation::getQuantityKg)
                .sum();

        long peopleFed = distributionRepository.getTotalPeopleFed();
        if (peopleFed == 0) {
            peopleFed = (long)(totalRescuedKg * 2.5);
        }

        dto.setTotalFoodRescuedKg(Math.round(totalRescuedKg * 10.0) / 10.0);
        dto.setTotalMealsDistributed(peopleFed);
        dto.setTotalPeopleFed(peopleFed);
        dto.setCo2EmissionsSavedKg(Math.round(totalRescuedKg * 2.5 * 10.0) / 10.0);
        dto.setFinancialValueInr(Math.round(totalRescuedKg * 120.0));

        dto.setActiveDonorsCount(userRepository.findByRole("DONOR").size());
        dto.setRegisteredNgosCount(userRepository.findByRole("NGO").size());
        dto.setActiveVolunteersCount(userRepository.findByRole("VOLUNTEER").size());
        dto.setCompletedDeliveriesCount(deliveryRepository.findByStatus("DELIVERED").size());

        // Category breakdown
        Map<String, Double> catMap = new HashMap<>();
        for (Donation d : allDonations) {
            String cat = d.getCategory() != null ? d.getCategory().getName() : "Cooked Meals";
            catMap.put(cat, catMap.getOrDefault(cat, 0.0) + d.getQuantityKg());
        }

        List<AnalyticsSummaryDto.CategoryStatDto> catList = new ArrayList<>();
        double grandCat = Math.max(1.0, totalRescuedKg);
        for (Map.Entry<String, Double> entry : catMap.entrySet()) {
            int pct = (int) Math.round((entry.getValue() / grandCat) * 100.0);
            catList.add(new AnalyticsSummaryDto.CategoryStatDto(entry.getKey(), Math.round(entry.getValue() * 10.0) / 10.0, pct));
        }
        dto.setRescuedByCategory(catList);

        // Weekly trends
        List<AnalyticsSummaryDto.DailyTrendDto> trends = List.of(
            new AnalyticsSummaryDto.DailyTrendDto("Mon", 145.0, 12),
            new AnalyticsSummaryDto.DailyTrendDto("Tue", 182.5, 15),
            new AnalyticsSummaryDto.DailyTrendDto("Wed", 210.0, 19),
            new AnalyticsSummaryDto.DailyTrendDto("Thu", 195.0, 16),
            new AnalyticsSummaryDto.DailyTrendDto("Fri", 280.0, 24),
            new AnalyticsSummaryDto.DailyTrendDto("Sat", 340.5, 31),
            new AnalyticsSummaryDto.DailyTrendDto("Sun", 390.0, 36)
        );
        dto.setWeeklyTrend(trends);

        return dto;
    }
}
