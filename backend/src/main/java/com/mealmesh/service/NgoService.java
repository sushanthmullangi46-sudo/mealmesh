package com.mealmesh.service;

import com.mealmesh.dto.AllocationResponseDto;
import com.mealmesh.dto.DeliveryResponseDto;
import com.mealmesh.dto.NgoProfileResponseDto;
import com.mealmesh.entity.*;
import com.mealmesh.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
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

        double claimQty = donation.getQuantityKg();
        double availableCap = Math.max(0, ngo.getMaxStorageCapacityKg() - ngo.getCurrentStorageCapacityKg());
        if (availableCap < claimQty) {
            if (availableCap <= 0) {
                throw new IllegalStateException("Storage capacity full (" + ngo.getMaxStorageCapacityKg() + " kg)");
            }
            claimQty = availableCap;
        }

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
        allocation.setMatchScore(95.0);
        allocation.setMatchedAt(LocalDateTime.now());
        allocation = allocationRepository.save(allocation);

        // Assign Volunteer Delivery
        VolunteerProfile volunteer = volunteerProfileRepository.findAll().stream()
                .filter(VolunteerProfile::isAvailable)
                .findFirst()
                .orElseGet(() -> volunteerProfileRepository.findAll().stream().findFirst().orElse(null));

        double pLat = donation.getLocation() != null ? donation.getLocation().getLatitude() : 12.9352;
        double pLon = donation.getLocation() != null ? donation.getLocation().getLongitude() : 77.6245;

        Location ngoLoc = locationRepository.findFirstByUserIdAndIsPrimaryTrue(ngo.getUser() != null ? ngo.getUser().getId() : null).orElse(null);
        double dLat = ngoLoc != null ? ngoLoc.getLatitude() : 12.9121;
        double dLon = ngoLoc != null ? ngoLoc.getLongitude() : 77.6446;

        Delivery delivery = new Delivery();
        delivery.setAllocation(allocation);
        delivery.setVolunteer(volunteer);
        delivery.setStatus("ASSIGNED");
        delivery.setPickupLatitude(pLat);
        delivery.setPickupLongitude(pLon);
        delivery.setDropoffLatitude(dLat);
        delivery.setDropoffLongitude(dLon);

        double distKm = 4.5;
        delivery.setEstimatedDistanceKm(distKm);
        delivery.setEstimatedTimeMinutes(14.0);
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
