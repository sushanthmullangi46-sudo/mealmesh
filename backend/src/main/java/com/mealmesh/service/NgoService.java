package com.mealmesh.service;

import com.mealmesh.dto.AllocationResponseDto;
import com.mealmesh.dto.DeliveryResponseDto;
import com.mealmesh.dto.NgoProfileResponseDto;
import com.mealmesh.entity.*;
import com.mealmesh.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import com.mealmesh.dsa.greedy.DonationBatch;
import com.mealmesh.dsa.greedy.GreedyAllocator;
import com.mealmesh.dsa.greedy.NgoCandidate;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class NgoService {

    private final NgoProfileRepository ngoProfileRepository;
    private final AllocationRepository allocationRepository;
    private final DonationRepository donationRepository;
    private final DeliveryRepository deliveryRepository;
    private final VolunteerProfileRepository volunteerProfileRepository;
    private final LocationRepository locationRepository;
    private final AuditLogRepository auditLogRepository;

    public NgoService(NgoProfileRepository ngoProfileRepository,
                      AllocationRepository allocationRepository,
                      DonationRepository donationRepository,
                      DeliveryRepository deliveryRepository,
                      VolunteerProfileRepository volunteerProfileRepository,
                      LocationRepository locationRepository,
                      AuditLogRepository auditLogRepository) {
        this.ngoProfileRepository = ngoProfileRepository;
        this.allocationRepository = allocationRepository;
        this.donationRepository = donationRepository;
        this.deliveryRepository = deliveryRepository;
        this.volunteerProfileRepository = volunteerProfileRepository;
        this.locationRepository = locationRepository;
        this.auditLogRepository = auditLogRepository;
    }

    public NgoProfileResponseDto getNgoProfile(String userEmail) {
        NgoProfile ngo = ngoProfileRepository.findByUserEmail(userEmail)
                .orElseGet(() -> ngoProfileRepository.findAll().stream().findFirst().orElse(null));
        return NgoProfileResponseDto.fromEntity(ngo);
    }

    @Transactional
    public NgoProfileResponseDto updateStorageCapacity(String userEmail, double currentKg, double maxKg) {
        NgoProfile ngo = ngoProfileRepository.findByUserEmail(userEmail)
                .orElseGet(() -> ngoProfileRepository.findAll().stream().findFirst().orElse(null));
        if (ngo != null) {
            ngo.setCurrentStorageCapacityKg(Math.max(0, currentKg));
            ngo.setMaxStorageCapacityKg(Math.max(10, maxKg));
            NgoProfile saved = ngoProfileRepository.save(ngo);
            return NgoProfileResponseDto.fromEntity(saved);
        }
        return null;
    }

    public List<AllocationResponseDto> getAllocationsForNgo(String userEmail) {
        NgoProfile ngo = ngoProfileRepository.findByUserEmail(userEmail)
                .orElseGet(() -> ngoProfileRepository.findAll().stream().findFirst().orElse(null));
        UUID userId = (ngo != null && ngo.getUser() != null) ? ngo.getUser().getId() : null;
        List<Allocation> list = allocationRepository.findByNgoUserId(userId);
        if (list.isEmpty()) {
            list = allocationRepository.findAll();
        }
        return list.stream().map(AllocationResponseDto::fromEntity).collect(Collectors.toList());
    }

    @Transactional
    public DeliveryResponseDto claimDonationForNgo(String userEmail, UUID donationId) {
        NgoProfile ngo = ngoProfileRepository.findByUserEmail(userEmail)
                .orElseGet(() -> ngoProfileRepository.findAll().stream().findFirst()
                        .orElseThrow(() -> new IllegalArgumentException("No NGO profile found in system")));

        Donation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> new IllegalArgumentException("Donation not found: " + donationId));

        // A batch can be claimed only once, and only before it expires.
        if (!"AVAILABLE".equalsIgnoreCase(donation.getStatus())) {
            throw new IllegalStateException("This batch has already been claimed (status: " + donation.getStatus() + ")");
        }
        if (donation.getExpiryTime() != null && donation.getExpiryTime().isBefore(LocalDateTime.now())) {
            throw new IllegalStateException("This batch has expired and can no longer be claimed");
        }

        double claimQty = donation.getQuantityKg();
        double availableCap = Math.max(0, ngo.getMaxStorageCapacityKg() - ngo.getCurrentStorageCapacityKg());
        if (availableCap < claimQty) {
            if (availableCap <= 0) {
                throw new IllegalStateException("Storage capacity full (" + ngo.getMaxStorageCapacityKg() + " kg)");
            }
            claimQty = availableCap;
        }

        double pLat = donation.getLocation() != null ? donation.getLocation().getLatitude() : 12.9352;
        double pLon = donation.getLocation() != null ? donation.getLocation().getLongitude() : 77.6245;

        Location ngoLoc = locationRepository.findFirstByUserIdAndIsPrimaryTrue(ngo.getUser() != null ? ngo.getUser().getId() : null).orElse(null);
        double dLat = ngoLoc != null ? ngoLoc.getLatitude() : 12.9121;
        double dLon = ngoLoc != null ? ngoLoc.getLongitude() : 77.6446;

        // Score this NGO with the same multi-criteria greedy formula used for automatic matching.
        long hoursLeft = donation.getExpiryTime() != null
                ? Math.max(0, java.time.Duration.between(LocalDateTime.now(), donation.getExpiryTime()).toHours()) : 4;
        DonationBatch batch = new DonationBatch(donation.getId().toString(), donation.getTitle(), donation.getQuantityKg(),
                pLat, pLon, hoursLeft, donation.getDietaryType(), donation.getUrgency());
        List<String> prefs = ngo.getDietaryPreferences() != null
                ? Arrays.asList(ngo.getDietaryPreferences().split(",")) : List.of("ALL");
        NgoCandidate candidate = new NgoCandidate(ngo.getId().toString(), ngo.getOrganizationName(), dLat, dLon,
                ngo.getCurrentStorageCapacityKg(), ngo.getMaxStorageCapacityKg(), prefs);
        GreedyAllocator.AllocationResult scored = GreedyAllocator.allocate(batch, List.of(candidate));
        double matchScore = scored.getAllocations().isEmpty() ? candidate.getCompositeScore()
                : scored.getAllocations().get(0).getScore();

        // Update NGO storage
        ngo.setCurrentStorageCapacityKg(ngo.getCurrentStorageCapacityKg() + claimQty);
        ngoProfileRepository.save(ngo);

        // Update donation status
        donation.setStatus("RESERVED");
        donationRepository.save(donation);

        // Create Allocation
        Allocation allocation = new Allocation();
        allocation.setDonation(donation);
        allocation.setNgo(ngo);
        allocation.setAllocatedQuantityKg(claimQty);
        allocation.setStatus("ACCEPTED");
        allocation.setMatchScore(matchScore);
        allocation.setMatchedAt(LocalDateTime.now());
        allocation = allocationRepository.save(allocation);

        // Greedy nearest-neighbour choice: the available volunteer closest to the pickup point.
        VolunteerProfile volunteer = volunteerProfileRepository.findAll().stream()
                .filter(VolunteerProfile::isAvailable)
                .filter(v -> v.getCurrentLatitude() != null && v.getCurrentLongitude() != null)
                .min(Comparator.comparingDouble(v -> GreedyAllocator.haversineDistance(
                        pLat, pLon, v.getCurrentLatitude(), v.getCurrentLongitude())))
                .orElseGet(() -> volunteerProfileRepository.findAll().stream().findFirst().orElse(null));

        Delivery delivery = new Delivery();
        delivery.setAllocation(allocation);
        delivery.setVolunteer(volunteer);
        delivery.setStatus("ASSIGNED");
        delivery.setPickupLatitude(pLat);
        delivery.setPickupLongitude(pLon);
        delivery.setDropoffLatitude(dLat);
        delivery.setDropoffLongitude(dLon);

        double distKm = Math.max(0.5, Math.round(GreedyAllocator.haversineDistance(pLat, pLon, dLat, dLon) * 10.0) / 10.0);
        delivery.setEstimatedDistanceKm(distKm);
        delivery.setEstimatedTimeMinutes(Math.max(5, Math.round(distKm * 3.2))); // ~19 km/h city two-wheeler speed
        delivery.setStartTime(LocalDateTime.now());
        delivery.setNotes("Claimed by " + ngo.getOrganizationName() + " (" + claimQty + " kg)");
        Delivery savedDelivery = deliveryRepository.save(delivery);

        // Audit Log
        AuditLog audit = new AuditLog();
        if (ngo.getUser() != null) audit.setUser(ngo.getUser());
        audit.setAction("NGO_CLAIM_DONATION");
        audit.setEntityType("DELIVERY");
        audit.setEntityId(savedDelivery.getId());
        audit.setDetails("NGO " + ngo.getOrganizationName() + " claimed " + claimQty + " kg. Delivery mission " + savedDelivery.getId() + " assigned to volunteer.");
        auditLogRepository.save(audit);

        return DeliveryResponseDto.fromEntity(savedDelivery);
    }
}
