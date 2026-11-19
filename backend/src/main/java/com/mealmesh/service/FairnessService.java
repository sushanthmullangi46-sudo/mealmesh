package com.mealmesh.service;

import com.mealmesh.dsa.fairness.FairnessAllocator;
import com.mealmesh.dto.ApiResponse;
import com.mealmesh.entity.*;
import com.mealmesh.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;

@Service
@Transactional
public class FairnessService {

    private final NgoProfileRepository ngoProfileRepository;
    private final DonationRepository donationRepository;
    private final AllocationRepository allocationRepository;
    private final DeliveryRepository deliveryRepository;
    private final VolunteerProfileRepository volunteerProfileRepository;
    private final LocationRepository locationRepository;
    private final AuditLogRepository auditLogRepository;
    private final HandoffRecordRepository handoffRecordRepository;

    public FairnessService(NgoProfileRepository ngoProfileRepository,
                           DonationRepository donationRepository,
                           AllocationRepository allocationRepository,
                           DeliveryRepository deliveryRepository,
                           VolunteerProfileRepository volunteerProfileRepository,
                           LocationRepository locationRepository,
                           AuditLogRepository auditLogRepository,
                           HandoffRecordRepository handoffRecordRepository) {
        this.ngoProfileRepository = ngoProfileRepository;
        this.donationRepository = donationRepository;
        this.allocationRepository = allocationRepository;
        this.deliveryRepository = deliveryRepository;
        this.volunteerProfileRepository = volunteerProfileRepository;
        this.locationRepository = locationRepository;
        this.auditLogRepository = auditLogRepository;
        this.handoffRecordRepository = handoffRecordRepository;
    }

    public List<Map<String, Object>> getNgoFairnessProfiles() {
        List<NgoProfile> ngos = ngoProfileRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();
        for (NgoProfile ngo : ngos) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", ngo.getId());
            map.put("organizationName", ngo.getOrganizationName());
            map.put("vulnerabilityIndex", ngo.getVulnerabilityIndex());
            map.put("targetBeneficiaryGroup", ngo.getTargetBeneficiaryGroup());
            map.put("dailyDeficitKg", ngo.getDailyDeficitKg());
            map.put("daysSinceLastServed", ngo.getDaysSinceLastServed());
            map.put("currentStorageCapacityKg", ngo.getCurrentStorageCapacityKg());
            map.put("maxStorageCapacityKg", ngo.getMaxStorageCapacityKg());
            map.put("availableCapacityKg", ngo.getAvailableCapacityKg());
            map.put("beneficiaryCount", ngo.getBeneficiaryCount());
            result.add(map);
        }
        return result;
    }

    public NgoProfile updateNgoFairnessProfile(UUID ngoId, int vulnerabilityIndex,
                                               String targetGroup, double dailyDeficitKg) {
        NgoProfile ngo = (ngoId != null) ? ngoProfileRepository.findById(ngoId).orElse(null) : null;
        if (ngo == null) {
            ngo = ngoProfileRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("No NGO profile found to update"));
        }
        ngo.setVulnerabilityIndex(Math.max(1, Math.min(10, vulnerabilityIndex)));
        if (targetGroup != null && !targetGroup.isBlank()) {
            ngo.setTargetBeneficiaryGroup(targetGroup.trim());
        }
        ngo.setDailyDeficitKg(Math.max(0, dailyDeficitKg));
        return ngoProfileRepository.save(ngo);
    }

    public FairnessAllocator.FairnessResult executeFairnessAllocation(UUID donationId) {
        Donation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> new IllegalArgumentException("Donation not found"));

        List<NgoProfile> allNgos = ngoProfileRepository.findAll();
        List<FairnessAllocator.CandidateNgo> candidates = new ArrayList<>();

        for (NgoProfile ngo : allNgos) {
            Location loc = locationRepository.findFirstByUserIdAndIsPrimaryTrue(ngo.getUser() != null ? ngo.getUser().getId() : null)
                    .orElse(null);
            double lat = loc != null ? loc.getLatitude() : 12.9121;
            double lon = loc != null ? loc.getLongitude() : 77.6446;

            List<String> prefs = new ArrayList<>();
            if (ngo.getDietaryPreferences() != null) {
                prefs.addAll(Arrays.asList(ngo.getDietaryPreferences().split(",")));
            }

            candidates.add(new FairnessAllocator.CandidateNgo(
                    ngo.getId().toString(),
                    ngo.getOrganizationName(),
                    lat,
                    lon,
                    ngo.getAvailableCapacityKg(),
                    ngo.getMaxStorageCapacityKg(),
                    ngo.getVulnerabilityIndex(),
                    ngo.getTargetBeneficiaryGroup(),
                    ngo.getDailyDeficitKg(),
                    ngo.getDaysSinceLastServed(),
                    ngo.getHistoricalReceivedKg(),
                    prefs
            ));
        }

        double donorLat = donation.getLocation() != null ? donation.getLocation().getLatitude() : 12.9352;
        double donorLon = donation.getLocation() != null ? donation.getLocation().getLongitude() : 77.6245;
        long hoursRemaining = Math.max(1, Duration.between(LocalDateTime.now(), donation.getExpiryTime()).toHours());

        FairnessAllocator.FairnessResult result = FairnessAllocator.allocate(
                donation.getId().toString(),
                donation.getTitle(),
                donation.getQuantityKg(),
                donorLat,
                donorLon,
                hoursRemaining,
                donation.getUrgency() != null ? donation.getUrgency() : "HIGH",
                candidates
        );

        // Commit allocations, update NGO states, assign delivery missions & handoff tokens
        for (FairnessAllocator.AllocationItem item : result.getAllocations()) {
            UUID ngoId = UUID.fromString(item.getNgoId());
            NgoProfile ngo = ngoProfileRepository.findById(ngoId).orElse(null);
            if (ngo != null) {
                ngo.setCurrentStorageCapacityKg(ngo.getCurrentStorageCapacityKg() + item.getAllocatedKg());
                ngo.setDaysSinceLastServed(0); // reset starvation counter!
                ngo.setHistoricalReceivedKg(ngo.getHistoricalReceivedKg() + item.getAllocatedKg());
                ngoProfileRepository.save(ngo);

                Allocation alloc = new Allocation();
                alloc.setDonation(donation);
                alloc.setNgo(ngo);
                alloc.setAllocatedQuantityKg(item.getAllocatedKg());
                alloc.setStatus("ACCEPTED");
                alloc.setMatchScore(item.getScore());
                alloc.setMatchedAt(LocalDateTime.now());
                alloc.setFairnessExplanation(item.getExplanationReason());
                alloc = allocationRepository.save(alloc);

                VolunteerProfile vol = volunteerProfileRepository.findAll().stream()
                        .filter(VolunteerProfile::isAvailable)
                        .findFirst()
                        .orElseGet(() -> volunteerProfileRepository.findAll().stream().findFirst().orElse(null));

                Location ngoLoc = locationRepository.findFirstByUserIdAndIsPrimaryTrue(ngo.getUser() != null ? ngo.getUser().getId() : null).orElse(null);
                double dLat = ngoLoc != null ? ngoLoc.getLatitude() : 12.9121;
                double dLon = ngoLoc != null ? ngoLoc.getLongitude() : 77.6446;

                Delivery delivery = new Delivery();
                delivery.setAllocation(alloc);
                delivery.setVolunteer(vol);
                delivery.setStatus("ASSIGNED");
                delivery.setPickupLatitude(donorLat);
                delivery.setPickupLongitude(donorLon);
                delivery.setDropoffLatitude(dLat);
                delivery.setDropoffLongitude(dLon);
                double distKm = Math.max(1.5, Math.round(item.getDistanceKm() * 10.0) / 10.0);
                delivery.setEstimatedDistanceKm(distKm);
                delivery.setEstimatedTimeMinutes(Math.max(5, Math.round(distKm * 3.2)));
                delivery.setStartTime(LocalDateTime.now());
                delivery.setNotes("Fairness-Allocated: " + item.getExplanationReason());
                delivery = deliveryRepository.save(delivery);

                // Create cryptographic Handoff record with QR codes for pickup and delivery
                HandoffRecord handoff = new HandoffRecord();
                handoff.setDelivery(delivery);
                handoff.setDonation(donation);
                String randHex = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
                handoff.setPickupCode("MESH-PK-" + randHex);
                handoff.setDeliveryCode("MESH-DL-" + randHex);
                handoff.setMealsServed((int) Math.round(item.getAllocatedKg() * 2.5));
                handoff.setCo2DivertedKg(Math.round(item.getAllocatedKg() * 2.5 * 10.0) / 10.0);
                handoff.setWaterSavedLiters(Math.round(item.getAllocatedKg() * 1050.0));
                handoffRecordRepository.save(handoff);

                // Log audit trail
                AuditLog log = new AuditLog();
                log.setAction("FAIRNESS_ALLOCATION");
                log.setEntityType("ALLOCATION");
                log.setEntityId(alloc.getId());
                log.setDetails(item.getExplanationReason() + " | Gini: " + result.getGiniCoefficientBefore() + " -> " + result.getGiniCoefficientAfter());
                auditLogRepository.save(log);
            }
        }

        if (result.getAllocatedKg() >= donation.getQuantityKg()) {
            donation.setStatus("MATCHED");
            donationRepository.save(donation);
        }

        return result;
    }

    public List<Map<String, Object>> getFairnessAuditTrail() {
        List<Allocation> allocations = allocationRepository.findAll();
        List<Map<String, Object>> trail = new ArrayList<>();
        for (Allocation a : allocations) {
            Map<String, Object> map = new HashMap<>();
            map.put("allocationId", a.getId());
            map.put("donationTitle", a.getDonation() != null ? a.getDonation().getTitle() : "Surplus Meal Batch");
            map.put("ngoName", a.getNgo() != null ? a.getNgo().getOrganizationName() : "Partner Shelter");
            map.put("allocatedKg", a.getAllocatedQuantityKg());
            map.put("matchScore", a.getMatchScore());
            map.put("matchedAt", a.getMatchedAt());
            map.put("explanation", a.getFairnessExplanation() != null ? a.getFairnessExplanation() :
                    "Matched based on composite proximity, urgency, and vulnerability score.");
            map.put("vulnerabilityIndex", a.getNgo() != null ? a.getNgo().getVulnerabilityIndex() : 7);
            map.put("targetBeneficiary", a.getNgo() != null ? a.getNgo().getTargetBeneficiaryGroup() : "Community");
            trail.add(map);
        }
        trail.sort((a, b) -> ((LocalDateTime) b.get("matchedAt")).compareTo((LocalDateTime) a.get("matchedAt")));
        return trail;
    }
}
