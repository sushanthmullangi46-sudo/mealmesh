package com.mealmesh.matching;

import com.mealmesh.dsa.greedy.DonationBatch;
import com.mealmesh.dsa.greedy.GreedyAllocator;
import com.mealmesh.dsa.greedy.NgoCandidate;
import com.mealmesh.dto.MatchingResultDto;
import com.mealmesh.entity.*;
import com.mealmesh.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class MatchingService {

    private final DonationRepository donationRepository;
    private final NgoProfileRepository ngoProfileRepository;
    private final LocationRepository locationRepository;
    private final AllocationRepository allocationRepository;
    private final AuditLogRepository auditLogRepository;
    private final NotificationRepository notificationRepository;
    private final DeliveryRepository deliveryRepository;
    private final VolunteerProfileRepository volunteerProfileRepository;

    public MatchingService(DonationRepository donationRepository,
                           NgoProfileRepository ngoProfileRepository,
                           LocationRepository locationRepository,
                           AllocationRepository allocationRepository,
                           AuditLogRepository auditLogRepository,
                           NotificationRepository notificationRepository,
                           DeliveryRepository deliveryRepository,
                           VolunteerProfileRepository volunteerProfileRepository) {
        this.donationRepository = donationRepository;
        this.ngoProfileRepository = ngoProfileRepository;
        this.locationRepository = locationRepository;
        this.allocationRepository = allocationRepository;
        this.auditLogRepository = auditLogRepository;
        this.notificationRepository = notificationRepository;
        this.deliveryRepository = deliveryRepository;
        this.volunteerProfileRepository = volunteerProfileRepository;
    }

    @Transactional
    public MatchingResultDto matchAndAllocateDonation(UUID donationId) {
        Donation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> new IllegalArgumentException("Donation not found: " + donationId));

        if (!"AVAILABLE".equalsIgnoreCase(donation.getStatus())) {
            throw new IllegalStateException("Donation status is " + donation.getStatus() + "; must be AVAILABLE to match.");
        }

        // Fetch candidate NGOs
        List<NgoProfile> verifiedNgos = ngoProfileRepository.findByIsVerifiedTrue();
        if (verifiedNgos.isEmpty()) {
            verifiedNgos = ngoProfileRepository.findAll();
        }
        List<NgoCandidate> candidates = new ArrayList<>();

        for (NgoProfile ngo : verifiedNgos) {
            Location ngoLoc = locationRepository.findFirstByUserIdAndIsPrimaryTrue(ngo.getUser() != null ? ngo.getUser().getId() : null)
                    .orElse(null);
            double lat = ngoLoc != null ? ngoLoc.getLatitude() : 12.9121;
            double lon = ngoLoc != null ? ngoLoc.getLongitude() : 77.6446;

            List<String> prefs = new ArrayList<>();
            if (ngo.getDietaryPreferences() != null) {
                prefs.addAll(Arrays.asList(ngo.getDietaryPreferences().split(",")));
            }

            candidates.add(new NgoCandidate(
                    ngo.getId().toString(),
                    ngo.getOrganizationName(),
                    lat,
                    lon,
                    ngo.getCurrentStorageCapacityKg(),
                    ngo.getMaxStorageCapacityKg(),
                    prefs
            ));
        }

        double donorLat = donation.getLocation() != null ? donation.getLocation().getLatitude() : 12.9352;
        double donorLon = donation.getLocation() != null ? donation.getLocation().getLongitude() : 77.6245;
        long hoursRemaining = Math.max(1, Duration.between(LocalDateTime.now(), donation.getExpiryTime()).toHours());

        DonationBatch batch = new DonationBatch(
                donation.getId().toString(),
                donation.getTitle(),
                donation.getQuantityKg(),
                donorLat,
                donorLon,
                hoursRemaining,
                donation.getDietaryType(),
                donation.getUrgency()
        );

        // Run multi-criteria greedy allocation
        GreedyAllocator.AllocationResult allocResult = GreedyAllocator.allocate(batch, candidates);

        List<MatchingResultDto.MatchedNgoDto> matchedDtos = new ArrayList<>();

        for (GreedyAllocator.NgoAllocationItem item : allocResult.getAllocations()) {
            UUID ngoId = UUID.fromString(item.getNgoId());
            NgoProfile ngo = ngoProfileRepository.findById(ngoId).orElse(null);
            if (ngo != null) {
                // Update NGO current storage
                ngo.setCurrentStorageCapacityKg(ngo.getCurrentStorageCapacityKg() + item.getAllocatedKg());
                ngoProfileRepository.save(ngo);

                // Create Allocation record
                Allocation allocation = new Allocation();
                allocation.setDonation(donation);
                allocation.setNgo(ngo);
                allocation.setAllocatedQuantityKg(item.getAllocatedKg());
                allocation.setStatus("ACCEPTED");
                allocation.setMatchScore(item.getScore());
                allocation.setMatchedAt(LocalDateTime.now());
                allocation = allocationRepository.save(allocation);

                // Create Volunteer Delivery Mission so it appears in Volunteer Portal!
                VolunteerProfile volunteer = volunteerProfileRepository.findAll().stream()
                        .filter(VolunteerProfile::isAvailable)
                        .findFirst()
                        .orElseGet(() -> volunteerProfileRepository.findAll().stream().findFirst().orElse(null));

                Location ngoLoc = locationRepository.findFirstByUserIdAndIsPrimaryTrue(ngo.getUser() != null ? ngo.getUser().getId() : null).orElse(null);
                double dLat = ngoLoc != null ? ngoLoc.getLatitude() : 12.9121;
                double dLon = ngoLoc != null ? ngoLoc.getLongitude() : 77.6446;

                Delivery delivery = new Delivery();
                delivery.setAllocation(allocation);
                delivery.setVolunteer(volunteer);
                delivery.setStatus("ASSIGNED");
                delivery.setPickupLatitude(donorLat);
                delivery.setPickupLongitude(donorLon);
                delivery.setDropoffLatitude(dLat);
                delivery.setDropoffLongitude(dLon);

                double distKm = Math.max(1.5, Math.round(item.getDistanceKm() * 10.0) / 10.0);
                delivery.setEstimatedDistanceKm(distKm);
                delivery.setEstimatedTimeMinutes(Math.max(5, Math.round(distKm * 3.2)));
                delivery.setStartTime(LocalDateTime.now());
                delivery.setNotes("Assigned via Greedy Matching: " + donation.getTitle() + " to " + ngo.getOrganizationName());
                deliveryRepository.save(delivery);

                // Notify NGO
                Notification notif = new Notification();
                if (ngo.getUser() != null) notif.setUser(ngo.getUser());
                notif.setTitle("Surplus Food Match: " + donation.getTitle());
                notif.setMessage(String.format(Locale.US, "Matched %.1f kg from %s (Proximity: %.1f km, Match Score: %.1f). Delivery mission dispatched.",
                        item.getAllocatedKg(), donation.getDonor() != null ? donation.getDonor().getOrganizationName() : "Donor Kitchen", item.getDistanceKm(), item.getScore()));
                notif.setType("ALLOCATION_PROPOSED");
                notificationRepository.save(notif);

                matchedDtos.add(new MatchingResultDto.MatchedNgoDto(
                        item.getNgoId(),
                        item.getNgoName(),
                        item.getAllocatedKg(),
                        item.getScore(),
                        item.getDistanceKm(),
                        String.format(Locale.US, "Allocated %.1f kg (Distance: %.1f km, Score: %.1f)", item.getAllocatedKg(), item.getDistanceKm(), item.getScore())
                ));
            }
        }

        if (!matchedDtos.isEmpty()) {
            donation.setStatus("RESERVED");
            donationRepository.save(donation);

            AuditLog audit = new AuditLog();
            if (donation.getDonor() != null && donation.getDonor().getUser() != null) {
                audit.setUser(donation.getDonor().getUser());
            }
            audit.setAction("GREEDY_ALLOCATION_MATCH");
            audit.setEntityType("DONATION");
            audit.setEntityId(donation.getId());
            audit.setDetails("Allocated " + allocResult.getAllocatedQuantityKg() + " kg across " + matchedDtos.size() + " NGOs. Created volunteer transport missions.");
            auditLogRepository.save(audit);
        }

        return new MatchingResultDto(
                donation.getId().toString(),
                donation.getTitle(),
                allocResult.getOriginalQuantityKg(),
                allocResult.getAllocatedQuantityKg(),
                allocResult.getRemainingQuantityKg(),
                matchedDtos
        );
    }
}
