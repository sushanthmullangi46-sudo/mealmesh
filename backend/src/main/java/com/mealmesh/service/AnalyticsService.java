package com.mealmesh.service;

import com.mealmesh.dsa.greedy.GreedyAllocator;
import com.mealmesh.dsa.hashtable.CustomHashTable;
import com.mealmesh.dsa.unionfind.DisjointSetUnion;
import com.mealmesh.dto.AnalyticsSummaryDto;
import com.mealmesh.entity.Delivery;
import com.mealmesh.entity.Donation;
import com.mealmesh.entity.Location;
import com.mealmesh.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.*;

/**
 * Impact metrics shown on the landing page and the analytics page.
 * Every number is computed from the database; nothing is hard-coded.
 */
@Service
public class AnalyticsService {

    /** Donation states that mean an NGO has taken the food, i.e. it was rescued from waste. */
    private static final Set<String> RESCUED_STATES =
            Set.of("RESERVED", "MATCHED", "IN_TRANSIT", "DELIVERED", "COMPLETED");

    /** Delivery states that mean the food reached the shelter. */
    private static final Set<String> FINISHED_DELIVERY_STATES = Set.of("DELIVERED", "COMPLETED");

    private static final double MEALS_PER_KG = 2.5;      // ~400 g per meal
    private static final double CO2_KG_PER_KG_FOOD = 2.5; // emissions avoided by not sending food to landfill
    private static final double INR_PER_KG = 120.0;      // average value of a kg of cooked food

    private final DonationRepository donationRepository;
    private final BeneficiaryDistributionRepository distributionRepository;
    private final UserRepository userRepository;
    private final DeliveryRepository deliveryRepository;
    private final LocationRepository locationRepository;

    /** Two sites closer than this belong to the same delivery zone. */
    private static final double ZONE_RADIUS_KM = 3.0;

    public AnalyticsService(DonationRepository donationRepository,
                            BeneficiaryDistributionRepository distributionRepository,
                            UserRepository userRepository,
                            DeliveryRepository deliveryRepository,
                            LocationRepository locationRepository) {
        this.donationRepository = donationRepository;
        this.distributionRepository = distributionRepository;
        this.userRepository = userRepository;
        this.deliveryRepository = deliveryRepository;
        this.locationRepository = locationRepository;
    }

    private static boolean isRescued(Donation d) {
        return d.getStatus() != null && RESCUED_STATES.contains(d.getStatus().toUpperCase());
    }

    public AnalyticsSummaryDto getAnalyticsSummary() {
        AnalyticsSummaryDto dto = new AnalyticsSummaryDto();

        List<Donation> rescued = donationRepository.findAll().stream().filter(AnalyticsService::isRescued).toList();
        double totalRescuedKg = rescued.stream().mapToDouble(Donation::getQuantityKg).sum();

        long meals = Math.round(totalRescuedKg * MEALS_PER_KG);
        long peopleFed = distributionRepository.getTotalPeopleFed();
        if (peopleFed == 0) peopleFed = meals;

        dto.setTotalFoodRescuedKg(round1(totalRescuedKg));
        dto.setTotalMealsDistributed(meals);
        dto.setTotalPeopleFed(peopleFed);
        dto.setCo2EmissionsSavedKg(round1(totalRescuedKg * CO2_KG_PER_KG_FOOD));
        dto.setFinancialValueInr(Math.round(totalRescuedKg * INR_PER_KG));

        dto.setActiveDonorsCount(userRepository.findByRole("DONOR").size());
        dto.setRegisteredNgosCount(userRepository.findByRole("NGO").size());
        dto.setActiveVolunteersCount(userRepository.findByRole("VOLUNTEER").size());

        List<Delivery> finished = deliveryRepository.findAll().stream()
                .filter(del -> del.getStatus() != null && FINISHED_DELIVERY_STATES.contains(del.getStatus().toUpperCase()))
                .toList();
        dto.setCompletedDeliveriesCount(finished.size());

        // Category breakdown over the SAME rescued set, so the percentages always add up to 100.
        // Totals are accumulated in our own hash table (separate chaining, O(1) average put/get).
        CustomHashTable<String, Double> kgByCategory = new CustomHashTable<>();
        kgByCategory.setRecordSteps(false); // step recording is only for the DSA Laboratory animations
        List<String> categoryNames = new ArrayList<>();
        for (Donation d : rescued) {
            String cat = d.getCategory() != null ? d.getCategory().getName() : "Uncategorised";
            if (!kgByCategory.containsKey(cat)) {
                categoryNames.add(cat);
                kgByCategory.put(cat, 0.0);
            }
            kgByCategory.put(cat, kgByCategory.get(cat) + d.getQuantityKg());
        }
        List<AnalyticsSummaryDto.CategoryStatDto> catList = new ArrayList<>();
        for (String cat : categoryNames) {
            double kg = kgByCategory.get(cat);
            int pct = totalRescuedKg > 0 ? (int) Math.round(kg * 100.0 / totalRescuedKg) : 0;
            catList.add(new AnalyticsSummaryDto.CategoryStatDto(cat, round1(kg), pct));
        }
        catList.sort((a, b) -> Double.compare(b.getQuantityKg(), a.getQuantityKg()));
        dto.setRescuedByCategory(catList);

        // Last 7 days, oldest first: kg rescued (by posting date) and deliveries completed (by completion date).
        LocalDate today = LocalDate.now();
        List<AnalyticsSummaryDto.DailyTrendDto> trend = new ArrayList<>();
        for (int back = 6; back >= 0; back--) {
            LocalDate day = today.minusDays(back);
            double kg = rescued.stream()
                    .filter(d -> d.getCreatedAt() != null && d.getCreatedAt().toLocalDate().equals(day))
                    .mapToDouble(Donation::getQuantityKg).sum();
            int deliveries = (int) finished.stream()
                    .filter(del -> del.getCompletionTime() != null && del.getCompletionTime().toLocalDate().equals(day))
                    .count();
            String label = day.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            trend.add(new AnalyticsSummaryDto.DailyTrendDto(label, round1(kg), deliveries));
        }
        dto.setWeeklyTrend(trend);

        dto.setDeliveryZoneCount(countDeliveryZones());
        return dto;
    }

    /**
     * Delivery zones with Disjoint Set Union: every donor/NGO site is a node, and two sites
     * within ZONE_RADIUS_KM are union-ed. The number of disjoint sets left is the number of zones.
     */
    int countDeliveryZones() {
        List<Location> sites = locationRepository.findAll().stream()
                .filter(l -> l.getUser() != null && l.getUser().getRole() != null)
                .filter(l -> "DONOR".equals(l.getUser().getRole()) || "NGO".equals(l.getUser().getRole()))
                .toList();
        if (sites.isEmpty()) return 0;
        DisjointSetUnion dsu = new DisjointSetUnion(sites.size());
        dsu.setRecordSteps(false);
        for (int i = 0; i < sites.size(); i++) {
            for (int j = i + 1; j < sites.size(); j++) {
                Location a = sites.get(i), b = sites.get(j);
                if (GreedyAllocator.haversineDistance(a.getLatitude(), a.getLongitude(), b.getLatitude(), b.getLongitude()) <= ZONE_RADIUS_KM) {
                    dsu.union(i, j);
                }
            }
        }
        return dsu.getComponentCount();
    }

    private static double round1(double v) {
        return Math.round(v * 10.0) / 10.0;
    }
}
