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
                .orElseThrow(() -> new IllegalArgumentException("No donor profile found for " + userEmail));

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
    public List<DonationResponseDto> getPrioritizedActiveDonations() {
        List<Donation> activeList = donationRepository.findAvailableActiveDonations(LocalDateTime.now());
        if (activeList.isEmpty()) {
            activeList = donationRepository.findByStatus("AVAILABLE");
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
