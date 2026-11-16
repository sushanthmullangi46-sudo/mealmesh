package com.mealmesh.service;

import com.mealmesh.dsa.heap.HeapItem;
import com.mealmesh.dsa.heap.MinHeap;
import com.mealmesh.dsa.linkedlist.DoublyLinkedList;
import com.mealmesh.dto.DonationRequestDto;
import com.mealmesh.dto.DonationResponseDto;
import com.mealmesh.entity.*;
import com.mealmesh.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class DonationService {

    private final DonationRepository donationRepository;
    private final DonorProfileRepository donorProfileRepository;
    private final FoodCategoryRepository categoryRepository;
    private final LocationRepository locationRepository;
    private final AuditLogRepository auditLogRepository;
    private final NotificationRepository notificationRepository;

    public DonationService(DonationRepository donationRepository,
                           DonorProfileRepository donorProfileRepository,
                           FoodCategoryRepository categoryRepository,
                           LocationRepository locationRepository,
                           AuditLogRepository auditLogRepository,
                           NotificationRepository notificationRepository) {
        this.donationRepository = donationRepository;
        this.donorProfileRepository = donorProfileRepository;
        this.categoryRepository = categoryRepository;
        this.locationRepository = locationRepository;
        this.auditLogRepository = auditLogRepository;
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    public DonationResponseDto createDonation(String userEmail, DonationRequestDto dto) {
        DonorProfile donor = donorProfileRepository.findByUserEmail(userEmail)
                .orElseGet(() -> donorProfileRepository.findAll().stream().findFirst()
                        .orElseThrow(() -> new IllegalArgumentException("No donor profile found for " + userEmail)));

        FoodCategory category = categoryRepository.findByNameIgnoreCase(dto.getCategoryName() != null ? dto.getCategoryName() : "Cooked Meals")
                .orElseGet(() -> categoryRepository.findAll().stream().findFirst()
                        .orElseThrow(() -> new IllegalStateException("No food categories configured")));

        Location location = locationRepository.findFirstByUserIdAndIsPrimaryTrue(donor.getUser().getId())
                .orElseGet(() -> {
                    Location newLoc = new Location();
                    newLoc.setUser(donor.getUser());
                    newLoc.setName(donor.getOrganizationName() + " Kitchen");
                    newLoc.setAddressLine(dto.getAddressLine() != null ? dto.getAddressLine() : "Koramangala, Bengaluru");
                    newLoc.setLatitude(dto.getLatitude() != null ? dto.getLatitude() : 12.9352);
                    newLoc.setLongitude(dto.getLongitude() != null ? dto.getLongitude() : 77.6245);
                    return locationRepository.save(newLoc);
                });

        Donation donation = new Donation();
        donation.setDonor(donor);
        donation.setCategory(category);
        donation.setLocation(location);
        donation.setTitle(dto.getTitle());
        donation.setDescription(dto.getDescription());
        donation.setFoodType(dto.getFoodType() != null ? dto.getFoodType() : "COOKED");
        donation.setDietaryType(dto.getDietaryType() != null ? dto.getDietaryType() : "VEG");
        donation.setQuantityKg(dto.getQuantityKg() > 0 ? dto.getQuantityKg() : 25.0);
        donation.setServings(dto.getServings() > 0 ? dto.getServings() : (int)(donation.getQuantityKg() * 2.5));
        donation.setCookedTime(LocalDateTime.now().minusHours(1));

        int hours = dto.getHoursUntilExpiry() > 0 ? dto.getHoursUntilExpiry() : 4;
        donation.setExpiryTime(LocalDateTime.now().plusHours(hours));

        String urgency = hours <= 2 ? "CRITICAL" : (hours <= 4 ? "HIGH" : "MEDIUM");
        donation.setUrgency(dto.getUrgency() != null ? dto.getUrgency() : urgency);
        donation.setStatus("AVAILABLE");
        donation.setStorageTemperatureCelsius(dto.getStorageTemperatureCelsius() != null ? dto.getStorageTemperatureCelsius() : 65.0);
        donation.setAllergenInfo(dto.getAllergenInfo() != null ? dto.getAllergenInfo() : "Contains Gluten/Dairy");
        donation.setPickupInstructions(dto.getPickupInstructions() != null ? dto.getPickupInstructions() : "Collect from dispatch counter");

        donation = donationRepository.save(donation);

        // Audit log
        AuditLog audit = new AuditLog();
        audit.setUser(donor.getUser());
        audit.setAction("POST_DONATION");
        audit.setEntityType("DONATION");
        audit.setEntityId(donation.getId());
        audit.setDetails("Registered " + donation.getQuantityKg() + " kg surplus: " + donation.getTitle());
        auditLogRepository.save(audit);

        return mapToDto(donation);
    }

    /**
     * Retrieves all active available donations ordered strictly by custom MinHeap
     * based on time remaining until expiry.
     */
    @Transactional
    public List<DonationResponseDto> getPrioritizedActiveDonations() {
        List<Donation> activeList = donationRepository.findAvailableActiveDonations(LocalDateTime.now());
        if (activeList.isEmpty()) {
            activeList = donationRepository.findByStatus("AVAILABLE");
        }
        if (activeList.isEmpty()) {
            ensureFreshSurplusDonations();
            activeList = donationRepository.findAvailableActiveDonations(LocalDateTime.now());
            if (activeList.isEmpty()) {
                activeList = donationRepository.findByStatus("AVAILABLE");
            }
        }

        MinHeap<Donation> minHeap = new MinHeap<>(false);
        for (Donation d : activeList) {
            long secondsRemaining = Math.max(0, Duration.between(LocalDateTime.now(), d.getExpiryTime()).getSeconds());
            double urgencyWeight = switch (d.getUrgency().toUpperCase()) {
                case "CRITICAL" -> 0.5;
                case "HIGH" -> 0.75;
                case "MEDIUM" -> 1.0;
                default -> 1.25;
            };
            double priorityKey = secondsRemaining * urgencyWeight;
            minHeap.insert(new HeapItem<>(d.getId().toString(), priorityKey, d.getTitle(), d.getUrgency(), d));
        }

        List<DonationResponseDto> result = new ArrayList<>();
        while (!minHeap.isEmpty()) {
            HeapItem<Donation> item = minHeap.extractMin();
            result.add(mapToDto(item.getPayload()));
        }
        return result;
    }

    @Transactional
    public synchronized void ensureFreshSurplusDonations() {
        DonorProfile donor1 = donorProfileRepository.findAll().stream().findFirst().orElse(null);
        if (donor1 == null) return;

        FoodCategory catCooked = categoryRepository.findByNameIgnoreCase("Cooked Meals")
                .orElseGet(() -> categoryRepository.findAll().stream().findFirst().orElse(null));
        FoodCategory catBakery = categoryRepository.findByNameIgnoreCase("Bakery Items")
                .orElse(catCooked);

        Location loc1 = locationRepository.findAll().stream().findFirst().orElse(null);

        // 1. Basmati Veg Biryani
        Donation d1 = new Donation();
        d1.setDonor(donor1);
        d1.setCategory(catCooked);
        d1.setLocation(loc1);
        d1.setTitle("Basmati Veg Biryani with Paneer Butter Masala");
        d1.setDescription("Wholesome hot lunch buffet surplus, stored in insulated warm containers.");
        d1.setFoodType("COOKED");
        d1.setDietaryType("VEG");
        d1.setQuantityKg(35.0);
        d1.setServings(90);
        d1.setCookedTime(LocalDateTime.now().minusHours(1));
        d1.setExpiryTime(LocalDateTime.now().plusHours(4));
        d1.setUrgency("HIGH");
        d1.setStatus("AVAILABLE");
        d1.setStorageTemperatureCelsius(65.0);
        d1.setAllergenInfo("Contains Dairy, Nuts");
        d1.setPickupInstructions("Collect from kitchen rear dispatch counter");
        donationRepository.save(d1);

        // 2. South Indian Sambar & Rice
        Donation d2 = new Donation();
        d2.setDonor(donor1);
        d2.setCategory(catCooked);
        d2.setLocation(loc1);
        d2.setTitle("South Indian Sambar, Rice & Vegetable Poriyal");
        d2.setDescription("Freshly cooked meals packed in food-grade insulated vessels.");
        d2.setFoodType("COOKED");
        d2.setDietaryType("VEG");
        d2.setQuantityKg(25.0);
        d2.setServings(65);
        d2.setCookedTime(LocalDateTime.now().minusHours(1));
        d2.setExpiryTime(LocalDateTime.now().plusHours(2));
        d2.setUrgency("CRITICAL");
        d2.setStatus("AVAILABLE");
        d2.setStorageTemperatureCelsius(68.0);
        d2.setAllergenInfo("None");
        d2.setPickupInstructions("Collect from Gate 2 banquet ramp");
        donationRepository.save(d2);

        // 3. Fresh Artisanal Breads & Rolls
        Donation d3 = new Donation();
        d3.setDonor(donor1);
        d3.setCategory(catBakery);
        d3.setLocation(loc1);
        d3.setTitle("Fresh Multigrain Sourdough Loaves & Buns");
        d3.setDescription("Freshly baked bakery items in sealed hygienic packets.");
        d3.setFoodType("PACKAGED");
        d3.setDietaryType("VEG");
        d3.setQuantityKg(20.0);
        d3.setServings(50);
        d3.setCookedTime(LocalDateTime.now().minusHours(2));
        d3.setExpiryTime(LocalDateTime.now().plusHours(6));
        d3.setUrgency("HIGH");
        d3.setStatus("AVAILABLE");
        d3.setStorageTemperatureCelsius(24.0);
        d3.setAllergenInfo("Contains Gluten");
        d3.setPickupInstructions("Collect from storefront bakery display counter");
        donationRepository.save(d3);

        // 4. Chapathi with Dal Tadka
        Donation d4 = new Donation();
        d4.setDonor(donor1);
        d4.setCategory(catCooked);
        d4.setLocation(loc1);
        d4.setTitle("Soft Wheat Chapathi with Dal Tadka & Jeera Rice");
        d4.setDescription("Nutritious warm surplus, perfect for community shelter distribution.");
        d4.setFoodType("COOKED");
        d4.setDietaryType("VEG");
        d4.setQuantityKg(30.0);
        d4.setServings(75);
        d4.setCookedTime(LocalDateTime.now().minusMinutes(45));
        d4.setExpiryTime(LocalDateTime.now().plusHours(5));
        d4.setUrgency("HIGH");
        d4.setStatus("AVAILABLE");
        d4.setStorageTemperatureCelsius(62.0);
        d4.setAllergenInfo("Contains Gluten");
        d4.setPickupInstructions("Collect from central commissary loading dock");
        donationRepository.save(d4);

        // 5. Fresh Idli & Medu Vada
        Donation d5 = new Donation();
        d5.setDonor(donor1);
        d5.setCategory(catCooked);
        d5.setLocation(loc1);
        d5.setTitle("Hot Steamed Idli & Medu Vada with Coconut Chutney");
        d5.setDescription("Fresh breakfast batch, ready for immediate distribution.");
        d5.setFoodType("COOKED");
        d5.setDietaryType("VEG");
        d5.setQuantityKg(18.0);
        d5.setServings(50);
        d5.setCookedTime(LocalDateTime.now().minusMinutes(30));
        d5.setExpiryTime(LocalDateTime.now().plusHours(2));
        d5.setUrgency("CRITICAL");
        d5.setStatus("AVAILABLE");
        d5.setStorageTemperatureCelsius(66.0);
        d5.setAllergenInfo("Contains Dairy");
        d5.setPickupInstructions("Collect from quick-service dispatch counter");
        donationRepository.save(d5);

        // 6. Fragrant Vegetable Pulao
        Donation d6 = new Donation();
        d6.setDonor(donor1);
        d6.setCategory(catCooked);
        d6.setLocation(loc1);
        d6.setTitle("Fragrant Vegetable Pulao with Cucumber Raita");
        d6.setDescription("Mildly spiced wholesome rice dish suitable for all beneficiaries.");
        d6.setFoodType("COOKED");
        d6.setDietaryType("VEG");
        d6.setQuantityKg(40.0);
        d6.setServings(100);
        d6.setCookedTime(LocalDateTime.now().minusHours(1));
        d6.setExpiryTime(LocalDateTime.now().plusHours(4));
        d6.setUrgency("HIGH");
        d6.setStatus("AVAILABLE");
        d6.setStorageTemperatureCelsius(64.0);
        d6.setAllergenInfo("Contains Dairy");
        d6.setPickupInstructions("Collect from main kitchen dispatch counter");
        donationRepository.save(d6);
    }

    public List<DonationResponseDto> getDonationsByDonor(String userEmail) {
        List<Donation> list = donationRepository.findByDonorUserEmail(userEmail);

        // Doubly linked list demonstration for chronological history
        DoublyLinkedList<Donation> historyList = new DoublyLinkedList<>();
        for (Donation d : list) {
            historyList.addLast(d);
        }

        List<DonationResponseDto> result = new ArrayList<>();
        for (Donation d : historyList.toList()) {
            result.add(mapToDto(d));
        }
        return result;
    }

    public List<DonationResponseDto> getAllRecentDonations() {
        return donationRepository.findTop20ByOrderByCreatedAtDesc().stream()
                .map(this::mapToDto)
                .toList();
    }

    public DonationResponseDto getDonationById(UUID id) {
        Donation d = donationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Donation not found: " + id));
        return mapToDto(d);
    }

    private DonationResponseDto mapToDto(Donation d) {
        DonationResponseDto dto = new DonationResponseDto();
        dto.setId(d.getId());
        dto.setTitle(d.getTitle());
        dto.setDescription(d.getDescription());
        dto.setCategoryName(d.getCategory() != null ? d.getCategory().getName() : "General");
        dto.setFoodType(d.getFoodType());
        dto.setDietaryType(d.getDietaryType());
        dto.setQuantityKg(d.getQuantityKg());
        dto.setServings(d.getServings());
        dto.setCookedTime(d.getCookedTime());
        dto.setExpiryTime(d.getExpiryTime());

        long minutesRemaining = Duration.between(LocalDateTime.now(), d.getExpiryTime()).toMinutes();
        dto.setMinutesRemaining(Math.max(0, minutesRemaining));

        dto.setUrgency(d.getUrgency());
        dto.setStatus(d.getStatus());
        dto.setStorageTemperatureCelsius(d.getStorageTemperatureCelsius());
        dto.setAllergenInfo(d.getAllergenInfo());
        dto.setPickupInstructions(d.getPickupInstructions());

        if (d.getDonor() != null) {
            dto.setDonorName(d.getDonor().getUser() != null ? d.getDonor().getUser().getFullName() : "Donor");
            dto.setDonorOrganization(d.getDonor().getOrganizationName());
            dto.setDonorPhone(d.getDonor().getUser() != null ? d.getDonor().getUser().getPhone() : "+91 98450 11001");
        }

        if (d.getLocation() != null) {
            dto.setLocationName(d.getLocation().getName());
            dto.setAddressLine(d.getLocation().getAddressLine());
            dto.setLatitude(d.getLocation().getLatitude());
            dto.setLongitude(d.getLocation().getLongitude());
        } else {
            dto.setLocationName("Bengaluru Depot");
            dto.setAddressLine("Central Kitchen");
            dto.setLatitude(12.9716);
            dto.setLongitude(77.5946);
        }

        dto.setCreatedAt(d.getCreatedAt());
        return dto;
    }
}
